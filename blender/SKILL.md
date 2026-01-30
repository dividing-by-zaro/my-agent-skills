---
name: blender
description: Blender best practices and Python code snippets for the Blender MCP server. Use when creating 3D models, manipulating geometry, applying materials, or performing operations like bisecting, boolean operations, and mesh editing. Contains working bpy code patterns discovered through iteration.
---

# Blender for 3D Printing

## Purpose

Provide working Python code snippets for Blender operations via the MCP server's `execute_blender_code` tool. Focused on creating printable 3D models.

## When To Use This Skill

- Creating or modifying 3D geometry for printing
- Performing mesh operations (bisect, boolean, extrude, etc.)
- Preparing models for export (checking manifold, merging meshes)
- Exporting models as STL for slicing

## Core Principles

1. **Always set context**: Blender operations require proper object selection and mode
2. **Use bmesh for complex operations**: More reliable than bpy.ops for geometry editing
3. **Check object existence**: Verify objects exist before operating on them
4. **Return to object mode**: Always clean up by returning to object mode after edits
5. **Keep meshes watertight**: No holes, all faces connected properly
6. **Avoid multiple meshes**: Use Boolean to merge objects into one solid
7. **Use 3D Print Toolbox before export**: Run `print3d_check_all()` to catch issues

---

## Scene Setup for 3D Printing

### Set Units to Millimeters

**Critical for accurate print dimensions.** Slicers expect metric units.

```python
import bpy

# Set scene units to millimeters
bpy.context.scene.unit_settings.system = 'METRIC'
bpy.context.scene.unit_settings.scale_length = 0.001  # 1 unit = 1mm
bpy.context.scene.unit_settings.length_unit = 'MILLIMETERS'
```

### Clean Scene (Remove Non-Printing Objects)

```python
import bpy

# Delete cameras and lights (not needed for 3D printing)
for obj in bpy.data.objects:
    if obj.type in ['CAMERA', 'LIGHT']:
        bpy.data.objects.remove(obj, do_unlink=True)
```

---

## Quick Reference - Common Setup

```python
import bpy

# Select an object and make it active
obj = bpy.data.objects['ObjectName']
bpy.context.view_layer.objects.active = obj
obj.select_set(True)

# Enter edit mode
bpy.ops.object.mode_set(mode='EDIT')

# Select all geometry
bpy.ops.mesh.select_all(action='SELECT')

# Return to object mode when done
bpy.ops.object.mode_set(mode='OBJECT')
```

---

## Geometry Operations

### Bisect (Cut Object in Half)

Use `bpy.ops.mesh.bisect()` to cut a mesh along a plane.

**Why split models?** Printing each half flat-side-down eliminates the need for support material.

**Important tips:**
- **Export as STL first, then re-import** - this cleans up geometry and ensures a proper mesh before bisecting
- **Always use `use_fill=True`** - otherwise the cut leaves the mesh hollow/open
- The Bisect tool is easier than the Knife tool for splitting models

**Parameters:**
- `plane_co`: Center point of the cut plane (x, y, z)
- `plane_no`: Normal vector defining cut direction
- `use_fill`: **Critical** - fills the cut surface so mesh isn't hollow
- `clear_inner`/`clear_outer`: Which half to remove

**Cut along Z-axis (horizontal cut):**

```python
import bpy

obj = bpy.data.objects['ObjectName']
bpy.context.view_layer.objects.active = obj
obj.select_set(True)

bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='SELECT')

# Cut at Z=0, keep bottom half
bpy.ops.mesh.bisect(
    plane_co=(0, 0, 0),      # Cut at origin
    plane_no=(0, 0, 1),      # Z-axis normal (horizontal cut)
    use_fill=True,           # Seal the cut
    clear_inner=False,       # Keep inner (below plane)
    clear_outer=True         # Remove outer (above plane)
)

bpy.ops.object.mode_set(mode='OBJECT')
```

**Cut along X-axis (vertical cut, front/back):**

```python
bpy.ops.mesh.bisect(
    plane_co=(0, 0, 0),
    plane_no=(1, 0, 0),      # X-axis normal
    use_fill=True,
    clear_inner=False,
    clear_outer=True
)
```

**Cut along Y-axis (vertical cut, left/right):**

```python
bpy.ops.mesh.bisect(
    plane_co=(0, 0, 0),
    plane_no=(0, 1, 0),      # Y-axis normal
    use_fill=True,
    clear_inner=False,
    clear_outer=True
)
```

**Complete workflow for splitting model into two halves (3D printing):**

