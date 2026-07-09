# Power BI Custom Visual Migration Guide — Legacy → Latest API

> **Scope.** A general, reusable, step‑by‑step playbook for migrating **any**
> legacy Power BI **custom visual** (API 1.x / 2.x, global‑`namespace` model,
> D3 v3, `enumerateObjectInstances` property pane) onto the **latest** Power BI
> visuals API and toolchain (ES modules, current D3, formatting‑model pane,
> single‑dataView delivery, and — only where the visual needs model‑computed
> totals — the matrix + Subtotal API).
>
> The guide is visual‑type agnostic (cartesian, categorical, matrix, map, KPI,
> gauge, …). **Every role, object, measure, file and value name in the examples
> is a placeholder** — read the intent, then substitute your own visual's names.
> Each step states *what* to change, *why*, and *how to verify*.

---

## 0. Prime directive & golden rules

### 0.1 Prime directive — **preserve the objective and logic**
Migration modernizes the **platform**, not the **product**. The visual must look
and behave the same before and after. Every change must be traceable to an
API/toolchain requirement — never to preference or "improvement."

**Never change these while migrating (they alter the product, not the platform):**
- The **meaning** of the data model — measure aggregation semantics, what a role
  represents, or how values are computed.
- **Capabilities role and object names**, and format **property names** — bindings
  and *already‑saved* user formatting persist by these exact names; renaming one
  silently drops data or resets a report author's settings.
- **User‑facing behavior** — the rendering/layout, the set of format options, their
  labels, and their default values.
- The visual's **GUID/identity** in `pbiviz.json` when the goal is to replace an
  existing visual in place (see §2.4).
- **Business/interaction logic** — sorting, filtering, drill, selection, tooltip
  content — unless an API contract forces a mechanical equivalent.

**Confirm with a human before touching these (high‑blast‑radius decisions):**
- Switching a **dataView mapping kind** (e.g. categorical → matrix) — it changes
  the shape delivered to every render path (§4.3).
- **Removing code that looks dead** — legacy visuals hide behavior behind globals,
  shims and string keys; confirm it is truly unreachable first.
- Changing any **default value** of a format property, or a **data‑reduction**
  limit (`dataReductionAlgorithm.top.count`).
- Raising `apiVersion` **beyond** what the target Power BI Desktop supports.
- Any change you cannot tie to a specific API requirement.

When in doubt, keep the legacy behavior and flag the item for review rather than
guessing.

### 0.2 Golden rules (apply to every step)
1. **One concern per change.** Bump the platform, type‑check, package, verify — then move on. Never batch unrelated rewrites.
2. **Emulate the old host, don't rewrite the renderer.** When the new API delivers data in a different shape, *reconstruct the shape the existing renderer expects* rather than rewriting the renderer (§5).
3. **Guard every optional dataView access.** In the modern API many fields are `undefined` unless a specific role is bound (§4.2).
4. **Diagnostics are transient.** Use version‑tagged, on‑canvas/console probes to *discover* host behavior, then **delete** them before shipping (§8).
5. **Let the host recover.** Never wipe the DOM on error; the host re‑invokes `update()`. Guard only *expected* partial states with a recoverable message (§7).
6. **Version every rebuild.** The host caches visuals by GUID; a version bump is what busts the cache (§9).
7. **When blocked, read the source of truth.** See §0.3.

### 0.3 When an error appears — **consult the web/docs before guessing**
> **Mandatory.** Whenever a **logical** error (wrong numbers, missing rows, wrong
> labels) or a **runtime** error (exception, `NaN`, blank visual, host crash)
> arises *with respect to the visual's objective*, **stop coding and consult the
> official documentation on the web**. Do not iterate blindly.

**Procedure**
1. Capture the exact symptom: error text + stack, or the precise wrong value vs. expected value.
2. Identify the API surface involved (dataView mapping, formatting model, selection, tooltip, axis util…).
3. Open the authoritative page for that surface (**Reference index, §14**) and re‑read the current contract.
4. Confirm the behavior **in‑host** with a transient diagnostic (§8).
5. Only then change code, and record the finding in your migration notes.

> Authoritative URLs are collected once in the **Reference index (§14)** — start
> from the changelog and the dataView‑mappings page.

---

