// The journal's orrery: a brass instrument, not a sky. Each topic is an
// engraved hoop on its own tilt; each published entry is a glass bead threaded
// on its hoop with a lit core, and each unwritten one is an empty clasp.
// Beads ride their hoops slowly; dragging turns the whole instrument.
// Nothing here is shared with the home page's star system on purpose.

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export type OrreryRing = { radius: number; tilt: number; color: string; period: number };
export type OrreryBead = { id: string; ring: number; angle: number; pinned: boolean; lit: boolean };
export type ScreenXY = { x: number; y: number };
export type BeadPoint = ScreenXY & { id: string; behind: boolean };

export type Orrery = {
  resize(w: number, h: number): void;
  start(): void;
  stop(): void;
  pick(x: number, y: number): string | null;
  setHovered(id: string | null): void;
  setDimmed(ring: number | null): void;
  dragBy(dx: number, dy: number): void;
  setDragging(on: boolean): void;
  dispose(): void;
};

const BRASS = '#b8925a';
const TARGET = new THREE.Vector3(0, -0.8, 0);

export function createOrrery(
  canvas: HTMLCanvasElement,
  rings: OrreryRing[],
  beads: OrreryBead[],
  opts: { reducedMotion: boolean; onFrame(beads: BeadPoint[], ringTops: ScreenXY[]): void },
): Orrery {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = env;
  scene.environmentIntensity = 0.45;

  const camera = new THREE.PerspectiveCamera(28, 2, 0.1, 100);
  const instrument = new THREE.Group();
  scene.add(instrument);

  const brass = new THREE.MeshStandardMaterial({ color: BRASS, metalness: 1, roughness: 0.3 });
  const darkBrass = new THREE.MeshStandardMaterial({ color: '#6e5634', metalness: 1, roughness: 0.5 });
  const glowMap = glowTexture();

  // Stand: a turned brass pillar on a stepped base, rising to the lamp.
  const profile = [
    [0, -2.45], [1.2, -2.45], [1.26, -2.4], [1.26, -2.34], [1.12, -2.28], [0.55, -2.22], [0.5, -2.16],
    [0.26, -2.06], [0.13, -1.8], [0.1, -1.1], [0.14, -1.0], [0.09, -0.9], [0.09, -0.52], [0.18, -0.46], [0, -0.4],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  instrument.add(new THREE.Mesh(new THREE.LatheGeometry(profile, 72), brass));

  // The lamp at the centre: a hot core inside a glass bulb, with a soft halo.
  const lamp = new THREE.Group();
  lamp.add(new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 24), new THREE.MeshBasicMaterial({ color: '#fff1dc' })));
  lamp.add(new THREE.Mesh(new THREE.SphereGeometry(0.36, 48, 32), new THREE.MeshPhysicalMaterial({
    color: '#ffe4c2', transmission: 1, thickness: 0.35, roughness: 0.12, ior: 1.35, metalness: 0,
  })));
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowMap, color: '#e8a87c', blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.85 }));
  halo.scale.setScalar(2.6);
  lamp.add(halo);
  lamp.add(new THREE.PointLight('#ffc98f', 14, 0, 2));
  instrument.add(lamp);

  // Hoops: each lies in its own tilted plane, with engraved ticks, a hairline
  // of the topic colour just inside, and two spokes back to the hub.
  const planes = rings.map(ring => {
    const plane = new THREE.Group();
    plane.rotation.z = THREE.MathUtils.degToRad(ring.tilt);
    instrument.add(plane);

    const hoop = new THREE.Mesh(new THREE.TorusGeometry(ring.radius, 0.024, 12, 256), brass);
    hoop.rotation.x = Math.PI / 2;
    plane.add(hoop);

    const TICKS = 120;
    const ticks = new THREE.InstancedMesh(new THREE.BoxGeometry(0.1, 0.012, 0.012), darkBrass, TICKS);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3();
    for (let i = 0; i < TICKS; i++) {
      const a = (i / TICKS) * Math.PI * 2;
      const long = i % 10 === 0 ? 1.8 : 1;
      p.set(Math.cos(a) * (ring.radius + 0.05 * long), 0, Math.sin(a) * (ring.radius + 0.05 * long));
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -a);
      s.set(long, 1, 1);
      ticks.setMatrixAt(i, m.compose(p, q, s));
    }
    plane.add(ticks);

    const hair = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(Array.from({ length: 200 }, (_, i) => {
        const a = (i / 200) * Math.PI * 2;
        return new THREE.Vector3(Math.cos(a) * (ring.radius - 0.07), 0, Math.sin(a) * (ring.radius - 0.07));
      })),
      new THREE.LineBasicMaterial({ color: ring.color, transparent: true, opacity: 0.45 }),
    );
    plane.add(hair);

    for (const a of [0.35, 0.35 + Math.PI]) {
      const len = ring.radius - 0.4;
      const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, len, 8), darkBrass);
      spoke.rotation.z = Math.PI / 2;
      const arm = new THREE.Group();
      arm.rotation.y = -a;
      spoke.position.x = 0.4 + len / 2;
      arm.add(spoke);
      plane.add(arm);
    }
    return { plane, hair };
  });

  // Beads: glass on the wire with a lit core in the topic colour; unwritten
  // entries are open brass clasps with nothing inside.
  const hitGeo = new THREE.SphereGeometry(0.3, 12, 8);
  const hitMat = new THREE.MeshBasicMaterial({ visible: false });
  const bodies = beads.map(bead => {
    const ring = rings[bead.ring];
    const carrier = new THREE.Group();
    planes[bead.ring].plane.add(carrier);
    const color = new THREE.Color(ring.color);
    const size = bead.pinned ? 1.3 : 1;
    let core: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial> | null = null;
    let glow: THREE.Sprite | null = null;
    let shell: THREE.Mesh | null = null;
    let hit: THREE.Mesh | null = null;
    if (bead.lit) {
      core = new THREE.Mesh(new THREE.SphereGeometry(0.05 * size, 20, 14), new THREE.MeshBasicMaterial({ color: color.clone() }));
      shell = new THREE.Mesh(new THREE.SphereGeometry(0.11 * size, 40, 28), new THREE.MeshPhysicalMaterial({
        color: color.clone().lerp(new THREE.Color('#ffffff'), 0.65), transmission: 1, thickness: 0.2, roughness: 0.06, ior: 1.5, metalness: 0,
      }));
      glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowMap, color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.7 }));
      glow.scale.setScalar(0.75 * size);
      hit = new THREE.Mesh(hitGeo, hitMat);
      hit.userData.id = bead.id;
      carrier.add(core, shell, glow, hit);
    } else {
      // The carrier's local z runs along the wire, and a torus faces z, so the
      // clasp already stands across the wire.
      carrier.add(new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.012, 8, 32), darkBrass));
    }
    return { bead, ring, carrier, core, shell, glow, hit, base: color, hover: 0, dim: 1 };
  });
  const hits = bodies.flatMap(b => (b.hit ? [b.hit] : []));

  // View: a slow yaw drift the reader can take over by dragging.
  let yaw = -0.5, pitch = 0.32, yawVel = 0, dragging = false;
  let hovered: string | null = null, dimmed: number | null = null;
  let w = 1, h = 1, raf = 0, last = 0, simT = 0;

  const fit = () => {
    camera.aspect = w / h;
    const outer = Math.max(...rings.map(r => r.radius));
    const vHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const hHalf = vHalf * camera.aspect;
    const d = Math.max((outer + 1.1) / hHalf, 2.75 / vHalf);
    camera.position.set(0, Math.sin(pitch) * d, Math.cos(pitch) * d).add(TARGET);
    camera.lookAt(TARGET);
    camera.updateProjectionMatrix();
  };

  const v = new THREE.Vector3();
  const toScreen = (p: THREE.Vector3): ScreenXY => {
    v.copy(p).project(camera);
    return { x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h };
  };
  const lampDist = () => camera.position.distanceTo(TARGET.clone().setY(0));

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, last ? (now - last) / 1000 : 0);
    last = now;
    if (!opts.reducedMotion) simT += dt;

    if (!dragging) {
      yaw += yawVel;
      yawVel *= 0.94;
      if (!opts.reducedMotion) yaw += dt * 0.04;
    }
    instrument.rotation.y = yaw;
    fit();

    const points: BeadPoint[] = [];
    const ld = lampDist();
    for (const b of bodies) {
      const a = THREE.MathUtils.degToRad(b.bead.angle) + (simT / b.ring.period) * Math.PI * 2;
      b.carrier.position.set(Math.cos(a) * b.ring.radius, 0, Math.sin(a) * b.ring.radius);
      b.carrier.rotation.y = -a;

      const wantHover = hovered === b.bead.id ? 1 : 0;
      const wantDim = dimmed !== null && dimmed !== b.bead.ring ? 0.18 : 1;
      b.hover += (wantHover - b.hover) * 0.18;
      b.dim += (wantDim - b.dim) * 0.12;
      if (b.core && b.glow && b.shell) {
        b.core.material.color.copy(b.base).multiplyScalar((1 + b.hover * 1.4) * b.dim);
        (b.glow.material as THREE.SpriteMaterial).opacity = 0.7 * b.dim + b.hover * 0.3;
        b.glow.scale.setScalar((b.bead.pinned ? 0.98 : 0.75) * (1 + b.hover * 0.7));
        b.shell.scale.setScalar(1 + b.hover * 0.18);
      }

      const world = b.carrier.getWorldPosition(new THREE.Vector3());
      points.push({ id: b.bead.id, ...toScreen(world), behind: camera.position.distanceTo(world) > ld });
    }
    planes.forEach((p, i) => {
      const mat = p.hair.material as THREE.LineBasicMaterial;
      mat.opacity += ((dimmed !== null && dimmed !== i ? 0.08 : 0.45) - mat.opacity) * 0.12;
    });

    // Each hoop's name sits at its highest point on screen.
    const ringTops = rings.map((ring, i) => {
      let top: ScreenXY = { x: 0, y: Infinity };
      for (let k = 0; k < 72; k++) {
        const a = (k / 72) * Math.PI * 2;
        const s = toScreen(planes[i].plane.localToWorld(new THREE.Vector3(Math.cos(a) * ring.radius, 0, Math.sin(a) * ring.radius)));
        if (s.y < top.y) top = s;
      }
      return top;
    });

    renderer.render(scene, camera);
    opts.onFrame(points, ringTops);
  };

  const raycaster = new THREE.Raycaster();
  return {
    resize(nw, nh) {
      w = Math.max(1, nw); h = Math.max(1, nh);
      renderer.setSize(w, h, false);
      fit();
    },
    start() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } },
    stop() { cancelAnimationFrame(raf); raf = 0; },
    pick(x, y) {
      raycaster.setFromCamera(new THREE.Vector2((x / w) * 2 - 1, -(y / h) * 2 + 1), camera);
      const hit = raycaster.intersectObjects(hits, false)[0];
      return (hit?.object.userData.id as string | undefined) ?? null;
    },
    setHovered(id) { hovered = id; },
    setDimmed(ring) { dimmed = ring; },
    dragBy(dx, dy) {
      yaw += dx * 0.006;
      yawVel = dx * 0.006;
      pitch = THREE.MathUtils.clamp(pitch + dy * 0.003, 0.22, 0.62);
    },
    setDragging(on) { dragging = on; },
    dispose() {
      cancelAnimationFrame(raf);
      scene.traverse(o => {
        const mesh = o as THREE.Mesh;
        mesh.geometry?.dispose();
        const mats = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
        mats.forEach(m => m.dispose());
      });
      glowMap.dispose();
      env.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}

// A soft round falloff for halos, drawn once.
function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.18, 'rgba(255,255,255,0.55)');
  grad.addColorStop(0.5, 'rgba(255,255,255,0.12)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
