# Builds the journal's reclining legs: an MPFB (MakeHuman, CC0) body in
# softly pointed, heeled boots, legs crossed at the knee on a chaise, cut at
# the tops of the thighs, with each vertex's rest-pose position stored as a
# colour so the site's shader can paint the suit, the thigh band and the
# boot trim.
#
# Run from the repo root (Blender 5.2 + MPFB 2 installed):
#   blender -b -P scripts/journal-legs.py -- public/journal/lounge-legs.glb \
#     '{"upperleg01.L":[-106,30,8],"upperleg01.R":[-90,-4,10],"lowerleg01.L":[38,0,0],"lowerleg01.R":[16,0,0],"foot.L":[20,0,0],"foot.R":[12,0,0]}'
# A third argument, a path prefix, also writes side/top/pov preview renders.
import bpy, sys, math, bmesh, json
from mathutils import Vector
from bl_ext.user_default.mpfb.services.targetservice import TargetService
from bl_ext.user_default.mpfb.services.humanservice import HumanService

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = argv[0]
POSE = json.loads(argv[1]) if len(argv) > 1 else {}
RENDER = argv[2] if len(argv) > 2 else None

bpy.ops.wm.read_factory_settings(use_empty=True)
macro = TargetService.get_default_macro_info_dict()
macro.update({'gender': 0.0, 'age': 0.5, 'muscle': 0.45, 'weight': 0.45, 'proportions': 1.0, 'height': 0.7})
body = HumanService.create_human(macro_detail_dict=macro)
# Long, slim legs with a little fullness at the thigh.
# target -> weight (why)
TARGETS = {
    'upperlegs-height-incr': 0.25,   # longer thighs
    'lowerlegs-height-incr': 0.35,   # longer shins: most of the leg length
    'measure-knee-circ-decr': 0.35,  # neat knees
    'measure-calf-circ-decr': 0.2,   # slim calves
    'measure-thigh-circ-incr': 0.15, # a little fuller at the thigh
}
TDIR = bpy.utils.user_resource('EXTENSIONS') + '/user_default/mpfb/data/targets/legs/'
for name, w in TARGETS.items():
    TargetService.load_target(body, TDIR + name + '.target.gz', weight=w, name=name)
HumanService.add_builtin_rig(body, 'default')
rig = body.parent
boots_path = bpy.utils.user_resource('EXTENSIONS') + '/.user/user_default/mpfb/data/clothes/shoes03/shoes03.mhclo'
boots = HumanService.add_mhclo_asset(boots_path, body, asset_type='Clothes', subdiv_levels=0)

# Block heels: a tapered block under each boot's heel, riding the foot bone.
def heel_block(side):
    rig.data.pose_position = 'REST'; bpy.context.view_layer.update()
    dg = bpy.context.evaluated_depsgraph_get()
    pts = [v.co.copy() for v in boots.evaluated_get(dg).to_mesh().vertices]
    pts = [p for p in pts if (p.x > 0) == (side == 'L') and p.z < 0.02]
    back = max(p.y for p in pts)
    heel = [p for p in pts if p.y > back - 0.05]
    cx = sum(p.x for p in heel) / len(heel); cy = back - 0.03
    bm = bmesh.new()
    top = [(-0.024, -0.03, 0.0), (0.024, -0.03, 0.0), (0.024, 0.026, 0.0), (-0.024, 0.026, 0.0)]
    bot = [(-0.016, -0.012, -0.075), (0.016, -0.012, -0.075), (0.016, 0.024, -0.075), (-0.016, 0.024, -0.075)]
    vs = [bm.verts.new((cx + x, cy + y, z)) for x, y, z in top + bot]
    for f in [(0, 1, 2, 3), (7, 6, 5, 4), (0, 4, 5, 1), (1, 5, 6, 2), (2, 6, 7, 3), (3, 7, 4, 0)]:
        bm.faces.new([vs[i] for i in f])
    me = bpy.data.meshes.new('heel.' + side); bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new('heel.' + side, me)
    bpy.context.scene.collection.objects.link(ob)
    bone = rig.pose.bones['foot.' + side]
    ob.parent = rig; ob.parent_type = 'BONE'; ob.parent_bone = 'foot.' + side
    ob.matrix_parent_inverse = (rig.matrix_world @ bone.matrix @ __import__('mathutils').Matrix.Translation((0, bone.length, 0))).inverted()
    rig.data.pose_position = 'POSE'
    return ob
heels = [heel_block('L'), heel_block('R')]
bpy.context.view_layer.update()

# Softly pointed toes: past the ball of the foot
# the shoe narrows, runs a touch longer and its toe box lowers a little.
from mathutils import Vector
def smooth(a, b, x):
    t = min(1.0, max(0.0, (x - a) / (b - a)))
    return t * t * (3 - 2 * t)