## 1. Migration workflow at a glance

```
Phase 0  Assess & inventory ............. detect legacy traits, list roles/objects/mappings
Phase 1  Toolchain & project ............ apiVersion, deps, eslint, tsconfig, module bridge
Phase 2  Lifecycle & API surface ........ IVisual: constructor / update / getFormattingModel
Phase 3  Property pane .................. enumerateObjectInstances → formatting‑model cards
Phase 4  DataView & mapping ............. single‑dataView, categorical vs matrix, subtotals
Phase 5  Rendering ...................... D3 v3 → v7 surface
Phase 6  Interactivity & tooltips ....... selection manager, tooltip delegate signatures
Phase 7  Error handling ................. host recovery, no DOM wipe
Phase 8  Diagnostics .................... transient in‑host probes
Phase 9  Versioning & cache ............. bump every build, cache‑clear import
Phase 10 Test & verify .................. build gates + manual matrix + acceptance
```

Each phase below is **independently verifiable**. Do not proceed to the next
phase until the current one type‑checks (`tsc --noEmit`) and packages
(`pbiviz package`) cleanly.

---

## 2. Phase 0 — Assessment & inventory

### 2.1 Detect the legacy traits
A visual needs this migration if **any** of these are present:

| Legacy trait | Where to look |
|---|---|
| `module powerbi.extensibility.visual { … }` internal‑module wrappers | every `src/*.ts` |
| Deps injected as globals via `externalJS` array | `pbiviz.json` |
| `enumerateObjectInstances()` / `enumerateObjectInstancesToReduce()` | `visual.ts` |
| D3 v3 surface: `d3.scale.linear`, `d3.svg.axis`, `d3.mouse`, `selection.attr({…})` | `visual.ts`, util files |
| `apiVersion` `1.x`/`2.x`; `.api/v*/PowerBI-visuals.d.ts` reference | `pbiviz.json`, `tsconfig.json` |
| `tslint.json` present | repo root |
| Multiple `dataViewMappings` (one per measure) | `capabilities.json` |

### 2.2 Freeze a reference copy
Keep an untouched copy of the original visual (e.g. a `Legacy/` folder) as the
**behavioral oracle**. Every migrated behavior is validated against it.

### 2.3 Inventory (record in your migration notes)
- **Data roles** — name, kind (`Grouping`/`Measure`), required vs optional.
- **DataView mappings** — how many, what kind (categorical/table/matrix), grouped or flat.
- **Format objects** — every `objects.*` key and its properties (these become formatting‑model cards; names must match exactly).
- **Non‑additive measures** — any role backed by `DISTINCTCOUNT`, `AVERAGE`, `MEDIAN`, ratios, `MIN`/`MAX`. Flag these now — they drive the §4.6 decision.
- **Renderer assumptions** — which dataView indices/fields the render code reads.

### 2.4 Migration strategy — start from a fresh scaffold (recommended)
Prefer **generating a new, same‑type visual project and porting the legacy code
into it** over upgrading the old project in place. A fresh scaffold gives you a
known‑good modern baseline (correct `tsconfig`, `eslint.config.mjs`, `package.json`
scripts, `apiVersion`, folder layout) instead of fighting stale config, and it
keeps the untouched original available as the behavioral oracle (§2.2).

```bash
pbiviz new MyVisual                 # generate a fresh project (add a template if one fits your visual type)
```

Then port **into** the new project, one concern at a time:
1. Copy the legacy `src/*` renderer/util files in; add the module bridge + shims (§3).
2. Recreate `capabilities.json` **roles and objects with identical names** — bindings
   and saved formatting depend on them (§0.1).
3. Copy `style/`, assets, and any localization.
4. Re‑apply the visual‑specific `pbiviz.json` fields.

> ⚠️ **Identity/GUID — confirm the intent before you build.** `pbiviz new` mints a
> **new `visualPluginName`/GUID**. To *replace* an existing visual so it upgrades in
> place inside published reports, copy the **original GUID** from the old
> `pbiviz.json` into the new one. To run the old and new side‑by‑side while testing,
> keep the new GUID. Getting this wrong either breaks existing report instances or
> blocks the in‑place upgrade — decide deliberately.

---

## 3. Phase 1 — Toolchain & project modernization

