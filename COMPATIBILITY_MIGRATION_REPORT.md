# Power BI Custom Visual — API 1.x → 5.x Compatibility Migration Report

> **Purpose**: A reusable playbook distilled from migrating the **100% Stacked Chart**
> (`PBI_CV_CDA74AB7_05E6_46FA_BEC9_92D47E483FFD_2`) from Power BI API **1.13.0** (2018-era,
> global-namespace model) to API **5.3.0** (ES-module model, `pbiviz` 7.x, D3 v7).
> Use it as a checklist when modernizing other legacy MAQ/GMO-style visuals.

**Target toolchain after migration**

| Component | Version |
|-----------|---------|
| `powerbi-visuals-api` | `~5.3.0` |
| `powerbi-visuals-tools` (pbiviz) | `7.1.0` |
| TypeScript | `5.5.4` (target es2022, `strict: false`) |
| D3 | `7.9.0` |
| `powerbi-visuals-utils-chartutils` | `^8.3.0` |
| Node | `16.19.0` |

---

## 0. TL;DR — The 5 bugs that will bite every legacy visual

| # | Symptom | Root cause | Fix class |
|---|---------|-----------|-----------|
| 1 | `TypeError: Cannot read properties of undefined (reading 'displayName')` in `createTooltipInfo` | API 5.x omits `values.source` when no series is bound | **Null-guard optional dataView access** |
| 2 | `<path> attribute d: Expected number, "M0,6V0HNaNV6"`; `translate(NaN,…)` | `getTickLabelMargins()` renamed its return keys in chartutils 8.x | **Map renamed util return shapes** |
| 3 | Secondary/tertiary/etc. measures never render | API 5.x emits **ONE** dataView and **drops value-only categorical mappings** | **Re-architect multi-dataView → single grouped + reconstruct** |
| 4 | Some measure rows missing when one field feeds several wells | A single column carries **multiple roles at once**; the host does not duplicate it | **Test each role independently (`hasRole`)** |
| 5 | "Fixed" bug reappears at identical stack offsets after re-import | Power BI **cached the stale package** | **Bump `version` every rebuild** |

---

## 1. Project / toolchain modernization

### 1.1 Module model: global `namespace` → ES modules
Legacy 1.x visuals rely on a single global `namespace powerbi.extensibility.visual {}`
shared across files. API 5.x bundles each file as an **ES module** (file-local scope).

**Strategy used (low-rewrite):** keep the legacy `namespace` blocks but publish their
members onto a shared global, and consume them through `globalThis`:

```ts
// Publisher (end of layout.ts, Columnutil.ts, selectionId.ts):
//   (globalThis as any).powerbi = … copy members onto shared global …

// Consumer (visual.ts) — side-effect imports guarantee publish order:
import "./layout"; import "./selectionId"; import "./Columnutil";
const ColumnUtil      = (globalThis as any).powerbi?.extensibility?.utils?.ColumnUtil;
const CartesianHelper = (globalThis as any).powerbi?.extensibility?.utils?.CartesianHelper;
```

> This avoids rewriting thousands of cross-file references. It is a **migration bridge**,
> not a final state — see the companion `CODE_REDUCTION_STRATEGY.md` for the real fix.

### 1.2 Ambient shim file (`legacyShim.d.ts`)
The 2018 code references hundreds of short, unqualified type names that used to be
globals (`DataViewCategorical`, `DataViewValueColumn`, `PrimitiveValue`, …) and a
**D3 v3 surface** (`d3.scale.Linear`, `d3.behavior.drag`, `selection.style({…})`).

Create one `legacyShim.d.ts` that:
- maps legacy structural data-view types to `any` (port shortcut);
- maps lifecycle types to their **real** API equivalents;
- re-declares the D3 v3 ambient surface so legacy call-sites compile.

