// The journal's lounge, seen through her eyes: legs in the white suit and
// boots stretched out on a floating chaise, a window wall onto a fantasy
// galaxy, the app and tech files on a stand to the left and the magazines
// fanned on a table to the right. She is posed live (loungeFigure.ts): tap an
// entry and her hand reaches for it, takes it and holds it in her lap.
// Nothing here is shared with the home page's star system on purpose.

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { createLoungeSky } from './loungeSky';
import { folderTexture, magazineTexture, COVER, type CoverArt, type Fonts } from './loungeTextures';
import { createFigure, mj, POSES, type PoseName, type Side } from './loungeFigure';

export type Item = CoverArt & { id: string; kind: 'file' | 'magazine' };
export type ScreenXY = { x: number; y: number };

export type Lounge = {
  ready: Promise<void>;
  resize(w: number, h: number): void;
  start(): void;
  stop(): void;
  pick(x: number, y: number): string | null;
  setHovered(id: string | null): void;
  // The entry resting in her lap, or null to send it back to its pile.
  setLap(id: string | null): void;
  // Carry an entry under the pointer; drop() says whether it landed in her lap.
  drag(id: string, x: number, y: number): void;
  drop(id: string, x: number, y: number): boolean;
  look(nx: number, ny: number): void;
  onFrame(cb: (anchors: { files: ScreenXY; magazines: ScreenXY; lapLeft: ScreenXY; lapRight: ScreenXY }) => void): void;
  dispose(): void;
};

const CUSHION_TOP = 0.46;
// Through her eyes: reclining on the chaise, looking down her legs to the
// galaxy. (+x is screen-left when looking down +z.)
const CHAISE_Z = 0.55;

const EYE_POV = new THREE.Vector3(0, CUSHION_TOP + 0.72, -0.72);
const AIM_POV = new THREE.Vector3(0, 0.56, 2.4);
const GOLD = '#c9a466';
const COVER_GLOW = 0.42;