### 3.1 Target toolchain (baseline)

| Component | Version |
|---|---|
| `powerbi-visuals-api` | latest stable your target Desktop supports (e.g. `~5.3.0`) |
| `powerbi-visuals-tools` (pbiviz) | `7.x` |
| TypeScript | `5.5.x` (`target es2022`, `strict:false` for legacy ports) |
| D3 | `7.9.x` |
| `powerbi-visuals-utils-*` | current majors (chartutils `^8.x`, formattingmodel `6.x`, …) |
| Node | `16.19.0`+ |

> **Choosing the API version.** Pin `apiVersion` to the newest the *target Power BI
> Desktop* supports (changelog maps API → Desktop month). Newer APIs are
> backward‑compatible; features guard themselves by capability declaration.

### 3.2 Module model — global `namespace` → ES modules
Modern pbiviz bundles each file as an **ES module** (file‑local scope). Two paths:

- **Full rewrite (preferred long‑term):** convert to real `import`/`export`.
- **Bridge (low‑risk, fast):** keep the legacy `namespace` blocks but publish their
  members onto a shared global and consume via `globalThis`. Use side‑effect imports
  to guarantee publish order:

```ts
// footer of each legacy util file (repeat per file):
const g: any = globalThis;
g.powerbi ??= {}; g.powerbi.extensibility ??= {}; g.powerbi.extensibility.utils ??= {};
Object.assign(g.powerbi.extensibility.utils, powerbi.extensibility.utils);

// visual.ts consumer — side‑effect imports force publish order:
import "./utilFileA"; import "./utilFileB"; import "./utilFileC";
const SomeUtil    = (globalThis as any).powerbi?.extensibility?.utils?.SomeUtil;
const AnotherUtil = (globalThis as any).powerbi?.extensibility?.utils?.AnotherUtil;
```

> The bridge is a **migration aid**, not a final state. It avoids rewriting
> thousands of cross‑file references on day one.

### 3.3 Ambient shim (`legacyShim.d.ts`)
Legacy code uses hundreds of unqualified type names that used to be globals and a
D3 v3 ambient surface. One shim file makes them compile without edits:

```ts
declare namespace d3 {
  namespace scale { function Linear<D=any,R=any>(): any; }
  namespace behavior { function drag(): any; }
  const select: any; const event: any;
}
declare type DataViewCategorical = any;
declare type PrimitiveValue = any;
declare const _: any;  // lodash
declare const $: any;  // jQuery
```

Map **structural dataView types** to `any` (port shortcut) but map **lifecycle
types** to their real API equivalents so the `IVisual` contract stays type‑checked.

### 3.4 Runtime D3 v3↔v7 shim (`legacyUtils.ts`)
Recreate the v3 surface on top of v7 and publish the `$`/`_`/`d3` globals the old
code expects. Import it **first** for side effects:

```ts
// index.ts
import "./legacyUtils";              // side‑effect: install shims BEFORE any visual code
export { Visual } from "./visual";
```

The shim: re‑adds `d3.mouse`/`d3.behavior.drag`/`d3.scale.Linear`/`d3.transform`,
patches the selection prototype to restore object‑form `.attr({…})`/`.style({…})`
and index access `selection[0][0]`, and publishes a small `$`/`_` subset.

### 3.5 Schema & config bumps
- `pbiviz.json`: `apiVersion` → target; `externalJS: null` (deps are bundled now).
- `capabilities.json`: keep role/object **names** identical (formatting‑model cards bind by name).
- Replace `.api/v*/PowerBI-visuals.d.ts` with `/// <reference types="powerbi-visuals-api" />`.
- `tslint.json` → `eslint.config.mjs` (flat config + `eslint-plugin-powerbi-visuals`).
- `tsconfig.json`: `target es2022`, `strict:false`, list entry `files` (`index.ts`, `legacyShim.d.ts`).

**Verify Phase 1:** `npx tsc --noEmit` clean; `npx pbiviz package` succeeds; visual loads (even if empty) in Desktop.

---

## 4. Phase 4 — DataView & data mapping (the highest‑risk phase)

> This is where most migrations break. Read the whole phase before editing
> `capabilities.json`.

