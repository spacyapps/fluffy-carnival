// Her, in the lounge: the rigged figure from scripts/journal-figure.py, posed
// live. How she moves, so it reads as a person and not a machine:
// - deliberate moves (a reach, bringing a card in, shifting her legs) follow
//   a minimum-jerk curve, the profile human arms move in: they ease out,
//   peak and ease in, with no sudden change of speed;
// - anything that follows something else (a resting hand, a hand holding a
//   card) rides a critically damped spring, so it settles and never snaps;
// - hands travel in shallow arcs, hips lead the knees and feet, fingers curl
//   one after another, the shoulder helps on long reaches, and she breathes.
// Arms are solved from where each wrist should be (shoulder, elbow, wrist),
// with a soft limit near full reach so the elbow never locks with a jolt.
// The suit, its gold trim and the boots are painted in the shader below from
// where each vertex sits at rest.

import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Bone turns, as the Blender script used to bake them: degrees (x, y, z) in
// each bone's own frame, Blender's XYZ order.
type Turn = [number, number, number];
type Turns = Record<string, Turn>;

// pose -> leg turns (why)
export const POSES = {
  rest:  { 'upperleg01.L': [-106, 30, 8], 'upperleg01.R': [-90, -4, 10], 'lowerleg01.L': [38, 0, 0], 'lowerleg01.R': [16, 0, 0], 'foot.L': [20, 0, 0], 'foot.R': [12, 0, 0] },  // knees lightly crossed
  cross: { 'upperleg01.L': [-110, 40, 6], 'upperleg01.R': [-88, -6, 10], 'lowerleg01.L': [46, 0, 0], 'lowerleg01.R': [14, 0, 0], 'foot.L': [20, 0, 0], 'foot.R': [12, 0, 0] },  // one thigh well over the other
  lift:  { 'upperleg01.L': [-122, 22, 8], 'upperleg01.R': [-90, -4, 10], 'lowerleg01.L': [52, 0, 0], 'lowerleg01.R': [16, 0, 0], 'foot.L': [20, 0, 0], 'foot.R': [12, 0, 0] },  // top leg raised clear; only passed through
  side:  { 'upperleg01.L': [-94, 17, 40], 'upperleg01.R': [-94, -14, 44], 'lowerleg01.L': [28, 0, 0], 'lowerleg01.R': [32, 0, 0], 'foot.L': [15, 0, 0], 'foot.R': [15, 0, 0] },  // legs together, tilted to one side
} satisfies Record<string, Turns>;
export type PoseName = keyof typeof POSES;
const LEG_BONES = Object.keys(POSES.rest);

// How her body moves. Seconds, degrees, metres, hertz.
// knob -> value (why)
const MOTION = {
  lean: -25,          // spine01 at rest: leaning back on the chaise
  breathe: 4.6,       // seconds per breath
  breatheDeg: 1.1,    // chest rise, spread over two spine bones
  legs: 1.25,         // a leg shift, direct
  legsVia: 1.8,       // a leg shift that lifts the top leg clear first
  legLag: { upperleg01: 0, lowerleg01: 0.12, foot: 0.22 } as Record<string, number>,  // hips lead, feet follow
  shift: 2.5,         // spine twist that goes with a leg shift
  handMove: 0.75,     // a hand move, unless the caller says otherwise
  handArc: 0.035,     // how high a hand's path bows
  follow: 4.2,        // spring frequency when a hand tracks something
  restCurl: 0.5,      // relaxed fingers, hanging
  layCurl: 0.15,      // fingers lying along her thigh: nearly straight
  palm: 0.03,         // wrist centre above the surface a hand rests on
  fidget: [8, 14],    // seconds between small resettles of a resting hand
  drum: [6, 12],      // seconds between finger drums
};
// finger -> curl speed (why): index closes first, pinky last, thumb in between
const CURL_RATE = [0, 7, 11, 9.5, 8.5, 7.5];

export type Side = 'L' | 'R';   // her left is +x (screen-left from her eyes)
// What a hand is doing: resting (on her thigh or the chaise), or going to a
// point with some curl of the fingers (0 open, 1 closed). A new `key` starts
// a fresh, eased move there; the same key keeps tracking a moving point.
export type HandGoal =
  | { kind: 'rest' }
  | { kind: 'at'; p: THREE.Vector3; curl: number; key: string; dur?: number; arc?: number };

