// Her, in the lounge: the rigged figure from scripts/journal-figure.py, posed
// live. Leg poses are bone turns blended over time; each arm is solved from
// where its hand should be (a two-bone reach: shoulder, elbow, wrist), so a
// hand can rest on her thigh, reach toward an entry, or hold one in her lap.
// The suit, its gold trim and the boots are painted in the shader below from
// where each vertex sits at rest.

import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Bone turns, as the Blender script used to bake them: degrees (x, y, z) in
// each bone's own frame, Blender's XYZ order.
type Turns = Record<string, [number, number, number]>;

// Seated, leaning back a little. The arms are left to the solver.
const BODY: Turns = { 'spine01': [-25, 0, 0] };

// pose -> leg turns (why)
export const POSES = {
  rest:  { 'upperleg01.L': [-106, 30, 8], 'upperleg01.R': [-90, -4, 10], 'lowerleg01.L': [38, 0, 0], 'lowerleg01.R': [16, 0, 0], 'foot.L': [20, 0, 0], 'foot.R': [12, 0, 0] },  // knees lightly crossed
  cross: { 'upperleg01.L': [-110, 40, 6], 'upperleg01.R': [-88, -6, 10], 'lowerleg01.L': [46, 0, 0], 'lowerleg01.R': [14, 0, 0], 'foot.L': [20, 0, 0], 'foot.R': [12, 0, 0] },  // one thigh well over the other
  lift:  { 'upperleg01.L': [-122, 22, 8], 'upperleg01.R': [-90, -4, 10], 'lowerleg01.L': [52, 0, 0], 'lowerleg01.R': [16, 0, 0], 'foot.L': [20, 0, 0], 'foot.R': [12, 0, 0] },  // top leg raised clear; only passed through
  side:  { 'upperleg01.L': [-94, 17, 40], 'upperleg01.R': [-94, -14, 44], 'lowerleg01.L': [28, 0, 0], 'lowerleg01.R': [32, 0, 0], 'foot.L': [15, 0, 0], 'foot.R': [15, 0, 0] },  // legs together, tilted to one side
} satisfies Record<string, Turns>;
export type PoseName = keyof typeof POSES;

export type Side = 'L' | 'R';   // her left is +x (screen-left from her eyes)
// What a hand is doing: resting (on her thigh or the chaise), or going to a
// point with some curl of the fingers (0 open, 1 closed).
export type HandGoal = { kind: 'rest' } | { kind: 'at'; p: THREE.Vector3; curl: number };

export type Figure = {
  root: THREE.Group;
  ready: Promise<void>;
  // Legs and cushion placement are settled once ready: the chaise top and
  // where her lap is, for the card.
  lap: THREE.Vector3;
  setPose(to: PoseName): void;
  pose(): PoseName;
  setHand(side: Side, goal: HandGoal): void;
  grip(side: Side, out: THREE.Vector3): THREE.Vector3;
  update(dt: number, time: number): void;
  dispose(): void;
};

// Blender's XYZ euler is three's 'ZYX'.
const turnQ = ([x, y, z]: [number, number, number]) =>
  new THREE.Quaternion().setFromEuler(new THREE.Euler(THREE.MathUtils.degToRad(x), THREE.MathUtils.degToRad(y), THREE.MathUtils.degToRad(z), 'ZYX'));
// three strips '.' from node names.
const node = (name: string) => name.replace(/[[\].:/]/g, '');