### 4.1 The single‑dataView rule (API 2.1+)
Since API **2.1**, *"Visuals only receive the dataView **type** declared in their
capabilities,"* and modern hosts deliver **exactly one** `dataView`. Legacy
visuals that declared **N value‑only mappings** and indexed `dataViews[0..N]` will
find `dataViews[1..N]` **undefined** — every extra measure silently disappears.

**Rule:** design for **one** dataView of **one** mapping kind. Reconstruct any
additional per‑measure shapes your renderer needs **in code** (§4.5).

### 4.2 Guard every optional access
In the modern API, `categorical.values.source` is `undefined` unless a **Series**
is bound; `categorical.categories` is absent until a grouping role is bound; a
value column may be missing. Guard **every** `.source`, `.source.displayName`,
`.source.groupName`, `.objects`, `.values[i]`:

```ts
if (!dv.categorical?.categories?.length) { this.showRecoverable("Please select Category data"); return; }
const col = values[i];
const fmt = valueFormatter.create({ format: col?.source?.format });
if (values.source && col?.source) { /* series item only when Series bound */ }
```

### 4.3 Choose the mapping kind — decision
| You need… | Use mapping | Notes |
|---|---|---|
| A flat category × series stack, additive measures | **categorical** (grouped) | Simplest; host sums measures across the group. |
| **Model‑computed totals** for **non‑additive** measures (DISTINCTCOUNT, AVERAGE, ratios) | **matrix + Subtotal API** | Only matrix can deliver the model's subtotal (§4.6). |
| Hierarchical rows / drilldown | **matrix** | Row hierarchy, expand/collapse. |
| A single aggregate number | **single** | Cannot combine with other mappings. |

> **Never mix mapping kinds** over the same roles. Declaring a `categorical` **and**
> a `table` mapping crashes the host query generator
> (`Cannot read properties of undefined (reading 'additionalProjections')`).
> Pick one kind; build any secondary shape in‑visual.

### 4.4 Categorical: one grouped mapping
Collapse N legacy mappings into **one** categorical mapping with all measures in
the grouped `select` (the primary measure first, so a stacking converter still
sees one primary value per series). Role names below are placeholders:

```jsonc
"dataViewMappings": [{
  "categorical": {
    "categories": { "for": { "in": "category" }, "dataReductionAlgorithm": { "top": { "count": 30000 } } },
    "values": { "group": { "by": "series", "select": [
      { "bind": { "to": "primaryMeasure" } },
      { "bind": { "to": "measure2" } },
      { "bind": { "to": "measure3" } }
      /* …all remaining measures… */
    ], "dataReductionAlgorithm": { "top": { "count": 30000 } } } }
  }
}]
```

### 4.5 Reconstruct per‑measure views the renderer expects
If the legacy renderer read `dataViews[1..N]`, rebuild those indices in `update()`
from the single grouped dataView — a **primary‑only clone** for the chart plus one
synthesized aggregated‑per‑category view per extra measure:

```ts
const host0 = options.dataViews[0];
const all = host0.categorical?.values;
const groups = all.grouped();
const catLen = host0.categorical.categories?.[0]?.values.length ?? 0;

// (a) primary‑only clone drives the chart; patch .grouped() so each group exposes
//     only the primary role.
const primaryOnly = all.filter(c => hasRole(c, primaryRole));
primaryOnly.source = all.source;
primaryOnly.grouped = () => groups.map(g => ({ ...g, values: g.values.filter(c => hasRole(c, primaryRole)) }));
normalized[0] = { ...host0, categorical: { ...host0.categorical, values: primaryOnly } };

// (b) one synthesized aggregated dataView per extra measure at its legacy index.
const ROLE_TO_INDEX = { measure2: 1, measure3: 2, /* …map each extra role to its legacy index… */ };
for (const role in ROLE_TO_INDEX) { /* prefer the model subtotal (§4.6), else sum segments */ }
this.dataViews = normalized;
```

### 4.6 Non‑additive measures — the Subtotal API (matrix only)
**Symptom.** A `DISTINCTCOUNT`/average/ratio measure shows the **sum of the
per‑series segments** (e.g. `1531`) instead of the **model value at the category
grain** (e.g. `700`). Summing segments is mathematically wrong for non‑additive
measures because members overlap across series.

