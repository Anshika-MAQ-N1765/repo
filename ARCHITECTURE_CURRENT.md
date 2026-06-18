# 100% Stacked Chart — Current (Modernized) Architecture

> Snapshot of the visual **after** the API 5.x / d3 v7 modernization.
> Source of truth: this repo (`repo/`). Companion to `ARCHITECTURE_INITIAL.md` (the frozen legacy baseline).

## At a Glance

| Aspect | Legacy (initial) | **Current (upgraded)** |
|---|---|---|
| pbiviz version | `1.0.1` | **`1.1.11.0`** |
| Power BI API | `1.13.0` | **`5.3.0`** |
| TypeScript | internal `module` namespaces | **`5.5.4`, ES modules** (`target es2022`) |
| Rendering | D3 **v3.5.5** | **D3 v7.9.0** |
| Dependency model | global scripts via `externalJS` | **ES `import` + webpack bundle** (`externalJS: null`) |
| Property pane | `enumerateObjectInstances()` | **`getFormattingModel()`** (formatting-model API) |
| Util packages | `…utils-*` v0.x | **`…utils-*` v6–v8** |
| Class / GUID | unchanged | `Visual` / `PBI_CV_CDA74AB7_05E6_46FA_BEC9_92D47E483FFD_2` |

---

## The Core Challenge & Strategy

The legacy code is ~9k lines written against d3 v3 and the TypeScript **internal-module** (`namespace powerbi.extensibility.*`) model, with deps injected as **globals**. Modern pbiviz uses **ES modules + webpack** and ships d3 v7 with a different API.

Rather than rewrite all rendering logic, the port keeps the legacy source **largely intact** and bridges it into the modern world with two shim layers:

1. **A runtime compatibility shim** (`legacyUtils.ts`) that re-creates the d3 v3 surface and the `$`/`_` globals the old code expects.
2. **A namespace→global publish pattern** so the old cross-file `powerbi.extensibility.*` references still resolve at runtime under ES modules.

```
index.ts
 ├─ import "./legacyUtils"   ← FIRST: install d3-v3 shim, publish $ / _ / d3 globals
 └─ export { Visual }        ← from ./visual
        │
        ▼
   visual.ts  ── import "./layout" / "./selectionId" / "./Columnutil"
        │            (each file's footer copies its namespace members → globalThis.powerbi)
        ▼
   Power BI host: constructor → update() → getFormattingModel()
```

---

## Project Structure

```
repo/
├── src/
│   ├── index.ts            #  2  Entry: import shim, then export Visual
│   ├── visual.ts           # 6427  Main visual (ported legacy core)
│   ├── Columnutil.ts       #  418  Column geometry + ColumnUtil namespace (+ publish footer)
│   ├── selectionId.ts      #  212  SelectionId / SelectionIdBuilder (+ publish footer)
│   ├── layout.ts           #  199  CartesianHelper, axis/category layout (+ publish footer)
│   ├── legacyUtils.ts      #  514  Runtime shim: d3 v3↔v7, jQuery $, lodash _, globals
│   ├── legacyShim.d.ts     #  264  Ambient type declarations for legacy unqualified names
│   └── formattingSettings.ts # 267  Formatting-model cards (new property pane)
├── style/visual.less
├── assets/
├── capabilities.json       # 9 roles · 7 dataViewMappings · 19 format objects
├── pbiviz.json             # externalJS: null · apiVersion 5.3.0
├── eslint.config.mjs       # (replaces tslint.json)
├── tsconfig.json           # ES2022, strict:false; files: index.ts + legacyShim.d.ts
└── package.json            # d3 7, powerbi-visuals-api ~5.3.0, utils v6–v8
```

---

## Key Mechanisms (what makes the upgrade work)

### 1. Module load order (`index.ts`)
```ts
import "./legacyUtils";          // side-effect: must run before any visual code
export { Visual } from "./visual";
```
`legacyUtils.ts` is imported for its **side effects first**, guaranteeing the shimmed `d3`, `$`, `_` globals exist before the ported logic executes.