```python
import bpy

# Step 1: Export original as STL first (cleans up geometry)
bpy.ops.export_mesh.stl(filepath='/tmp/original.stl', use_selection=True)

# Step 2: Re-import the STL for clean geometry
bpy.ops.import_mesh.stl(filepath='/tmp/original.stl')
obj = bpy.context.active_object

# Step 3: Bisect - First half (clear outer portion)
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.mesh.bisect(
    plane_co=(0, 0, 0),
    plane_no=(0, 0, 1),
    use_fill=True,          # CRITICAL: prevents hollow mesh
    clear_inner=False,
    clear_outer=True        # Remove top half
)
bpy.ops.object.mode_set(mode='OBJECT')

# Step 4: Export first half
bpy.ops.export_mesh.stl(filepath='/path/to/bottom_half.stl', use_selection=True)

# Step 5: Undo bisect, then do second half
# (Or reload the STL and repeat with clear_inner=True, clear_outer=False)
```

**Key point:** To get the other half, swap the clear flags:
- First half: `clear_outer=True, clear_inner=False`
- Second half: `clear_outer=False, clear_inner=True`

---

### Boolean Operations (Merging Meshes)

**Important for 3D printing:** Avoid having multiple separate meshes in your model - this causes printing errors. Use Boolean UNION to merge objects into one solid, watertight mesh.

```python
import bpy

# Ensure both objects exist
obj1 = bpy.data.objects['Target']
obj2 = bpy.data.objects['Cutter']

# Select target object
bpy.context.view_layer.objects.active = obj1
obj1.select_set(True)

# Add boolean modifier
bool_mod = obj1.modifiers.new(name='Boolean', type='BOOLEAN')
bool_mod.operation = 'UNION'  # Merge into one solid (for combining parts)
# bool_mod.operation = 'DIFFERENCE'  # Cut obj2 shape out of obj1
# bool_mod.operation = 'INTERSECT'  # Keep only overlapping area
bool_mod.object = obj2

# Apply the modifier
bpy.ops.object.modifier_apply(modifier='Boolean')

# Delete the second object (now merged into first)
bpy.data.objects.remove(obj2, do_unlink=True)
```

**Use cases:**
- `UNION`: Combine multiple parts into one printable object
- `DIFFERENCE`: Cut holes, create cavities, carve shapes
- `INTERSECT`: Keep only where two shapes overlap

---

### Extrude Faces

Useful for embossing/debossing features (like carving a face into a pumpkin).

```python
import bpy
import bmesh

obj = bpy.data.objects['ObjectName']
bpy.context.view_layer.objects.active = obj
bpy.ops.object.mode_set(mode='EDIT')

bm = bmesh.from_edit_mesh(obj.data)

# Select top faces (faces with normal pointing up)
for face in bm.faces:
    face.select = face.normal.z > 0.9

# Extrude selected faces
bpy.ops.mesh.extrude_region_move(
    TRANSFORM_OT_translate={"value": (0, 0, 1)}  # Extrude 1 unit up
)

bmesh.update_edit_mesh(obj.data)
bpy.ops.object.mode_set(mode='OBJECT')
```

---

## Print Preparation

### 3D Print Toolbox (Recommended)

Blender's built-in 3D Print Toolbox add-on finds and fixes common mesh problems before export. **Use this before every export.**

```python
import bpy

# Ensure add-on is enabled (only needed once per session)
bpy.ops.preferences.addon_enable(module='object_print3d_utils')

# Select object to check
obj = bpy.data.objects['ObjectName']
bpy.context.view_layer.objects.active = obj
obj.select_set(True)
```

**Run all checks at once:**

```python
bpy.ops.mesh.print3d_check_all()
```

**Or run individual checks:**

```python
# Check for non-watertight mesh (holes, open edges)
bpy.ops.mesh.print3d_check_solid()

# Check for self-intersecting geometry
bpy.ops.mesh.print3d_check_intersect()

# Check for walls thinner than minimum (set threshold in toolbox panel)
bpy.ops.mesh.print3d_check_thick()

# Check for overly sharp edges
bpy.ops.mesh.print3d_check_sharp()

# Check for overhangs that need supports (default 45°)
bpy.ops.mesh.print3d_check_overhang()

# Check for degenerate/distorted faces
bpy.ops.mesh.print3d_check_degenerate()
```

**Auto-fix common issues:**

```python
# Fix non-manifold edges (fills holes, merges vertices)
bpy.ops.mesh.print3d_clean_non_manifold()

# Make mesh flat on one side (for bed adhesion)
bpy.ops.mesh.print3d_clean_flat()

# Remove isolated/loose geometry
bpy.ops.mesh.print3d_clean_isolated()
```

**Export directly from toolbox:**

```python
# Export with toolbox (applies fixes automatically)
bpy.ops.mesh.print3d_export(filepath='/path/to/output.stl')
```