**Root cause.** Categorical delivery only carries per‑segment leaf values; the
visual can only sum them. The correct total exists **only** in the model, computed
by grouping on the category alone. The host *does* compute it, then **strips it**
unless you request it.

**Fix — request subtotals with a matrix mapping.** Available since API **2.6**
(subtotals) / **5.1** (subtotal type); see the Total/Subtotal API in §14.

1. Switch mapping 0 to **matrix** (rows = category, columns = series, values = measures):

```jsonc
"dataViewMappings": [{
  "matrix": {
    "rows":    { "for": { "in": "category" }, "dataReductionAlgorithm": { "top": { "count": 30000 } } },
    "columns": { "for": { "in": "series" },   "dataReductionAlgorithm": { "top": { "count": 30000 } } },
    "values":  { "select": [ { "bind": { "to": "primaryMeasure" } }, { "bind": { "to": "measure2" } } /* … */ ] }
  }
}]
```

2. Declare the **Subtotal API** so the host delivers the across‑series total per
   category as an `isSubtotal` column (and add the matching `subTotals` object):

```jsonc
"subtotals": {
  "matrix": {
    "rowSubtotals":    { "propertyIdentifier": { "objectName": "subTotals", "propertyName": "rowSubtotals" },    "defaultValue": false },
    "columnSubtotals": { "propertyIdentifier": { "objectName": "subTotals", "propertyName": "columnSubtotals" }, "defaultValue": true  },
    "levelSubtotalEnabled": { "propertyIdentifier": { "objectName": "subTotals", "propertyName": "levelSubtotalEnabled" }, "defaultValue": true }
  }
}
```

3. **Adapt matrix → categorical in code** so the existing renderer is untouched.
   Walk the row/column tree, emit grouped per‑series value columns, and read the
   model total off the `isSubtotal` column into a per‑category "grain totals" map.
   Prefer the grain total for non‑additive labels; fall back to summing only if no
   subtotal column arrived:

```ts
// in the adapter: capture the across‑series model total per category
if (node.isSubtotal) subtotalLeafByMeasure[m] = leafPos;      // remember the total column
// per measure/category: value = nodeAt(rowNode, subtotalLeafByMeasure[m])   // model 700, not 1531
```

> **Self‑verifying.** Add a transient probe (§8) that prints the subtotal values.
> `subCol=true sec=[700,…]` ⇒ success. `subCol=false` ⇒ subtotal shape differs,
> re‑read the matrix docs. `sec=[1531,…]` ⇒ host summed; the measure must be made
> non‑additive in the model (author a `REMOVEFILTERS` measure) — the visual cannot
> invent a distinct count it wasn't given.

### 4.7 One field in several wells → multi‑role columns
When the **same field** is dropped into multiple wells (e.g. Primary **and** Sixth),
the host returns **one** column carrying **all** roles — it does **not** duplicate
it. In matrix delivery it may instead emit a **duplicate, data‑less** value source
for the second role (its subtotal column reads `null` → the label shows `0`).

**Rules:**
- Test roles with a **per‑role, case‑insensitive** `hasRole(col, role)`, never "first role wins."
- If a role's own subtotal is all‑null, **fall back to another value source with the same `queryName`** that does carry data:

```ts
const hasRole = (c, role) => {
  const r = c?.source?.roles; if (!r) return false;
  if (r[role]) return true;
  const want = role.toLowerCase();
  return Object.keys(r).some(k => r[k] && k.toLowerCase() === want);
};
// grain fallback: if all‑null, borrow from the same measure delivered under another role
if (!anyNonNull(arr)) { /* find m2 with same queryName that has data; arr = readGrain(m2) */ }
```

### 4.8 Display‑name transforms — once, by reference
Every categorical `source` references `metadata.columns`. Transform display names
(e.g. Title‑Case) **once** by mutating `metadata.columns[i].displayName`; the change
flows by reference to tooltips/labels/legend/axes. (CSS `text-transform` can't reach
**host‑rendered** tooltips — transform the data, not the DOM.)

**Verify Phase 4:** every bound role renders; additive measures match the legacy
visual; non‑additive measures match the **model** value (not the segment sum);
binding a measure before the category shows the recoverable prompt, not a crash.

---

## 5. Phase 5 — Rendering (D3 v3 → v7)

