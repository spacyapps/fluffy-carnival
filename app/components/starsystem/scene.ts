// The home page star system: a WebGL scene with no React in it. The hero
// component owns the DOM (labels, captions, links) and drives this through the
// small StarSystem interface; this file owns the sky, the bodies and the camera.

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import * as GLSL from './shaders';
import { buildRelayCraft } from './relay';

export type Surface = 'gas' | 'ocean' | 'molten';

export interface BodySpec {
  id: string;
  kind: 'mission' | 'journal' | 'contact';
  color?: string;
  phase?: 'live' | 'in-play';
  surface?: Surface;
  radius?: number;
  orbit?: number;
  rings?: boolean;
  moon?: boolean;
}

export interface ScreenPoint {
  id: string;
  x: number;
  y: number;
  r: number;
  visible: boolean;
}

export interface StarSystem {
  resize(width: number, height: number): void;
  setFocus(id: string | null): void;
  // Rush the camera in at a body, for the moment before its page loads.
  dive(id: string): void;
  // 0 at the top of the page, 1 once the hero has scrolled away.
  setScroll(progress: number): void;
  setPointer(nx: number, ny: number): void;
  pick(x: number, y: number): string | null;
  start(): void;
  stop(): void;
  dispose(): void;
}

interface Tracked {
  id: string;
  pivot: THREE.Object3D;
  frame: number;
  update(t: number, dt: number): void;
  focus?: { value: number };
  // How far the close-up swings toward the sun (-) or away (+) from side-on.
  shotOut?: number;
}

const TAU = Math.PI * 2;
const UP = new THREE.Vector3(0, 1, 0);
const SUN_R = 2.6;
const INK = '#ece6d6';
const PEACH = '#e8a87c';
const MIST = '#9bb5c9';
const LILAC = '#c89bd1';

// Framing of the resting shot: the sun sits right of centre, leaving the lower
// left dark for the headline.
const OVERVIEW_TARGET = new THREE.Vector3(-7, -3.5, 3);
const OVERVIEW_DIST = 66;
const OVERVIEW_POLAR = 1.12;
const OVERVIEW_AZ = 0.5;

const surfaceKind: Record<Surface, number> = {
  gas: 0,     // gas -> 0 (banded giant, storm spot)
  ocean: 1,   // ocean -> 1 (continents, clouds, city lights if live)
  molten: 2,  // molten -> 2 (still forming: dark crust, glowing seams)
};

