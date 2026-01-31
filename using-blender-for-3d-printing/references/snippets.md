# Blender Code Snippets for 3D Printing

## Table of Contents

- [Geometry Operations](#geometry-operations) — Bisect, Boolean, Extrude, Subdivide, Smooth
- [Primitives](#primitives) — Cube, Sphere, Cylinder, Cone, Torus
- [Transformations](#transformations) — Scale, Rotate, Move, Apply All Transforms
- [Selection](#selection) — By location (bmesh), by face normal
- [Modifiers](#modifiers) — Subdivision Surface, Mirror, Solidify, Bevel, Array
- [Print Preparation](#print-preparation) — 3D Print Toolbox, manifold check, wall thickness, decimate, verify export
- [Export / Import](#export--import) — STL with Blender 4.x API, parameter mapping
- [Profile-and-Extrude Pattern](#profile-and-extrude-pattern) — Swept geometry, zoom to fit
- [Design Patterns for Printability](#design-patterns-for-printability) — Teardrop holes, hexagonal holes, mouse ears, shadow lines
- [Utility Functions](#utility-functions) — Duplicate, delete, existence check, dimensions, center origin

---

## Geometry Operations

### Bisect (Cut Object Along a Plane)

Use `bpy.ops.mesh.bisect()` to cut a mesh along a plane.

**Why split models?** Printing each half flat-side-down eliminates the need for support material.

**Important tips:**
- **Export as STL first, then re-import** — this cleans up geometry and ensures a proper mesh before bisecting
- **Always use `use_fill=True`** — otherwise the cut leaves the mesh hollow/open

**Parameters:**
- `plane_co`: Center point of the cut plane (x, y, z)
- `plane_no`: Normal vector defining cut direction
- `use_fill`: **Critical** — fills the cut surface so mesh isn't hollow
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

**Complete workflow for splitting model into two halves:**

```python
import bpy

# Step 1: Export original as STL first (cleans up geometry)
bpy.ops.wm.stl_export(filepath='/tmp/original.stl', export_selected_objects=True)

# Step 2: Re-import the STL for clean geometry
bpy.ops.wm.stl_import(filepath='/tmp/original.stl')
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
bpy.ops.wm.stl_export(filepath='/path/to/bottom_half.stl', export_selected_objects=True)

# Step 5: Undo bisect, then do second half
# (Or reload the STL and repeat with clear_inner=True, clear_outer=False)
```

**To get the other half**, swap the clear flags:
- First half: `clear_outer=True, clear_inner=False`
- Second half: `clear_outer=False, clear_inner=True`

---

### Boolean Operations

Add a Boolean modifier to combine, subtract, or intersect meshes.

**General pattern:**

```python
import bpy

obj1 = bpy.data.objects['Target']
obj2 = bpy.data.objects['Cutter']

bpy.context.view_layer.objects.active = obj1
obj1.select_set(True)

bool_mod = obj1.modifiers.new(name='Boolean', type='BOOLEAN')
bool_mod.operation = 'UNION'  # Merge into one solid (for combining parts)
# bool_mod.operation = 'DIFFERENCE'  # Cut obj2 shape out of obj1
# bool_mod.operation = 'INTERSECT'  # Keep only overlapping area
bool_mod.object = obj2

bpy.ops.object.modifier_apply(modifier='Boolean')

# Delete the second object (now merged into first)
bpy.data.objects.remove(obj2, do_unlink=True)
```

**Use cases:**
- `UNION`: Combine multiple parts into one printable object
- `DIFFERENCE`: Cut holes, create cavities, carve shapes
- `INTERSECT`: Keep only where two shapes overlap

#### Boolean Difference to Trim Geometry (e.g. Shorten Legs)

Use an oversized cube as a cutter to remove a portion of an object. More reliable than bisect for partial trimming — no edit mode or geometry selection needed.

```python
import bpy

# 1. Determine how much to cut
obj = bpy.data.objects['Shelf']
z_min = min(v.co.z for v in obj.data.vertices)
z_max = max(v.co.z for v in obj.data.vertices)

cut_z = 20  # height of material to remove from the bottom

# 2. Create an oversized cutter cube
#    Must be wider/deeper than the object in XY, but Z range only overlaps
#    the part to remove
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, (z_min + cut_z) / 2 - 0.5))
cutter = bpy.context.active_object
cutter.name = 'LegCutter'

obj_x = obj.dimensions.x
obj_y = obj.dimensions.y
cutter.scale = (obj_x + 20, obj_y + 20, cut_z + 1)
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

# 3. Verify cutter only overlaps the intended region
cutter_z_min = min(v.co.z for v in cutter.data.vertices)
cutter_z_max = max(v.co.z for v in cutter.data.vertices)
print(f"Cutter Z: {cutter_z_min:.1f} to {cutter_z_max:.1f}")
print(f"Object Z: {z_min:.1f} to {z_max:.1f}")

# 4. Apply Boolean DIFFERENCE
bpy.ops.object.select_all(action='DESELECT')
obj.select_set(True)
bpy.context.view_layer.objects.active = obj

bool_mod = obj.modifiers.new(name='TrimLegs', type='BOOLEAN')
bool_mod.operation = 'DIFFERENCE'
bool_mod.object = cutter
bpy.ops.object.modifier_apply(modifier='TrimLegs')

# 5. Clean up: delete the cutter
bpy.data.objects.remove(cutter, do_unlink=True)

print(f"Trimmed. New Z range: {min(v.co.z for v in obj.data.vertices):.1f} "
      f"to {max(v.co.z for v in obj.data.vertices):.1f}")
```

---

### Extrude Faces

Useful for embossing/debossing features.

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

### Subdivide Mesh

Adds more geometry for smoother curves.

```python
import bpy

obj = bpy.data.objects['ObjectName']
bpy.context.view_layer.objects.active = obj
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.mesh.subdivide(number_cuts=2)
bpy.ops.object.mode_set(mode='OBJECT')
```

---

### Smooth Shading

Visual only — doesn't affect print geometry.

```python
import bpy

obj = bpy.data.objects['ObjectName']
bpy.context.view_layer.objects.active = obj
bpy.ops.object.shade_smooth()
```

---

## Primitives

```python
import bpy

# Cube
bpy.ops.mesh.primitive_cube_add(
    size=2,
    location=(0, 0, 0)
)

# UV Sphere
bpy.ops.mesh.primitive_uv_sphere_add(
    radius=1,
    segments=32,
    ring_count=16,
    location=(0, 0, 0)
)

# Cylinder
bpy.ops.mesh.primitive_cylinder_add(
    radius=1,
    depth=2,
    vertices=32,
    location=(0, 0, 0)
)

# Cone
bpy.ops.mesh.primitive_cone_add(
    radius1=1,
    radius2=0,
    depth=2,
    vertices=32,
    location=(0, 0, 0)
)

# Torus
bpy.ops.mesh.primitive_torus_add(
    major_radius=1,
    minor_radius=0.25,
    major_segments=48,
    minor_segments=12,
    location=(0, 0, 0)
)
```

---

## Transformations

### Scale Object

```python
import bpy

obj = bpy.data.objects['ObjectName']
obj.scale = (2, 2, 2)  # Double size uniformly

# Or scale non-uniformly
obj.scale = (1, 1, 2)  # Double height only
```

### Rotate Object

```python
import bpy
import math

obj = bpy.data.objects['ObjectName']
obj.rotation_euler = (
    math.radians(45),  # X rotation
    0,                  # Y rotation
    math.radians(90)   # Z rotation
)
```

### Move Object

```python
import bpy

obj = bpy.data.objects['ObjectName']
obj.location = (1, 2, 3)

# Or relative move
obj.location.z += 1
```

### Apply All Transforms

**Important before export:** Bakes scale/rotation into actual vertex positions.

```python
import bpy

obj = bpy.data.objects['ObjectName']
bpy.context.view_layer.objects.active = obj
obj.select_set(True)
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
```

---

## Selection

### Select by Location (bmesh)

```python
import bpy
import bmesh

obj = bpy.data.objects['ObjectName']
bpy.context.view_layer.objects.active = obj
bpy.ops.object.mode_set(mode='EDIT')

bm = bmesh.from_edit_mesh(obj.data)

# Select vertices above Z=0
for v in bm.verts:
    v.select = v.co.z > 0

bm.select_flush_mode()
bmesh.update_edit_mesh(obj.data)
```

### Select Faces by Normal

```python
import bpy
import bmesh

obj = bpy.data.objects['ObjectName']
bpy.ops.object.mode_set(mode='EDIT')

bm = bmesh.from_edit_mesh(obj.data)

# Select faces pointing up (top faces)
for face in bm.faces:
    face.select = face.normal.z > 0.9

bmesh.update_edit_mesh(obj.data)
```

---

## Modifiers

### Subdivision Surface

Creates smoother surfaces. Good for organic shapes. Higher levels = smoother but more polygons. Values above 3 may cause memory issues.

```python
import bpy

obj = bpy.data.objects['ObjectName']
bpy.context.view_layer.objects.active = obj

mod = obj.modifiers.new(name='Subsurf', type='SUBSURF')
mod.levels = 2          # Viewport smoothness
mod.render_levels = 2   # Final smoothness

bpy.ops.object.modifier_apply(modifier='Subsurf')
```

### Mirror

Work on half the model, mirror automatically. Great for symmetrical objects.

```python
import bpy

obj = bpy.data.objects['ObjectName']

mirror = obj.modifiers.new(name='Mirror', type='MIRROR')
mirror.use_axis[0] = True  # Mirror on X axis

bpy.context.view_layer.objects.active = obj
bpy.ops.object.modifier_apply(modifier='Mirror')
```

### Solidify (Add Thickness)

Essential for turning surfaces into printable solids. If your model is just a surface (like an imported SVG), use this to add wall thickness.

```python
import bpy

obj = bpy.data.objects['ObjectName']

solidify = obj.modifiers.new(name='Solidify', type='SOLIDIFY')
solidify.thickness = 2.0  # 2mm walls
solidify.offset = 0       # Center the thickness

bpy.context.view_layer.objects.active = obj
bpy.ops.object.modifier_apply(modifier='Solidify')
```

### Bevel

Rounds sharp edges. Can improve print quality and aesthetics.

```python
import bpy

obj = bpy.data.objects['ObjectName']

bevel = obj.modifiers.new(name='Bevel', type='BEVEL')
bevel.width = 0.5      # Bevel size
bevel.segments = 3     # Smoothness of bevel

bpy.context.view_layer.objects.active = obj
bpy.ops.object.modifier_apply(modifier='Bevel')
```

### Array

Create repeated copies (e.g., chain links, patterns).

```python
import bpy

obj = bpy.data.objects['ObjectName']

array = obj.modifiers.new(name='Array', type='ARRAY')
array.count = 5
array.relative_offset_displace = (1.1, 0, 0)  # Slight gap between copies

bpy.context.view_layer.objects.active = obj
bpy.ops.object.modifier_apply(modifier='Array')
```

---

## Print Preparation

### 3D Print Toolbox

Blender's built-in add-on finds and fixes common mesh problems. **Use before every export.**

```python
import bpy

# Enable add-on (only needed once per session)
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

**Individual checks:**

```python
bpy.ops.mesh.print3d_check_solid()       # Non-watertight (holes, open edges)
bpy.ops.mesh.print3d_check_intersect()   # Self-intersecting geometry
bpy.ops.mesh.print3d_check_thick()       # Walls thinner than minimum
bpy.ops.mesh.print3d_check_sharp()       # Overly sharp edges
bpy.ops.mesh.print3d_check_overhang()    # Overhangs needing supports (default 45 deg)
bpy.ops.mesh.print3d_check_degenerate()  # Degenerate/distorted faces
```

**Auto-fix common issues:**

```python
bpy.ops.mesh.print3d_clean_non_manifold()  # Fill holes, merge vertices
bpy.ops.mesh.print3d_clean_flat()          # Flatten one side for bed adhesion
bpy.ops.mesh.print3d_clean_isolated()      # Remove loose geometry
```

**Export directly from toolbox:**

```python
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

bm = bmesh.from_edit_mesh(obj.data)
non_manifold_count = sum(1 for v in bm.verts if v.select)

bpy.ops.object.mode_set(mode='OBJECT')

if non_manifold_count > 0:
    print(f"WARNING: {non_manifold_count} non-manifold vertices found!")
else:
    print("Mesh is watertight and ready for printing")
```

---

### Wall Thickness Guidelines

| Material | Minimum Wall Thickness |
|----------|----------------------|
| PLA/ABS (FDM) | 1.2mm (3 perimeters at 0.4mm nozzle) |
| Resin (SLA) | 0.5mm - 1mm |
| Detailed features | 2mm+ recommended |

Use `print3d_check_thick()` to find thin areas, then thicken with the Solidify modifier (see [Modifiers > Solidify](#solidify-add-thickness)).

---

### Reduce Over-Tessellation (Decimate)

Models with too many faces slow down processing and create large files.

```python
import bpy

obj = bpy.data.objects['ObjectName']
bpy.context.view_layer.objects.active = obj

print(f"Before: {len(obj.data.polygons)} faces")

decimate = obj.modifiers.new(name='Decimate', type='DECIMATE')
decimate.decimate_type = 'COLLAPSE'
decimate.ratio = 0.5  # Reduce to 50% of faces (adjust as needed)

bpy.ops.object.modifier_apply(modifier='Decimate')

print(f"After: {len(obj.data.polygons)} faces")
```

Start with ratio 0.5, check if detail is preserved. Most printers can't reproduce detail finer than 0.1-0.2mm.

---

### Verify Export (Re-import Test)

After exporting, re-import to verify geometry. Catches missing modifiers or broken geometry.

```python
import bpy

# Export
bpy.ops.wm.stl_export(filepath='/tmp/test_export.stl', export_selected_objects=True)

# Re-import to compare
bpy.ops.wm.stl_import(filepath='/tmp/test_export.stl')
imported = bpy.context.active_object
imported.name = 'Verification_Import'

# Move aside for visual comparison
imported.location.x += imported.dimensions.x * 1.5
```

---

## Export / Import

**Blender 4.x changed the STL API.** The old `bpy.ops.export_mesh.stl()` / `bpy.ops.import_mesh.stl()` no longer exist.

### Export STL

```python
import bpy

obj = bpy.data.objects['ObjectName']
bpy.ops.object.select_all(action='DESELECT')
obj.select_set(True)

# Apply transforms first
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

bpy.ops.wm.stl_export(
    filepath='/path/to/output.stl',
    export_selected_objects=True,
    global_scale=1.0,
    ascii_format=False  # Binary format (default) — much smaller files
)
```

### Import STL

```python
import bpy

bpy.ops.wm.stl_import(filepath='/path/to/model.stl')
obj = bpy.context.active_object  # The imported object
```

### Parameter Mapping (old to new)

| Old (`export_mesh.stl`) | New (`wm.stl_export`) |
|---|---|
| `use_selection=True` | `export_selected_objects=True` |
| `ascii=False` | `ascii_format=False` |

---

## Profile-and-Extrude Pattern

Build a 2D cross-section profile with bmesh, then extrude it to create 3D shapes like shelves, channels, rails. Use the Solidify modifier for wall thickness instead of manually constructing inner/outer walls.

### Build Profile, Extrude, and Solidify

```python
import bpy
import bmesh
import math

# Example: shelf cross-section (side profile in YZ plane, extruded along X)
width = 200       # Extrude distance (X)
depth = 160       # Profile span (Y)
leg_height = 60   # Profile height (Z)
curve_radius = 25
thickness = 5
segments = 16     # Segments per quarter-circle arc

top_z = leg_height
r = curve_radius

# Build 2D profile as (Y, Z) points
profile = []

# Front leg bottom
profile.append((0, 0))

# Straight section up to curve start
if leg_height > r:
    profile.append((0, top_z - r))

# Front curve (vertical-to-horizontal, quarter circle)
# Arc center: (r, top_z - r)
for i in range(1, segments + 1):
    angle = math.pi - (math.pi / 2 * i / segments)
    y = r + r * math.cos(angle)
    z = (top_z - r) + r * math.sin(angle)
    profile.append((y, z))

# Flat top
profile.append((depth - r, top_z))

# Back curve (horizontal-to-vertical, quarter circle)
# Arc center: (depth - r, top_z - r)
for i in range(1, segments + 1):
    angle = math.pi / 2 - (math.pi / 2 * i / segments)
    y = (depth - r) + r * math.cos(angle)
    z = (top_z - r) + r * math.sin(angle)
    profile.append((y, z))

# Back leg bottom
if leg_height > r:
    profile.append((depth, top_z - r))
profile.append((depth, 0))

# IMPORTANT: Remove near-duplicate points at arc/line junctions
cleaned = [profile[0]]
for i in range(1, len(profile)):
    dy = profile[i][0] - cleaned[-1][0]
    dz = profile[i][1] - cleaned[-1][1]
    if math.sqrt(dy*dy + dz*dz) > 0.01:
        cleaned.append(profile[i])
profile = cleaned

# Create mesh by placing profile at X=-width/2 and X=+width/2
mesh = bpy.data.meshes.new('ShelfMesh')
obj = bpy.data.objects.new('Shelf', mesh)
bpy.context.collection.objects.link(obj)

bm = bmesh.new()
half_w = width / 2
left_verts = []
right_verts = []

for (y, z) in profile:
    left_verts.append(bm.verts.new((-half_w, y - depth/2, z)))
    right_verts.append(bm.verts.new((half_w, y - depth/2, z)))

bm.verts.ensure_lookup_table()

for i in range(len(profile) - 1):
    bm.faces.new([left_verts[i], left_verts[i+1], right_verts[i+1], right_verts[i]])

bm.to_mesh(mesh)
bm.free()

# Use Solidify for wall thickness (cleaner than manual inner/outer walls)
bpy.context.view_layer.objects.active = obj
obj.select_set(True)
solidify = obj.modifiers.new(name='Solidify', type='SOLIDIFY')
solidify.thickness = thickness
solidify.offset = -1  # Solidify outward
solidify.use_even_offset = True
bpy.ops.object.modifier_apply(modifier='Solidify')
```

### Zoom to Fit Object (Required at mm Scale)

With `scale_length=0.001`, newly created objects are invisible at default zoom. Always zoom after creation.

```python
import bpy

obj = bpy.data.objects['ObjectName']
bpy.ops.object.select_all(action='DESELECT')
obj.select_set(True)
bpy.context.view_layer.objects.active = obj

for area in bpy.context.screen.areas:
    if area.type == 'VIEW_3D':
        for region in area.regions:
            if region.type == 'WINDOW':
                with bpy.context.temp_override(area=area, region=region):
                    bpy.ops.view3d.view_selected()
                break
        break
```

---

## Design Patterns for Printability

Code patterns implementing rules from `design-rules.md`. See that file for design rationale.

### Teardrop Hole — Horizontal (Axis Parallel to Print Surface)

Avoids unsupported overhangs at the top of the hole. Small holes use a 90-degree point; large holes use a flat roof offset 0.4mm above the circle to compensate for bridge droop.

```python
import bpy
import bmesh
import math

def create_teardrop_hole_horizontal(radius, depth, location=(0, 0, 0), segments=32, flat_roof=False):
    """Create a teardrop-shaped hole tool for boolean subtraction.
    Hole axis runs along Y. Teardrop point/flat at +Z (top of hole).
    Use flat_roof=True for holes larger than ~6mm diameter.
    """
    mesh = bpy.data.meshes.new('TeardropHole')
    obj = bpy.data.objects.new('TeardropHole', mesh)
    bpy.context.collection.objects.link(obj)

    bm = bmesh.new()
    half_depth = depth / 2

    # Build profile in XZ plane (hole cross-section)
    for y_pos in [-half_depth, half_depth]:
        verts = []
        if flat_roof:
            # Flat roof variant: circle below, flat bridge on top
            roof_offset = 0.4  # mm above circle for bridge droop
            for i in range(segments):
                angle = math.pi + (math.pi * i / (segments - 1))  # Bottom half: pi to 2*pi
                x = radius * math.cos(angle)
                z = radius * math.sin(angle)
                verts.append(bm.verts.new((x, y_pos, z)))
            # Flat roof at top
            verts.append(bm.verts.new((-radius, y_pos, roof_offset)))
            verts.append(bm.verts.new((radius, y_pos, roof_offset)))
        else:
            # Teardrop variant: circle with 90-degree point at top
            for i in range(segments):
                angle = math.pi / 2 + (2 * math.pi * i / segments)
                if angle > 2 * math.pi:
                    angle -= 2 * math.pi
                x = radius * math.cos(angle)
                z = radius * math.sin(angle)
                # Replace top quarter with straight lines to a point
                if z > radius * 0.707:  # Above 45 degrees
                    continue
                verts.append(bm.verts.new((x, y_pos, z)))
            # Add the teardrop point at top
            verts.append(bm.verts.new((0, y_pos, radius)))

    bm.verts.ensure_lookup_table()
    half = len(bm.verts) // 2
    front = list(bm.verts[:half])
    back = list(bm.verts[half:])

    # Create faces between front and back rings
    for i in range(len(front)):
        j = (i + 1) % len(front)
        bm.faces.new([front[i], front[j], back[j], back[i]])

    # Cap the ends
    bm.faces.new(front)
    bm.faces.new(list(reversed(back)))

    bm.to_mesh(mesh)
    bm.free()

    obj.location = location
    return obj
```

### Teardrop Hole — Vertical (Axis Perpendicular to Print Surface)

Gives the perimeter seam a designated corner so it doesn't distort the circular portion. Uses a 120-degree angle (gentler than horizontal variant).

```python
import bpy
import bmesh
import math

def create_teardrop_hole_vertical(radius, depth, location=(0, 0, 0), segments=32):
    """Create a teardrop-shaped hole tool for vertical holes.
    Hole axis runs along Z. Teardrop point at +X to capture seam.
    120-degree angle at the point.
    """
    mesh = bpy.data.meshes.new('TeardropVertical')
    obj = bpy.data.objects.new('TeardropVertical', mesh)
    bpy.context.collection.objects.link(obj)

    bm = bmesh.new()

    # Build profile in XY plane
    # Circle from 30 deg to 330 deg, then lines to a point at the right
    point_half_angle = math.radians(30)  # 120-degree point = 60 deg total = 30 each side
    point_x = radius / math.cos(point_half_angle)  # X position of teardrop tip

    for z_pos in [0, depth]:
        verts_ring = []
        # Arc from +30 deg to +330 deg (going the long way around, skipping the right side)
        arc_start = point_half_angle
        arc_end = 2 * math.pi - point_half_angle
        for i in range(segments):
            angle = arc_start + (arc_end - arc_start) * i / (segments - 1)
            x = radius * math.cos(angle)
            y = radius * math.sin(angle)
            verts_ring.append(bm.verts.new((x, y, z_pos)))
        # Teardrop point
        verts_ring.append(bm.verts.new((point_x, 0, z_pos)))

    bm.verts.ensure_lookup_table()
    half = len(bm.verts) // 2
    bottom = list(bm.verts[:half])
    top = list(bm.verts[half:])

    for i in range(len(bottom)):
        j = (i + 1) % len(bottom)
        bm.faces.new([bottom[i], bottom[j], top[j], top[i]])

    bm.faces.new(bottom)
    bm.faces.new(list(reversed(top)))

    bm.to_mesh(mesh)
    bm.free()

    obj.location = location
    return obj
```

### Hexagonal Hole (Interference Fit)

Hexagonal holes accommodate oversized shafts by bending rather than stretching. The seam hides in a corner. Use instead of circular holes for press fits.

```python
import bpy
import bmesh
import math

def create_hex_hole(radius, depth, location=(0, 0, 0)):
    """Create a hexagonal hole tool for boolean subtraction.
    radius: inscribed circle radius (flat-to-flat / 2).
    """
    mesh = bpy.data.meshes.new('HexHole')
    obj = bpy.data.objects.new('HexHole', mesh)
    bpy.context.collection.objects.link(obj)

    bm = bmesh.new()

    for z_pos in [0, depth]:
        for i in range(6):
            angle = math.radians(60 * i + 30)  # Flat bottom orientation
            x = radius / math.cos(math.radians(30)) * math.cos(angle)
            y = radius / math.cos(math.radians(30)) * math.sin(angle)
            bm.verts.new((x, y, z_pos))

    bm.verts.ensure_lookup_table()
    bottom = list(bm.verts[:6])
    top = list(bm.verts[6:])

    for i in range(6):
        j = (i + 1) % 6
        bm.faces.new([bottom[i], bottom[j], top[j], top[i]])

    bm.faces.new(bottom)
    bm.faces.new(list(reversed(top)))

    bm.to_mesh(mesh)
    bm.free()

    obj.location = location
    return obj
```

### Mouse Ears (Bed Adhesion)

Small discs at part corners to prevent lifting. Design into the geometry so no slicer brim is needed.

```python
import bpy
import math

def add_mouse_ear(location, radius=5, height=0.4):
    """Add a mouse ear disc at the given location.
    radius: ear radius in mm (default 5mm).
    height: one or two layers thick (default 0.4mm = 2 layers).
    """
    bpy.ops.mesh.primitive_cylinder_add(
        radius=radius,
        depth=height,
        vertices=32,
        location=(location[0], location[1], height / 2)
    )
    ear = bpy.context.active_object
    ear.name = 'MouseEar'
    return ear

# Usage: add ears at each corner of a bounding box, then Boolean UNION
# corners = [(x_min, y_min), (x_max, y_min), (x_min, y_max), (x_max, y_max)]
# for (x, y) in corners:
#     ear = add_mouse_ear((x, y, 0))
#     # Boolean UNION ear with main object
```

### Shadow Line (Gap Between Mating Parts)

A controlled gap between joined parts hides surface imperfections. A small lip conceals the mechanical connection.

```python
import bpy

def add_shadow_line_lip(obj, lip_height=1.0, lip_depth=0.8, gap_width=0.5):
    """Add a lip along the joining edge for a shadow line effect.
    Typically applied near the parting line of a two-part enclosure.
    lip_height: how tall the lip extends (mm).
    lip_depth: how far inward the lip reaches (mm).
    gap_width: visible gap between the two parts (mm).

    Design guidance:
    - gap_width should be large enough to hide surface imperfections (~0.5mm)
    - Add a matching recess on the mating part
    - For dust protection, add a second inner lip to create a labyrinth seal
    """
    # Shadow lines are geometry-specific — implement by adding a thin
    # extruded lip along the parting edge of your enclosure.
    # Typical approach:
    # 1. Select edge loop at the parting line
    # 2. Extrude inward by lip_depth
    # 3. Extrude up/down by lip_height
    # 4. Ensure gap_width clearance on the mating part
    pass  # Implementation depends on specific part geometry
```

---

## Utility Functions

### Duplicate Object

```python
import bpy

obj = bpy.data.objects['ObjectName']
bpy.context.view_layer.objects.active = obj
obj.select_set(True)
bpy.ops.object.duplicate()
new_obj = bpy.context.active_object
new_obj.name = 'ObjectName_Copy'
```

### Delete Object

```python
import bpy

obj = bpy.data.objects['ObjectName']
bpy.data.objects.remove(obj, do_unlink=True)
```

### Check if Object Exists

```python
import bpy

def object_exists(name):
    return name in bpy.data.objects

if object_exists('Cube'):
    obj = bpy.data.objects['Cube']
```

### Get Object Dimensions

```python
import bpy

obj = bpy.data.objects['ObjectName']
print(f"Dimensions (XYZ): {obj.dimensions}")
print(f"Bounding box: {[v[:] for v in obj.bound_box]}")

# In millimeters (if units set correctly)
print(f"Size: {obj.dimensions.x}mm x {obj.dimensions.y}mm x {obj.dimensions.z}mm")
```

### Center Object at Origin

```python
import bpy

obj = bpy.data.objects['ObjectName']
bpy.context.view_layer.objects.active = obj
obj.select_set(True)

# Set origin to geometry center
bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')

# Move object so origin is at world origin
obj.location = (0, 0, 0)
```
