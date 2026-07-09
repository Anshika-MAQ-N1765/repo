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

for old, new in replacements:
    if old in text:
        text = text.replace(old, new, 1)
        print(f"Updated block: {old.splitlines()[0]}")
    else:
        print(f"Skipped block already applied or missing: {old.splitlines()[0]}")

path.write_text(text, encoding="utf-8")
print("Updated targeted visual.ts comments")