export function createLounge(canvas: HTMLCanvasElement, items: Item[], fonts: Fonts, opts: { reducedMotion: boolean; upper?: boolean; view?: string | null; pose?: string | null }): Lounge {
  // ?view=side / ?view=front: looks at her from beside the chaise or from
  // the window, for working on the figure.
  // view -> [eye, aim]
  const VIEWS: Record<string, [THREE.Vector3, THREE.Vector3]> = {
    side: [new THREE.Vector3(-1.7, 1.25, 0.35), new THREE.Vector3(0, 0.72, 0.35)],
    front: [new THREE.Vector3(0.1, 1.15, 2.1), new THREE.Vector3(0, 0.85, 0)],
  };
  const [EYE, AIM] = VIEWS[opts.view ?? ''] ?? [EYE_POV.clone(), AIM_POV.clone()];
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#05060a');
  // Reflections come from the view itself: the galaxy in the floor, the
  // boots and the gold.
  const pmrem = new THREE.PMREMGenerator(renderer);

  const camera = new THREE.PerspectiveCamera(52, 2, 0.05, 900);
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(512, 256), 0.4, 0.55, 0.96);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  const sky = createLoungeSky();
  scene.add(sky.mesh);
  const envScene = new THREE.Scene();
  envScene.add(new THREE.Mesh(sky.mesh.geometry, sky.mesh.material));
  const env = pmrem.fromScene(envScene, 0.02, 0.1, 500).texture;
  scene.environment = env;
  scene.environmentIntensity = 1.2;

  // ── light: the galaxy is the key, a warm reading light keeps covers legible ──
  scene.add(new THREE.HemisphereLight('#6a5a9a', '#0a0a10', 0.25));
  const galaxyLight = new THREE.DirectionalLight('#c8b8ff', 0.9);
  galaxyLight.position.set(-2, 4, 8);
  scene.add(galaxyLight);
  const teal = new THREE.DirectionalLight('#5fd3d8', 0.35);
  teal.position.set(6, 2, 4);
  scene.add(teal);
  const reading = new THREE.SpotLight('#ffd9ae', 2.2, 0, 0.55, 0.8, 2);
  reading.position.set(0.1, 2.3, 0.5);   // straight over the chaise, so its pool stays on it
  reading.target.position.set(0, 0.45, 0.6);
  reading.castShadow = true;
  reading.shadow.mapSize.set(1024, 1024);
  reading.shadow.bias = -0.0005;
  reading.shadow.normalBias = 0.03; // no shadow acne striping the fabric
  scene.add(reading, reading.target);
  // A soft light from behind her feet, rimming the white boots.
  const feet = new THREE.SpotLight('#fff1e0', 2.0, 1.55, 0.45, 1, 2); // short reach: it stops at her boots
  feet.position.set(-0.2, 1.8, 2.0);
  feet.target.position.set(-0.15, 0.55, 1.0);
  scene.add(feet, feet.target);
  // A soft light close to her, so her own hands, sleeves and whatever she
  // holds aren't lost in the dark; it fades out well before the room.
  // Up and behind her, so it falls evenly rather than flaring on whatever
  // she holds close.
  const near = new THREE.PointLight('#fff0e0', 0.45, 2.4, 2);
  near.position.set(EYE.x, EYE.y + 0.45, EYE.z - 0.35);
  scene.add(near);

  // ── room ──
  // The floor stops at the window; past the sill there's only sky.
  const WIN_Z = 3.6;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, WIN_Z + 1), new THREE.MeshStandardMaterial({ color: '#08090d', roughness: 0.85, metalness: 0.1 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.z = (WIN_Z - 1) / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // The window wall: dark mullions and a low sill with a thin light in it.
  const frameMat = new THREE.MeshStandardMaterial({ color: '#15161c', roughness: 0.4, metalness: 0.8 });
  for (const x of [-4.6, -2.3, 2.3, 4.6]) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.1, 5, 0.14), frameMat);
    m.position.set(x, 2.5, WIN_Z);
    scene.add(m);
  }
  const sill = new THREE.Mesh(new THREE.BoxGeometry(12, 0.3, 0.5), frameMat);
  sill.position.set(0, 0.15, WIN_Z);
  scene.add(sill);
  const sillLight = new THREE.Mesh(new THREE.BoxGeometry(12, 0.012, 0.02), new THREE.MeshBasicMaterial({ color: new THREE.Color('#7fe3ea').multiplyScalar(1.6) }));
  sillLight.position.set(0, 0.305, WIN_Z - 0.22);
  scene.add(sillLight);

  // ── the chaise: a deep, channel-quilted cushion in soft ivory fabric on a
  // plinth that floats on its own light. It runs toward the window. ──
  const chaise = new THREE.Group();
  chaise.position.set(0, 0, CHAISE_Z);
  scene.add(chaise);
  const quilt = channelNormals();
  quilt.repeat.set(1, 2.2);
  const fabric = new THREE.MeshPhysicalMaterial({
    color: '#e6e0d7', roughness: 0.88, normalMap: quilt, normalScale: new THREE.Vector2(1.4, 1.4),
    sheen: 0.45, sheenColor: new THREE.Color('#fffaf2'), sheenRoughness: 0.8,
  });
  const cushion = new THREE.Mesh(new RoundedBoxGeometry(1.05, 0.17, 2.3, 10, 0.08), fabric);
  cushion.position.y = CUSHION_TOP - 0.08;
  cushion.receiveShadow = cushion.castShadow = true;
  const plinth = new THREE.Mesh(new RoundedBoxGeometry(0.86, 0.2, 2.1, 4, 0.04), new THREE.MeshStandardMaterial({ color: '#1a1b22', roughness: 0.6, metalness: 0.5 }));
  plinth.position.y = CUSHION_TOP - 0.26;
  const trim = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.008, 2.32), new THREE.MeshStandardMaterial({ color: GOLD, metalness: 1, roughness: 0.3 }));
  trim.position.y = CUSHION_TOP - 0.16;
  const under = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.9), new THREE.MeshBasicMaterial({ color: new THREE.Color('#7fe3ea'), transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false }));
  under.rotation.x = -Math.PI / 2;
  under.position.y = 0.012;
  chaise.add(cushion, plinth, trim, under);

  // ── her ──
  const draco = new DRACOLoader().setDecoderPath('/draco/');
  const figure = createFigure(new GLTFLoader().setDRACOLoader(draco).loadAsync('/journal/lounge-figure.glb'), {
    upper: !!opts.upper,
    cushionTop: CUSHION_TOP,
    reduced: opts.reducedMotion,
    // Lay her legs on the cushion: lowest point just into it, the tops of her
    // thighs just under the bottom of the view, a touch right of centre
    // (screen-right is -x).
    place: box => new THREE.Vector3(-(box.min.x + box.max.x) / 2 - 0.05, CUSHION_TOP - box.min.y - 0.012, -0.42 - box.min.z),
  });
  scene.add(figure.root);
  const figureReady = figure.ready.then(() => {
    // The lap card stands just above her lap.
    LAP.p.set(figure.lap.x, figure.lap.y + 0.02 + (H * LAP.s) / 2 * 0.85, figure.lap.z);
    aimLap();
  });

  // ── the files, on a slanted stand to her left ──
  const pending: Promise<void>[] = [figureReady];
  type Body = {
    item: Item; group: THREE.Group; mesh: THREE.Mesh; mat: THREE.MeshStandardMaterial;
    home: { p: THREE.Vector3; q: THREE.Quaternion; s: number }; lift: number;
  };
  const bodies: Body[] = [];
  const hits: THREE.Object3D[] = [];
  const W = 0.2, H = 0.2 * (COVER.h / COVER.w);

  const table = (x: number, z: number) => {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.025, 64), new THREE.MeshPhysicalMaterial({ color: '#10121a', roughness: 0.08, metalness: 0.2, clearcoat: 1 }));
    top.position.y = 0.5;
    top.receiveShadow = true;
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.006, 8, 96), new THREE.MeshStandardMaterial({ color: GOLD, metalness: 1, roughness: 0.3 }));
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.512;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.06, 0.5, 24), new THREE.MeshStandardMaterial({ color: '#1a1b22', metalness: 0.9, roughness: 0.3 }));
    stem.position.y = 0.25;
    g.add(top, rim, stem);
    scene.add(g);
    return g;
  };

  const place = (list: Item[], anchor: THREE.Group, layout: (i: number, n: number) => { x: number; y: number; z: number; rx: number; ry: number; rz: number; s: number }) => {
    list.forEach((item, i) => {
      const { tex, ready } = item.kind === 'file' ? folderTexture(item, fonts) : magazineTexture(item, fonts);
      pending.push(ready);
      // Covers carry a little of their own light, like paper under a lamp,
      // so they read in the dim lounge.
      const lit = { map: tex, emissive: new THREE.Color('#ffffff'), emissiveMap: tex, emissiveIntensity: COVER_GLOW };
      const mat = item.kind === 'file'
        ? new THREE.MeshStandardMaterial({ ...lit, roughness: 0.55 })
        : new THREE.MeshPhysicalMaterial({ ...lit, roughness: 0.32, clearcoat: 0.7, clearcoatRoughness: 0.3 });   // soft gloss: no hot spot when it's close to her
      const edge = new THREE.MeshStandardMaterial({ color: item.kind === 'file' ? '#d9d2c6' : '#f2eee8', roughness: 0.6 });
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(W, H, item.kind === 'file' ? 0.008 : 0.004), [edge, edge, edge, edge, mat, edge]);
      mesh.castShadow = mesh.receiveShadow = true;
      mesh.userData.id = item.id;
      const l = layout(i, list.length);
      const group = new THREE.Group();
      group.position.set(l.x, l.y, l.z);
      group.rotation.set(l.rx, l.ry, l.rz, 'YXZ');
      group.scale.setScalar(l.s);
      group.add(mesh);
      anchor.add(group);
      // Items live in world space once placed, so they can leave their pile.
      anchor.updateMatrixWorld(true);
      scene.attach(group);
      hits.push(mesh);
      bodies.push({ item, group, mesh, mat, home: { p: group.position.clone(), q: group.quaternion.clone(), s: l.s }, lift: 0 });
    });
  };

  const files = items.filter(i => i.kind === 'file');
  const mags = items.filter(i => i.kind === 'magazine');

  // Files stand in a low gold rack, stepped back and up so each title
  // clears the one in front; the lead file stands at the front.
  // Files on a table to her left, magazines on one to her right, each
  // turned to face her.
  const faceUs = (g: THREE.Group) => { g.rotation.y = Math.atan2(-(EYE.x - g.position.x), -(EYE.z - g.position.z)); };
  const left = table(0.92, 0.5);
  faceUs(left);
  const rack = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.012, 0.26), new THREE.MeshStandardMaterial({ color: GOLD, metalness: 1, roughness: 0.35 }));
  rack.position.set(0, 0.53, 0);
  left.add(rack);
  place(files, left, (i, n) => ({
    x: (i % 2 ? 0.012 : -0.012),
    y: 0.54 + H / 2 + i * 0.045,
    z: -0.09 + i * (0.2 / Math.max(1, n - 1)),
    rx: 0.22, ry: Math.PI, rz: (i % 2 ? -0.02 : 0.02),
    s: i === 0 ? 1.08 : 1,
  }));

  // Magazines fanned on a low easel to her right, newest in front.
  const right = table(-0.88, 0.58);
  faceUs(right);
  const easel = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.012, 0.3), new THREE.MeshStandardMaterial({ color: GOLD, metalness: 1, roughness: 0.35 }));
  easel.position.set(0, 0.52, 0);
  right.add(easel);
  // A raised back step for the second row, so it isn't floating.
  const step = new THREE.Mesh(new THREE.BoxGeometry(0.46, H * 0.78, 0.07), new THREE.MeshStandardMaterial({ color: '#15161c', metalness: 0.6, roughness: 0.4 }));
  step.position.set(0, 0.525 + (H * 0.78) / 2, 0.13);
  right.add(step);
  // Two rows: the newest two in front, older ones raised behind them so
  // every cover line shows.
  place(mags, right, (i, n) => {
    const row = Math.floor(i / 2), col = i % 2, perRow = Math.min(2, n - row * 2);
    return {
      x: (col - (perRow - 1) / 2) * 0.22,
      y: 0.53 + (H / 2) * Math.cos(0.55) + row * H * 0.78,
      z: -0.02 + row * 0.1,
      rx: 0.55, ry: Math.PI, rz: (col - (perRow - 1) / 2) * -0.08,
      s: i === 0 ? 1.05 : 1.0,
    };
  });

  // ── view ──
  let w = 1, h = 1, raf = 0, last = 0, time = 0;
  let lookX = 0, lookY = 0, curX = 0, curY = 0;
  let hovered: string | null = null;
  let lapId: string | null = null, dragId: string | null = null, justDropped = false;
  // Her legs while something rests in her lap: now and then she shifts to
  // another pose, and back to resting once the lap is clear.
  const heldPose = opts.pose && opts.pose in POSES ? opts.pose as PoseName : null;
  let nextShift = 0;
  const shiftIn = () => time + 3 + Math.random() * 5;
  // A tapped entry is fetched: her hand reaches toward it, it lifts and
  // glides into her open hand, she closes it and brings it to her lap, and
  // her other hand comes to take the far edge. Files come to her left hand,
  // magazines to her right.
  // step -> seconds into the fetch (why)
  const FETCH = {
    reach: 0.8,      // her hand goes out toward it
    summon: 0.5,     // it starts toward her hand as she reaches
    fly: 0.6,        // ...and arrives as her hand is fully out
    grasp: 1.0,      // her fingers close on it
    bring: 1.15,     // she brings it in
    bringDur: 0.95,
    meet: 1.55,      // her other hand comes to the far edge
    meetDur: 0.7,
    done: 2.3,
  };
  let fetch: { id: string; side: Side; t: number } | null = null;
  const wristP = new THREE.Vector3(), edgeA = new THREE.Vector3(), edgeB = new THREE.Vector3(), off = new THREE.Vector3(), axis = new THREE.Vector3();
  const dragAt = new THREE.Vector3(), tmpP = new THREE.Vector3(), tmpN = new THREE.Vector3(), tmpQ = new THREE.Quaternion(), UP = new THREE.Vector3(0, 1, 0);
  const reduced = opts.reducedMotion;
  const camRight = new THREE.Vector3().subVectors(AIM, EYE).normalize().cross(new THREE.Vector3(0, 1, 0)).normalize();
  // Her lap: resting over her thighs, the cover turned to us. Its place is
  // set once the legs load, from where her knees actually are.
  const LAP = { p: new THREE.Vector3(0, 0.8, 0), q: new THREE.Quaternion(), s: 1.0 };
  function aimLap() {
    const o = new THREE.Object3D();
    o.position.copy(LAP.p);
    o.lookAt(EYE);
    LAP.q.copy(o.quaternion);
  }
  aimLap();
  let frameCb: ((a: { files: ScreenXY; magazines: ScreenXY; lapLeft: ScreenXY; lapRight: ScreenXY }) => void) | null = null;
  const v = new THREE.Vector3();
  const toScreen = (p: THREE.Vector3): ScreenXY => {
    v.copy(p).project(camera);
    return { x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h };
  };

  // Where her hand holds a card: at its left or right edge (her left is +x),
  // just outside it, level with its face (+z) and low, so her fingers curl
  // over the edge below the title. As an offset from the card's centre.
  function gripOffset(side: Side, q: THREE.Quaternion, scale: number, out: THREE.Vector3) {
    axis.set(1, 0, 0).applyQuaternion(q);
    const sign = (axis.x > 0) === (side === 'L') ? 1 : -1;
    return out.set(sign * (W * 0.5 + 0.035), -H * 0.28, 0.004).multiplyScalar(scale).applyQuaternion(q);
  }
  // That point with the card in her lap, or on a card as it is now.
  const lapGrip = (side: Side, out: THREE.Vector3) => gripOffset(side, LAP.q, LAP.s, out).add(LAP.p);
  const cardGrip = (g: THREE.Object3D, side: Side, out: THREE.Vector3) => gripOffset(side, g.quaternion, g.scale.x, out).add(g.position);

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, last ? (now - last) / 1000 : 0);
    last = now;
    if (!opts.reducedMotion) time += dt;

    curX += (lookX - curX) * 0.05;
    curY += (lookY - curY) * 0.05;
    // A glance toward the pointer (screen-right is -x here), nothing more.
    // Her eyes rise and fall a touch with her breath.
    const breath = reduced ? 0 : Math.sin((time / 4.6) * Math.PI * 2) * 0.0018;
    camera.position.copy(EYE).addScaledVector(camRight, curX * 0.02);
    camera.position.y += breath - curY * 0.012;
    camera.lookAt(tmpP.copy(AIM).addScaledVector(camRight, curX * 0.12).addScaledVector(UP, -curY * 0.08));
    sky.update(camera, time);

    // Her hands first: fetching, holding the entry in her lap by its edges,
    // or at rest. Goals read the cards as they were last frame.
    if (fetch) fetch.t += dt;
    if (fetch && fetch.t > FETCH.done) fetch = null;
    const held = lapId ? bodies.find(q => q.item.id === lapId) : undefined;
    if (fetch) {
      const t = fetch.t, side = fetch.side, other: Side = side === 'L' ? 'R' : 'L';
      const b = bodies.find(q => q.item.id === fetch!.id)!;
      if (t < FETCH.bring) figure.setHand(side, { kind: 'at', p: b.home.p, curl: t < FETCH.grasp ? 0.08 : 0.8, key: 'reach', dur: FETCH.reach, arc: 0.06 });
      else figure.setHand(side, { kind: 'at', p: lapGrip(side, edgeA), curl: 0.8, key: 'bring', dur: FETCH.bringDur, arc: 0.05 });
      if (t < FETCH.meet) figure.setHand(other, { kind: 'rest' });
      else figure.setHand(other, { kind: 'at', p: lapGrip(other, edgeB), curl: 0.8, key: 'meet', dur: FETCH.meetDur, arc: 0.03 });
    } else if (held && !dragId) {
      figure.setHand('L', { kind: 'at', p: cardGrip(held.group, 'L', edgeA), curl: 0.85, key: 'hold' });
      figure.setHand('R', { kind: 'at', p: cardGrip(held.group, 'R', edgeB), curl: 0.85, key: 'hold' });
    } else {
      figure.setHand('L', { kind: 'rest' });
      figure.setHand('R', { kind: 'rest' });
    }
    if (heldPose) figure.setPose(heldPose);
    else if (!reduced) {
      if (!lapId) figure.setPose('rest');
      else if (time > nextShift && !fetch) {
        const choices = (['rest', 'cross', 'side'] as const).filter(p => p !== figure.pose());
        figure.setPose(choices[Math.floor(Math.random() * choices.length)]);
        nextShift = shiftIn();
      }
    }
    figure.update(dt, time);

    // Then each entry: in her hand while she fetches it, else easing toward
    // its pile (lifted a little when hovered), her lap, or the pointer.
    for (const b of bodies) {
      const id = b.item.id;
      const inLap = id === lapId, carried = id === dragId;
      const f = fetch && fetch.id === id ? fetch : null;
      b.lift += ((hovered === id && !inLap ? 1 : 0) - b.lift) * 0.15;
      b.mat.emissiveIntensity = inLap ? COVER_GLOW * 0.45 : COVER_GLOW + 0.2 * b.lift;
      if (f && f.t >= FETCH.summon) {
        // Hanging from her hand by its edge: flying in, then held.
        figure.hand(f.side, wristP);
        const u = Math.min(1, (f.t - FETCH.summon) / FETCH.fly), e = reduced ? 1 : mj(u);
        const held = tmpP.copy(wristP).sub(gripOffset(f.side, LAP.q, LAP.s, off));
        if (e < 1) {
          b.group.position.copy(b.home.p).lerp(held, e).addScaledVector(UP, 0.05 * Math.sin(Math.PI * u));
          b.group.quaternion.copy(b.home.q).slerp(LAP.q, e);
          b.group.scale.setScalar(b.home.s + (LAP.s - b.home.s) * e);
        } else {
          b.group.position.copy(held);
          b.group.quaternion.copy(LAP.q);
          b.group.scale.setScalar(LAP.s);
        }
        continue;
      }
      // Waiting to be taken, it lifts a little toward her.
      const lift = f ? 1 : b.lift;
      const tp = carried ? dragAt : inLap && !f ? LAP.p : tmpP.copy(b.home.p).addScaledVector(tmpN.set(0, 0, 1).applyQuaternion(b.home.q), lift * 0.03);
      const k = reduced ? 1 : carried ? 0.3 : 0.1;
      const tq = (inLap || carried) && !f ? LAP.q : b.home.q;
      const ts = inLap && !f ? LAP.s : b.home.s;
      b.group.position.lerp(tp, k);
      b.group.quaternion.slerp(tq, k);
      b.group.scale.setScalar(b.group.scale.x + (ts - b.group.scale.x) * k);
    }

    composer.render();
    if (frameCb) {
      const f = toScreen(left.localToWorld(tmpP.set(0, 0.54 + H + 0.2, -0.05)));
      const m = toScreen(right.localToWorld(tmpP.set(0, 0.53 + H * 1.85, 0.1)));
      const lapLeft = toScreen(tmpP.copy(LAP.p).addScaledVector(camRight, -(W * LAP.s) / 2));
      const lapRight = toScreen(tmpP.copy(LAP.p).addScaledVector(camRight, (W * LAP.s) / 2));
      frameCb({ files: f, magazines: m, lapLeft, lapRight });
    }
  };

  const raycaster = new THREE.Raycaster();
  return {
    ready: Promise.all(pending).then(() => {}),
    resize(nw, nh) {
      w = Math.max(1, nw); h = Math.max(1, nh);
      renderer.setSize(w, h, false);
      composer.setSize(w, h);
      bloom.resolution.set(w / 2, h / 2);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    },
    start() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } },
    stop() { cancelAnimationFrame(raf); raf = 0; },
    pick(x, y) {
      raycaster.setFromCamera(new THREE.Vector2((x / w) * 2 - 1, -(y / h) * 2 + 1), camera);
      const hit = raycaster.intersectObjects(hits, false)[0];
      return (hit?.object.userData.id as string | undefined) ?? null;
    },
    setHovered(id) { hovered = id; },
    // A new entry in her lap: she shifts within a second, however it arrived.
    // Tapped ones she fetches herself; dragged ones are already on their way.
    setLap(id) {
      if (id && id !== lapId) {
        // Her legs shift once her hands are settled, not mid-reach.
        nextShift = time + (justDropped || reduced ? 0.6 : FETCH.done + 0.4) + Math.random() * 0.6;
        const b = bodies.find(q => q.item.id === id);
        if (b && !justDropped && !reduced) fetch = { id, side: b.item.kind === 'file' ? 'L' : 'R', t: 0 };
      }
      if (!id) fetch = null;
      justDropped = false;
      lapId = id;
    },
    drag(id, x, y) {
      const b = bodies.find(q => q.item.id === id);
      if (!b) return;
      dragId = id;
      // Carry it on a plane facing her, at the depth it started from.
      raycaster.setFromCamera(new THREE.Vector2((x / w) * 2 - 1, -(y / h) * 2 + 1), camera);
      const n = camera.getWorldDirection(new THREE.Vector3());
      const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(n, b.group.position);
      raycaster.ray.intersectPlane(plane, dragAt);
    },
    drop(id, x, y) {
      dragId = null;
      justDropped = true;
      // Let go over the middle of the view and it settles in her lap.
      return y > h * 0.3 && Math.abs(x - w / 2) < w * 0.32;
    },
    look(nx, ny) { lookX = nx; lookY = ny; },
    onFrame(cb) { frameCb = cb; },
    dispose() {
      cancelAnimationFrame(raf);
      scene.traverse(o => {
        const mesh = o as THREE.Mesh;
        mesh.geometry?.dispose();
        const mats = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
        mats.forEach(m => { (m as THREE.MeshStandardMaterial).map?.dispose(); m.dispose(); });
      });
      sky.dispose();
      figure.dispose();
      draco.dispose();
      env.dispose();
      pmrem.dispose();
      composer.dispose();
      renderer.dispose();
    },
  };
}

// Channel quilting for the cushion: soft rolls across its width.
function channelNormals() {
  const c = document.createElement('canvas');
  c.width = 8; c.height = 512;
  const g = c.getContext('2d')!;
  const img = g.createImageData(8, 512);
  const period = 64;
  for (let y = 0; y < 512; y++) {
    const t = (y % period) / period;
    // Height of a roll: sqrt(sin) so the seams pinch and the middles puff.
    const slope = (Math.PI * Math.cos(Math.PI * t)) / (2 * Math.sqrt(Math.max(Math.sin(Math.PI * t), 0.02)));
    const n = new THREE.Vector3(0, -slope * 0.12, 1).normalize();
    for (let x = 0; x < 8; x++) {
      const i = (y * 8 + x) * 4;
      img.data[i] = (n.x * 0.5 + 0.5) * 255;
      img.data[i + 1] = (n.y * 0.5 + 0.5) * 255;
      img.data[i + 2] = (n.z * 0.5 + 0.5) * 255;
      img.data[i + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