| v3 (legacy) | v7 (modern) | Action |
|---|---|---|
| `d3.scale.linear()` | `d3.scaleLinear()` | shim or replace |
| `d3.svg.axis().orient()` | `d3.axisBottom/axisLeft` | shim or replace (`orient` removed) |
| `d3.mouse(node)` | `d3.pointer(event)` | replace |
| `d3.event` (global) | event arg to handler | replace |
| `selection.attr({k:v})` / `style({k:v})` | chained `.attr('k',v)` | shim (object‑form) |
| `selection[0][0]` | `selection.node()` | shim (index access) |

**Utils major‑bump gotcha.** After a `powerbi-visuals-utils-*` major bump, util
return shapes can change keys. Example: `AxisHelper.getTickLabelMargins()` renamed
`{xMax,yLeft,yRight}` → `{top,left,right,bottom}`. Legacy readers get `undefined`,
then `undefined + 10 = NaN`, and SVG `d`/`transform` become `"…NaN…"`. Grep every
destructure of a utils return and map to the new keys with `|| 0`.

---

## 6. Phase 3 — Property pane → formatting‑model API

API 5.x replaces `enumerateObjectInstances()` with the **formatting‑model API**.
Define one **card** per capabilities object; each property is a **slice**:

```ts
class CategoryAxisCardSettings extends formattingSettings.SimpleCard {
  name = "categoryAxis";                                  // MUST equal capabilities object name
  showAxisTitle = new formattingSettings.ToggleSwitch({ name: "showAxisTitle", value: false });
  slices = [this.showAxisTitle /* … */];
}
export class VisualFormattingSettingsModel extends formattingSettings.Model { cards = [ /* … */ ]; }

// visual.ts
private fmt = new FormattingSettingsService();
public update(o){ this.model = this.fmt.populateFormattingSettingsModel(VisualFormattingSettingsModel, o.dataViews[0]); }
public getFormattingModel(){ try { this.applyDynamicFormatting(); } catch { /* never blank the surface */ } return this.fmt.buildFormattingModel(this.model); }
```

**Rules:**
- `card.name`/`slice.name` **must** match the capabilities object/property names, or values silently won't persist.
- **Dynamic slices** (per‑series color pickers, per‑measure label titles) are injected by mutating `card.slices` before `buildFormattingModel`, inside a `try/catch`.
- **Default parity.** A default of `false` sets only the *pane* default; make the render gate explicit (`render only when prop === true`) or a default‑off toggle renders until toggled twice.

---

## 7. Phase 7 — Error handling: let the host recover

- **Never** wipe the DOM on error. The scaffold is built once in the constructor; wiping it turns a one‑off error **permanent** and masks the host's **recoverable** boundary (it re‑invokes `update()` on the next change).
- Let genuinely unexpected exceptions **propagate** — Desktop DevTools still shows the stack.
- Guard **expected** partial states (incomplete binding) with a recoverable message and early `return`.
- Keep exactly one narrow, silent `try/catch` around the **format‑pane build**, because a pane error must not blank the chart.
- **No shipped `console.*`.** Diagnostics are transient (§8).

---

## 8. Phase 8 — Diagnostics methodology (transient only)

Local jsdom/unit tests do **not** reflect real host behavior. To discover how the
host actually delivers data, use a **version‑tagged, on‑canvas banner** (no
DevTools needed) or a single `console.log`:

```ts
// TRANSIENT — remove before ship. Tag with the package version to detect stale caches.
let diag = `DIAG v${VER}: len=${dvs.length} kind=${dv0?.matrix?'matrix':dv0?.categorical?'categorical':'none'}`;
this.root.select('.diagBanner').style('display','block').text(diag);
```

**Discipline:** tag with the package version (so you can tell a cached build from a
fresh one), read it once in Desktop, capture the fact in your migration notes,
then **delete** the probe and the banner div before the release build.

---

## 9. Phase 9 — Versioning & cache discipline

The host caches visuals by GUID. If a fixed build shows the **identical error at
identical offsets** after re‑import, you're running the stale bundle.

1. **Bump `pbiviz.json → visual.version` on every rebuild** (`1.3.0.0 → 1.3.1.0 …`).
2. On import: **remove the visual from the canvas first**, then import, then re‑add fields.
3. Confirm the running build with the version‑tagged probe (§8) before further debugging.

