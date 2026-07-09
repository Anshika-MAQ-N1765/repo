# Power BI Visuals API — Changelog & Migration Relevance

> A condensed, **migration‑oriented** history of the Power BI **custom visuals**
> API, from the initial release to current. For each milestone this notes *what
> changed* and *why it matters when migrating* a legacy visual.
>
> **Authoritative source (always current):**
> <https://learn.microsoft.com/en-us/power-bi/developer/visuals/changelog>
> Version numbers below mirror that page; the "Migration relevance" column is this
> repo's annotation. When in doubt, re‑read the official page (see
> `MIGRATION_GUIDE.md` §0.3).

---

## How to read this

- **API version** — the `apiVersion` you set in `pbiviz.json`.
- **Desktop** — the earliest Power BI Desktop month that supports that API.
- **Migration relevance** — 🔴 breaking / behavior‑changing, 🟡 enables a needed
  pattern, 🟢 optional enhancement.

Pin `apiVersion` to the **newest** version your target Desktop supports; the API is
backward‑compatible and features self‑guard by capability declaration.

---

## 5.x — Modern era (ES modules, formatting model, D3 v7)

| API | Desktop | Highlights | Migration relevance |
|---|---|---|---|
| **v5.10.0** | Jun 2024 | `DataViewMetadataColumn.sourceFieldParameters` (field‑parameter provenance) | 🟢 Read field‑parameter origin if your visual reflects it. |
| **v5.9.1** | — | `acquireAADTokenService` across sovereign clouds | 🟢 Only for auth‑enabled visuals. |
| **v5.9.0** | Mar 2024 | **Hierarchical identity filter API** (matrix); extended auth | 🟡 Filtering across matrix hierarchies. |
| **v5.8.0** | Feb 2024 | **On‑object formatting**; new **Local storage API** | 🟢 On‑object UX parity with core visuals. |
| **v5.7.0** | Dec 2023 | **Authentication API** (Entra SSO); **dynamic drill control** | 🟢 Toggle drill at runtime. |
| **v5.4.0** | May 2023 | Improved keyboard navigation; **detect filter** in reports | 🟢 Accessibility & filter awareness. |
| **v5.3.0** | Mar 2023 | **SelectionId fix for matrix `dataView`**; `downloadService.exportVisualsContentExtended` | 🔴 Persisted matrix selectionIds from older APIs may not map — re‑test selection after adopting matrix. **(This repo targets 5.3.0.)** |
| **v5.2.0** | Dec 2022 | Customized data reduction (dynamic fetch window) | 🟢 Large‑data paging control. |
| **v5.1.0** | Oct 2022 | **New format pane** design; **Subtotals type** (top/bottom); custom sorting; identity filter | 🟡 Design for the new format pane; subtotal ordering control (builds on v2.6 subtotals). |

> **Why 5.x is a hard boundary.** The formatting‑model API replaces
> `enumerateObjectInstances`, dependencies are **bundled** (no `externalJS`), and
> the host delivers a **single dataView** and **drops value‑only categorical
> mappings**. These three shifts drive the bulk of a 1.x→5.x migration
> (`MIGRATION_GUIDE.md` §3, §4, §6).

---

## 4.x — Drilldown, downloads, privileges

| API | Desktop | Highlights | Migration relevance |
|---|---|---|---|
| **v4.7.0** | Jul 2022 | **Licensing API**; **Drilldown API** (visual‑initiated drill) | 🟢 Monetization & self‑drill. |
| **v4.6.0** | Jun 2022 | `privileges` capability (web access, download file); **Download API** | 🟡 Declare `privileges` for web/file access. |
| **v4.2.0** | Feb 2022 | **Expand/collapse row headers** (matrix) flags | 🟡 Needed for matrix drill/expand visuals (`dataview-mappings#expand-and-collapse`). |

---

## 3.x — No‑data updates, multi‑select

| API | Desktop | Highlights | Migration relevance |
|---|---|---|---|
| **v3.8.0** | May 2021 | Baseline support | 🟢 |
| **v3.7.0** | Apr 2021 | Baseline support | 🟢 |
| **v3.6.0** | Feb 2021 | **Update without data binding** (`no‑dataroles‑support`) | 🟡 Visuals that render without a data role. |
| **v3.4.0** | Nov 2020 | `fetchMoreData` `aggregateSegments` (no‑aggregation paging) | 🟢 Large‑data paging. |
| **v3.2.0** | Sep 2019 | `supportsMultiVisualSelection` | 🟢 Cross‑visual multi‑select. |

