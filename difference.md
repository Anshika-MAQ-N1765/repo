Here's a visual comparison of the two structures, using a concrete example (bars = Category, colored segments = Series, and the non‑additive **Distinct Users** measure).
 
## The same data, two delivery shapes
 
```

                        SAME REPORT FIELDS

   ┌─────────────────────────────────────────────────────────────┐

   │  Category = "Basic/100", "Advanced/300"                      │

   │  Series   = S1, S2, S3   (the stacked segments)             │

   │  Measures = Y, Secondary, Tertiary … Sixth, SampleSize      │

   └─────────────────────────────────────────────────────────────┘

             │                                     │

   BEFORE (API 1.x)                        AFTER (API 5.x)

   7 categorical feeds                     1 matrix tree

```
 
---
 
## BEFORE — Categorical: 7 parallel dataViews (flat arrays)
 
```

options.dataViews[]  ► the host hands back a SEPARATE dataView per mapping
 
┌── dataViews[0] ─ the stack ────────────────────────────────┐

│ categorical                                                │

│   categories[0].values = [ "Basic/100" , "Advanced/300" ]  │  ← the bars

│   values.grouped() =                                       │

│        ┌ group S1 → [ Y col ]                              │

│        ├ group S2 → [ Y col ]     one Y column per series  │  ← the segments

│        └ group S3 → [ Y col ]                              │

└────────────────────────────────────────────────────────────┘

┌── dataViews[1] ┐ ┌ dataViews[2] ┐ ┌ dataViews[3..6] ──────┐

│ Secondary col  │ │ SampleSize   │ │ Tertiary/Quaternary/  │

│ (value only)   │ │ (value only) │ │ Fifth/Sixth (1 each)  │

└────────────────┘ └──────────────┘ └───────────────────────┘
 
PER-BAR TOTAL for "Advanced/300":

     the VISUAL adds up the segments itself

        S1 + S2 + S3  =  8 + 46 + … =  1531   ← WRONG for Distinct Users

                                               (people counted in >1 segment)

```
 
**Traits:** flat `categories[]` + `values[]`; every extra measure is its **own dataView**; the visual **sums** segments → non‑additive totals are wrong.
 
---
 
## AFTER — Matrix: 1 dataView (a two‑axis tree) + Subtotal API
 
```

options.dataViews[0].matrix   ► ONE hierarchical object
 
   valueSources = [ Y, Secondary, Tertiary, Quaternary, Fifth, Sixth, SampleSize ]
 
                         columns.root  (SERIES  →  measures are the inner level)

                         ┌──────┬──────┬──────┬───────────────────┐

                         │  S1  │  S2  │  S3  │  ✦ isSubtotal ✦    │ ← NEW: model total

   rows.root (CATEGORY)  ├──────┼──────┼──────┼───────────────────┤

   ┌──────────────────┐  │      │      │      │                   │

   │ "Basic/100"      │→ │  ..  │  ..  │  ..  │   (model grain)   │

   ├──────────────────┤  │      │      │      │                   │

   │ "Advanced/300"   │→ │   8  │  46  │ ...  │      700  ✅       │ ← CORRECT

   └──────────────────┘  └──────┴──────┴──────┴───────────────────┘

        (bars)              └── each cell = row.values[ leafPos ] ──┘
 
PER-BAR TOTAL for "Advanced/300":

     the MODEL computes it and puts it on the isSubtotal column  →  700

     (no client-side summing)

```
 
**Traits:** one tree — categories on `rows.root.children`, series on `columns.root.children`, measures inner‑most; all 7 measures in **one** dataView; the host adds an **`isSubtotal`** column carrying the **model’s** across‑series total.
 
---
 
## The bridge that keeps the old renderer unchanged
 
```

   HOST (matrix + subtotals)

            │

            ▼

   matrixToCategorical(dv)        ◄── walks the tree, reads the isSubtotal leaf

            │                          into _categoryGrainTotals[role]

            ▼

   rebuilds the LEGACY shape in memory:

        dataViews[0]  = Y-only stack        (categories[] + grouped())

        dataViews[1]  = Secondary   ┐

        dataViews[2]  = SampleSize  │  each value = model subtotal (700),

        dataViews[3]  = Tertiary    │  NOT the segment sum (1531)

        dataViews[4]  = Quaternary  │  fallback to summing only if no

        dataViews[5]  = Fifth       │  subtotal column arrived

        dataViews[6]  = Sixth       ┘

            │

            ▼

   ~6,600-line legacy renderer  ► draws exactly as before, none the wiser

```
 
---
 
## One‑glance summary
 
```

        BEFORE (categorical)                AFTER (matrix)

   ┌───────────────────────────┐     ┌───────────────────────────┐

   │  7 dataViewMappings        │     │  1 dataViewMapping         │

   │  7 parallel dataViews      │ ──► │  1 dataView (tree)         │

   │  flat categories + values  │     │  rows × columns × measures │

   │  visual SUMS the segments  │     │  MODEL supplies subtotal   │

   │  Distinct Users = 1531 ✗   │     │  Distinct Users = 700 ✓    │

   └───────────────────────────┘     └───────────────────────────┘

              why? API 2.1 dropped dataViews[1..6]  →  matrix is the

              only mapping that can carry model-computed totals

```
 
Want me to save this diagram into a doc (e.g. append it to ARCHITECTURE_CURRENT.md or the migration guide) so it lives with the project?
 