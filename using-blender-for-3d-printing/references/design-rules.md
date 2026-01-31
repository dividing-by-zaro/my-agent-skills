# Design Rules for 3D Printing (FDM/FFF)

Actionable design rules for generating printable geometry. Based on the standard printer profile: 0.4mm nozzle, 0.2mm layer height.

## Table of Contents

- [Orientation and Strength](#orientation-and-strength)
- [Edge Treatment](#edge-treatment)
- [Hole Design](#hole-design)
- [Fit Features](#fit-features)
- [Support Avoidance](#support-avoidance)
- [Dimensional Tolerances](#dimensional-tolerances)
- [Text and Engraving](#text-and-engraving)
- [Surface Joining](#surface-joining)
- [General Geometry](#general-geometry)

---

## Orientation and Strength

**Orient tensile loads parallel to the print surface.** Parts are ~3x weaker when pulling layers apart. This applies to bending loads too — the tension side of a bend should be parallel to layers.

**Split parts when no single orientation works.** Each piece can be printed in its optimal orientation. Use dovetail joints for assembly — they print well in most orientations.

**Strength comes from perimeters, not infill.** More perimeters/shells is far more effective than increasing infill percentage. A square cross-section often outperforms an I-beam in 3D printing because the infill is mostly air — extra volume costs little material.

**Prefer thick shapes over thin shapes.** Increasing cross-sectional area in 3D printing adds minimal material (infill is sparse) but significantly increases strength. Don't try to minimize volume — minimize surface area instead.

---

## Edge Treatment

**Chamfers on horizontal edges, fillets on vertical edges.** This is the single most impactful rule for print quality:

- Edges parallel to print surface: use 45-degree chamfers. Fillets start with steep overhangs that print poorly and make layer stepping very visible.
- Edges vertical to print surface: use fillets. The print head can follow a smooth curve without sharp acceleration changes, reducing ringing artifacts. Chamfers create two sharp corners that print worse.

**Add fillets to internal corners for strength.** Sharp internal corners concentrate stress. A fillet allows force to flow on a more direct path, significantly reducing stress concentration.

---

## Hole Design

### Horizontal Holes (axis parallel to print surface)

Circular holes print poorly when horizontal — the top is an unsupported overhang.

- **Small holes (up to ~6mm):** Use a teardrop shape with a 90-degree point at the top.
- **Large holes (above ~6mm):** Use a flat roof. Offset the roof 0.4mm above the theoretical circle to compensate for bridge droop.

### Vertical Holes (axis perpendicular to print surface)

Circular vertical holes have a seam problem — the perimeter start/stop point can add ~0.4mm deviation and shift the hole centerline.

- Use a teardrop shape with a 120-degree angle to give the seam a designated corner that doesn't interfere with the circular portion.

### Interference Fit Holes

**Do not use circular holes for press fits.** A circle can only widen by stretching material, which leads to cracking. Use hexagonal or square holes instead — they accommodate oversized shafts by bending rather than stretching.

- Works best for smaller diameters
- Hexagonal holes also solve the seam problem (seam hides in a corner)

---

## Fit Features

### Crush Ribs (single-assembly press fits)

Ribbing inside a bore that plastically deforms during assembly. Compensates for print tolerance because deforming small ribs requires much less force than deforming a full contact surface.

Design values:
- Undersized crush ribs by **0.2mm** from nominal
- Oversized bore by **0.4mm** from nominal
- Not suitable for repeated disassembly — force decreases after first use

### Grip Fins (reassemblable press fits)

Similar concept but deformation is elastic, not plastic. The fins flex to accommodate the mating part and spring back when removed. Suitable for joints that need repeated assembly.

---

## Support Avoidance

**Maximum unsupported overhang: ~45 degrees from vertical.** Design geometry to stay within this limit.

**Diagonal orientation trick:** Tilting a rectangular part 45 degrees on the bed can eliminate overhangs and produce uniform surface finish on all sides. May need a brim for stability.

**Sacrificial layers for internal overhangs:** Instead of leaving an unsupported step (like an upside-down counterbore), add a one-layer-thick bridge across the full opening. Cut or drill it out after printing.

**Counterbore trick (no post-processing needed):**
1. Cut the counterbore to depth
2. Add a 0.2mm (one layer) cut leaving only bridge strips that don't cross the inner hole
3. Add another 0.2mm cut perpendicular to the first, bridging the remaining gaps
4. Resume the circular inner hole — remaining bridges are small enough to print cleanly

**Sequential bridging:** Bridges can support further bridges on top. Build up bridge layers perpendicular to each other, letting each set solidify before adding the next.

---

## Dimensional Tolerances

### Standard Assumptions

| Parameter | Value |
|-----------|-------|
| Nozzle diameter | 0.4mm |
| Layer height | 0.2mm |
| Surface deviation (safe) | ±0.1mm per surface |
| Seam artifact deviation | up to 0.4mm |
| Clearance fit gap | > 2x printer tolerance (> 0.2mm per side) |
| Print-in-place clearance | 0.3mm between moving parts |
| Stepper resolution (theoretical) | ~0.01mm |

### Dimensional Notes

- Circles are always slightly undersized due to nozzle drag
- Inner holes: deviation makes them smaller
- Outer diameters: deviation makes them smaller (lesser degree)
- Warping increases with sharp edges and flat surfaces — voluminous, rounded shapes warp less

---

## Text and Engraving

**Prefer engraving over embossing.** Engraved text produces cleaner results, especially at small sizes.

**Orient text vertical to the print surface.** Text printed as part of perimeter lines achieves the most detail.

Design values:
- Minimum stroke width: **0.6mm**
- Engraving depth: **0.5mm**

---

## Surface Joining

### Shadow Lines

When two parts meet, direct surface contact looks uneven due to imperfections. Instead, leave a controlled gap (shadow line) and hide the mechanical connection behind a small lip.

- The gap is wide enough that surface imperfections are not visible
- Add a second inner lip for dust protection (creates a labyrinth seal)
- Works for both edge-to-edge and lid-on-box joints (use alignment ribs on the inside for centering)

---

## General Geometry

**Design voluminous, not hollow.** Do not add cutouts to save material — in FDM, cutouts increase surface area (where most material is) and often increase print time. A solid block with sparse infill uses less material than the same block with holes cut through it.

**Mouse ears for bed adhesion.** Small discs at part corners prevent lifting. Design them into the CAD geometry so no slicer brim is needed. Two variants:
- Directly on the part corner
- On a small breakaway stub for easier removal

**Print-in-place clearance:** 0.3mm minimum between interlocking features. Use breakaway surfaces (single-layer bridges) to support floating geometry.

**Zip tie channels:** A section of hollow cylinder (see snippets.md for dimensions). Orient so perimeters don't bridge across the channel opening — bridges in that orientation are weak and can rip out.
- Channel dimensions for 100mm zip ties: ~4mm wide, ~2mm deep, ~3mm radius
