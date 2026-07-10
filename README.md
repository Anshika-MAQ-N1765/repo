# 100% Stacked Chart (Power BI custom visual)

A 100% stacked column chart for comparing each value's contribution to the
whole, with support for up to six extra measures rendered as labels, a custom
legend, configurable axes, data/total labels, a sample-size filter and a custom
chart title.

- **Visual name:** `100per-Stackchart`
- **GUID:** `PBI_CV_CDA74AB7_05E6_46FA_BEC9_92D47E483FFD_2`
- **Version:** `1.4.0.0` (see `pbiviz.json`)
- **Power BI API:** `~5.3.0` · **D3:** `7.9.0` · **TypeScript:** `5.5.4`

---

## Quick start

```bash
npm install              # install dependencies
npm start                # dev server with live reload (pbiviz start)
npm run package          # build dist/<GUID>.<version>.pbiviz
npm run lint             # eslint
npx tsc --noEmit         # type-check only (must be clean)
```

Import the generated `dist/*.pbiviz` into Power BI Desktop
(**Visualizations → … → Import a visual from a file**) to test.

---

## Data roles

| Role | Kind | Purpose |
|------|------|---------|
| Category | Grouping | X axis |
| Series | Grouping | Legend / stacks |
| Primary Measure (`Y`) | Measure | The stacked value (required) |
| Secondary … Sixth Measure | Measure | Extra values shown as on-chart labels |
| Sample Size | Measure | Threshold for the sample filter |

Only **Primary Measure** is required. Adding a measure before a Category shows a
recoverable "Please select Category data" prompt.

---

## Architecture in brief

The visual is a port of a legacy (API 1.x / D3 v3) code base onto the modern
(API 5.x / D3 v7, ES-module) toolchain. Rather than rewrite the rendering, two
shim layers bridge the old code into the new world:

1. **Runtime D3-v3 shim** (`legacyUtils.ts`) — recreates the D3 v3 surface
   (`d3.mouse`, `d3.behavior`, object-form `selection.attr({…})`, index access)
   on top of D3 v7, and publishes the `$` / `_` / `d3` globals the old code uses.
2. **Namespace → global publish** (`layout.ts`, `Columnutil.ts`,
   `selectionId.ts`) — each file's `namespace powerbi.extensibility.*` compiles
   to a module-local object, so a footer copies its members onto a single shared
   `globalThis.powerbi` that `visual.ts` reads at runtime.

`index.ts` imports the shim **first** (for side effects), then exports `Visual`.

**Data delivery (matrix + Subtotal API).** `capabilities.json` declares **one
`matrix` mapping** (`rows = Category`, `columns = Series`, `values = measures`)
and requests **column subtotals**. API 5.x delivers a single dataView, so
`update()` runs `matrixToCategorical()` to rebuild the categorical shape the
renderer expects: a Primary‑only chart view plus one aggregated‑per‑category
view per extra measure at a fixed index (`[1]` secondary, `[2]` sample size,
`[3]` tertiary, `[4]` quaternary, `[5]` fifth, `[6]` sixth). For **non‑additive**
measures (e.g. Distinct Users = `DISTINCTCOUNT`) it reads the model's
category‑grain **subtotal** rather than summing per‑series segments, so the label
shows the correct total (e.g. `700`, not `1531`).

See `MIGRATION_GUIDE.md` (general playbook) and `POWERBI_API_CHANGELOG.md` (API
history) for the reusable patterns, and `ARCHITECTURE_CURRENT.md` (modern state)
/ `ARCHITECTURE_INITIAL.md` (legacy baseline) for the full picture.

---

## Project structure

```
repo/
├── src/
│   ├── index.ts            # Entry: import shim, then export Visual
│   ├── visual.ts           # Main visual (ported chart core)
│   ├── Columnutil.ts       # Column geometry + ColumnUtil (+ publish footer)
│   ├── selectionId.ts      # SelectionId / SelectionIdBuilder (+ publish footer)
│   ├── layout.ts           # CartesianHelper, axis/category layout (+ publish footer)
│   ├── legacyUtils.ts      # Runtime D3 v3↔v7 shim + $/_/d3 globals
│   ├── legacyShim.d.ts     # Ambient types for legacy unqualified names
│   └── formattingSettings.ts # Formatting-model cards (property pane)
├── style/visual.less
├── assets/
├── capabilities.json       # Data roles, dataView mapping, format objects
├── pbiviz.json             # Visual metadata + version
└── tsconfig.json           # ES2022, strict:false
```

---

## Notes

- The property pane uses the API 5.x formatting model
  (`formattingSettings.ts` + `getFormattingModel()`); per-series color pickers
  and measure-label titles are injected at runtime.
- Axis titles are **off by default** and render only when explicitly enabled.
- The `Can't run lint validation` message during `pbiviz package` is a known,
  non-blocking warning.
- `/Users/anstripa/CV/Stack Chart/` is the **frozen legacy reference** (API 1.x);
  do not modify it — this repo is the modernized port.