---

## 10. Scenarios — decision matrix

| Scenario | Symptom / need | Path | Guide § |
|---|---|---|---|
| **A. Simple additive stack** | category × series, sum measures | one grouped **categorical** mapping | §4.4 |
| **B. Multi‑measure labels** | extra measures shown as labels/totals | grouped categorical + per‑measure reconstruction | §4.5 |
| **C. Non‑additive measure** | DISTINCTCOUNT/avg/ratio shows segment sum, not model total | **matrix + Subtotal API** + adapter | §4.6 |
| **D. Hierarchical / drilldown** | row hierarchy, expand/collapse | **matrix** mapping (+ expandCollapse) | §4.3, changelog v4.2 |
| **E. Same field in many wells** | a measure label shows 0 / rows missing | per‑role `hasRole` + same‑`queryName` grain fallback | §4.7 |
| **F. Tooltip crash** | `Cannot read '…' of undefined` in tooltip | null‑guard optional `.source` access | §4.2 |
| **G. NaN axis / broken path** | `d="…NaN…"`, `translate(NaN,…)` | map renamed utils return keys with `|| 0` | §5 |
| **H. Format pane empty** | pane ignores `enumerateObjectInstances` | port to formatting‑model cards | §6 |
| **I. Toggle "off" still renders** | default‑off feature shows until toggled twice | align render gate with pane default (`=== true`) | §6 |
| **J. Report crashes adding a mapping** | `additionalProjections` throw | never mix mapping kinds; build secondary shape in‑visual | §4.3 |
| **K. Fixed bug reappears after import** | identical error post‑fix | bump version; cache‑clear import | §9 |

---

## 11. Testing & verification

### 11.1 Build gates (must pass every phase)
```bash
npx tsc --noEmit -p tsconfig.json     # type‑check — must be clean
npx pbiviz package                    # must emit dist/<GUID>.<version>.pbiviz
```
> The eslint "Can't run lint validation" line during packaging is a known,
> non‑blocking warning on Node 16. `structuredClone is not defined` is likewise
> a benign Node‑16 packaging warning.

### 11.2 Bundle assertions (automate in CI)
Unzip the `.pbiviz` and assert the capabilities shipped as intended:
```bash
unzip -o -q dist/<GUID>.<version>.pbiviz -d .tmp/vp
python3 - <<'PY'
import json; p=json.load(open('.tmp/vp/resources/<GUID>.pbiviz.json')); c=p['capabilities']
dvm=c['dataViewMappings']; assert len(dvm)==1, dvm
assert 'matrix' in dvm[0] or 'categorical' in dvm[0]
# for non‑additive scenario C:
assert c.get('subtotals',{}).get('matrix',{}).get('columnSubtotals',{}).get('defaultValue') is True
print('bundle OK', p['visual']['version'])
PY
```

### 11.3 Manual test matrix (in Power BI Desktop, against the legacy oracle)
For **each** scenario the visual supports, verify parity with the frozen legacy copy:

| Check | Expected |
|---|---|
| Only Primary Measure bound | renders; no crash |
| Measure bound **before** Category | recoverable "Please select Category data" prompt |
| Series bound / not bound | legend appears/absent; no tooltip crash either way |
| Additive measure label | equals legacy value |
| **Non‑additive** measure label | equals **model** value (e.g. 700), not segment sum (1531) |
| Same field in two wells | both labels show the real value (no 0) |
| Each format toggle (default‑off) | hidden until turned on; on state matches legacy |
| Resize / high‑DPI | no `NaN` paths; axes/labels intact |
| Theme / high‑contrast | colors respond |
| Re‑import after fix | behavior changes (version - bumped, cache busted) |

### 11.4 Acceptance criteria (definition of done)
- [ ] `tsc --noEmit` clean; `pbiviz package` succeeds; bundle assertions pass.
- [ ] Every bound role renders; additive parity with legacy; non‑additive equals model.
- [ ] No crash on partial bindings; recoverable prompts only.
- [ ] Format pane matches legacy options; defaults match render gates.
- [ ] **All diagnostics removed**; no shipped `console.*`; no DOM‑wiping error path.
- [ ] Version bumped; migration notes updated with any new findings.