### 2. Runtime d3 v3 ↔ v7 shim (`legacyUtils.ts`)
- Copies d3 v7 into a mutable object and **re-adds the v3 surface**: `d3.mouse`, `d3.behavior.drag`, `d3.scale.Linear`, `d3.transform`.
- **Patches the selection prototype** to restore the v3 **object-form** `selection.attr({…})` / `style({…})` and v3 **index access** `selection[0][0]`.
- Publishes `$`/`jQuery` (a small DOM helper) and `_` (a small lodash subset) as globals.
- Publishes the patched `d3` global. (No `externalJS` anymore — these were the libraries that array used to inject.)

### 3. Namespace → global publish (`layout.ts`, `selectionId.ts`, `Columnutil.ts`)
Each file still declares `namespace powerbi.extensibility.*`, which the compiler lowers to a **file-local** `powerbi` object. An end-of-file IIFE copies those members onto the **single shared `globalThis.powerbi`**, so `visual.ts` resolves e.g. `ColumnUtil`, `SelectionIdBuilder`, `CartesianHelper` at runtime:
```ts
const g: any = globalThis;
g.powerbi.extensibility.utils ||= {};
Object.assign(g.powerbi.extensibility.utils, powerbi.extensibility.utils);
```
> ⚠️ Implication: usage analysis must account for this **runtime** global access — a plain text grep can miss cross-file references.

### 4. Compile-time type bridge (`legacyShim.d.ts`)
Ambient `declare` aliases (e.g. `DataViewCategorical`, `IColorInfo`, the `d3` v3 namespace, util namespaces) let the unqualified legacy type names compile without rewriting thousands of references.

### 5. Formatting-model property pane (`formattingSettings.ts` + `getFormattingModel()`)
The old `enumerateObjectInstances()` is **replaced** by the API 5.x formatting model: `formattingSettings.ts` defines 14 cards (legend, axes, labels, measure titles, title, …) consumed via `FormattingSettingsService`. `getFormattingModel()` builds the pane and injects dynamic per-series **data-color** pickers and measure-label titles at runtime (`setDataColors`, `applyDynamicFormatting`).

---

## Data Model (`capabilities.json`) — preserved from legacy
- **Roles (9):** `Category`, `Series`, `Y`, `SecondaryMeasure`, `TertiaryMeasure`, `QuaternaryMeasure`, `FifthMeasure`, `SixthMeasure`, `SampleSize`.
- **DataView mappings: 7** — main `Category × Series → Y` categorical stack + one value-only mapping per extra measure (the host delivers each as `options.dataViews[0..6]`).
- **Format objects: 19** (drive the cards above).

---

## Rendering Pipeline (per `update()`) — unchanged in spirit
1. Read `DataView` + viewport.
2. Normalize the 7 per-mapping dataViews; build the internal `ColumnChartData` model.
3. Compute category/value scales and axis properties.
4. Normalize each category stack to 100%.
5. Render SVG (stacked columns, axes, gridlines, data/total labels, legend) — via the shimmed d3.
6. Bind interactivity (`ChartBehavior`) + tooltips (`tooltiputils` v6: delegate receives the **bound datum directly**).
7. Property pane served by `getFormattingModel()`.

---

## Notable Post-Upgrade Fixes & Cleanup
- **Tooltips:** tooltiputils v6 changed the delegate signature — it now receives the data point directly (`d => d.tooltipInfo`), not a `TooltipEventArgs` wrapper.
- **Axis fonts:** d3 v7's `d3-axis` stamps `font-family:sans-serif`/`font-size:10` on the axis `<g>`; the render code clears and re-asserts Segoe UI to match the legacy look.
- **Axis domain line:** d3 v7 re-creates `path.domain` on every `.call()`; the code removes it after each axis render.
- **Dead-code reduction (type-only / no behavior change):** `visual.ts` 7008→6427, `Columnutil.ts` 885→418, `selectionId.ts` 548→212 — removing duplicate legacy interfaces/namespaces superseded by the live code, each validated by `tsc --noEmit` + `pbiviz package`.

---

## Build & Verify
```bash
npx tsc --noEmit -p tsconfig.json     # type-check (must be clean)
npx pbiviz package                    # emits dist/<GUID>.<version>.pbiviz
npx pbiviz start                      # dev server for live testing
```
> The eslint-config "Can't run lint validation" message during packaging is a known, non-blocking warning.
