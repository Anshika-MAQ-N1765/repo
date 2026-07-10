from pathlib import Path
import re

path = Path(r"c:\Users\AnshikaTripathiMAQSo\OneDrive - MAQ Software\Documents\Custom Visual\StackChart new\stackchart\src\visual.ts")
text = path.read_text(encoding="utf-8")

replacements = [
    (
        """// Resolved from the shared global `powerbi` (populated by legacyUtils); this
// file's own `powerbi` namespace is module-local and can't see published members.
const LegendBehavior = (globalThis as any).powerbi?.extensibility?.utils?.chart?.legend?.LegendBehavior;""",
        """// Use the shared Power BI namespace provided by the compatibility shims.
const LegendBehavior = (globalThis as any).powerbi?.extensibility?.utils?.chart?.legend?.LegendBehavior;""",
    ),
    (
        """    // Published onto globalThis.powerbi by layout.ts / Columnutil.ts / selectionId.ts
    // (their footers run first via the side-effect imports above).
    const ColumnUtil = (globalThis as any).powerbi?.extensibility?.utils?.ColumnUtil;""",
        """    // Expose the shared helpers through the global Power BI namespace.
    const ColumnUtil = (globalThis as any).powerbi?.extensibility?.utils?.ColumnUtil;""",
    ),
    (
        """       // d3 v7: append entering rects, then merge with the update selection so 
       // the layout (x/y/width/height) and fill styles are applied to BOTH the 
       // newly created and the existing rectangles. Without merge, brand new 
       // rects on first render get no geometry and stay invisible. 
""",
        """       // Merge entering rects with the update selection so new shapes get layout and styling.
""",
    ),
    (
        """       // Flatten the column hierarchy into ordered leaves. With columns=[Series] and
       // values=[measures], the measures are the innermost column level, so each answer
       // node has one child per measure. A row node's .values dict is keyed by this leaf
       // position (depth-first). The across-answer grand total (the model's level-grain
       // value — correct for non-additive measures) rides on an isSubtotal answer node.
""",
        """       // Flatten the column hierarchy so each series/measure combination has a stable position.
""",
    ),
    (
        """       // (4) category-grain totals per role (model-computed; correct for non-additive).
       // rows/cols shape: the across-answer total is the isSubtotal COLUMN slot on each
       // level row node. Nested fallback: the level node's own .values or isSubtotal child.
""",
        """       // Keep category-grain totals for extra measure roles.
""",
    ),
    (
        """           // A measure dropped into two field wells (e.g. the Primary measure ALSO added
           // as a secondary label) makes the host emit a duplicate, data-less value source
           // for the second role, so its subtotal column reads null -> the label showed 0.
           // Fall back to any value source with the SAME queryName that does carry subtotal
           // data, so the duplicate label shows the real total instead of 0/blank.
""",
        """           // If a measure appears in two roles, fall back to the matching subtotal source.
""",
    ),
]

replacements.extend([
    (
        """       // d3 v3 -> v7: axes returned by AxisHelper.createAxis are d3 v7 axis 
       // generators (axisBottom / axisLeft). The legacy render code calls 
       // `axis.orient(...)`, which existed in d3 v3 but was removed in v4+. 
       // Without this, `axis.orient is not a function` throws here and aborts 
       // the whole render -> the chart shows no bars/axes (blank visual). 
       // In d3 v7 the orientation is fixed when the axis is created, so we add 
       // a no-op `orient` that returns the axis to preserve method chaining. 
""",
        """       // Add no-op orient() method to preserve d3 v3 method-chaining style in d3 v7.\n""",
    ),
    (
        """       // d3 v7's axis generator stamps font-family="sans-serif" and font-size="10"
       // onto the axis <g> (d3 v3 / the old version never did this). Those inherit
       // down onto the tick <text>, overriding Power BI's Segoe UI and making the
       // category labels render in a different (generic sans-serif) font than the
       // old version. Clear the injected attributes and re-assert Segoe UI + the
       // intended size so the x-axis values match the old look.
""",
        """       // Clear d3 v7's injected sans-serif and use Segoe UI to match the old version.\n""",
    ),
    (
        """       // The X (category) axis must never render a domain/baseline SVG line. Modern
       // d3 (v7) draws path.domain with a visible stroke by default (d3 v3 did not),
       // and it is re-created on every axis call/transition, so removing it here -
       // after the axis is drawn - is more reliable than a static CSS rule. Showing
       // or hiding the axis (below) then only affects the labels/ticks.
""",
        """       // Remove the x-axis domain line that d3 v7 adds by default.\n""",
    ),
    (
        """           // Same d3 v7 axis-font neutralisation as the x-axis so the percent labels
           // (0% / 100%) render in Segoe UI like the old version instead of d3's
           // injected generic sans-serif.
""",
        """           // Clear d3 v7's injected sans-serif and use Segoe UI for percent labels.\n""",
    ),
    (
        """               // Uniform light-grey horizontal gridlines (old-version style) for every
               // tick INCLUDING 0% and 100%. The dark zero-line emphasis is dropped so
               // the two reference lines read as two separate light lines rather than a
               // bold baseline.
""",
        """               // Apply uniform light-grey gridlines for every tick.\n""",
    ),
    (
        """           // The Y axis must not render its vertical domain/baseline path: it connects
           // the 0% and 100% gridlines down one side into a rectangle. Strip it after
           // the axis is drawn (d3 v7 re-creates it on every call/transition).
""",
        """           // Remove the y-axis domain path that d3 v7 adds by default.\n""",
    ),
])

for old, new in replacements:
    if old in text:
        text = text.replace(old, new, 1)
        print(f"Updated block: {old.splitlines()[0]}")
    else:
        print(f"Skipped block already applied or missing: {old.splitlines()[0]}")

path.write_text(text, encoding="utf-8")
print("Updated targeted visual.ts comments")
