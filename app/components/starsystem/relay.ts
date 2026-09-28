// The Contact relay: a communications satellite built from primitives and
// canvas-drawn textures. Its +z side (dish and solar cells) faces the sun.

import * as THREE from 'three';

export function buildRelayCraft() {
  const craft = new THREE.Group();

  const foilMaps = foilTextures();
  const foil = new THREE.MeshStandardMaterial({
    map: foilMaps.map, normalMap: foilMaps.normal, normalScale: new THREE.Vector2(0.9, 0.9),
    metalness: 0.7, roughness: 0.32, emissive: '#3d2a10',
  });
  const silverFoil = new THREE.MeshStandardMaterial({
    color: '#c9ccd2', normalMap: foilMaps.normal, normalScale: new THREE.Vector2(0.6, 0.6),
    metalness: 0.8, roughness: 0.3, emissive: '#16181c',
  });
  const cells = new THREE.MeshStandardMaterial({ map: cellTexture(), metalness: 0.55, roughness: 0.22, emissive: '#081220' });
  const panelBack = new THREE.MeshStandardMaterial({ color: '#5d6068', metalness: 0.3, roughness: 0.7, emissive: '#0c0d10' });
  const radiator = new THREE.MeshStandardMaterial({ map: radiatorTexture(), metalness: 0.2, roughness: 0.45, emissive: '#141414' });
  const white = new THREE.MeshStandardMaterial({ color: '#e2ddd0', metalness: 0.05, roughness: 0.55, emissive: '#121110', side: THREE.DoubleSide });
  const darkMetal = new THREE.MeshStandardMaterial({ color: '#3a3b3f', metalness: 0.85, roughness: 0.35, emissive: '#060607' });
  const lens = new THREE.MeshStandardMaterial({ color: '#05070a', metalness: 0.2, roughness: 0.05 });

  const add = (geo: THREE.BufferGeometry, mat: THREE.Material | THREE.Material[], x = 0, y = 0, z = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    craft.add(m);
    return m;
  };

  // Bus, gold foil on the sides, a silver sunward face, radiators top and bottom.
  add(new THREE.BoxGeometry(0.6, 0.6, 0.8), [foil, foil, foil, foil, silverFoil, foil]);
  for (const s of [-1, 1]) add(new THREE.BoxGeometry(0.56, 0.012, 0.72), radiator, 0, s * 0.306, 0);

  // Solar wings: a yoke, then two hinged panels each side, cells facing the sun.
  for (const s of [-1, 1]) {
    const yoke = add(new THREE.CylinderGeometry(0.014, 0.014, 0.3, 8), darkMetal, s * 0.45, 0, 0);
    yoke.rotation.z = Math.PI / 2;
    add(new THREE.CylinderGeometry(0.035, 0.035, 0.05, 12), darkMetal, s * 0.31, 0, 0).rotation.z = Math.PI / 2;
    for (let k = 0; k < 2; k++) {
      const cx = s * (0.6 + 0.41 + k * 0.84);
      add(new THREE.BoxGeometry(0.8, 0.58, 0.016), [panelBack, panelBack, panelBack, panelBack, cells, panelBack], cx, 0, 0);
      add(new THREE.BoxGeometry(0.03, 0.05, 0.03), darkMetal, cx - s * 0.415, 0, 0);
    }
  }

  // High-gain dish: a true paraboloid, a feed horn at its focus on three struts.
  const f = 0.3, rimR = 0.46, base = 0.47;
  const profile: THREE.Vector2[] = [];
  for (let i = 0; i <= 24; i++) {
    const r = (i / 24) * rimR;
    profile.push(new THREE.Vector2(r, (r * r) / (4 * f)));
  }
  const dish = add(new THREE.LatheGeometry(profile, 64), white, 0, 0, base);
  dish.rotation.x = Math.PI / 2;
  const rimDepth = (rimR * rimR) / (4 * f);
  add(new THREE.TorusGeometry(rimR, 0.008, 6, 64), darkMetal, 0, 0, base + rimDepth);
  add(new THREE.CylinderGeometry(0.06, 0.08, 0.08, 16), darkMetal, 0, 0, base - 0.02).rotation.x = Math.PI / 2;
  const focus = new THREE.Vector3(0, 0, base + f);
  const horn = add(new THREE.ConeGeometry(0.045, 0.1, 16, 1, true), darkMetal, 0, 0, base + f - 0.02);
  horn.rotation.x = -Math.PI / 2;
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.3;
    const from = new THREE.Vector3(Math.cos(a) * rimR * 0.95, Math.sin(a) * rimR * 0.95, base + rimDepth * 0.9);
    const len = from.distanceTo(focus);
    const strut = add(new THREE.CylinderGeometry(0.006, 0.006, len, 6), darkMetal);
    strut.position.copy(from).add(focus).multiplyScalar(0.5);
    strut.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), focus.clone().sub(from).normalize());
  }

  // Aft end: four thrusters, a medium-gain horn.
  for (const [x, y] of [[-0.22, -0.22], [0.22, -0.22], [-0.22, 0.22], [0.22, 0.22]]) {
    const n = add(new THREE.ConeGeometry(0.035, 0.07, 12, 1, true), darkMetal, x, y, -0.44);
    n.rotation.x = -Math.PI / 2;
  }
  const mga = add(new THREE.ConeGeometry(0.07, 0.16, 16, 1, true), white, 0, 0.12, -0.48);
  mga.rotation.x = Math.PI / 2;

  // Star trackers on top, looking off-axis, with dark lenses.
  for (const s of [-1, 1]) {
    const g = new THREE.Group();
    g.position.set(s * 0.17, 0.34, -0.2);
    g.rotation.set(-0.5, 0, s * 0.35);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.1, 16), darkMetal);
    const cap = new THREE.Mesh(new THREE.CircleGeometry(0.04, 16), lens);
    cap.rotation.x = -Math.PI / 2;
    cap.position.y = 0.051;
    g.add(body, cap);
    craft.add(g);
  }

  // Magnetometer boom off the back, and two whip antennas.
  const boom = add(new THREE.CylinderGeometry(0.006, 0.006, 1.1, 6), white);
  boom.position.set(-0.2, 0.2, -0.95);
  boom.rotation.set(Math.PI / 2 - 0.35, 0, 0.25);
  add(new THREE.BoxGeometry(0.05, 0.05, 0.07), darkMetal, -0.34, 0.39, -1.45);
  for (const s of [-1, 1]) {
    const whip = add(new THREE.CylinderGeometry(0.003, 0.003, 0.6, 4), darkMetal, s * 0.3, -0.4, -0.3);
    whip.rotation.set(0.4, 0, s * 0.6);
  }

  const beaconColor = new THREE.Color('#e8a87c');
  const beacon = add(new THREE.SphereGeometry(0.028, 10, 8), new THREE.MeshBasicMaterial({ color: beaconColor.clone() }), 0.2, 0.33, 0.3);

  return {
    craft,
    blink(t: number) {
      const on = (t % 1.6) < 0.1 || ((t + 0.25) % 1.6) < 0.06;
      (beacon.material as THREE.MeshBasicMaterial).color.copy(beaconColor).multiplyScalar(on ? 8 : 0.3);
    },
  };
}

function canvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return { c, g: c.getContext('2d')! };
}

function texture(c: HTMLCanvasElement, srgb = true, repeat = 1) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  t.anisotropy = 4;
  return t;
}

// Multi-layer insulation: crinkled facets (a Voronoi field), gold in the
// colour map and bumpy in the normal map, built from the same heights.
function foilTextures() {
  const S = 128;
  const seeds = Array.from({ length: 70 }, () => ({ x: Math.random() * S, y: Math.random() * S, h: Math.random(), gx: Math.random() - 0.5, gy: Math.random() - 0.5 }));
  const height = new Float32Array(S * S);
  const { c, g } = canvas(S, S);
  const img = g.createImageData(S, S);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    let best = 1e9, second = 1e9, id = 0;
    for (let i = 0; i < seeds.length; i++) {
      let dx = Math.abs(x - seeds[i].x), dy = Math.abs(y - seeds[i].y);
      dx = Math.min(dx, S - dx); dy = Math.min(dy, S - dy);
      const d = dx * dx + dy * dy;
      if (d < best) { second = best; best = d; id = i; } else if (d < second) second = d;
    }
    const s = seeds[id];
    const crease = Math.min(1, (Math.sqrt(second) - Math.sqrt(best)) / 2.5);
    const hgt = s.h * 0.6 + ((x - s.x) * s.gx + (y - s.y) * s.gy) * 0.03 + crease * 0.3;
    height[y * S + x] = hgt;
    const b = 0.62 + s.h * 0.45 - (1 - crease) * 0.25;
    const k = (y * S + x) * 4;
    img.data[k] = Math.min(255, 214 * b);
    img.data[k + 1] = Math.min(255, 164 * b);
    img.data[k + 2] = Math.min(255, 72 * b);
    img.data[k + 3] = 255;
  }
  g.putImageData(img, 0, 0);

  const { c: nc, g: ng } = canvas(S, S);
  const nimg = ng.createImageData(S, S);
  const at = (x: number, y: number) => height[((y + S) % S) * S + ((x + S) % S)];
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const dx = (at(x + 1, y) - at(x - 1, y)) * 3;
    const dy = (at(x, y + 1) - at(x, y - 1)) * 3;
    const len = Math.hypot(dx, dy, 1);
    const k = (y * S + x) * 4;
    nimg.data[k] = (-dx / len * 0.5 + 0.5) * 255;
    nimg.data[k + 1] = (-dy / len * 0.5 + 0.5) * 255;
    nimg.data[k + 2] = (1 / len * 0.5 + 0.5) * 255;
    nimg.data[k + 3] = 255;
  }
  ng.putImageData(nimg, 0, 0);
  return { map: texture(c, true, 2), normal: texture(nc, false, 2) };
}

