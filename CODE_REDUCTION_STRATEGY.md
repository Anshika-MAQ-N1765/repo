# Code-Reduction & Modernization Strategy — `repo/` (100% Stacked Chart)

> **Scope**: this repository only. A phased, risk-ordered plan to shrink and modernize the
> codebase **without regressing** the now-working visual. Every phase ends with a hard
> verification gate. Pair this with `COMPATIBILITY_MIGRATION_REPORT.md` (the cross-visual playbook).

**Baseline (post-cleanup, v1.0.8.0)**

| File | Lines |
|------|------:|
| `src/visual.ts` | **6,875** |
| `src/Columnutil.ts` | 885 |
| `src/selectionId.ts` | 548 |
| `src/legacyUtils.ts` | 514 |
| `src/legacyShim.d.ts` | 266 |
| `src/layout.ts` | 199 |
| `src/index.ts` | 2 |
| **Total `src`** | **~9,289** |

**`visual.ts` internal map (the real problem is one 6.8k-line file):**

| Lines | Block | ~Size | Nature |
|------:|-------|------:|--------|
| 48–446 | ~30 `interface`/`namespace` decls | ~400 | pure types |
| 447–1294 | `class GMOSVGLegend` | **~847** | inlined legend framework |
| 1317–1470 | `class ColumnChartConverterHelper` | ~154 | converter |
| 1471–1597 | `class CartesianChartGMO` | ~127 | axis/layout helpers |
| 1598–1624 | `class ColumnChartGMO` | ~27 | static helpers |
| 1625–2541 | `class StackedChartGMOStrategy` | **~917** | inlined column/stack renderer |
| 2542–end | `class Visual` | ~4,330 | the actual visual |

---

## Guiding principles

1. **Behavior is frozen.** The multi-measure rendering works in Power BI. No phase may
   change visual output. Verification = `tsc --noEmit` clean **+** `pbiviz package` **+**
   re-import & eyeball.
2. **Mechanical before structural before behavioral.** Do the safe, reversible edits first.
3. **One concern per package version.** Bump `pbiviz.json` per phase so each step is a
   discrete, cache-bustable artifact you can roll back.
4. **Prefer the SDK over hand-rolled logic.** Most of the bulk is re-implemented framework
   code that `powerbi-visuals-utils-*` already provides (and we already depend on).

---

## Phase 1 — Mechanical (safe, ~0 risk) · target −300–500 lines

### 1.1 Replace manual KMB/number formatting with `valueFormatter` ✅ high value
Four hand-written helpers total ~120 lines and re-implement what the **already-imported**
`valueFormatter` does (K/M/B/T, `%`, precision, culture):

| Helper | Lines | Replace with |
|--------|------:|--------------|
| `format(d, displayUnit, precision, columnType)` | ~50 | `valueFormatter.create({ value: displayUnit, precision }).format(d)` |
| `numberWithCommas(x)` | ~5 | `valueFormatter.create({ value: 0 }).format(x)` |
| `addSpecialCharacters(...)` | ~30 | built-in display-unit handling |
| `measureValue(...)` | ~35 | `valueFormatter.create({ format, value, precision })` |

**Plan:** introduce one `private formatMeasure(value, format, displayUnits, precision)` that
wraps `valueFormatter.create`, redirect all call-sites, delete the four helpers.
**Gate:** values in every measure row must match pre-change screenshots exactly (esp. the
`%` branch used by the 100%-stacked labels).

### 1.2 Move static `.style({...})` bags to `visual.less` · 56 blocks
Of the 56 d3 `.style({…})` object-literals, the **static** ones (fixed colors, `position`,
`overflow`, `font-family`, fixed paddings on `.legend`, `.Title_Div_Text`, `.errorMessage`,
`.cartesianChart`) belong in CSS. Add classed selectors to `style/visual.less` and delete the
inline bags. Keep only **data-driven** styles inline (computed `top`, `font-size`, fills).
**Gate:** layout identical at 3 viewport sizes (small/medium/large — the visual has explicit
breakpoints in `applyViewportSettings`).

### 1.3 Convert remaining `.style({k:v})` → chained `.style('k', v)`
The leftover dynamic bags rely on the d3-v3 object-syntax shim. Converting to the v7 chained
form lets us **delete that part of `legacyShim.d.ts`** and removes a future footgun.
**Gate:** `tsc` clean after removing the shim typing.

---

## Phase 2 — Structural extraction (low risk, pure code-movement) · target: `visual.ts` → ~2.5–3k lines

> No logic changes — only relocate whole classes into their own modules and wire imports via
> the existing `globalThis.powerbi` bridge (same pattern as `layout.ts`/`Columnutil.ts`).

| New file | Move | ~Lines out of `visual.ts` |
|----------|------|--------------------------:|
| `src/interfaces.ts` | the ~30 interfaces (lines 48–446) | ~350 |
| `src/legend.ts` | `class GMOSVGLegend` | ~847 |
| `src/stackedStrategy.ts` | `class StackedChartGMOStrategy` | ~917 |
| `src/cartesian.ts` | `ColumnChartConverterHelper` + `CartesianChartGMO` + `ColumnChartGMO` | ~310 |