for side in (True, False):
    vs = [v for v in boots.data.vertices if (v.co.x > 0) == side]
    tip = min(v.co.y for v in vs); ball = tip + 0.075
    toe = [v for v in vs if v.co.y < ball]
    cx = sum(v.co.x for v in toe) / len(toe)
    sole = min(v.co.z for v in toe)
    for v in toe:
        t = (ball - v.co.y) / (ball - tip)
        v.co.x = cx + (v.co.x - cx) * (1 - 0.35 * t)
        v.co.y -= 0.01 * t * t
        v.co.z = sole + (v.co.z - sole) * (1 - 0.2 * t)

# The base shoe's laces are separate little strips (about 50 vertices each);
# drop every loose piece that small so the fronts are plain leather.
bm = bmesh.new(); bm.from_mesh(boots.data)
seen, doomed = set(), []
for v in bm.verts:
    if v in seen: continue
    part, stack = [], [v]
    while stack:
        u = stack.pop()
        if u in seen: continue
        seen.add(u); part.append(u)
        stack.extend(e.other_vert(u) for e in u.link_edges)
    if len(part) < 100: doomed.extend(part)
bmesh.ops.delete(bm, geom=doomed, context='VERTS')
bm.to_mesh(boots.data); bm.free()

# The boot shaft: the lower leg's own surface, lifted off the stocking,
# from the shoe up to a line just above the ankle with a V cut at the front.
SHAFT_TOP, V_APEX, V_HALF = 0.26, 0.19, 0.05
rig.data.pose_position = 'REST'; bpy.context.view_layer.update()
dg = bpy.context.evaluated_depsgraph_get()
sme = bpy.data.meshes.new_from_object(body.evaluated_get(dg), depsgraph=dg)
shaft = bpy.data.objects.new('shaft', sme)
bpy.context.scene.collection.objects.link(shaft)
bm = bmesh.new(); bm.from_mesh(sme)
bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z > 0.34 or abs(v.co.x) > 0.2], context='VERTS')
geom = lambda: bm.verts[:] + bm.edges[:] + bm.faces[:]
bmesh.ops.bisect_plane(bm, geom=geom(), plane_co=(0, 0, SHAFT_TOP), plane_no=(0, 0, 1), clear_outer=True)
bmesh.ops.bisect_plane(bm, geom=geom(), plane_co=(0, 0, 0.03), plane_no=(0, 0, 1), clear_inner=True)
centres = {}
for side in (True, False):
    band = [v.co for v in bm.verts if (v.co.x > 0) == side and 0.2 < v.co.z < 0.25]
    cx = sum(c.x for c in band) / len(band); cy = sum(c.y for c in band) / len(band)
    centres[side] = (cx, cy)
    for sgn in (-1, 1):
        d = Vector((sgn * V_HALF, 0, SHAFT_TOP - V_APEX))
        n = d.cross(Vector((0, 1, 0))).normalized()
        bmesh.ops.bisect_plane(bm, geom=geom(), plane_co=(cx, 0, V_APEX), plane_no=n)
def in_v(c):
    cx, cy = centres[c.x > 0]
    return c.y < cy and c.z > V_APEX + (SHAFT_TOP - V_APEX) * abs(c.x - cx) / V_HALF + 1e-4
bmesh.ops.delete(bm, geom=[f for f in bm.faces if in_v(f.calc_center_median())], context='FACES')
bm.normal_update()
for v in bm.verts:
    v.co += v.normal * (0.0035 + 0.006 * (1 - smooth(0.07, 0.13, v.co.z)))
bm.to_mesh(sme); bm.free()
# Leather has a thickness at its edge.
sol = shaft.modifiers.new('thick', 'SOLIDIFY'); sol.thickness = 0.0025; sol.offset = -1
# Skin it to the rig with the body's own weights.
for g in body.vertex_groups: shaft.vertex_groups.new(name=g.name)
dt = shaft.modifiers.new('weights', 'DATA_TRANSFER')
dt.object = body; dt.use_vert_data = True; dt.data_types_verts = {'VGROUP_WEIGHTS'}
dt.vert_mapping = 'POLYINTERP_NEAREST'; dt.layers_vgroup_select_src = 'ALL'; dt.layers_vgroup_select_dst = 'NAME'
bpy.context.view_layer.objects.active = shaft
for m in ('thick', 'weights'):
    with bpy.context.temp_override(object=shaft, active_object=shaft):
        bpy.ops.object.modifier_apply(modifier=m)
arm = shaft.modifiers.new('rig', 'ARMATURE'); arm.object = rig
rig.data.pose_position = 'POSE'

# bone -> euler degrees (x, y, z) in the bone's own frame
for name, (x, y, z) in POSE.items():
    pb = rig.pose.bones[name]
    pb.rotation_mode = 'XYZ'
    pb.rotation_euler = (math.radians(x), math.radians(y), math.radians(z))