---

## 2.x — Filtering, subtotals, identity model changes

| API | Desktop | Highlights | Migration relevance |
|---|---|---|---|
| **v2.6.0** | Jun 2019 | `isInFocus` + `switchFocusModeState`; **subtotals customization** | 🟡 **First subtotal support** — the basis for non‑additive totals (`total-subtotal-api`; guide §4.6). |
| **v2.5.0** | — | `SelectionIdBuilder.withMatrixNode`/`withTable`; `DataRepetitionSelector` → `CustomVisualOpaqueIdentity` | 🔴 Selection identity model changed; update selection builders. |
| **v2.3.0** | — | Landing page, local storage, **tuple (multi‑column) filter**, **rendering events** | 🟢 Report `renderingStarted/Finished`. |
| **v2.2.0** | — | Restore JSON filter from dataView; **context menu API**; drillthrough | 🟢 Right‑click menu. |
| **v2.1.0** | — | **Only the declared dataView type is delivered**; `undefined`→`null` in dataView; `DataViewScopeIdentity`→`DataRepetitionSelector`; `proto` metadata removed | 🔴🔴 **Watershed break.** Multi‑dataView‑type visuals break; iterate with `null` checks; re‑derive identity keys via `JSON.stringify(identity)`. Root of the **single‑dataView** rule (guide §4.1). |

---

## 1.x — Foundational features

| API | Highlights | Migration relevance |
|---|---|---|
| **v1.13.0** | Sync slicers; high‑contrast; keyboard‑focus flag | 🟢 Accessibility baseline. *(Legacy visuals in this repo originated at 1.13.)* |
| **v1.12.0** | Themes; **fetchMoreData** (beyond 30 K); **canvas tooltips** | 🟡 Report‑page tooltips. |
| **v1.11.0** | FilterManager API; **bookmarks** | 🟢 Bookmark state. |
| **v1.10.0** | `ILocalizationManager`; authentication | 🟢 Localization. |
| **v1.9.0** | `launchUrl` | 🟢 Open external links. |
| **v1.8.0** | `fillRule` (gradient); `rule` property in capabilities | 🟢 Gradient fills. |
| **v1.7.0** | RESJSON localization | 🟢 Localized resources. |
| **v1.6.2** | Edit mode; interactive (HTML) R visuals | 🟢 |
| **v1.5.0** | Allow interactions | 🟢 Interactivity toggle. |
| **v1.4.0** | Localization | 🟢 |
| **v1.3.0** | **Tooltips** | 🟢 Tooltip support. |
| **v1.2.0** | `colorPalette`; multiple selection; R visuals | 🟡 Palette & multi‑select. |
| **v1.1.0** | iFrame debug; `pbiviz update`; `--api-version` | 🟢 Tooling. |
| **v1.0.0** | Initial release; `createSelectionIdBuilder`, `createSelectionManager`, default colors | 🟢 Baseline `IVisual`. |

---

## The four changes that dominate a 1.x → 5.x migration

1. **Single dataView delivery (from v2.1).** Only the declared mapping *type* is
   returned, as **one** dataView; value‑only extra mappings are dropped.
   → Collapse to one grouped mapping and reconstruct per‑measure views in code.
   *(Guide §4.1, §4.5.)*
2. **Non‑additive totals need the Subtotal API (from v2.6 / v5.1).** Only a
   **matrix** mapping with `columnSubtotals` requested delivers the model's
   category‑grain total for DISTINCTCOUNT/average/ratio measures.
   *(Guide §4.6.)*
3. **Formatting‑model pane (from v5.1).** `enumerateObjectInstances` is replaced by
   typed **cards/slices** built via `FormattingSettingsService`.
   *(Guide §6.)*
4. **Bundled ES modules + D3 v7 (toolchain, pbiviz 7.x).** `externalJS` is gone;
   the D3 v3 surface must be shimmed or replaced.
   *(Guide §3, §5.)*

---

## Version‑selection quick rule

- **Newest Desktop in your org supports v5.x** → target the latest 5.x your Desktop
  month allows (this repo: **5.3.0**, which includes the matrix selectionId fix and
  Subtotal API).
- **Must run on older Desktop** → check the changelog's *Desktop month* column and
  pin the highest compatible API; then feature‑guard anything newer.

> Re‑verify against the live changelog before pinning — Microsoft adds versions
> over time and this table is a snapshot.