export function createFigure(
  load: Promise<GLTF>,
  opts: { upper: boolean; cushionTop: number; place: (box: THREE.Box3) => THREE.Vector3 },
): Figure {
  const root = new THREE.Group();
  const mat = suitMaterial();
  const lap = new THREE.Vector3(0, 0.8, 0);
  const bones = new Map<string, THREE.Bone>();
  const restQ = new Map<THREE.Bone, THREE.Quaternion>();
  const meshes: THREE.SkinnedMesh[] = [];
  const bone = (name: string) => bones.get(node(name));

  // Leg pose, blended along a route of poses; into or out of 'side' goes via
  // 'lift' so the top leg clears the other.
  let current: PoseName = 'rest';
  let route: PoseName[] = [], along = 0;

  // Per hand: the goal, where the wrist is being steered now, and finger curl.
  const hands = {
    L: { goal: { kind: 'rest' } as HandGoal, at: new THREE.Vector3(), curl: 0.35, settled: false },
    R: { goal: { kind: 'rest' } as HandGoal, at: new THREE.Vector3(), curl: 0.35, settled: false },
  };
  const lengths = { L: [0, 0], R: [0, 0] };

  const ready = load.then(gltf => {
    gltf.scene.traverse(o => {
      if (!(o as THREE.Bone).isBone) return;
      bones.set(o.name, o as THREE.Bone);
      restQ.set(o as THREE.Bone, o.quaternion.clone());
    });
    // Her forearms at rest, in the script's (Blender) coordinates, to find
    // which vertices are forearm: glTF (x, y, z) is Blender (x, -z, y).
    gltf.scene.updateMatrixWorld(true);
    const blender = (b: THREE.Bone) => { const g = b.getWorldPosition(new THREE.Vector3()); return new THREE.Vector3(g.x, -g.z, g.y); };
    const forearms = (['L', 'R'] as const).map(side => {
      const shoulder = blender(bone('upperarm01.' + side)!), elbow = blender(bone('lowerarm01.' + side)!), wrist = blender(bone('wrist.' + side)!);
      return { shoulder, upper: elbow.clone().sub(shoulder).normalize(), elbow, dir: wrist.sub(elbow).normalize(), sign: side === 'L' ? 1 : -1 };
    });
    if (!opts.upper) {
      const [l, r] = forearms;
      mat.userData.fade = { elbowL: l.elbow, dirL: l.dir, elbowR: r.elbow, dirR: r.dir };
    }
    gltf.scene.traverse(o => {
      const m = o as THREE.SkinnedMesh;
      if (!m.isMesh) return;
      m.material = mat;
      m.castShadow = m.receiveShadow = true;
      m.frustumCulled = false;   // posed far from its rest bounds
      // Unless asked for all of her, draw only what she'd see of herself:
      // legs, forearms and hands.
      if (!opts.upper) m.geometry.setIndex(visibleOnly(m.geometry, forearms));
      if (m.isSkinnedMesh) meshes.push(m);
    });
    root.add(gltf.scene);

    for (const side of ['L', 'R'] as const) {
      const s = bone('upperarm01.' + side)!, e = bone('lowerarm01.' + side)!, w = bone('wrist.' + side)!;
      root.updateMatrixWorld(true);
      const S = s.getWorldPosition(new THREE.Vector3()), E = e.getWorldPosition(new THREE.Vector3()), W = w.getWorldPosition(new THREE.Vector3());
      lengths[side] = [S.distanceTo(E), E.distanceTo(W)];
    }

    // Seat her: pose, then lay her legs on the cushion.
    applyTurns({ ...BODY, ...POSES.rest });
    root.updateMatrixWorld(true);
    const pts = legPoints();
    root.position.copy(opts.place(new THREE.Box3().setFromPoints(pts)));
    root.updateMatrixWorld(true);
    // Her lap, for the card: over her thighs, a little way from her hips.
    const legs = legPoints();
    const box = new THREE.Box3().setFromPoints(legs);
    const z = box.min.z + 0.35;
    const near = legs.filter(q => Math.abs(q.z - z) < 0.1);
    lap.set(near.reduce((a, q) => a + q.x, 0) / Math.max(1, near.length), Math.max(...near.map(q => q.y)), z);
  });

  function legPoints() {
    const out: THREE.Vector3[] = [];
    for (const m of meshes) {
      const col = m.geometry.attributes.color;
      const pos = m.geometry.attributes.position;
      for (let i = 0; i < pos.count; i += 4) {
        if (col && !isLeg(col, i)) continue;
        out.push(m.getVertexPosition(i, new THREE.Vector3()).applyMatrix4(m.matrixWorld));
      }
    }
    return out;
  }

  function applyTurns(turns: Turns) {
    for (const [name, t] of Object.entries(turns)) {
      const b = bone(name);
      if (b) b.quaternion.copy(restQ.get(b)!).multiply(turnQ(t));
    }
  }

  function blendLegs(a: PoseName, b: PoseName, k: number) {
    const A = POSES[a] as Turns, B = POSES[b] as Turns;
    for (const name of Object.keys(A)) {
      const bn = bone(name);
      if (!bn) continue;
      const qa = restQ.get(bn)!.clone().multiply(turnQ(A[name]));
      const qb = restQ.get(bn)!.clone().multiply(turnQ(B[name]));
      bn.quaternion.copy(qa.slerp(qb, k));
    }
  }

  // ── arms ──
  const tS = new THREE.Vector3(), tE = new THREE.Vector3(), tW = new THREE.Vector3(), tT = new THREE.Vector3();
  const qa = new THREE.Quaternion(), qb = new THREE.Quaternion(), qc = new THREE.Quaternion();

  // Turn bone b (in world terms) so the direction from `from` to `to` lines up
  // with `want`.
  function aim(b: THREE.Bone, from: THREE.Vector3, to: THREE.Vector3, want: THREE.Vector3) {
    const have = tT.subVectors(to, from).normalize();
    qa.setFromUnitVectors(have, want.clone().normalize());
    b.getWorldQuaternion(qb);
    b.parent!.getWorldQuaternion(qc);
    b.quaternion.copy(qc.invert().multiply(qa.multiply(qb)));
    b.updateMatrixWorld(true);
  }

  function solveArm(side: Side, target: THREE.Vector3) {
    const s = bone('upperarm01.' + side)!, e = bone('lowerarm01.' + side)!, w = bone('wrist.' + side)!;
    for (const b of [s, e]) b.quaternion.copy(restQ.get(b)!);
    s.updateMatrixWorld(true);
    s.getWorldPosition(tS);
    const [l1, l2] = lengths[side];
    const toT = new THREE.Vector3().subVectors(target, tS);
    const d = THREE.MathUtils.clamp(toT.length(), Math.abs(l1 - l2) + 0.01, (l1 + l2) * 0.985);
    const dir = toT.normalize();
    // Elbow: out to her side and down, the way a relaxed arm bends.
    const sx = side === 'L' ? 1 : -1;
    const pole = new THREE.Vector3(sx * 0.6, -0.7, -0.2);
    pole.addScaledVector(dir, -pole.dot(dir)).normalize();
    const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
    const hgt = Math.sqrt(Math.max(0, l1 * l1 - a * a));
    const elbow = tS.clone().addScaledVector(dir, a).addScaledVector(pole, hgt);
    const wrist = tS.clone().addScaledVector(dir, d);
    e.getWorldPosition(tE);
    aim(s, tS, tE, elbow.clone().sub(tS));
    e.getWorldPosition(tE);
    w.getWorldPosition(tW);
    aim(e, tE, tW, wrist.clone().sub(tE));
  }

  function curlFingers(side: Side, c: number, time: number, drum: number) {
    for (let f = 1; f <= 5; f++) {
      // A slow drum along the fingers when idle; the thumb keeps still.
      const tap = f > 1 ? drum * Math.max(0, Math.sin(time * 9 - f * 0.9)) * 0.5 : 0;
      for (let j = 1; j <= 3; j++) {
        const b = bone(`finger${f}-${j}.${side}`);
        if (!b) continue;
        const deg = (f === 1 ? 18 : 32) * (c + tap) * (j === 1 ? 0.8 : 1);
        b.quaternion.copy(restQ.get(b)!).multiply(turnQ([deg, 0, 0]));
      }
    }
  }

  // Where a resting hand goes: her left on her left thigh, her right on the
  // chaise beside her hip.
  function restAt(side: Side, time: number, out: THREE.Vector3) {
    const hip = bone('upperleg01.' + side)!.getWorldPosition(new THREE.Vector3());
    if (side === 'L') {
      const knee = bone('lowerleg01.L')!.getWorldPosition(new THREE.Vector3());
      return out.copy(hip).lerp(knee, 0.6 + 0.03 * Math.sin(time * 0.35)).add(new THREE.Vector3(0.06, 0.08, 0));
    }
    return out.set(hip.x - 0.2, opts.cushionTop + 0.035, hip.z + 0.42);
  }

  let drumUntil = 0, nextDrum = 4;
  const goalP = new THREE.Vector3();

  return {
    root,
    ready,
    lap,
    setPose(to) {
      if (to === current && !route.length) return;
      const from = route.length ? route[route.length - 1] : current;
      if (to === from) return;
      const via = (to === 'side') !== (from === 'side');
      route = [current, ...(via ? ['lift' as const] : []), to];
      along = 0;
    },
    pose: () => (route.length ? route[route.length - 1] : current),
    setHand(side, goal) { hands[side].goal = goal; },
    grip(side, out) {
      // The middle of her palm: past the wrist along the hand.
      const w = bone('wrist.' + side)!, f = bone(`finger3-1.${side}`);
      w.getWorldPosition(out);
      if (f) out.lerp(f.getWorldPosition(tT), 0.7);
      return out;
    },
    update(dt, time) {
      if (!meshes.length) return;
      // Body and legs first; the arms are solved against them.
      applyTurns(BODY);
      if (route.length) {
        along = Math.min(route.length - 1, along + dt / 0.9);
        const i = Math.min(route.length - 2, Math.floor(along)), k = along - i;
        blendLegs(route[i], route[i + 1], k * k * (3 - 2 * k));
        if (along >= route.length - 1) { current = route[route.length - 1]; route = []; }
      } else blendLegs(current, current, 0);
      root.updateMatrixWorld(true);

      if (time > nextDrum) { drumUntil = time + 1.6; nextDrum = time + 6 + Math.random() * 6; }
      for (const side of ['L', 'R'] as const) {
        const h = hands[side];
        const want = h.goal.kind === 'rest' ? restAt(side, time, goalP) : goalP.copy(h.goal.p);
        const curl = h.goal.kind === 'rest' ? 0.55 : h.goal.curl;
        if (!h.settled) { h.at.copy(want); h.settled = true; }
        h.at.lerp(want, 1 - Math.exp(-dt * 7));
        h.curl += (curl - h.curl) * (1 - Math.exp(-dt * 6));
        solveArm(side, h.at);
        const idle = h.goal.kind === 'rest' && side === 'L' && time < drumUntil ? 1 : 0;
        curlFingers(side, h.curl, time, idle);
      }
    },
    dispose() {
      mat.dispose();
      for (const m of meshes) m.geometry.dispose();
    },
  };
}

