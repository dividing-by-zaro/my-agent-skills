# Blender Code Snippets for 3D Printing

Additional code patterns organized by category. Add new snippets here as they're discovered and tested.

---

## Geometry Manipulation

### Subdivide Mesh

Adds more geometry for smoother curves. Use Subdivision Surface modifier for smoother results.

```python
import bpy

obj = bpy.data.objects['ObjectName']
bpy.context.view_layer.objects.active = obj
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.mesh.subdivide(number_cuts=2)
bpy.ops.object.mode_set(mode='OBJECT')
```

### Subdivision Surface Modifier

Creates smoother surfaces. Good for organic shapes before printing.

```python
import bpy

obj = bpy.data.objects['ObjectName']
bpy.context.view_layer.objects.active = obj

# Add subdivision surface
mod = obj.modifiers.new(name='Subsurf', type='SUBSURF')
mod.levels = 2          # Viewport smoothness
mod.render_levels = 2   # Final smoothness

# Apply it (bakes the smoothing into the mesh)
bpy.ops.object.modifier_apply(modifier='Subsurf')
```

**Note:** Higher values = smoother but more polygons. Values above 3 may cause memory issues.

### Smooth Shading

Makes surfaces appear smoother without adding geometry (visual only, doesn't affect print).

```python
import bpy

obj = bpy.data.objects['ObjectName']
bpy.context.view_layer.objects.active = obj
bpy.ops.object.shade_smooth()
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

## Primitives

### Add Primitives with Parameters

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

## Modifiers (Print-Relevant)

### Mirror Modifier

Work on half the model, mirror automatically. Great for symmetrical objects.

```python
import bpy

obj = bpy.data.objects['ObjectName']

mirror = obj.modifiers.new(name='Mirror', type='MIRROR')
mirror.use_axis[0] = True  # Mirror on X axis

# Apply before export
bpy.context.view_layer.objects.active = obj
bpy.ops.object.modifier_apply(modifier='Mirror')
```

### Solidify (Add Thickness)

Essential for turning surfaces into printable solids.

```python
import bpy

obj = bpy.data.objects['ObjectName']

solidify = obj.modifiers.new(name='Solidify', type='SOLIDIFY')
solidify.thickness = 2.0  # 2mm walls
solidify.offset = 0       # Center the thickness

# Apply before export
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

# Apply before export
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

# Apply before export
bpy.context.view_layer.objects.active = obj
bpy.ops.object.modifier_apply(modifier='Array')
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

Useful for checking print size.

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

---

## Notes

- Add new snippets here as they're discovered
- Test snippets before adding to ensure they work
- Always apply modifiers before STL export
- Check mesh is manifold/watertight before printing