export type Figure = {
  root: THREE.Group;
  ready: Promise<void>;
  // Settled once ready: where her lap is, for the card.
  lap: THREE.Vector3;
  setPose(to: PoseName): void;
  pose(): PoseName;
  setHand(side: Side, goal: HandGoal): void;
  // Where her wrist actually is (what a held card hangs from).
  hand(side: Side, out: THREE.Vector3): THREE.Vector3;
  update(dt: number, time: number): void;
  dispose(): void;
};

// Minimum-jerk profile, 0..1 -> 0..1: zero speed and acceleration at both ends.
export const mj = (t: number) => { const u = Math.min(1, Math.max(0, t)); return u * u * u * (10 - 15 * u + 6 * u * u); };
// A single hump, 0 at both ends, 1 in the middle, arriving and leaving at
// zero speed so an arced move still starts and stops gently.
const hump = (t: number) => { const u = Math.min(1, Math.max(0, t)); return 16 * u * u * (1 - u) * (1 - u); };

// Blender's XYZ euler is three's 'ZYX'.
const eul = new THREE.Euler();
const turnInto = (out: THREE.Quaternion, x: number, y: number, z: number) =>
  out.setFromEuler(eul.set(THREE.MathUtils.degToRad(x), THREE.MathUtils.degToRad(y), THREE.MathUtils.degToRad(z), 'ZYX'));
// three strips '.' from node names.
const node = (name: string) => name.replace(/[[\].:/]/g, '');

type Hand = {
  goal: HandGoal; key: string;
  pos: THREE.Vector3; vel: THREE.Vector3;             // the wrist target as it moves
  wrist: THREE.Vector3;                                // where the wrist actually got to
  from: THREE.Vector3; v0: THREE.Vector3; t: number; dur: number; arc: number; moving: boolean; settled: boolean;
  curl: number[];                                      // per finger, 1..5
  fidget: number; nextFidget: number; nudge: THREE.Vector3;
  lay: THREE.Vector3; layOn: boolean;                  // which way the hand should lie, when resting on something
};

