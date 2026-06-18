# 100% Stacked Chart — Initial (Legacy) Architecture

> Snapshot of the visual **as originally authored**, before the API 5.x / d3 v7 modernization.
> Source of truth: the frozen reference at `Stack Chart/` (do not modify).

## At a Glance

| Aspect | Value |
|---|---|
| Visual name / class | `100per-Stackchart` / `Visual` |
| GUID | `PBI_CV_CDA74AB7_05E6_46FA_BEC9_92D47E483FFD_2` |
| pbiviz version | `1.0.1` |
| Power BI API | `1.13.0` |
| Language | TypeScript (internal-module / `namespace` style) |
| Rendering | D3 **v3.5.5** (SVG) |
| Dependencies | Loaded as **global scripts** via `externalJS` (not ES imports) |
| Styling | `style/visual.less` |
| Lint / build | `tslint.json` + legacy `pbiviz` CLI |

---

## Runtime & Module Model

- Every source file is wrapped in `module powerbi.extensibility.visual { … }` (TypeScript **internal modules**). The compiler concatenates them into one global namespace — there are **no ES `import`/`export` statements** between files.
- Third‑party libraries are delivered as **global variables** through the `externalJS` array in `pbiviz.json`:
  - `$` (jQuery), `_` (lodash), `d3` (v3), `globalize` (culture/number formatting)
  - `powerbi-visuals-utils-*` packages (chart, svg, dataview, formatting, interactivity, color, tooltip, type)
- The visual implements the API 1.13 `IVisual` contract: a constructor, `update()`, and **`enumerateObjectInstances()`** for the property (format) pane.

```
Power BI host
   │  DataView  +  VisualUpdateOptions
   ▼
Visual.update() ──► converter ──► ColumnChartData ──► layout/axes ──► D3 SVG render
   │                                                          │
   └── enumerateObjectInstances() ◄── property pane           └── Behavior (selection) + tooltips
```

---

## Project Structure

```
Stack Chart/
├── src/
│   ├── visual.ts        # Main visual: update(), converter, axes, legend, labels, format pane
│   ├── Columnutil.ts    # Column drawing + ColumnUtil/StackedUtil/ClusteredUtil, axis helpers
│   ├── selectionId.ts   # SelectionId / SelectionIdBuilder
│   ├── utils.ts         # General utilities + selection helpers
│   ├── layout.ts        # CartesianHelper, axis/category layout math
│   ├── Behavior.ts      # IInteractiveBehavior — click/selection handling
│   └── interfaces.ts    # Ambient `declare module` type augmentations
├── style/visual.less    # Styles
├── assets/              # icon / thumbnail / screenshot
├── capabilities.json    # Data roles, mappings, format objects
├── pbiviz.json          # Metadata + externalJS list
├── tsconfig.json
└── tslint.json
```

### Source files by size & responsibility

| File | Lines | Responsibility |
|---|---:|---|
| `visual.ts` | ~6994 | Entry point. DataView→model conversion, scale/axis/legend/label construction, SVG rendering, responsive `update()`, and `enumerateObjectInstances()` format pane. |
| `Columnutil.ts` | ~852 | Stacked-column geometry and drawing; `ColumnUtil`, `StackedUtil`, `ClusteredUtil` namespaces; domain/axis utilities. |
| `selectionId.ts` | ~524 | `SelectionId` and `SelectionIdBuilder` — identity for cross/highlight selection. |
| `utils.ts` | ~420 | Shared helpers (formatting, selection plumbing). |
| `layout.ts` | ~274 | `CartesianHelper` and category/axis layout calculations. |
| `interfaces.ts` | ~74 | `declare module` augmentations (e.g. `PixelConverter`, `StringExtensions`, `TextSizeDefaults`). |
| `Behavior.ts` | ~61 | Interactivity behavior: binds click events, applies selection styling. |
| **Total** | **~9197** | |

---

## Data Model (`capabilities.json`)

- **Data roles (9):** `Category`, `Series`, `Y`, `SecondaryMeasure`, `TertiaryMeasure`, `QuaternaryMeasure`, `FifthMeasure`, `SixthMeasure`, `SampleSize`.
- **Data view mappings: 7** — one categorical mapping for the main `Category × Series → Y` stack, plus value-only mappings for each additional measure.
- **Format objects (19):** `general`, `legend`, `categoryAxis`, `valueAxis`, `sampleFilter`, `textWrap`, `measureTitles`, `dataPoint`, `labels`, `totalLabels`, `secondaryLabels`, `tertiaryLabels`, `quaternaryLabels`, `FifthLabels`, `SixthLabels`, `PMIndicator`, `GMOColumnChartTitle`, `plotArea`, `title`.

---

## Rendering Pipeline (per `update()`)

1. **Read** `DataView` + viewport from `VisualUpdateOptions`.
2. **Convert** categorical data into the internal `ColumnChartData` model (series, data points, legend, label settings) via the converter strategy.
3. **Compute** category/value scales and axis properties (`layout.ts`, `Columnutil.ts`, chartutils `AxisHelper`).
4. **Normalize** each category stack to 100%.
5. **Render** SVG: axes, gridlines, stacked columns, data labels, total labels, and legend (d3 v3 object-form `.attr({…})` / `.style({…})`).
6. **Bind** interactivity (`Behavior.ts`) and tooltips (`tooltiputils`).
7. **Format pane** populated on demand through `enumerateObjectInstances()`.

---

## Defining Characteristics of the Initial State

- d3 **v3** API surface throughout: `d3.scale.linear`, `d3.svg.axis`, `d3.mouse`, `d3.transform`, and object-form `selection.attr({…})`/`style({…})`.
- Globals-based dependency model (`externalJS`) rather than bundled ES modules.
- Old property-pane API (`enumerateObjectInstances`) instead of the formatting-model API.
- Older `powerbi-visuals-utils-*` (e.g. `chartutils` `0.3.0`) and `@types/d3` `^3.5`.
- Single concatenated namespace — cross-file references resolve at compile time with no explicit imports.

> These are exactly the traits the modernization effort (in `repo/`) replaces: ES modules + global-publish shims, d3 v7, the formatting-model API, and current util package versions.