export function createStarSystem(
  canvas: HTMLCanvasElement,
  specs: BodySpec[],
  opts: { reducedMotion: boolean; onFrame(points: ScreenPoint[]): void },
): StarSystem {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  const pr = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(pr);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#07090c');
  const camera = new THREE.PerspectiveCamera(34, 1, 0.05, 2500);

  const time = { value: 0 };
  const pixelRatio = { value: pr };
  const pointScale = { value: 400 };
  const sunPos = { value: new THREE.Vector3() };
  const sphereGeo = new THREE.SphereGeometry(1, 96, 64);

  // ── Sky ────────────────────────────────────────────────────────────────
  const band = new THREE.Vector3(0.28, 0.86, 0.42).normalize();
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(900, 48, 32),
    new THREE.ShaderMaterial({
      vertexShader: GLSL.SPHERE_VERT,
      fragmentShader: GLSL.SKY_FRAG,
      uniforms: { uColorA: { value: new THREE.Color(MIST) }, uColorB: { value: new THREE.Color(LILAC) }, uBand: { value: band } },
      side: THREE.BackSide,
      depthWrite: false,
    }),
  );
  sky.renderOrder = -2;
  scene.add(sky);

  const stars = makeStars(band, time, pixelRatio);
  stars.renderOrder = -1;
  scene.add(stars);

  // ── Sun ────────────────────────────────────────────────────────────────
  const sun = new THREE.Mesh(
    sphereGeo,
    new THREE.ShaderMaterial({ vertexShader: GLSL.SPHERE_VERT, fragmentShader: GLSL.SUN_FRAG, uniforms: { uTime: time } }),
  );
  sun.scale.setScalar(SUN_R);
  scene.add(sun);

  const coronae = [
    billboard(SUN_R * 7, GLSL.CORONA_FRAG, { uTime: time, uColor: { value: new THREE.Color(1.0, 0.62, 0.36) }, uIntensity: { value: 1.0 } }),
    billboard(SUN_R * 22, GLSL.CORONA_FRAG, { uTime: time, uColor: { value: new THREE.Color(PEACH) }, uIntensity: { value: 0.12 } }),
  ];
  coronae.forEach(c => scene.add(c));

  scene.add(new THREE.PointLight(0xffe2c4, 2.4, 0, 0));
  scene.add(new THREE.AmbientLight(0x9bb5c9, 0.05));
  scene.add(new THREE.HemisphereLight(0x9bb5c9, 0x1a1410, 0.12));

  // ── Bodies ─────────────────────────────────────────────────────────────
  const tracked: Tracked[] = [];
  const hits: THREE.Mesh[] = [];
  const hitMat = new THREE.MeshBasicMaterial({ visible: false });
  const addHit = (parent: THREE.Object3D, id: string, radius: number) => {
    const hit = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), hitMat);
    hit.scale.setScalar(radius);
    hit.userData.id = id;
    parent.add(hit);
    hits.push(hit);
  };

  let missionIndex = 0;
  for (const spec of specs) {
    const body =
      spec.kind === 'mission' ? makePlanet(spec, missionIndex++) :
      spec.kind === 'journal' ? makeComet(spec) :
      makeRelay(spec);
    tracked.push(body);
  }

  const belt = makeBelt();
  scene.add(belt);

  function makePlanet(spec: BodySpec, index: number): Tracked {
    const R = spec.radius ?? 0.7;
    const orbitR = spec.orbit ?? 8 + index * 4;
    const live = spec.phase !== 'in-play';
    const surface = spec.surface ?? 'ocean';
    const angle0 = 0.9 + index * 2.39996;
    const omega = 1.15 / Math.pow(orbitR, 1.5);
    const spin = 0.08 + 0.05 * ((index * 7) % 3);

    const base = new THREE.Color(spec.color ?? MIST);
    const colorA = base.clone().lerp(new THREE.Color(0.16, 0.16, 0.17), 0.32);
    const colorB = base.clone().offsetHSL(0.05, -0.2, 0.16);
    const atmo = base.clone().offsetHSL(-0.03, -0.1, 0.12).multiplyScalar(surface === 'molten' ? 0.25 : 0.9);
    if (surface === 'gas') colorB.lerp(new THREE.Color(INK), 0.35);

    const orbitGroup = new THREE.Group();
    orbitGroup.rotation.x = (index % 2 ? 1 : -1) * 0.025 * (index + 1);
    scene.add(orbitGroup);

    const bodyAngle = { value: angle0 };
    const focus = { value: 0 };
    orbitGroup.add(orbitLine(t => [Math.cos(t) * orbitR, Math.sin(t) * orbitR], {
      uBodyAngle: bodyAngle,
      uDashed: { value: live ? 0 : 1 },
      uBase: { value: live ? 0.085 : 0.06 },
      uFocus: focus,
      uColor: { value: new THREE.Color(INK) },
      uTrail: { value: (live ? new THREE.Color(PEACH) : new THREE.Color(MIST)).multiplyScalar(0.35) },
    }));

    const pivot = new THREE.Group();
    orbitGroup.add(pivot);
    const tilt = new THREE.Group();
    tilt.rotation.z = 0.12 + 0.2 * (index % 3);
    pivot.add(tilt);

    const uniforms = {
      uSunPos: sunPos, uTime: time,
      uColorA: { value: colorA }, uColorB: { value: colorB }, uAtmo: { value: atmo },
      uSeed: { value: index * 3.7 + 1.3 }, uKind: { value: surfaceKind[surface] }, uLive: { value: live ? 1 : 0 },
    };
    const globe = new THREE.Mesh(sphereGeo, new THREE.ShaderMaterial({ vertexShader: GLSL.SPHERE_VERT, fragmentShader: GLSL.PLANET_FRAG, uniforms }));
    globe.scale.setScalar(R);
    tilt.add(globe);

    const shell = new THREE.Mesh(sphereGeo, new THREE.ShaderMaterial({
      vertexShader: GLSL.SPHERE_VERT, fragmentShader: GLSL.ATMO_FRAG,
      uniforms: { uSunPos: sunPos, uAtmo: { value: atmo }, uStrength: { value: surface === 'molten' ? 0.8 : 1.6 } },
      side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false,
    }));
    shell.scale.setScalar(R * 1.1);
    tilt.add(shell);

    const planetWorld = new THREE.Vector3();
    let ringUniforms: { uPlanetPos: { value: THREE.Vector3 } } | null = null;
    if (spec.rings) {
      const inner = R * 1.45, outer = R * 2.5;
      const u = {
        uSunPos: sunPos, uPlanetPos: { value: planetWorld }, uPlanetR: { value: R },
        uInner: { value: inner }, uOuter: { value: outer },
        uColorA: { value: colorB.clone().lerp(new THREE.Color(INK), 0.3) }, uColorB: { value: colorA.clone().multiplyScalar(0.7) },
      };
      const ring = new THREE.Mesh(new THREE.RingGeometry(inner, outer, 180, 1), new THREE.ShaderMaterial({
        vertexShader: GLSL.RING_VERT, fragmentShader: GLSL.RING_FRAG, uniforms: u,
        side: THREE.DoubleSide, transparent: true, depthWrite: false,
      }));
      ring.rotation.x = -Math.PI / 2;
      tilt.add(ring);
      ringUniforms = u;
    }

    let moonPivot: THREE.Group | null = null;
    if (spec.moon) {
      moonPivot = new THREE.Group();
      moonPivot.rotation.x = 0.3;
      const moon = new THREE.Mesh(sphereGeo, new THREE.ShaderMaterial({
        vertexShader: GLSL.SPHERE_VERT, fragmentShader: GLSL.PLANET_FRAG,
        uniforms: { ...uniforms, uKind: { value: 3 }, uLive: { value: 0 }, uAtmo: { value: new THREE.Color(0, 0, 0) }, uSeed: { value: 11.0 } },
      }));
      moon.scale.setScalar(R * 0.27);
      moon.position.x = R * 2.7;
      moonPivot.add(moon);
      pivot.add(moonPivot);
    }

    // A forming world still sits in its own disc of rubble, inside a
    // half-built lattice.
    let debris: THREE.Points | null = null;
    let scaffold: ReturnType<typeof makeScaffold> | null = null;
    if (!live) {
      debris = debrisDisc(R, colorA);
      tilt.add(debris);
      scaffold = makeScaffold(R, index * 1.7);
      tilt.add(scaffold.group);
    }

    addHit(pivot, spec.id, Math.max(R * 1.8, 1.1));

    return {
      id: spec.id, pivot, frame: spec.rings ? R * 1.9 : R, focus,
      update(t) {
        const a = angle0 + omega * t;
        bodyAngle.value = a % TAU;
        pivot.position.set(Math.cos(a) * orbitR, 0, -Math.sin(a) * orbitR);
        globe.rotation.y = t * spin;
        if (moonPivot) moonPivot.rotation.y = t * 0.35;
        if (debris) debris.rotation.y = t * 0.12;
        if (scaffold) scaffold.update(t);
        if (ringUniforms) pivot.getWorldPosition(planetWorld);
      },
    };
  }

  // The journal is a comet on an eccentric orbit: it swings in close, grows a
  // tail pointed away from the sun, and drifts back out.
  function makeComet(spec: BodySpec): Tracked {
    const a = 19, e = 0.7, h = 5.2;
    const p = a * (1 - e * e);
    const radiusAt = (th: number) => p / (1 + e * Math.cos(th));
    let theta = -2.2;

    const orbitGroup = new THREE.Group();
    orbitGroup.rotation.set(0.34, 2.3, 0.08);
    scene.add(orbitGroup);

    const bodyAngle = { value: theta };
    const focus = { value: 0 };
    orbitGroup.add(orbitLine(th => [Math.cos(th) * radiusAt(th), Math.sin(th) * radiusAt(th)], {
      uBodyAngle: bodyAngle, uDashed: { value: 0 }, uBase: { value: 0.035 }, uFocus: focus,
      uColor: { value: new THREE.Color(INK) }, uTrail: { value: new THREE.Color(MIST).multiplyScalar(0.3) },
    }));

    const pivot = new THREE.Group();
    orbitGroup.add(pivot);
    const nucleus = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.6, 2.9, 3.2) }));
    pivot.add(nucleus);
    const comaColor = { value: new THREE.Color(MIST) };
    const comaIntensity = { value: 1 };
    const coma = billboard(2.4, GLSL.CORONA_FRAG, { uTime: time, uColor: comaColor, uIntensity: comaIntensity });
    pivot.add(coma);
    addHit(pivot, spec.id, 1.3);

    const tail = cometTail();
    scene.add(tail.points);

    const world = new THREE.Vector3();
    const prev = new THREE.Vector3();
    let started = false;

    const step = (dt: number) => {
      const r = radiusAt(theta);
      theta += (h / (r * r)) * dt;
      bodyAngle.value = ((theta % TAU) + TAU) % TAU;
      pivot.position.set(Math.cos(theta) * r, 0, -Math.sin(theta) * r);
      orbitGroup.updateMatrixWorld(true);
      pivot.getWorldPosition(world);
      if (!started) { prev.copy(world); started = true; }
      const heat = THREE.MathUtils.clamp(Math.pow(9 / r, 2), 0.12, 3);
      comaIntensity.value = 0.35 + 0.45 * heat;
      tail.step(dt, world, prev, heat);
      prev.copy(world);
    };
    // Grow a tail before the first frame, so a paused (reduced-motion) scene has one.
    for (let i = 0; i < 150; i++) step(1 / 30);

    return {
      id: spec.id, pivot, frame: 0.9, focus,
      update(_t, dt) { if (dt > 0) step(dt); },
    };
  }

  // Contact is a relay satellite in the outer system, sending out pulses.
  function makeRelay(spec: BodySpec): Tracked {
    const orbitR = spec.orbit ?? 33;
    const angle0 = 2.35;
    const omega = 0.9 / Math.pow(orbitR, 1.5);

    const pivot = new THREE.Group();
    scene.add(pivot);
    const craft = new THREE.Group();
    craft.scale.setScalar(0.52);
    pivot.add(craft);

    const relay = buildRelayCraft();
    craft.add(relay.craft);

    const pulses = [0, 1, 2].map(() => {
      const m = new THREE.Mesh(new THREE.RingGeometry(0.985, 1, 128), new THREE.MeshBasicMaterial({
        color: new THREE.Color(PEACH), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
      }));
      m.userData.billboard = true;
      pivot.add(m);
      return m;
    });

    addHit(pivot, spec.id, 1.6);

    const focus = { value: 0 };
    return {
      id: spec.id, pivot, frame: 0.72, focus, shotOut: -0.85,
      update(t) {
        const a = angle0 + omega * t;
        pivot.position.set(Math.cos(a) * orbitR, 1.2, -Math.sin(a) * orbitR);
        craft.lookAt(0, 0, 0);
        craft.rotateZ(Math.sin(t * 0.2) * 0.15);
        relay.blink(t);
        pulses.forEach((m, i) => {
          const ph = ((t * 0.28) + i / pulses.length) % 1;
          m.scale.setScalar(0.5 + ph * 2.0);
          const mat = m.material as THREE.MeshBasicMaterial;
          mat.opacity = Math.pow(1 - ph, 2.5) * 0.45;
        });
      },
    };
  }

  // ── Helpers that need the scene's uniforms ─────────────────────────────
  function billboard(size: number, frag: string, uniforms: Record<string, THREE.IUniform>) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.ShaderMaterial({
      vertexShader: GLSL.BILLBOARD_VERT, fragmentShader: frag, uniforms,
      blending: THREE.AdditiveBlending, transparent: true, depthWrite: false,
    }));
    m.userData.billboard = true;
    return m;
  }

  function orbitLine(at: (t: number) => [number, number], uniforms: Record<string, THREE.IUniform>) {
    const n = 360;
    const pos = new Float32Array(n * 3);
    const ang = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const t = (i / n) * TAU;
      const [x, y] = at(t);
      pos.set([x, 0, -y], i * 3);
      ang[i] = t;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aAngle', new THREE.BufferAttribute(ang, 1));
    return new THREE.LineLoop(g, new THREE.ShaderMaterial({
      vertexShader: GLSL.ORBIT_VERT, fragmentShader: GLSL.ORBIT_FRAG, uniforms,
      blending: THREE.AdditiveBlending, transparent: true, depthWrite: false,
    }));
  }

  function particleMaterial() {
    return new THREE.ShaderMaterial({
      vertexShader: GLSL.PARTICLE_VERT, fragmentShader: GLSL.POINT_FRAG,
      uniforms: { uPR: pixelRatio, uScale: pointScale },
      blending: THREE.AdditiveBlending, transparent: true, depthWrite: false,
    });
  }

  function makeScaffold(R: number, seed: number) {
    const Rs = R * 1.28;
    const wire = new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(Rs, 3));
    const src = wire.getAttribute('position') as THREE.BufferAttribute;
    const n = src.count;
    const rand = new Float32Array(n), h = new Float32Array(n), along = new Float32Array(n);
    for (let i = 0; i < n; i += 2) {
      rand[i] = rand[i + 1] = Math.random();
      h[i] = h[i + 1] = Math.max(src.getY(i), src.getY(i + 1)) / Rs;
      along[i + 1] = 1;
    }
    wire.setAttribute('aRand', new THREE.BufferAttribute(rand, 1));
    wire.setAttribute('aH', new THREE.BufferAttribute(h, 1));
    wire.setAttribute('aT', new THREE.BufferAttribute(along, 1));
    const front = { value: 0 };
    const group = new THREE.Group();
    group.add(new THREE.LineSegments(wire, new THREE.ShaderMaterial({
      vertexShader: GLSL.SCAFFOLD_VERT, fragmentShader: GLSL.SCAFFOLD_FRAG,
      uniforms: { uFront: front, uTime: time, uColor: { value: new THREE.Color(MIST) }, uWeld: { value: new THREE.Color(PEACH) } },
      blending: THREE.AdditiveBlending, transparent: true, depthWrite: false,
    })));

    // The welding line: a ring riding the build front, throwing sparks.
    const ringPts: THREE.Vector3[] = [];
    for (let i = 0; i < 128; i++) ringPts.push(new THREE.Vector3(Math.cos((i / 128) * TAU), 0, Math.sin((i / 128) * TAU)));
    const ring = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(ringPts), new THREE.LineBasicMaterial({
      color: new THREE.Color(PEACH).multiplyScalar(1.6), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false,
    }));
    group.add(ring);

    const sparkN = 70;
    const sPos = new Float32Array(sparkN * 3), sCol = new Float32Array(sparkN * 3), sSize = new Float32Array(sparkN).fill(0.035);
    const sg = new THREE.BufferGeometry();
    const sPosAttr = new THREE.BufferAttribute(sPos, 3), sColAttr = new THREE.BufferAttribute(sCol, 3);
    sg.setAttribute('position', sPosAttr);
    sg.setAttribute('aColor', sColAttr);
    sg.setAttribute('aSize', new THREE.BufferAttribute(sSize, 1));
    const sparks = new THREE.Points(sg, particleMaterial());
    sparks.frustumCulled = false;
    group.add(sparks);
    const weld = new THREE.Color(PEACH).lerp(new THREE.Color(1, 1, 1), 0.4);

    return {
      group,
      update(t: number) {
        const f = 0.32 + 0.36 * Math.sin(t * 0.09 + seed);
        front.value = f;
        const y = f * Rs, r = Math.sqrt(Math.max(Rs * Rs - y * y, 0));
        ring.position.y = y;
        ring.scale.set(r, 1, r);
        group.rotation.y = t * 0.03;
        for (let i = 0; i < sparkN; i++) {
          const a = Math.random() * TAU;
          const out = 1 + Math.random() * 0.06;
          sPos[i * 3] = Math.cos(a) * r * out;
          sPos[i * 3 + 1] = y + (Math.random() - 0.3) * 0.08 * R;
          sPos[i * 3 + 2] = Math.sin(a) * r * out;
          const k = Math.random() < 0.3 ? 1.5 + Math.random() * 2 : 0;
          sCol[i * 3] = weld.r * k; sCol[i * 3 + 1] = weld.g * k; sCol[i * 3 + 2] = weld.b * k;
        }
        sPosAttr.needsUpdate = sColAttr.needsUpdate = true;
      },
    };
  }

  function debrisDisc(R: number, tint: THREE.Color) {
    const n = 700;
    const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), size = new Float32Array(n);
    const warm = new THREE.Color(PEACH);
    for (let i = 0; i < n; i++) {
      const r = R * (1.5 + Math.pow(Math.random(), 1.6) * 1.8);
      const a = Math.random() * TAU;
      pos.set([Math.cos(a) * r, gauss() * R * 0.05, Math.sin(a) * r], i * 3);
      const c = tint.clone().lerp(warm, Math.random() * 0.5).multiplyScalar(0.25 + Math.random() * 0.5);
      col.set([c.r, c.g, c.b], i * 3);
      size[i] = 0.012 + Math.random() * 0.032;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    return new THREE.Points(g, particleMaterial());
  }

  function cometTail() {
    const n = 1400;
    const pos = new Float32Array(n * 3), vel = new Float32Array(n * 3), col = new Float32Array(n * 3), size = new Float32Array(n);
    const age = new Float32Array(n).fill(1e9), life = new Float32Array(n).fill(1), ion = new Uint8Array(n);
    const ionColor = new THREE.Color(MIST).multiplyScalar(1.3);
    const dustColor = new THREE.Color(PEACH).lerp(new THREE.Color(INK), 0.4);
    const g = new THREE.BufferGeometry();
    const posAttr = new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage);
    const colAttr = new THREE.BufferAttribute(col, 3).setUsage(THREE.DynamicDrawUsage);
    const sizeAttr = new THREE.BufferAttribute(size, 1).setUsage(THREE.DynamicDrawUsage);
    g.setAttribute('position', posAttr);
    g.setAttribute('aColor', colAttr);
    g.setAttribute('aSize', sizeAttr);
    const points = new THREE.Points(g, particleMaterial());
    points.frustumCulled = false;

    let cursor = 0, owed = 0;
    const away = new THREE.Vector3(), cv = new THREE.Vector3();

    return {
      points,
      step(dt: number, at: THREE.Vector3, prevAt: THREE.Vector3, heat: number) {
        away.copy(at).normalize();
        cv.copy(at).sub(prevAt).divideScalar(Math.max(dt, 1e-4));
        owed += 240 * heat * dt;
        while (owed >= 1) {
          owed -= 1;
          const i = cursor; cursor = (cursor + 1) % n;
          const isIon = Math.random() < 0.45;
          ion[i] = isIon ? 1 : 0;
          age[i] = 0;
          life[i] = isIon ? 1.4 + Math.random() : 2.6 + Math.random() * 2.2;
          const speed = isIon ? 3.2 + Math.random() * 1.6 : 0.5 + Math.random() * 0.7;
          const spread = isIon ? 0.12 : 0.35;
          const carry = isIon ? 0.15 : 0.7;
          for (let k = 0; k < 3; k++) {
            const ak = k === 0 ? away.x : k === 1 ? away.y : away.z;
            const ck = k === 0 ? cv.x : k === 1 ? cv.y : cv.z;
            const pk = k === 0 ? at.x : k === 1 ? at.y : at.z;
            vel[i * 3 + k] = ak * speed + ck * carry + gauss() * spread;
            pos[i * 3 + k] = pk + gauss() * 0.05;
          }
        }
        for (let i = 0; i < n; i++) {
          age[i] += dt;
          const f = age[i] / life[i];
          if (f >= 1) { col[i * 3] = col[i * 3 + 1] = col[i * 3 + 2] = 0; size[i] = 0; continue; }
          pos[i * 3] += vel[i * 3] * dt;
          pos[i * 3 + 1] += vel[i * 3 + 1] * dt;
          pos[i * 3 + 2] += vel[i * 3 + 2] * dt;
          const fade = Math.pow(1 - f, 1.6) * Math.min(1, age[i] * 8);
          const c = ion[i] ? ionColor : dustColor;
          const k = fade * (ion[i] ? 0.9 : 0.7);
          col[i * 3] = c.r * k; col[i * 3 + 1] = c.g * k; col[i * 3 + 2] = c.b * k;
          size[i] = (ion[i] ? 0.05 : 0.07) * (0.6 + f * 1.4);
        }
        posAttr.needsUpdate = colAttr.needsUpdate = sizeAttr.needsUpdate = true;
      },
    };
  }

  // ── Camera ─────────────────────────────────────────────────────────────
  let focusId: string | null = null;
  let diving = false, diveT = 0;
  let scrollP = 0;
  const ease = (x: number) => x * x * (3 - 2 * x);
  const pointer = new THREE.Vector2();
  const goalPos = new THREE.Vector3(), goalTarget = new THREE.Vector3();
  const camPos = new THREE.Vector3(), camTarget = new THREE.Vector3();
  const tmp = new THREE.Vector3(), fwd = new THREE.Vector3(), right = new THREE.Vector3();

  function overviewGoal(t: number) {
    const az = OVERVIEW_AZ + Math.sin(t * 0.035) * 0.2 + pointer.x * 0.06;
    const pol = OVERVIEW_POLAR + Math.sin(t * 0.05) * 0.025 + pointer.y * 0.035;
    goalTarget.copy(OVERVIEW_TARGET);
    goalPos.setFromSphericalCoords(OVERVIEW_DIST * (1 + scrollP * 0.5), pol - scrollP * 0.32, az + scrollP * 0.25).add(OVERVIEW_TARGET);
  }

  // A three-quarter shot from the side of the orbit: the terminator runs down
  // the middle, so a live world's night side shows its lights. The body sits
  // left of centre to leave room for the caption on the right.
  function focusGoal(body: Tracked, t: number) {
    body.pivot.getWorldPosition(tmp);
    const out = tmp.clone().setY(0);
    if (out.lengthSq() < 1e-6) out.set(1, 0, 0);
    out.normalize();
    const side = new THREE.Vector3(-out.z, 0, out.x);
    const dir = side.multiplyScalar(1).addScaledVector(out, (body.shotOut ?? 0.12) + pointer.x * 0.08).addScaledVector(UP, 0.3 + pointer.y * 0.05).normalize();
    dir.applyAxisAngle(UP, Math.sin(t * 0.08) * 0.12);
    const dist = (body.frame * 9 + 2) * (1 + scrollP * 0.6) * (1 - 0.7 * ease(diveT));
    goalPos.copy(tmp).addScaledVector(dir, dist);
    fwd.copy(tmp).sub(goalPos).normalize();
    right.crossVectors(fwd, UP).normalize();
    goalTarget.copy(tmp).addScaledVector(right, dist * 0.13).addScaledVector(UP, -dist * 0.07);
  }

  // ── Post ───────────────────────────────────────────────────────────────
  const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 });
  const composer = new EffectComposer(renderer, target);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.62, 0.55, 0.95);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  const grade = new ShaderPass(new THREE.ShaderMaterial({
    uniforms: { tDiffuse: { value: null }, uTime: time },
    vertexShader: GLSL.GRADE_VERT, fragmentShader: GLSL.GRADE_FRAG,
  }));
  composer.addPass(grade);

  // ── Loop ───────────────────────────────────────────────────────────────
  let width = 1, height = 1;
  let raf = 0, running = false, last = 0;
  let simT = 0;
  const reduced = opts.reducedMotion;
  const ndc = new THREE.Vector3();
  const parentQuat = new THREE.Quaternion();
  const points: ScreenPoint[] = tracked.map(b => ({ id: b.id, x: 0, y: 0, r: 0, visible: false }));

  const tick = (dt: number) => {
    if (!reduced) simT += dt;
    time.value = simT;
    const simDt = reduced ? 0 : dt;
    for (const b of tracked) b.update(simT, simDt);
    belt.rotation.y = simT * 0.0045;
    scene.updateMatrixWorld();

    const body = focusId ? tracked.find(b => b.id === focusId) : undefined;
    if (body) focusGoal(body, simT); else overviewGoal(simT);
    for (const b of tracked) if (b.focus) b.focus.value += ((b === body ? 1 : 0) - b.focus.value) * Math.min(1, dt * 3);

    if (diving) diveT = Math.min(1, diveT + dt / 1.3);
    bloom.strength = 0.62 + ease(diveT) * 0.9;
    renderer.toneMappingExposure = (1 - scrollP * 0.4) * (1 + ease(diveT) * 0.5);
    const k = reduced ? 60 : diving ? 2.6 : body ? 1.25 : 0.85;
    camPos.lerp(goalPos, 1 - Math.exp(-dt * k));
    camTarget.lerp(goalTarget, 1 - Math.exp(-dt * (reduced ? 60 : 1.9)));
    // Arc over the system in transit rather than cutting through the sun.
    const gap = camPos.distanceTo(goalPos);
    camera.position.copy(camPos).addScaledVector(UP, Math.min(gap * 0.32, 16));
    camera.lookAt(camTarget);
    camera.updateMatrixWorld();

    sky.position.copy(camera.position);
    stars.position.copy(camera.position);
    // Billboards face the camera in world space, whatever their parent's tilt.
    scene.traverse(o => {
      if (!o.userData.billboard || !o.parent) return;
      o.parent.getWorldQuaternion(parentQuat);
      o.quaternion.copy(parentQuat.invert().multiply(camera.quaternion));
    });

    composer.render(dt);

    const f = height / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    tracked.forEach((b, i) => {
      b.pivot.getWorldPosition(tmp);
      const d = tmp.distanceTo(camera.position);
      ndc.copy(tmp).project(camera);
      const p = points[i];
      p.x = (ndc.x + 1) / 2 * width;
      p.y = (1 - ndc.y) / 2 * height;
      p.r = (b.frame / d) * f;
      p.visible = ndc.z < 1 && ndc.x > -1.05 && ndc.x < 1.05 && ndc.y > -1.05 && ndc.y < 1.05;
    });
    opts.onFrame(points);
  };

  const loop = (now: number) => {
    const dt = last ? Math.min((now - last) / 1000, 0.05) : 1 / 60;
    last = now;
    tick(dt);
    raf = requestAnimationFrame(loop);
  };

  // Start the camera already in the overview, not flying in from the origin.
  overviewGoal(0);
  camPos.copy(goalPos);
  camTarget.copy(goalTarget);

  const raycaster = new THREE.Raycaster();

  return {
    resize(w, h) {
      width = Math.max(1, w); height = Math.max(1, h);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      composer.setPixelRatio(pr);
      composer.setSize(width, height);
      pointScale.value = height / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
      if (!running) tick(0);
    },
    setFocus(id) { if (!diving) focusId = id; },
    dive(id) { focusId = id; diving = true; diveT = 0; },
    setScroll(progress) { scrollP = THREE.MathUtils.clamp(progress, 0, 1); },
    setPointer(nx, ny) { pointer.set(nx, ny); },
    pick(x, y) {
      raycaster.setFromCamera(new THREE.Vector2((x / width) * 2 - 1, -(y / height) * 2 + 1), camera);
      const hit = raycaster.intersectObjects(hits, false)[0];
      return hit ? (hit.object.userData.id as string) : null;
    },
    start() {
      if (running) return;
      running = true; last = 0;
      raf = requestAnimationFrame(loop);
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
    },
    dispose() {
      cancelAnimationFrame(raf);
      running = false;
      scene.traverse(o => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach(x => x.dispose()); else mat?.dispose();
      });
      composer.dispose();
      target.dispose();
      renderer.dispose();
    },
  };
}