---

## 12. Troubleshooting playbook (symptom → cause → fix → doc)

| Symptom | Likely cause | Fix | Doc |
|---|---|---|---|
| `Cannot read properties of undefined (reading 'displayName')` | `values.source` undefined (no Series) | null‑guard optional access | dataview‑mappings |
| `d="M0,6V0HNaNV6"`, `translate(NaN,…)` | renamed utils return keys | map `{top,left,right}` with `\|\| 0` | (utils release notes) |
| Extra measures never render | single‑dataView drops value‑only mappings | one grouped mapping + reconstruction | dataview‑mappings |
| Non‑additive label = segment sum | subtotals not requested | matrix + `columnSubtotals` | total‑subtotal‑api |
| Measure label shows `0` (dual‑well) | duplicate data‑less source | same‑`queryName` grain fallback | total‑subtotal‑api |
| `additionalProjections` host crash | two mapping kinds mixed | one mapping kind only | dataview‑mappings |
| Format pane empty / ignored | still on `enumerateObjectInstances` | formatting‑model cards | format‑pane‑general |
| Default‑off toggle renders anyway | gate treats unset as on | render only when `=== true` | format‑pane‑general |
| Fixed bug reappears identically | stale cached bundle | bump version; cache‑clear import | changelog |
| `axis.orient is not a function` | D3 v4+ removed `orient` | `axisBottom/axisLeft` or shim | (d3 docs) |

> **If a symptom isn't listed, or a fix doesn't hold:** invoke §0.3 — read the
> authoritative doc, confirm in‑host with a transient probe, then fix and record.

---

## 13. Migration checklist (copy into each PR)

- [ ] Legacy traits inventoried; reference copy frozen; non‑additive measures flagged.
- [ ] `apiVersion` → target; deps bumped; `externalJS: null`; `eslint.config.mjs`; `tsconfig` es2022.
- [ ] `legacyShim.d.ts` + `/// <reference types="powerbi-visuals-api" />`; module bridge via `globalThis.powerbi` + side‑effect imports.
- [ ] Property pane ported to formatting‑model API; card/slice names match capabilities; dynamic slices injected in `try/catch`; defaults match render gates.
- [ ] All optional `.source`/`.values[i]`/`.objects` derefs guarded; partial‑binding guard added.
- [ ] Display‑name transforms applied once on `metadata.columns`, by reference.
- [ ] Renamed utils return shapes mapped with `|| 0`.
- [ ] Exactly **one** dataView mapping **kind**; multi‑measure reconstruction in `update()`.
- [ ] Non‑additive measures → matrix + Subtotal API + adapter; grain preferred over segment sum.
- [ ] Multi‑role columns handled with case‑insensitive per‑role `hasRole` + same‑`queryName` fallback.
- [ ] D3 v3 surface shimmed/replaced; tooltip/selection delegate signatures updated.
- [ ] Errors propagate to host; only a silent `try/catch` around the format‑pane build; no DOM wipe.
- [ ] All diagnostics transient and **removed**; no shipped `console.*`.
- [ ] Version bumped; cache‑clear import steps followed; build gates + manual matrix pass.
- [ ] Project docs / migration notes updated to reflect the final state.

---

## 14. Reference index

- API changelog (version → Desktop month, feature per version): <https://learn.microsoft.com/en-us/power-bi/developer/visuals/changelog>
- DataView mappings (categorical / table / matrix / single, data reduction, expand‑collapse): <https://learn.microsoft.com/en-us/power-bi/developer/visuals/dataview-mappings>
- Total & Subtotal API (non‑additive totals): <https://learn.microsoft.com/en-us/power-bi/developer/visuals/total-subtotal-api>
- New format pane / formatting model: <https://learn.microsoft.com/en-us/power-bi/developer/visuals/format-pane-general>
- Capabilities reference: <https://learn.microsoft.com/en-us/power-bi/developer/visuals/capabilities>
- Selection API: <https://learn.microsoft.com/en-us/power-bi/developer/visuals/selection-api>
- Tooltips: <https://learn.microsoft.com/en-us/power-bi/developer/visuals/add-tooltips>
- Developer docs root: <https://learn.microsoft.com/en-us/power-bi/developer/visuals/>