---

### Manual Check for Non-Manifold Geometry

Alternative method without the toolbox:

```python
import bpy
import bmesh

obj = bpy.data.objects['ObjectName']
bpy.context.view_layer.objects.active = obj
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='DESELECT')

# Select non-manifold edges (holes, open edges, etc.)
bpy.ops.mesh.select_non_manifold()

# Check if anything was selected
bm = bmesh.from_edit_mesh(obj.data)
non_manifold_count = sum(1 for v in bm.verts if v.select)

bpy.ops.object.mode_set(mode='OBJECT')

if non_manifold_count > 0:
    print(f"WARNING: {non_manifold_count} non-manifold vertices found!")
else:
    print("Mesh is watertight and ready for printing")
```

### Wall Thickness Guidelines

Walls that are too thin will fail to print or break easily. Minimum thickness depends on your printer and material:

| Material | Minimum Wall Thickness |
|----------|----------------------|
| PLA/ABS (FDM) | 1.2mm (3 perimeters at 0.4mm nozzle) |
| Resin (SLA) | 0.5mm - 1mm |
| Detailed features | 2mm+ recommended |

Use `print3d_check_thick()` to find thin areas, then thicken with Solidify.

### Make Mesh Solid (Add Thickness)

If your model is just a surface (like an imported SVG), add thickness with Solidify.

```python
import bpy

obj = bpy.data.objects['ObjectName']
bpy.context.view_layer.objects.active = obj

# Add solidify modifier
solidify = obj.modifiers.new(name='Solidify', type='SOLIDIFY')
solidify.thickness = 2.0  # 2mm thickness - safe for most prints
solidify.offset = 0  # Center the thickness

# Apply it
bpy.ops.object.modifier_apply(modifier='Solidify')
```

### Reduce Over-Tessellation (Too Many Triangles)

Models with too many faces slow down processing and create unnecessarily large files. Use Decimate to reduce polygon count while preserving shape.

```python
import bpy

obj = bpy.data.objects['ObjectName']
bpy.context.view_layer.objects.active = obj

# Check current face count
print(f"Before: {len(obj.data.polygons)} faces")

# Add decimate modifier
decimate = obj.modifiers.new(name='Decimate', type='DECIMATE')
decimate.decimate_type = 'COLLAPSE'
decimate.ratio = 0.5  # Reduce to 50% of faces (adjust as needed)

# Apply it
bpy.ops.object.modifier_apply(modifier='Decimate')

print(f"After: {len(obj.data.polygons)} faces")
```

**Tip:** Start with ratio 0.5, check if detail is preserved, adjust if needed. Most 3D printers can't reproduce detail finer than 0.1-0.2mm anyway.

### Apply All Transforms Before Export

Ensures scale/rotation are baked into the mesh.

```python
import bpy

obj = bpy.data.objects['ObjectName']
bpy.context.view_layer.objects.active = obj
obj.select_set(True)
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
```

### Verify Export (Re-import Test)

After exporting, re-import the STL into a fresh scene to verify it looks correct. This catches issues like missing modifiers or broken geometry.

```python
import bpy

# Export the model
bpy.ops.export_mesh.stl(filepath='/tmp/test_export.stl', use_selection=True)

# Import into same scene to compare
bpy.ops.import_mesh.stl(filepath='/tmp/test_export.stl')
imported = bpy.context.active_object
imported.name = 'Verification_Import'

# Move it aside for visual comparison
imported.location.x += imported.dimensions.x * 1.5

# Visually inspect - should look identical to original
print("Compare the imported model with the original. They should match.")
```

---

## Export

### Export as STL (for 3D printing)

**Binary vs ASCII:** Blender defaults to binary STL, which is much smaller than ASCII. Keep it that way unless a specific tool requires ASCII.

```python
import bpy

# Select object to export
obj = bpy.data.objects['ObjectName']
bpy.ops.object.select_all(action='DESELECT')
obj.select_set(True)

# Apply transforms first
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

# Export selected as STL (binary by default - smaller file size)
bpy.ops.export_mesh.stl(
    filepath='/path/to/output.stl',
    use_selection=True,
    global_scale=1.0,
    ascii=False  # Binary format (default) - much smaller files
)
```

### Import STL

```python
import bpy

bpy.ops.import_mesh.stl(filepath='/path/to/model.stl')
obj = bpy.context.active_object  # The imported object
```

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

# Print current context
print(f"Mode: {bpy.context.mode}")
print(f"Active: {bpy.context.active_object}")
print(f"Selected: {[o.name for o in bpy.context.selected_objects]}")
```

---

## Resources

- References: See `references/snippets.md` for more code patterns
- Blender Python API: https://docs.blender.org/api/current/