// Stars at infinity: most scattered evenly, the rest crowded into a band.
// Colours run blue-white to amber, weighted toward white; a few are bright
// enough to catch the bloom.
function makeStars(band: THREE.Vector3, time: { value: number }, pixelRatio: { value: number }) {
  const n = 7000;
  const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), size = new Float32Array(n), phase = new Float32Array(n);
  const tints = ['#9bb0ff', '#b7c6ff', '#dde4ff', '#f8f7ff', '#f8f7ff', '#fff4ea', '#fff4ea', '#ffe0bd', '#ffc98f'].map(c => new THREE.Color(c));
  const u = new THREE.Vector3(), w = new THREE.Vector3();
  u.set(1, 0, 0).cross(band).normalize();
  w.copy(band).cross(u).normalize();
  const v = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    if (i < n * 0.45) {
      const a = Math.random() * TAU;
      v.copy(u).multiplyScalar(Math.cos(a)).addScaledVector(w, Math.sin(a)).addScaledVector(band, gauss() * 0.16).normalize();
    } else {
      v.set(gauss(), gauss(), gauss()).normalize();
    }
    pos.set([v.x * 800, v.y * 800, v.z * 800], i * 3);
    const b = 0.3 + Math.pow(Math.random(), 4) * 2.2;
    const c = tints[Math.floor(Math.random() * tints.length)].clone().multiplyScalar(b);
    col.set([c.r, c.g, c.b], i * 3);
    size[i] = 1.1 + Math.pow(Math.random(), 6) * 3.2;
    phase[i] = Math.random();
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
  g.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
  g.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));
  const points = new THREE.Points(g, new THREE.ShaderMaterial({
    vertexShader: GLSL.STAR_VERT, fragmentShader: GLSL.POINT_FRAG,
    uniforms: { uTime: time, uPR: pixelRatio },
    blending: THREE.AdditiveBlending, transparent: true, depthWrite: false,
  }));
  points.frustumCulled = false;
  return points;
}