// The suit, the stockings and the boots, painted from each vertex's rest
// pose (colour attribute): R height at rest (/1.8 m), G sideways from the
// leg's centre line, B forward/back of it, A the region.
function suitMaterial() {
  const mat = new THREE.MeshPhysicalMaterial({
    color: '#ffffff', vertexColors: true, roughness: 0.7, side: THREE.DoubleSide, specularIntensity: 0.45,
    sheen: 1, sheenColor: new THREE.Color('#fff6ea'), sheenRoughness: 0.55,
  });
  mat.onBeforeCompile = shader => {
    // Forearm fade (set when only her legs and forearms are drawn).
    const f = mat.userData.fade as { elbowL: THREE.Vector3; dirL: THREE.Vector3; elbowR: THREE.Vector3; dirR: THREE.Vector3 } | undefined;
    shader.uniforms.uFade = { value: f ? 1 : 0 };
    shader.uniforms.uElbowL = { value: f?.elbowL ?? new THREE.Vector3() };
    shader.uniforms.uDirL = { value: f?.dirL ?? new THREE.Vector3(0, 0, 1) };
    shader.uniforms.uElbowR = { value: f?.elbowR ?? new THREE.Vector3() };
    shader.uniforms.uDirR = { value: f?.dirR ?? new THREE.Vector3(0, 0, 1) };
    shader.uniforms.uFadeRange = { value: new THREE.Vector2(FADE[0], FADE[1]) };
    // Rest-pose x (sideways) and y (-y is her front) arrive in the UVs; the
    // glTF export stores v as 1 - v, so undo that here.
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec2 vRest;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvRest = vec2(uv.x, 1.0 - uv.y);');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>
        varying vec2 vRest;
        uniform float uFade;
        uniform vec3 uElbowL, uDirL, uElbowR, uDirR;
        uniform vec2 uFadeRange;`)
      .replace('#include <color_fragment>', /* glsl */ `
        float hz = vColor.r * 1.8;
        // Forearms dissolve toward the elbow in a fine stipple.
        if (uFade > 0.5 && hz > 0.72) {
          vec3 rp = vec3(vRest.x, vRest.y, hz);
          bool left = rp.x > 0.0;
          vec3 el = left ? uElbowL : uElbowR, dr = left ? uDirL : uDirR;
          float along = dot(rp - el, dr);
          if (length(rp - el - dr * along) < 0.075) {
            float k = smoothstep(uFadeRange.x, uFadeRange.y, along);
            float n = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
            if (n > k) discard;
          }
        }
        float sx = (vColor.g - 0.5) / 5.0;
        float fy = -(vColor.b - 0.5) / 5.0;
        float reg = vColor.a;
        // region -> alpha (see scripts/journal-figure.py)
        float boot = step(0.75, reg);                              // boot, 1
        float heel = step(0.35, reg) * (1.0 - boot);               // heel, 0.5
        float cuff = step(0.15, reg) * (1.0 - step(0.35, reg));    // sleeve cuff, 0.2
        float skin = step(0.05, reg) * (1.0 - step(0.15, reg));    // hands, 0.1
        float front = smoothstep(0.0, 0.015, fy);

        // Boots: gold rolled edge along the V-cut top, piping down the front,
        // and the heel.
        float shaftTop = 0.26 - 0.07 * (1.0 - smoothstep(0.0, 0.05, abs(sx))) * front;
        float shaft = max(boot, heel);
        float rim = boot * (1.0 - smoothstep(0.004, 0.008, shaftTop - hz)) * step(0.1, hz);
        float piping = boot * front * (1.0 - smoothstep(0.002, 0.004, abs(sx)));

        // The suit: a gold band where the shorts end, princess lines from the
        // hem in to the waist and out round the bust to the armpits, a yoke
        // from the collar, a mandarin collar edged in gold, and an emblem on
        // the upper chest. Front only, by rest y.
        float ux = abs(vRest.x);
        float fr = 1.0 - smoothstep(-0.07, -0.035, vRest.y);
        float torso = step(ux, mix(0.25, 0.2, step(1.15, hz))) * (1.0 - boot) * (1.0 - heel);
        float band = (1.0 - smoothstep(0.006, 0.009, abs(hz - 0.765))) * step(ux, 0.25);
        float w = mix(0.13, 0.108, smoothstep(0.80, 0.90, hz));
        w = mix(w, 0.075, smoothstep(0.90, 1.05, hz));
        w = mix(w, 0.09, smoothstep(1.05, 1.13, hz));
        w = mix(w, 0.15, smoothstep(1.13, 1.28, hz));
        float princess = (1.0 - smoothstep(0.003, 0.0055, abs(ux - w))) * step(0.77, hz) * (1.0 - step(1.29, hz)) * fr;
        float yt = clamp((1.405 - hz) / 0.115, 0.0, 1.0);
        float yoke = (1.0 - smoothstep(0.003, 0.0055, abs(ux - (0.035 + 0.105 * yt)))) * step(1.29, hz) * step(hz, 1.405) * fr;
        float collar = step(1.432, hz) + (1.0 - smoothstep(0.003, 0.005, abs(hz - 1.402))) * step(ux, 0.075);
        vec2 e = vec2(ux, hz - 1.30);
        float d = e.x / 0.028 + abs(e.y) / 0.042;
        float emblem = (step(d, 1.0) * step(0.7, d)
          + step(ux, 0.004) * step(abs(e.y), 0.055)
          + step(abs(e.y + 0.004), 0.004) * step(ux, 0.036)) * (1.0 - smoothstep(-0.075, -0.055, vRest.y));
        float trim = min(1.0, princess + yoke + collar + emblem) * torso;

        float gold = min(1.0, max(max(rim, piping), max(band, heel)) + trim + cuff);
        vec3 suit = vec3(0.94, 0.92, 0.88);
        vec3 leather = vec3(0.98, 0.97, 0.95);
        vec3 goldC = vec3(0.8, 0.62, 0.34);
        vec3 skinC = vec3(0.93, 0.79, 0.7);
        diffuseColor.rgb = mix(mix(mix(suit, leather, shaft), goldC, gold), skinC, skin);
      `)
      .replace('#include <roughnessmap_fragment>', /* glsl */ `
        #include <roughnessmap_fragment>
        roughnessFactor = mix(mix(mix(0.78, 0.58, shaft), mix(0.3, 0.45, heel), gold), 0.5, skin);
      `)
      .replace('#include <metalnessmap_fragment>', /* glsl */ `
        #include <metalnessmap_fragment>
        metalnessFactor = gold * 0.75 * (1.0 - 0.4 * heel) * (1.0 - skin);
      `)
      // Gold thread catches a little light of its own; polished metal alone
      // would only mirror the dark sky and read brown.
      .replace('#include <emissivemap_fragment>', /* glsl */ `
        #include <emissivemap_fragment>
        totalEmissiveRadiance += goldC * gold * 0.16 + skinC * skin * 0.1;
      `);
  };
  return mat;
}

// Which vertices are her legs (and boots): below the tops of the thighs at
// rest, and not a hand or cuff, whose arms hang that low at rest.
const THIGH_TOP = 0.84;
type Attr = THREE.BufferAttribute | THREE.InterleavedBufferAttribute;
function isLeg(col: Attr, i: number) {
  const reg = col.getW(i);
  return col.getX(i) * 1.8 < THIGH_TOP && !(reg > 0.05 && reg < 0.35);
}
// Her forearms and hands, from just below the elbow; the shader fades the
// last few centimetres out so there's no cut edge to see. Her upper arms
// would sit right under her eyes, so she doesn't see them.
type Forearm = { shoulder: THREE.Vector3; upper: THREE.Vector3; elbow: THREE.Vector3; dir: THREE.Vector3; sign: number };
const rp = new THREE.Vector3(), rq = new THREE.Vector3();
function isArm(col: Attr, uv: Attr, i: number, arms: Forearm[]) {
  const reg = col.getW(i);
  if (reg > 0.05 && reg < 0.35) return true;
  rp.set(uv.getX(i), 1 - uv.getY(i), col.getX(i) * 1.8);
  const arm = arms.find(a => Math.sign(rp.x) === a.sign);
  if (!arm) return false;
  const along = rq.copy(rp).sub(arm.elbow).dot(arm.dir);
  return along > FADE[0] && rq.copy(rp).sub(arm.elbow).addScaledVector(arm.dir, -along).length() < 0.07;
}
// Forearm fade, in metres past the elbow: hidden before the first, solid past the second.
const FADE = [0.02, 0.1];
function visibleOnly(g: THREE.BufferGeometry, arms: Forearm[]) {
  const col = g.attributes.color, uv = g.attributes.uv;
  const idx = g.index;
  if (!col || !idx) return idx;
  const show = (i: number) => isLeg(col, i) || (uv ? isArm(col, uv, i, arms) : false);
  const keep: number[] = [];
  for (let t = 0; t < idx.count; t += 3) {
    const a = idx.getX(t), b = idx.getX(t + 1), c = idx.getX(t + 2);
    if (show(a) && show(b) && show(c)) keep.push(a, b, c);
  }
  return keep;
}