```ts
declare namespace d3 {
  namespace scale { function Linear<D=any,R=any>(): Linear<D,R>; }
  namespace behavior { function drag(): any; }
  const select: any; const event: any;
}
declare type DataViewCategorical = any;
declare type PrimitiveValue = any;
declare const _: any;  // lodash
declare const $: any;  // jQuery
```

### 1.3 `pbiviz.json` / `capabilities.json` schema bumps
- `apiVersion` → `5.3.0`.
- Replace `.api/v1.13.0/PowerBI-visuals.d.ts` with the `/// <reference types="powerbi-visuals-api" />` triple-slash directive.
- `tslint.json` → `eslint.config.mjs` (flat config, `eslint-plugin-powerbi-visuals`).

---

## 2. Bug class #1 — Null-guard optional dataView access

**Where it hides:** any code that assumes `dataView.categorical.values.source` exists.
In 1.x a dynamic-series source was always present; in 5.x it is `undefined` unless a
**Series/Legend** field is bound.

**Before (crashes):**
```ts
tooltipDataItems.push({
  value: <string>valueColumn.source.groupName,
  displayName: <string>values.source.displayName,   // values.source === undefined → throw
});
```

**After (guarded):**
```ts
let valueColumn = values[seriesIndex];
let fmt = valueFormatter.create({ format: valueColumn && valueColumn.source ? valueColumn.source.format : undefined });
if (categories && categories.source) { /* category item */ }
if (values.source && valueColumn && valueColumn.source) { /* series item — only when Series bound */ }
if (valueColumn && valueColumn.source) { /* measure item */ }
```

**Rule of thumb:** every `.source`, `.source.displayName`, `.source.groupName`,
`.objects`, and `.values[i]` deref in tooltip/label/legend code must be guarded.
Also wrap `enumerateObjectInstances` in `try/catch` so a format-pane error never blanks the visual.

---

## 3. Bug class #2 — Renamed util return shapes (chartutils 8.x)

`AxisHelper.getTickLabelMargins()` changed its **return keys**:

| chartutils 1.x (old) | chartutils 8.x (new) |
|----------------------|----------------------|
| `.xMax`  | `.top` (x-axis/bottom label height) |
| `.yLeft` | `.left` |
| `.yRight`| `.right` |

Legacy code read the old names → `undefined` → `undefined + 10 = NaN` → SVG `d`/`transform`
attributes become `"…NaN…"` and the browser rejects the path.

**Fix — map the new shape wherever margins are consumed (`render()`, `renderChart()`):**
```ts
// where `top` is the x-axis (bottom) label height, `left`/`right` are the y-axis widths.
const bottom = (tickLabelMargins.top   || 0);
const left   = (tickLabelMargins.left  || 0);
const right  = (tickLabelMargins.right || 0);
```

**Generalize:** after a utils major bump, grep for every destructure of a utils return
object and diff it against the new `.d.ts`. The dangerous ones are arithmetic consumers
(`x + margin`, `translate(${x},${y})`) because they convert `undefined` to `NaN` silently.

---

## 4. Bug class #3 — Single-dataView delivery (the big one)

### 4.1 What changed
Legacy multi-measure visuals declared **N separate `dataViewMappings`** (one per measure
role) and indexed the host's reply as `dataViews[0]`, `dataViews[1]`, … In API 1.x the host
returned a **stable placeholder dataView per mapping**.

**API 5.x emits exactly ONE dataView and silently DROPS value-only categorical mappings.**
Proven at runtime with an in-host diagnostic:

```
[DIAG] hostLen=1  rawValueCols=[Y("Sum of Sales")]   // secondary/tertiary never arrived
```

So `dataViews[1..6]` are `undefined`, and every extra measure is gone.

### 4.2 The fix — one grouped mapping + in-code reconstruction
**Step A — `capabilities.json`:** collapse the N mappings into **one** categorical mapping,
and put **all** measures in the grouped `select` (Primary/`Y` first so the stacking
converter still sees one Y per series group):