// The asteroid belt between the inner missions and the outer ones: lumpy,
// flat-shaded rocks lit by the sun's point light.
function makeBelt() {
  const geo = new THREE.IcosahedronGeometry(1, 1);
  const p = geo.attributes.position as THREE.BufferAttribute;
  const seen = new Map<string, number>();
  for (let i = 0; i < p.count; i++) {
    const key = `${p.getX(i).toFixed(3)},${p.getY(i).toFixed(3)},${p.getZ(i).toFixed(3)}`;
    const s = seen.get(key) ?? 0.7 + Math.random() * 0.5;
    seen.set(key, s);
    p.setXYZ(i, p.getX(i) * s, p.getY(i) * s * 0.8, p.getZ(i) * s);
  }
  geo.computeVertexNormals();
  const n = 1100;
  const mesh = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ color: '#6e665e', roughness: 1, metalness: 0, flatShading: true }), n);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), s = new THREE.Vector3(), t = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    const r = 25.5 + gauss() * 1.1;
    const a = Math.random() * TAU;
    t.set(Math.cos(a) * r, gauss() * 0.35, Math.sin(a) * r);
    e.set(Math.random() * TAU, Math.random() * TAU, Math.random() * TAU);
    q.setFromEuler(e);
    s.setScalar(0.02 + Math.pow(Math.random(), 4) * 0.09);
    mesh.setMatrixAt(i, m.compose(t, q, s));
  }
  return mesh;
}

// Solar-panel cells: dark blue squares on a silver grid, drawn once.
function panelTexture() {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 64;
  const g = c.getContext('2d')!;
  g.fillStyle = '#b9bcc4';
  g.fillRect(0, 0, 256, 64);
  for (let x = 0; x < 16; x++) for (let y = 0; y < 4; y++) {
    const l = 16 + Math.random() * 8;
    g.fillStyle = `hsl(218, 55%, ${l}%)`;
    g.fillRect(x * 16 + 1, y * 16 + 1, 14, 14);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function gauss() {
  return (Math.random() + Math.random() + Math.random() - 1.5) / 0.75;
}
