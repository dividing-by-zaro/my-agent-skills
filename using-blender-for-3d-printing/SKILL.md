---
name: using-blender-for-3d-printing
description: Blender best practices, Python code snippets, and design-for-3D-printing rules for the Blender MCP server. Use when creating 3D models, manipulating geometry, applying materials, or performing operations like bisecting, boolean operations, and mesh editing. Also use when designing printable parts — covers orientation, edge treatment, hole design, fit features, support avoidance, and dimensional tolerances for FDM/FFF printing. Contains working bpy code patterns discovered through iteration.
---

# Blender for 3D Printing

## Core Principles

1. **Always set context**: Blender operations require proper object selection and mode
2. **Use bmesh for complex operations**: More reliable than bpy.ops for geometry editing
3. **Check object existence**: Verify objects exist before operating on them
4. **Return to object mode**: Always clean up by returning to object mode after edits
5. **Keep meshes watertight**: No holes, all faces connected properly
6. **Avoid multiple meshes**: Use Boolean to merge objects into one solid
7. **Use 3D Print Toolbox before export**: Run `print3d_check_all()` to catch issues
8. **Solidify for uniform thickness**: Build a single mid-surface, then use the Solidify modifier for wall thickness — cleaner than constructing inner/outer walls manually
9. **Profile-and-extrude for swept shapes**: Define a 2D cross-section with bmesh vertices, then extrude across the width. Good for shelves, channels, rails, etc.
10. **Clean duplicate vertices**: When building profiles procedurally (arc segments meeting straight sections), filter near-duplicate points before mesh creation
11. **Zoom after creation at mm scale**: With `scale_length=0.001`, objects are tiny in viewport. Always call `view3d.view_selected()` after creating geometry
12. **Design for printability**: Use chamfers on horizontal edges, fillets on vertical edges. Use teardrop holes instead of circles. Avoid geometry requiring supports (max ~45 deg overhang). See `references/design-rules.md` for full design rules

---

## Scene Setup for 3D Printing

### Set Units to Millimeters

**Critical for accurate print dimensions.** Slicers expect metric units.

```python
import bpy

bpy.context.scene.unit_settings.system = 'METRIC'
bpy.context.scene.unit_settings.scale_length = 0.001  # 1 unit = 1mm
bpy.context.scene.unit_settings.length_unit = 'MILLIMETERS'
```

### Clean Scene (Remove Non-Printing Objects)

```python
import bpy

for obj in bpy.data.objects:
    if obj.type in ['CAMERA', 'LIGHT']:
        bpy.data.objects.remove(obj, do_unlink=True)
```

---

## Quick Reference - Common Setup

```python
import bpy

obj = bpy.data.objects['ObjectName']
bpy.context.view_layer.objects.active = obj
obj.select_set(True)

bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='SELECT')

# Return to object mode when done
bpy.ops.object.mode_set(mode='OBJECT')
```

---

## Code Snippets Reference

Consult `references/snippets.md` for detailed code patterns organized by category:

- **Geometry Operations** — Bisect (cut along plane with fill), Boolean (Union/Difference/Intersect), Extrude faces, Subdivide, Smooth shading
- **Primitives** — Cube, Sphere, Cylinder, Cone, Torus with parameters
- **Transformations** — Scale, Rotate, Move, Apply All Transforms
- **Selection** — Select vertices by location (bmesh), select faces by normal
- **Modifiers** — Subdivision Surface, Mirror, Solidify, Bevel, Array
- **Print Preparation** — 3D Print Toolbox checks/fixes, manifold verification, wall thickness guide, decimate, verify export
- **Export / Import** — STL export/import with Blender 4.x API
- **Profile-and-Extrude** — Swept geometry pattern for shelves, channels, rails
- **Design Patterns for Printability** — Teardrop holes, hexagonal holes, mouse ears, shadow lines
- **Utility Functions** — Duplicate, delete, existence check, dimensions, center origin

Consult `references/design-rules.md` for design-for-3D-printing rules when deciding **what** geometry to create:

- **Orientation and Strength** — Print orientation, layer direction, cross-section choices
- **Edge Treatment** — When to use chamfers vs fillets based on edge orientation
- **Hole Design** — Teardrop shapes for horizontal/vertical holes, hex holes for press fits
- **Fit Features** — Crush ribs (single-assembly), grip fins (reassemblable)
- **Support Avoidance** — Max overhang angles, sacrificial layers, counterbore trick
- **Dimensional Tolerances** — Expected deviations, clearance values, practical numbers
- **Text and Engraving** — Engraving over embossing, orientation, minimum stroke width

### Critical: Blender 4.x STL API Change

The old `bpy.ops.export_mesh.stl()` / `bpy.ops.import_mesh.stl()` no longer exist. Use:

- Export: `bpy.ops.wm.stl_export(filepath='...', export_selected_objects=True)`
- Import: `bpy.ops.wm.stl_import(filepath='...')`

See `references/snippets.md` > Export / Import for full parameter mapping.

---

## Troubleshooting

### Common Issues

**"Context is incorrect" error:**
- Ensure you're in the right mode (OBJECT vs EDIT)
- Make sure the correct object is active and selected

**Operation doesn't affect anything:**
- Check that geometry is selected in edit mode
- Verify the object has actual mesh data

**Bisect not working:**
- Must be in EDIT mode
- Must have geometry selected
- Check plane position intersects the mesh

**Print fails / Slicer shows errors:**
- Run `bpy.ops.mesh.print3d_check_all()` to find all issues
- Use `bpy.ops.mesh.print3d_clean_non_manifold()` to auto-fix holes
- Ensure mesh is watertight (no holes)
- Use Boolean UNION to merge separate meshes into one
- Apply all transforms before export

### Debug Pattern

```python
import bpy

print(f"Mode: {bpy.context.mode}")
print(f"Active: {bpy.context.active_object}")
print(f"Selected: {[o.name for o in bpy.context.selected_objects]}")
```