export function createFigure(
  load: Promise<GLTF>,
  opts: { upper: boolean; cushionTop: number; reduced: boolean; place: (box: THREE.Box3) => THREE.Vector3 },
): Figure {
  const root = new THREE.Group();
  const mat = suitMaterial();
  const lap = new THREE.Vector3(0, 0.8, 0);
  const bones = new Map<string, THREE.Bone>();
  const restQ = new Map<THREE.Bone, THREE.Quaternion>();
  const meshes: THREE.SkinnedMesh[] = [];
  const bone = (name: string) => bones.get(node(name));

  // Scratch space: nothing below allocates once she's loaded.
  const v1 = new THREE.Vector3(), v2 = new THREE.Vector3(), v3 = new THREE.Vector3(), v4 = new THREE.Vector3();
  const vS = new THREE.Vector3(), vE = new THREE.Vector3(), vW = new THREE.Vector3(), vElbow = new THREE.Vector3(), vWrist = new THREE.Vector3(), vPole = new THREE.Vector3();
  const q1 = new THREE.Quaternion(), q2 = new THREE.Quaternion(), q3 = new THREE.Quaternion(), qT = new THREE.Quaternion(), qI = new THREE.Quaternion();
  const UP = new THREE.Vector3(0, 1, 0);

  // ── legs: each pose cached as final bone rotations ──
  let legBones: THREE.Bone[] = [];
  const poseQ = {} as Record<PoseName, THREE.Quaternion[]>;
  let legTarget: PoseName = 'rest';
  const legMove = { active: false, t: 0, dur: 1, via: false, a: [] as THREE.Quaternion[], c: [] as THREE.Quaternion[], b: [] as THREE.Quaternion[], lag: [] as number[], twist: 0 };

  // ── hands ──
  const newHand = (): Hand => ({
    goal: { kind: 'rest' }, key: '', pos: new THREE.Vector3(), vel: new THREE.Vector3(), wrist: new THREE.Vector3(), from: new THREE.Vector3(), v0: new THREE.Vector3(),
    t: 0, dur: 1, arc: 0, moving: false, settled: false, curl: [0, 0.5, 0.5, 0.5, 0.5, 0.5],
    fidget: 0, nextFidget: 3 + Math.random() * 6, nudge: new THREE.Vector3(),
    lay: new THREE.Vector3(), layOn: false,
  });
  const hands: Record<Side, Hand> = { L: newHand(), R: newHand() };
  const arm = {} as Record<Side, { clav?: THREE.Bone; s: THREE.Bone; e: THREE.Bone; w: THREE.Bone; l1: number; l2: number; fingers: (THREE.Bone | undefined)[][] }>;
  let drumAt = -10, nextDrum = 4;

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
      const elbow = blender(bone('lowerarm01.' + side)!), wrist = blender(bone('wrist.' + side)!);
      return { elbow, dir: wrist.sub(elbow).normalize(), sign: side === 'L' ? 1 : -1 };
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

    // Cache the leg poses and the arm chains; a missing bone just means
    // that part stays at rest.
    legBones = LEG_BONES.map(n => bone(n)).filter((b): b is THREE.Bone => !!b);
    for (const name of Object.keys(POSES) as PoseName[]) {
      const turns = POSES[name] as Turns;
      poseQ[name] = legBones.map(b => {
        const key = LEG_BONES.find(n => node(n) === b.name)!;
        const [x, y, z] = turns[key];
        return restQ.get(b)!.clone().multiply(turnInto(new THREE.Quaternion(), x, y, z));
      });
    }
    legMove.lag = legBones.map(b => MOTION.legLag[Object.keys(MOTION.legLag).find(k => b.name.startsWith(k.replace('.', ''))) ?? 'foot'] ?? 0);
    legMove.a = legBones.map(() => new THREE.Quaternion());
    legMove.b = legBones.map(() => new THREE.Quaternion());
    legMove.c = legBones.map(() => new THREE.Quaternion());

    root.updateMatrixWorld(true);
    for (const side of ['L', 'R'] as const) {
      const s = bone('upperarm01.' + side), e = bone('lowerarm01.' + side), w = bone('wrist.' + side);
      if (!s || !e || !w) continue;
      arm[side] = {
        clav: bone('clavicle.' + side), s, e, w,
        l1: s.getWorldPosition(v1).distanceTo(e.getWorldPosition(v2)),
        l2: e.getWorldPosition(v1).distanceTo(w.getWorldPosition(v2)),
        fingers: [1, 2, 3, 4, 5].map(f => [1, 2, 3].map(j => bone(`finger${f}-${j}.${side}`))),
      };
    }

    // Seat her: pose, then lay her legs on the cushion.
    setLegs(poseQ.rest);
    applyBody(0, 0);
    root.updateMatrixWorld(true);
    root.position.copy(opts.place(new THREE.Box3().setFromPoints(legPoints())));
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

  function setLegs(qs: THREE.Quaternion[]) { legBones.forEach((b, i) => b.quaternion.copy(qs[i])); }

  // Spine: the lean, a breath, and a small twist when her legs shift.
  function applyBody(time: number, twist: number) {
    const breath = opts.reduced ? 0 : Math.sin((time / MOTION.breathe) * Math.PI * 2) * MOTION.breatheDeg;
    const s1 = bone('spine01'), s2 = bone('spine02'), s3 = bone('spine03');
    if (s1) s1.quaternion.copy(restQ.get(s1)!).multiply(turnInto(qT, MOTION.lean, twist, 0));
    if (s2) s2.quaternion.copy(restQ.get(s2)!).multiply(turnInto(qT, breath * 0.6, 0, 0));
    if (s3) s3.quaternion.copy(restQ.get(s3)!).multiply(turnInto(qT, breath * 0.4, 0, 0));
  }

  function updateLegs(dt: number) {
    if (!legMove.active) return 0;
    legMove.t += dt;
    const span = legMove.dur - 0.22;
    let done = true;
    legBones.forEach((b, i) => {
      const s = mj((legMove.t - legMove.lag[i]) / span);
      if (s < 1) done = false;
      const a = legMove.a[i], c = legMove.c[i], e = legMove.b[i];
      if (legMove.via) {
        // A quadratic path through the lifted pose: the top leg clears the
        // other without stopping in mid-air.
        q1.copy(a).slerp(c, s);
        q2.copy(c).slerp(e, s);
        b.quaternion.copy(q1.slerp(q2, s));
      } else b.quaternion.copy(a).slerp(e, s);
    });
    const progress = Math.min(1, legMove.t / legMove.dur);
    if (done) legMove.active = false;
    return hump(progress) * legMove.twist;
  }

  // ── arms ──

  // Turn bone b (in world terms) so the direction from `from` to `to` lines
  // up with `want`, `amount` of the way.
  function aim(b: THREE.Bone, from: THREE.Vector3, to: THREE.Vector3, want: THREE.Vector3, amount = 1) {
    v3.subVectors(to, from).normalize();
    v4.copy(want).normalize();
    q1.setFromUnitVectors(v3, v4);
    if (amount < 1) q1.copy(qI).slerp(q1, amount);
    b.getWorldQuaternion(q2);
    b.parent!.getWorldQuaternion(q3);
    b.quaternion.copy(q3.invert().multiply(q1.multiply(q2)));
    b.updateMatrixWorld(true);
  }

  function solveArm(side: Side, target: THREE.Vector3) {
    const A = arm[side];
    if (!A) return;
    const { s, e, w, l1, l2 } = A;
    if (A.clav) A.clav.quaternion.copy(restQ.get(A.clav)!);
    s.quaternion.copy(restQ.get(s)!);
    e.quaternion.copy(restQ.get(e)!);
    (A.clav ?? s).updateMatrixWorld(true);
    const reach = l1 + l2;
    // On a long reach the shoulder comes forward to help.
    if (A.clav) {
      A.clav.getWorldPosition(v1);
      s.getWorldPosition(vS);
      const need = THREE.MathUtils.clamp((vS.distanceTo(target) - reach * 0.8) / (reach * 0.5), 0, 1);
      if (need > 0) aim(A.clav, v1, vS, v2.subVectors(target, v1), need * 0.3);
    }
    s.getWorldPosition(vS);
    // Targets arrive already within reach (see reachable); this only guards
    // the edges.
    const want = v1.subVectors(target, vS);
    const d = THREE.MathUtils.clamp(want.length(), Math.abs(l1 - l2) + 0.01, reach * 0.999);
    const dir = want.normalize();
    // Elbow: out to her side and down, the way a relaxed arm bends.
    vPole.set(side === 'L' ? 0.6 : -0.6, -0.7, -0.2);
    vPole.addScaledVector(dir, -vPole.dot(dir)).normalize();
    const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
    const h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
    vElbow.copy(vS).addScaledVector(dir, a).addScaledVector(vPole, h);
    vWrist.copy(vS).addScaledVector(dir, d);
    e.getWorldPosition(vE);
    aim(s, vS, vE, v2.subVectors(vElbow, vS));
    e.getWorldPosition(vE);
    w.getWorldPosition(vW);
    aim(e, vE, vW, v2.subVectors(vWrist, vE));
  }

  // A hand resting on something bends at the wrist to lie along it, rather
  // than carrying on at the forearm's angle into it. Eased in and out.
  const layAmt: Record<Side, number> = { L: 0, R: 0 };
  function layHand(side: Side) {
    const A = arm[side], H = hands[side];
    const base = A?.fingers[2][0];
    if (!A || !base) return;
    A.w.quaternion.copy(restQ.get(A.w)!);
    layAmt[side] += ((H.layOn && !H.moving ? 1 : 0) - layAmt[side]) * (opts.reduced ? 1 : 0.12);
    if (layAmt[side] < 0.01) return;
    A.w.updateMatrixWorld(true);
    A.w.getWorldPosition(vW);
    base.getWorldPosition(vE);
    aim(A.w, vW, vE, H.lay, layAmt[side]);
  }

  function poseFingers(side: Side, time: number, drumming: boolean) {
    const A = arm[side], H = hands[side];
    if (!A) return;
    for (let f = 1; f <= 5; f++) {
      // The drum: fingers lift and fall pinky to index, twice.
      let tap = 0;
      if (drumming && f > 1) {
        for (let k = 0; k < 2; k++) {
          const x = time - drumAt - k * 0.42 - (5 - f) * 0.085;
          tap -= 0.45 * Math.exp(-(x * x) / 0.0025);
        }
      }
      const c = H.curl[f] + tap;
      A.fingers[f - 1].forEach((b, j) => {
        if (!b) return;
        // joint -> share of the curl (why): knuckle and middle joint do most
        const deg = (f === 1 ? 20 : 34) * c * [0.85, 1, 0.8][j];
        b.quaternion.copy(restQ.get(b)!).multiply(turnInto(qT, deg, 0, 0));
      });
    }
  }

  // Where a resting hand goes: on the chaise off to her side. Each drifts a
  // little, and now and then resettles.
  function restAt(side: Side, time: number, out: THREE.Vector3) {
    const H = hands[side];
    const hip = bone('upperleg01.' + side);
    if (!hip) return out.copy(H.pos);
    hip.getWorldPosition(v1);
    // Flat on the cushion beside her hip, off to her side and just out of
    // her view, fingers pointing down the chaise. Her left is +x.
    const sx = side === 'L' ? 1 : -1;
    out.set(v1.x + sx * 0.2, opts.cushionTop + MOTION.palm, v1.z + 0.12 + 0.015 * Math.sin(time * 0.35 + sx));
    H.lay.set(sx * 0.15, -0.08, 1).normalize();
    H.layOn = true;
    return out.add(H.nudge);
  }

  // Critically damped spring toward `to`, in small steps so it's stable at
  // any frame rate.
  function spring(p: THREE.Vector3, v: THREE.Vector3, to: THREE.Vector3, hz: number, dt: number) {
    const w = 2 * Math.PI * hz;
    for (let left = dt; left > 1e-6; left -= 1 / 120) {
      const h = Math.min(left, 1 / 120);
      v.addScaledVector(v1.subVectors(to, p), w * w * h).multiplyScalar(1 / (1 + 2 * w * h));
      p.addScaledVector(v, h);
    }
  }

  // Pull a target in to where her arm can actually reach, softly: near full
  // stretch it falls short smoothly rather than the elbow snapping straight.
  // Doing it to the target (not in the solver) keeps where she aims and
  // where her wrist goes the same point, so moves start without a jump.
  function reachable(side: Side, p: THREE.Vector3) {
    const A = arm[side];
    if (!A) return p;
    A.s.getWorldPosition(vS);
    const reach = A.l1 + A.l2, soft = reach * 0.08, hard = reach - soft;
    const d = p.distanceTo(vS);
    if (d <= hard) return p;
    const k = (hard + soft * (1 - Math.exp(-(d - hard) / soft))) / d;
    return p.sub(vS).multiplyScalar(k).add(vS);
  }

  function updateHand(side: Side, dt: number, time: number) {
    const H = hands[side];
    const g = H.goal;
    // Resting hands resettle now and then: a new small offset, a new move.
    if (g.kind === 'rest' && !opts.reduced && time > H.nextFidget) {
      H.fidget++;
      H.nudge.set((Math.random() - 0.5) * 0.03, 0, (Math.random() - 0.5) * 0.04);
      H.nextFidget = time + MOTION.fidget[0] + Math.random() * (MOTION.fidget[1] - MOTION.fidget[0]);
    }
    const target = reachable(side, g.kind === 'rest' ? restAt(side, time, v4.set(0, 0, 0)) : v4.copy(g.p));
    const key = g.kind === 'rest' ? `rest:${H.fidget}` : g.key;
    if (!H.settled) { H.pos.copy(target); H.wrist.copy(target); H.key = key; H.settled = true; }
    else if (key !== H.key) {
      H.key = key;
      // Carry on at the speed it was already moving.
      H.from.copy(H.pos);
      H.v0.copy(H.vel);
      H.t = 0;
      H.dur = g.kind === 'rest' ? (key.endsWith(':0') || H.from.distanceTo(target) > 0.1 ? 0.9 : 1.3) : g.dur ?? MOTION.handMove;
      H.arc = g.kind === 'rest' ? MOTION.handArc * 0.6 : g.arc ?? MOTION.handArc;
      // Barely anywhere to go: just keep following.
      H.moving = H.from.distanceTo(target) > 0.03;
    }
    if (opts.reduced) { H.pos.copy(target); H.vel.set(0, 0, 0); H.moving = false; }
    else if (H.moving) {
      // Minimum-jerk toward the target as it is now, bowed up into an arc.
      // Its starting speed fades out over the move (u(1-u)^2 has slope 1 at
      // the start and none at the end), so moves blend into one another.
      const prev = v2.copy(H.pos);
      H.t += dt;
      const u = Math.min(1, H.t / H.dur);
      H.pos.copy(H.from).lerp(target, mj(u)).addScaledVector(UP, H.arc * hump(u))
        .addScaledVector(H.v0, H.dur * u * (1 - u) * (1 - u));
      H.vel.subVectors(H.pos, prev).divideScalar(Math.max(dt, 1e-4));
      if (u >= 1) { H.moving = false; H.vel.set(0, 0, 0); }
    } else spring(H.pos, H.vel, target, MOTION.follow, dt);
    // Fingers, each at its own pace.
    if (g.kind !== 'rest') H.layOn = false;
    const want = g.kind === 'rest' ? (H.layOn ? MOTION.layCurl : MOTION.restCurl) : g.curl;
    for (let f = 1; f <= 5; f++) H.curl[f] += (want - H.curl[f]) * (opts.reduced ? 1 : 1 - Math.exp(-dt * CURL_RATE[f]));
  }

  return {
    root,
    ready,
    lap,
    setPose(to) {
      if (to === legTarget || !legBones.length) return;
      const from = legTarget;
      legTarget = to;
      if (opts.reduced) { setLegs(poseQ[to]); return; }
      // Start from wherever her legs are now, so an interrupted shift flows on.
      legMove.via = (to === 'side') !== (from === 'side');
      legBones.forEach((b, i) => {
        legMove.a[i].copy(b.quaternion);
        legMove.b[i].copy(poseQ[to][i]);
        // The via pose, pushed out so the path actually passes through it.
        if (legMove.via) legMove.c[i].copy(legMove.a[i]).slerp(legMove.b[i], 0.5).slerp(poseQ.lift[i], 2);
      });
      legMove.dur = legMove.via ? MOTION.legsVia : MOTION.legs;
      legMove.twist = (to === 'side' ? 1 : -1) * MOTION.shift;
      legMove.t = 0;
      legMove.active = true;
    },
    pose: () => legTarget,
    setHand(side, goal) { hands[side].goal = goal; },
    hand: (side, out) => (arm[side] ? arm[side].w.getWorldPosition(out) : out.copy(hands[side].pos)),
    update(dt, time) {
      if (!meshes.length) return;
      // Body and legs first; the arms are solved against them.
      const twist = updateLegs(dt);
      applyBody(time, twist);
      root.updateMatrixWorld(true);
      if (time > nextDrum && hands.L.goal.kind === 'rest') { drumAt = time; nextDrum = time + MOTION.drum[0] + Math.random() * (MOTION.drum[1] - MOTION.drum[0]); }
      for (const side of ['L', 'R'] as const) {
        updateHand(side, dt, time);
        solveArm(side, hands[side].pos);
        layHand(side);
        if (arm[side]) arm[side].w.getWorldPosition(hands[side].wrist); else hands[side].wrist.copy(hands[side].pos);
        poseFingers(side, time, side === 'L' && hands.L.goal.kind === 'rest' && time - drumAt < 1.2 && !opts.reduced);
      }
    },
    dispose() {
      for (const t of Object.values(mat.userData.maps as Record<string, THREE.Texture>)) t.dispose();
      mat.dispose();
      for (const m of meshes) m.geometry.dispose();
    },
  };
}