**Result:** `visual.ts` drops to roughly **3,400 lines** containing just the `Visual` class —
readable and reviewable. Total LOC is unchanged, but the file is no longer a monolith.

**Method (repeat per module):**
1. Cut one class into the new file; add the side-effect publish footer
   (`(globalThis as any).powerbi… = …`) mirroring `layout.ts`.
2. `import "./legend";` (side-effect) near the top of `visual.ts`; resolve the symbol via the
   `globalThis` consumer constant already used for `ColumnUtil`/`CartesianHelper`.
3. `tsc --noEmit` → `pbiviz package` → **re-import & verify** before the next module.

**Gate per module:** clean build + identical render. Commit after each so any regression is
bisectable to a single class move.

---

## Phase 3 — Replace inlined frameworks with the SDK (higher value, higher risk)

### 3.1 Swap `GMOSVGLegend` (~847 lines) for the built-in legend ★ biggest single win
We **already import** `svgLegend.SVGLegend` and `legendInterfaces` from
`powerbi-visuals-utils-chartutils`. `GMOSVGLegend` is a 2018 fork of exactly that. Migrating
to the stock `createLegend()` / `LegendData` deletes ~800 lines outright.

**Risk:** the fork has custom `primaryTitle`/measure-width behavior; the stock legend's layout
differs slightly. **Mitigation:** do this on a branch, screenshot-compare legend positions for
top/bottom/left/right orientations and the title on/off cases.

### 3.2 Collapse the 6 measure render blocks (deferred in cleanup) — now with a safety net
The secondary…sixth title + value-label blocks (~600 lines, classes
`secLabels/terLabels/quatLabels/fiveLabels/sixLabels`) are near-duplicates that differ only in
`dataViews[index]`, css class, settings object, and one `width` attr (quaternary). They are
**stateful** (`yAxisValue -= 27`, `--measureCounter`) so they were left intact during cleanup.

**Plan (only after Phase 2 isolates the renderer):**
1. Define a config table:
   ```ts
   const MEASURES = [
     { idx:1, cls:'secLabels',  get:'getSecondaryLabelSettings' },
     { idx:3, cls:'terLabels',  get:'getTertiaryLabelSettings' },
     { idx:4, cls:'quatLabels', get:'getQuaternaryLabelSettings', width:true },
     { idx:5, cls:'fiveLabels', get:'getFifthLabelSettings' },
     { idx:6, cls:'sixLabels',  get:'getSixthLabelSettings' },
   ];
   ```
2. Replace the 5 duplicated blocks with one loop that preserves the exact accumulator order.
3. **Gate:** a golden-image test — render the v1.0.8.0 build and the refactor against the same
   `.pbix`, diff the SVG text nodes (label text, x/y, font-size) node-for-node. Ship only on
   an exact match.

**Estimated saving:** ~450 lines.

---

## Phase 4 — Type-safety restoration (quality, optional) · neutral LOC

`legacyShim.d.ts` maps ~20 structural data-view types to `any`. Once Phases 1–3 settle the
surface, replace the `any` aliases with the real `powerbi.DataView*` types **one at a time**,
fixing the compile errors each reveals. This won't cut lines but removes the largest source of
latent runtime bugs (the very class of `undefined.displayName` crashes we fixed).

---

## Projected outcome

| Stage | `visual.ts` | Total `src` | Risk |
|-------|------------:|------------:|------|
| Baseline (v1.0.8.0) | 6,875 | ~9,289 | — |
| After Phase 1 | ~6,450 | ~8,850 | none |
| After Phase 2 | **~3,400** (rest in 4 modules) | ~8,850 | low |
| After Phase 3 | ~2,500 | **~7,400** | medium |
| After Phase 4 | ~2,500 | ~7,400 | low (quality) |

**Net:** a 6.8k-line monolith becomes a ~2.5k-line `Visual` class plus focused modules, with
~1,900 fewer total lines — most of it deleted by **using the SDK we already ship** instead of
hand-rolled forks.

---

## Execution checklist (per phase)

- [ ] Branch from `main`; bump `pbiviz.json → version`.
- [ ] Make the change; keep edits small and reversible.
- [ ] `npx tsc --noEmit -p tsconfig.json` → clean.
- [ ] `npx pbiviz package` → "Build completed successfully".
- [ ] Re-import the fresh `.pbiviz` (remove from canvas first) and **eyeball** vs. the
      previous build — chart, legend, all measure rows, 3 viewport sizes.
- [ ] Commit with the phase id; only then proceed.

## Explicitly out of scope (do not do casually)

- Rewriting the stacking/percentage math in `createDataPoints` / `getStackedMultiplier`.
- Changing `capabilities.json` roles or the `update()` reconstruction (the compatibility core).
- Touching `/Users/anstripa/CV/Stack Chart/` — that is the frozen API 1.x reference.
