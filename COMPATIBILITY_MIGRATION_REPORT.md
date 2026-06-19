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

## 0. TL;DR — The bugs & decisions that bite every legacy visual

| # | Symptom | Root cause | Fix class |
|---|---------|-----------|-----------|
| 1 | `TypeError: Cannot read properties of undefined (reading 'displayName')` in `createTooltipInfo` | API 5.x omits `values.source` when no series is bound | **Null-guard optional dataView access** |
| 2 | `<path> attribute d: Expected number, "M0,6V0HNaNV6"`; `translate(NaN,…)` | `getTickLabelMargins()` renamed its return keys in chartutils 8.x | **Map renamed util return shapes** |
| 3 | Secondary/tertiary/etc. measures never render | API 5.x emits **ONE** dataView and **drops value-only categorical mappings** | **Re-architect multi-dataView → single grouped + reconstruct** |
| 4 | Some measure rows missing when one field feeds several wells | A single column carries **multiple roles at once**; the host does not duplicate it | **Test each role independently (`hasRole`)** |
| 5 | "Fixed" bug reappears at identical stack offsets after re-import | Power BI **cached the stale package** | **Bump `version` every rebuild** |
| 6 | Format pane empty / `enumerateObjectInstances` ignored | API 5.x replaces it with the **formatting-model API** (`getFormattingModel`) | **Port to `FormattingSettingsService` cards** |
| 7 | A toggle that's "off by default" still renders until toggled twice | Render gate treats an **unset** property as on, but the pane default is off | **Align pane defaults with render gates** |
| 8 | Whole report crashes (`additionalProjections`) when adding a 2nd mapping kind | The host query generator **can't mix** a `categorical` and a `table` mapping over the same roles | **One mapping kind only** (see §4.4) |