// The suit, the stockings and the boots, painted from each vertex's rest
// pose (colour attribute): R height at rest (/1.8 m), G sideways from the
// leg's centre line, B forward/back of it, A the region.
// Material swatches, tiled over her from where each point sits at rest.
// file -> real size of one tile in metres (why)
const SWATCHES = {
  suit:    ['/journal/mat-suit.jpg', 0.08],     // stretch knit: a fine weave
  leather: ['/journal/mat-leather.jpg', 0.06],  // boot leather grain
  gold:    ['/journal/mat-gold.jpg', 0.05],     // brushed gold, lines running round her
} as const;
const EMBLEM = { src: '/journal/mat-emblem.png', size: 0.1, at: 1.30 };  // square mask; metres tall; rest height of its centre

// A soft, sky-facing glow added to the suit itself, so her body is lit more
// without touching anything else in the room.
const SUIT_LIFT = 0.3;

function suitMaterial() {
  const mat = new THREE.MeshPhysicalMaterial({
    color: '#ffffff', vertexColors: true, roughness: 0.7, side: THREE.DoubleSide, specularIntensity: 0.45,
    sheen: 1, sheenColor: new THREE.Color('#fff6ea'), sheenRoughness: 0.55,
  });
  const loader = new THREE.TextureLoader();
  const tex = (src: string, color: boolean) => {
    const t = loader.load(src);
    if (color) { t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; }
    t.anisotropy = 4;
    return t;
  };
  const maps = {
    suit: tex(SWATCHES.suit[0], true), leather: tex(SWATCHES.leather[0], true),
    gold: tex(SWATCHES.gold[0], true), emblem: tex(EMBLEM.src, false),
  };
  mat.userData.maps = maps;
  mat.onBeforeCompile = shader => {
    shader.uniforms.uLift = { value: SUIT_LIFT };
    shader.uniforms.tSuit = { value: maps.suit };
    shader.uniforms.tLeather = { value: maps.leather };
    shader.uniforms.tGold = { value: maps.gold };
    shader.uniforms.tEmblem = { value: maps.emblem };
    shader.uniforms.uTile = { value: new THREE.Vector3(SWATCHES.suit[1], SWATCHES.leather[1], SWATCHES.gold[1]) };
    shader.uniforms.uEmblem = { value: new THREE.Vector2(EMBLEM.size, EMBLEM.at) };
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
        uniform float uFade, uLift;
        uniform vec3 uElbowL, uDirL, uElbowR, uDirR;
        uniform vec2 uFadeRange;
        uniform sampler2D tSuit, tLeather, tGold, tEmblem;
        uniform vec3 uTile;
        uniform vec2 uEmblem;
        // A swatch tiled over her body: two projections (side-on and
        // front-on) averaged, so it holds on any surface without a UV layout.
        vec4 swatch(sampler2D t, vec3 p, float tile) {
          return 0.5 * (texture2D(t, p.xz / tile) + texture2D(t, p.yz / tile));
        }`)
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
        // The emblem on her upper chest, front only.
        // (textures load flipped: v runs bottom to top, like height)
        vec2 euv = vec2(0.5 + vRest.x / uEmblem.x, 0.5 + (hz - uEmblem.y) / uEmblem.x);
        float inE = step(0.0, euv.x) * step(euv.x, 1.0) * step(0.0, euv.y) * step(euv.y, 1.0);
        float emblem = inE * smoothstep(0.35, 0.65, texture2D(tEmblem, euv).r) * (1.0 - smoothstep(-0.075, -0.055, vRest.y));
        float trim = min(1.0, princess + yoke + collar + emblem) * torso;

        float gold = min(1.0, max(max(rim, piping), max(band, heel)) + trim + cuff);
        // The materials, from the swatches.
        vec3 rp3 = vec3(vRest.x, vRest.y, hz);
        vec3 suit = swatch(tSuit, rp3, uTile.x).rgb;
        vec3 leather = swatch(tLeather, rp3, uTile.y).rgb;
        vec3 goldC = swatch(tGold, rp3, uTile.z).rgb;
        vec3 skinC = vec3(0.93, 0.79, 0.7);
        diffuseColor.rgb = mix(mix(mix(suit, leather, shaft), goldC, gold), skinC, skin);
        // Their fine grain, as a height for the bump below (metres).
        float matLum = dot(diffuseColor.rgb, vec3(0.3, 0.59, 0.11));
        float matH = matLum * mix(mix(0.0035, 0.002, shaft), 0.0025, gold) * (1.0 - skin);
      `)
      // Bump from the swatches' grain: light catches the weave and the leather.
      .replace('#include <normal_fragment_maps>', /* glsl */ `
        #include <normal_fragment_maps>
        {
          vec3 sx = dFdx(-vViewPosition), sy = dFdy(-vViewPosition);
          vec3 r1 = cross(sy, normal), r2 = cross(normal, sx);
          float det = dot(sx, r1) * faceDirection;
          vec3 grad = sign(det) * (dFdx(matH) * r1 + dFdy(matH) * r2);
          normal = normalize(abs(det) * normal - grad);
        }
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
        // Sky-facing surfaces take the most, so it models her form rather than flattening it.
        float upv = dot(normal, normalize((viewMatrix * vec4(0.0, 1.0, 0.0, 0.0)).xyz)) * 0.5 + 0.5;
        totalEmissiveRadiance += diffuseColor.rgb * vec3(1.0, 0.97, 0.92) * uLift * (0.35 + 0.65 * upv);
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
type Forearm = { elbow: THREE.Vector3; dir: THREE.Vector3; sign: number };
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