```jsonc
"dataViewMappings": [{
  "categorical": {
    "categories": { "for": { "in": "Category" } },
    "values": {
      "group": {
        "by": "Series",
        "select": [
          { "bind": { "to": "Y" } },                 // index 0 — chart
          { "bind": { "to": "secondaryMeasure" } },
          { "bind": { "to": "tertiaryMeasure" } },
          { "bind": { "to": "quaternaryMeasure" } },
          { "bind": { "to": "fifthMeasure" } },
          { "bind": { "to": "sixthMeasure" } },
          { "bind": { "to": "sampleSize" } }
        ]
      }
    }
  }
}]
```

**Step B — `update()`:** rebuild what the legacy renderer expects:
1. a **Y-only categorical clone** for the stacking chart (filter the flat `values` array
   **and** patch `.grouped()` so each group exposes only its Y column — the flat-index
   converter is then byte-for-byte unaffected);
2. one **synthesized, aggregated-per-category dataView** per extra measure at its fixed
   legacy index (`[1]=secondary [2]=sampleSize [3]=tertiary [4]=quaternary [5]=fifth [6]=sixth`).

```ts
const host0 = options.dataViews[0];
const allValues = host0.categorical?.values;
const origGroups = allValues.grouped();
const catLen = host0.categorical.categories?.[0]?.values.length ?? 0;

// (a) Y-only clone
const yOnly = allValues.filter(c => hasRole(c, 'Y'));
yOnly.source  = allValues.source;
yOnly.grouped = () => origGroups.map(g => ({ ...g, values: g.values.filter(c => hasRole(c, 'Y')) }));
const chartDV = { ...host0, categorical: { ...host0.categorical, values: yOnly } };
this.dataView = chartDV; normalized[0] = chartDV;

// (b) synthesize one aggregated dataView per extra measure
const ROLE_TO_INDEX = { secondaryMeasure:1, sampleSize:2, tertiaryMeasure:3, quaternaryMeasure:4, fifthMeasure:5, sixthMeasure:6 };
for (const role in ROLE_TO_INDEX) {
  const srcCol = origGroups.flatMap(g => g.values).find(c => hasRole(c, role));
  if (!srcCol) continue;
  const sums = new Array(catLen).fill(null);
  for (const g of origGroups) {
    const col = g.values.find(c => hasRole(c, role));
    col?.values.forEach((v, c) => { if (v != null) sums[c] = (sums[c] ?? 0) + (+v || 0); });
  }
  normalized[ROLE_TO_INDEX[role]] = {
    metadata: { columns: [srcCol.source], objects: host0.metadata?.objects ?? null },
    categorical: { categories: host0.categorical.categories, values: [{ source: srcCol.source, values: sums }] },
  };
}
this.dataViews = normalized;        // and feed setData(this.dataViews)
```

> **Key insight:** keep the *renderer* unchanged by re-creating the data shape it was
> written for, instead of rewriting the renderer to a new shape. Emulate the old host.

### 4.3 The decisive tool: an in-host diagnostic `console.log`
A green local jsdom test does **not** reflect real host behavior. A one-line, version-tagged
diagnostic in `update()` was what overturned the wrong "indices shift" hypothesis and
revealed the single-dataView truth. **Always tag it with the package version** and remove it
once confirmed:

```ts
console.log(`[DIAG v${VER}] hostLen=${dvs.length} raw=[${rawRoles}] reconstructed=${synth}`);
```

---

## 5. Bug class #4 — Multi-role columns (`hasRole`, not `roleOf`)

When the **same field** is dropped into several wells (e.g. `Sum of Sales` →
Primary **+** Secondary **+** Quaternary), the host returns **one** column whose
`source.roles = { Y:true, secondaryMeasure:true, quaternaryMeasure:true }` — it does
**not** duplicate the column.

```
rawValueCols=[Y+secondaryMeasure+quaternaryMeasure("Sum of Sales"), tertiaryMeasure("Count of Month")]
```