> **Two reversed decisions** (don't repeat the early mistakes — see §8): a DOM-wiping
> on-canvas error renderer makes failures **permanent**, and shipped `console.*`
> diagnostics are noise. Let errors reach the host's **recoverable** boundary, and keep
> diagnostics **transient**.

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
- Drop `externalJS` (set to `null`): D3/jQuery/lodash are no longer host-injected globals;
  they are bundled (or shimmed — see §1.2 / §7).

### 1.4 Property pane: `enumerateObjectInstances` → formatting-model API
API 5.x deprecates `enumerateObjectInstances()`/`enumerateObjectInstancesToReduce()` in
favour of the **formatting-model API**. Replace the hand-built instance arrays with typed
**cards** consumed by `FormattingSettingsService`.

```ts
// formattingSettings.ts — one card per capabilities object, slices = its properties.
class CategoryAxisCardSettings extends formattingSettings.SimpleCard {
  name = "categoryAxis";                 // MUST equal the capabilities object name
  showAxisTitle = new formattingSettings.ToggleSwitch({ name: "showAxisTitle", value: false });
  // …
  slices = [this.showAxisTitle, /* … */];
}
export class VisualFormattingSettingsModel extends formattingSettings.Model { cards = [ /* … */ ]; }

// visual.ts
private fmtService = new FormattingSettingsService();
public update(o) { this.model = this.fmtService.populateFormattingSettingsModel(VisualFormattingSettingsModel, o.dataViews[0]); }
public getFormattingModel() { return this.fmtService.buildFormattingModel(this.model); }
```

**Migration rules of thumb**
- `card.name` / `slice.name` **must** match the `capabilities.json` object/property names,
  or values silently won't persist.
- **Dynamic, data-driven slices** (e.g. one color picker per series, per-measure label
  titles) are injected at runtime by mutating `card.slices` right before
  `buildFormattingModel` — keep that in a `try/catch` so a pane error can't blank the chart.
- **Default parity (bug #7).** A formatting default of `false` only sets the *pane* default;
  if the renderer's gate still treats an **unset** value as "on" (`prop == null || prop`),
  the feature shows until the user toggles it twice. Make the render gate **explicit**:
  `render only when prop === true`, matching the card default.

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

### 2.1 Guard required roles & binding order
A user can bind a measure **before** the required grouping role (e.g. Primary measure
before Category). The dataView then has `categorical.values` but **no** `categorical.categories`,
and any code doing `categories[0]` (legend/selection builders) throws. Detect the
incomplete state early and show a recoverable prompt instead of throwing:

```ts
if (!dv.categorical?.categories?.length) {
  this.showMessage("Please select Category data");   // next update with a Category clears it
  return;
}
```

> Generalize: enumerate the roles your renderer assumes exist and bail **cleanly** for any
> partial binding. The host re-runs `update()` when the user completes the binding.

### 2.2 Display-name handling (titles) — do it once, by reference
Every categorical `source` is a **reference into `metadata.columns`**. To transform display
names (e.g. Title-Case for tooltips/labels/legend/axes) do it **once**, mutating
`metadata.columns[i].displayName` at the single point where you read the dataView — the
change then flows by reference to every render site with no per-call-site edits. There is no
native `String` title-caser; a one-liner suffices (and preserves acronyms):

```ts
const toTitleCase = (s: string) => s == null ? s : String(s).replace(/\b\w/g, c => c.toUpperCase());
for (const col of dv.metadata?.columns ?? []) if (typeof col.displayName === "string") col.displayName = toTitleCase(col.displayName);
```
> CSS `text-transform` can't reach **host-rendered** tooltips, so transform the data, not the DOM.

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
revealed the single-dataView truth.

```ts
console.log(`[DIAG v${VER}] hostLen=${dvs.length} raw=[${rawRoles}] reconstructed=${synth}`);
```

> **Transient only.** Tag it with the package version, read it once in Power BI Desktop's
> DevTools, then **delete it**. Shipped `console.*` is noise and was later stripped from this
> visual entirely (see §8). Use it to *discover* host behavior, never to *document* it.

### 4.4 Dead-end: you cannot serve both a chart mapping and a "table" mapping
A tempting idea is to add a second `dataViewMapping` of kind `table` so the host's
**Show-as-table** shows flat columns while the grouped `categorical` mapping still drives the
chart. **This crashes the entire report** before your code runs:

```
TypeError: Cannot read properties of undefined (reading 'additionalProjections')
  at QueryGenerator.rewriteQuery (…)
```

The host's query generator builds **one** query and cannot reconcile two mapping *kinds* over
the same roles. Two hard constraints make this unavoidable:

1. The capabilities schema makes a categorical `values` block a strict `oneOf` —
   `group` **or** `select`, never both. So "grouped for the chart **and** flat for the table"
   is not expressible in a single mapping.
2. API 5.x **drops** the extra value-only/secondary mappings anyway (§4).

**Takeaway:** pick **one** mapping shape — the single grouped `categorical` mapping (§4.2).
If a flat tabular export is required, build it **in-visual** (e.g. a custom export), do not
add a second host mapping. Cosmetic "Show as table" duplication is the accepted trade-off.

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
const hasRole = (c, role) => {
  const r = c?.source?.roles; if (!r) return false;
  if (r[role]) return true;                          // exact match
  const want = role.toLowerCase();                   // …or case-insensitive fallback
  return Object.keys(r).some(k => r[k] && k.toLowerCase() === want);
};
… find(c => hasRole(c, role))
```

> **Case matters too.** `capabilities.json` role names (e.g. lowercase `secondaryMeasure`)
> may not match the casing the host stamps on `source.roles`. A case-insensitive `hasRole`
> avoids silently missing rows when the two disagree.

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

## 8. Error handling — let the host recover; don't wipe the DOM

> **Reversed decision.** An early version of this migration added a `renderFatalError`
> helper that, on any throw, **cleared the visual's DOM** and painted the stack on the
> canvas. It looked helpful but was actively harmful, so it was **removed**. Record the
> reasoning so other migrations don't reintroduce it.

**Why the on-canvas error renderer was removed**
- The visual builds its SVG/DOM **once in the constructor**. A handler that does
  `while (host.firstChild) host.removeChild(...)` destroys that scaffold, so the **next**
  `update()` has nothing to draw into — a one-off transient error becomes **permanent**.
- It masked Power BI's own error boundary, which is **recoverable**: the host re-invokes
  `update()` on the next data/resize change. Swallowing the throw prevented that recovery.

**What to do instead**
- Let exceptions propagate to the host. You lose nothing in diagnosis — Power BI Desktop's
  DevTools still shows the stack — and the visual **recovers** on the next update.
- Guard *expected* partial states explicitly (see §2.1) with a recoverable message; reserve
  exceptions for genuinely unexpected failures.
- Keep one **narrow, silent** `try/catch` only around the format-pane build
  (`getFormattingModel`), because a pane error must not blank the chart surface — but it must
  not wipe the DOM or log either:

```ts
public getFormattingModel() {
  try { this.applyDynamicFormatting(); } catch { /* never break the surface */ }
  return this.fmtService.buildFormattingModel(this.model);
}
```

- **No shipped `console.*`.** Diagnostics are a debugging tool (§4.3), not a shipping feature;
  strip them before packaging.

---

## 9. Migration checklist (copy into each visual's PR)

- [ ] `apiVersion` → 5.3.0; deps bumped; `eslint.config.mjs` replaces `tslint.json`; `externalJS: null`.
- [ ] `legacyShim.d.ts` added; `/// <reference types="powerbi-visuals-api" />` in entry files.
- [ ] Cross-file globals bridged via `globalThis.powerbi` + side-effect imports.
- [ ] Property pane ported to the formatting-model API (`getFormattingModel` + `FormattingSettingsService`); `card.name`/`slice.name` match capabilities; dynamic slices injected at build time.
- [ ] Pane defaults match render gates (a default-off toggle renders only when `=== true`).
- [ ] All `.source` / `.source.displayName` / `.source.groupName` derefs guarded.
- [ ] Required-role / binding-order guards added (e.g. measure-before-category bails cleanly).
- [ ] Display-name transforms (title-case, etc.) applied once on `metadata.columns`, by reference.
- [ ] `getTickLabelMargins()` consumers mapped to `{top,left,right,bottom}` with `|| 0`.
- [ ] Multi-measure mappings collapsed to ONE grouped mapping; reconstruction in `update()`.
- [ ] Exactly one dataViewMapping *kind* (no categorical + table mix — see §4.4).
- [ ] Role tests use case-insensitive `hasRole(col, role)` (per-role), never first-role-wins.
- [ ] Version-tagged in-host diagnostic used transiently, then **removed**; no shipped `console.*`.
- [ ] `version` bumped for every rebuild; cache-clearing import steps documented.
- [ ] **No** DOM-wiping error renderer; errors propagate to the host; only a silent `try/catch` around the format-pane build.
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
| 1.1.x | Property pane ported to formatting-model API; per-series color & measure-title slices injected dynamically |
| 1.1.x | Centralized Title-Case on `metadata.columns`; case-insensitive `hasRole` |
| 1.1.x | Required-role guard (measure-before-category); axis-title default aligned with render gate |
| 1.1.x | **Reverted** additive `table` mapping (host `additionalProjections` crash — §4.4) |
| 1.1.x | **Removed** `renderFatalError` + all `console.*`; rely on host recovery (§8) |
| 1.1.x | Comment/dead-code cleanup across `visual.ts`, `selectionId.ts`, `Columnutil.ts`; README added |

> Note: the 1.1.x rows collapse several incremental package bumps; consult the commit history
> for exact per-build versions. The **decisions** (not the numbers) are what transfer to other
> visuals.