bpy.context.view_layer.update()

def evaluated(obj):
    dg = bpy.context.evaluated_depsgraph_get()
    ev = obj.evaluated_get(dg)
    return [v.co.copy() for v in ev.to_mesh().vertices], ev


def bake(obj, is_boot):
    rig.data.pose_position = 'REST'; bpy.context.view_layer.update()
    rest, _ = evaluated(obj)
    rig.data.pose_position = 'POSE'; bpy.context.view_layer.update()
    dg = bpy.context.evaluated_depsgraph_get()
    ev = obj.evaluated_get(dg)
    me = bpy.data.meshes.new_from_object(ev, depsgraph=dg)
    new = bpy.data.objects.new(obj.name + '_baked', me)
    bpy.context.scene.collection.objects.link(new)
    # Per side and per 1 cm of height, the leg's centre line, so each vertex
    # knows how far it sits from the front seam: R height, G sideways offset,
    # B front/back offset (front is -y), A 1 on the boots.
    from collections import defaultdict
    acc = defaultdict(lambda: [0.0, 0.0, 0])
    for r in rest:
        k = (r.x > 0, round(r.z * 100))
        a = acc[k]; a[0] += r.x; a[1] += r.y; a[2] += 1
    def centre(r):
        for d in (0, 1, -1, 2, -2, 3, -3):
            a = acc.get((r.x > 0, round(r.z * 100) + d))
            if a and a[2]: return a[0] / a[2], a[1] / a[2]
        return r.x, r.y
    col = me.color_attributes.new('rest', 'FLOAT_COLOR', 'POINT')
    for i, v in enumerate(me.vertices):
        r = rest[i]
        cx, cy = centre(r)
        col.data[i].color = (r.z / 1.8, (r.x - cx) * 5 + 0.5, (r.y - cy) * 5 + 0.5, 1.0 if is_boot else 0.0)
    return new, rest

legs, rest = bake(body, False)
shoes, _ = bake(boots, True)
boot_shafts, _ = bake(shaft, True)
# Heels: bake their posed transform into the mesh; A = 0.5 marks them.
heel_objs = []
for hb in heels:
    me = hb.data.copy(); me.transform(hb.matrix_world)
    ob = bpy.data.objects.new(hb.name + '_baked', me)
    bpy.context.scene.collection.objects.link(ob)
    c = me.color_attributes.new('rest', 'FLOAT_COLOR', 'POINT')
    for i in range(len(me.vertices)): c.data[i].color = (0.0, 0.5, 0.5, 0.5)
    heel_objs.append(ob)
top = max(r.z for r in rest)
cut = top * 0.5   # the tops of the thighs; the camera sits just behind
bm = bmesh.new(); bm.from_mesh(legs.data)
col = bm.verts.layers.float_color.get('rest')
rest_x = [r.x for r in rest]
def gone(v):
    z = v[col][0] * 1.8; x = rest_x[v.index]
    return z > cut or (z > 0.55 and abs(x) > 0.21)   # above the hips, or the hanging hands
dead = [v for v in bm.verts if gone(v)]
bmesh.ops.delete(bm, geom=dead, context='VERTS')
bm.to_mesh(legs.data); bm.free()
for o in (legs, shoes):
    for p in o.data.polygons: p.use_smooth = True
keep = [legs, shoes, boot_shafts, *heel_objs]
for o in list(bpy.context.scene.objects):
    if o not in keep: bpy.data.objects.remove(o, do_unlink=True)
for o in (legs, shoes, boot_shafts):
    for p in o.data.polygons: p.use_smooth = True
    m = o.modifiers.new('sub', 'SUBSURF'); m.levels = 1; m.render_levels = 1
print('TOP', top, 'VERTS', len(legs.data.vertices), len(shoes.data.vertices))

if RENDER:
    sc = bpy.context.scene
    sc.render.engine = 'BLENDER_WORKBENCH'
    sc.render.resolution_x, sc.render.resolution_y = 900, 500
    cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam'))
    sc.collection.objects.link(cam); sc.camera = cam
    for tag, loc, rot in [('side', (3.2, -0.4, 0.9), (85, 0, 90)), ('top', (0, -0.5, 3.5), (0, 0, 0)), ('pov', (0, 0.35, 1.3), (64, 0, 180)), ('feet', (0.9, -1.0, 1.0), (88, 0, 90))]:
        cam.location = loc; cam.rotation_euler = [math.radians(a) for a in rot]
        sc.render.filepath = f'{RENDER}_{tag}.png'
        bpy.ops.render.render(write_still=True)

bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', export_apply=True, export_vertex_color='ACTIVE', export_all_vertex_colors=True, export_materials='NONE', export_yup=True, export_draco_mesh_compression_enable=True, export_draco_mesh_compression_level=7)