A "first role wins" helper drops every role after the first → missing rows.

**Wrong:**
```ts
const roleOf = c => Object.keys(c.source.roles).find(k => c.source.roles[k]);  // first-only
… find(c => roleOf(c) === role)
```
**Right:**
```ts
const hasRole = (c, role) => !!(c?.source?.roles && c.source.roles[role]);     // per-role
… find(c => hasRole(c, role))
```

---

## 6. Bug class #5 — Stale-package cache & versioning discipline

Power BI Desktop/Service caches an imported visual by GUID. If a fixed build shows the
**identical error at the identical byte offsets** after re-import, you're running the old
bundle. Two-part discipline:

1. **Bump `pbiviz.json → visual.version` on every rebuild** (`1.0.6.0 → 1.0.7.0 …`). The
   version bump is what reliably busts the host cache.
2. When importing, **remove the visual from the canvas first**, then import, then re-add fields.

Verify the running build with the version-tagged diagnostic (§4.3) before debugging further.

---

## 7. D3 v3 → v7 notes

- `axis.orient(...)` was removed in d3 v4+. Legacy axis code throws `axis.orient is not a
  function`. Shim it (see `legacyShim.d.ts` `declare module "d3-axis"`) or replace with
  `d3.axisBottom/axisLeft`.
- `d3.select(...).style({ k: v })` **object syntax** is v3-only; the shim types `style` as
  `any` so the legacy object-style calls compile. (Final state: convert to chained
  `.style('k', v)`.)
- `d3.mouse` → `d3.pointer`; `d3.event` (global) → event arg passed to handlers.

---

## 8. Defensive rendering — `renderFatalError`

Add a never-throwing error surface so a runtime failure shows the **stack on the visual**
instead of a blank rectangle. Wrap `constructor`, `update`, and `enumerateObjectInstances`:

```ts
try { … } catch (e) { this.renderFatalError('update', e); }
```

This single helper saved hours during the migration by surfacing the failing phase + stack
directly in Power BI.

---

## 9. Migration checklist (copy into each visual's PR)

- [ ] `apiVersion` → 5.3.0; deps bumped; `eslint.config.mjs` replaces `tslint.json`.
- [ ] `legacyShim.d.ts` added; `/// <reference types="powerbi-visuals-api" />` in entry files.
- [ ] Cross-file globals bridged via `globalThis.powerbi` + side-effect imports.
- [ ] All `.source` / `.source.displayName` / `.source.groupName` derefs guarded.
- [ ] `getTickLabelMargins()` consumers mapped to `{top,left,right,bottom}` with `|| 0`.
- [ ] Multi-measure mappings collapsed to ONE grouped mapping; reconstruction in `update()`.
- [ ] Role tests use `hasRole(col, role)` (per-role), never first-role-wins.
- [ ] Version-tagged in-host diagnostic added, confirmed, then **removed**.
- [ ] `version` bumped for every rebuild; cache-clearing import steps documented.
- [ ] `renderFatalError` wraps constructor / update / enumerate.
- [ ] `tsc --noEmit` clean **and** `pbiviz package` succeeds; re-imported & visually verified.

---

## 10. Version history of this migration

| Version | Change |
|---------|--------|
| 1.0.2.0 | `createTooltipInfo` null-guards; removed 10 `debugger` statements |
| 1.0.3.0 | NaN axis fix — `getTickLabelMargins` key mapping; removed console spam |
| 1.0.4.0 | Restored 7 dataViewMappings (interim hypothesis) |
| 1.0.5.0 | Role-based normalization + **in-host diagnostic** → proved single-dataView |
| 1.0.6.0 | Single grouped mapping + per-measure reconstruction |
| 1.0.7.0 | `hasRole` multi-role fix (secondary/quaternary rows) |
| 1.0.8.0 | Dead-code cleanup; unified measure-label settings; final clean build |