// Solar cells: a silver grid, blue-black cells with busbars and a slight
// per-cell tint, as on a real array.
function cellTexture() {
  const { c, g } = canvas(512, 384);
  g.fillStyle = '#9ea3ad';
  g.fillRect(0, 0, 512, 384);
  const cols = 10, rows = 8, pad = 3;
  const cw = 512 / cols, ch = 384 / rows;
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    const x = i * cw + pad, y = j * ch + pad, w = cw - pad * 2, h = ch - pad * 2;
    const grad = g.createLinearGradient(x, y, x + w, y + h);
    const l = 13 + Math.random() * 6;
    grad.addColorStop(0, `hsl(222, 60%, ${l + 4}%)`);
    grad.addColorStop(1, `hsl(228, 55%, ${l}%)`);
    g.fillStyle = grad;
    g.fillRect(x, y, w, h);
    g.fillStyle = 'rgba(200,205,215,0.45)';
    for (let b = 1; b < 3; b++) g.fillRect(x + (w * b) / 3, y, 1.2, h);
    g.fillStyle = 'rgba(200,205,215,0.12)';
    for (let f = 1; f < 12; f++) g.fillRect(x, y + (h * f) / 12, w, 0.6);
  }
  return texture(c);
}

// Radiator: white optical-solar-reflector tiles.
function radiatorTexture() {
  const { c, g } = canvas(256, 256);
  g.fillStyle = '#d8d8d4';
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) {
    g.fillStyle = `hsl(210, 6%, ${80 + Math.random() * 10}%)`;
    g.fillRect(i * 32 + 1, j * 32 + 1, 30, 30);
  }
  return texture(c);
}
