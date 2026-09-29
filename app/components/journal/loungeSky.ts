// The view from the lounge: a fantasy sky drawn by one shader. A great spiral
// galaxy hangs tilted over the window, wrapped in magenta and teal nebulae,
// with a dense star field behind. It follows the camera, so it sits at
// infinity. Nothing here is shared with the home page on purpose.

import * as THREE from 'three';

export function createLoungeSky() {
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uGalaxy: { value: new THREE.Vector3(0.12, 0.26, 1).normalize() },
    },
    vertexShader: VERT,
    fragmentShader: FRAG,
    side: THREE.BackSide,
    depthWrite: false,
    depthTest: false,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(400, 64, 32), material);
  mesh.renderOrder = -1;
  mesh.frustumCulled = false;
  return {
    mesh,
    update(camera: THREE.Camera, time: number) {
      mesh.position.copy(camera.position);
      material.uniforms.uTime.value = time;
    },
    dispose() { mesh.geometry.dispose(); material.dispose(); },
  };
}

const VERT = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const FRAG = /* glsl */ `
uniform float uTime;
uniform vec3 uGalaxy;
varying vec3 vDir;

float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float noise(vec3 x) {
  vec3 i = floor(x), f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float fbm(vec3 p) { float a = 0.5, s = 0.0; for (int i = 0; i < 6; i++) { s += a * noise(p); p *= 2.02; a *= 0.5; } return s; }

vec3 stars(vec3 d, float scale, float density, float size) {
  vec3 p = d * scale;
  vec3 cell = floor(p);
  float h = hash(cell);
  if (h > density) return vec3(0.0);
  vec3 pos = cell + 0.25 + 0.5 * vec3(hash(cell + 1.3), hash(cell + 2.7), hash(cell + 4.1));
  float dist = length(p - pos) / scale;
  float mag = pow(hash(cell + 7.9), 7.0);
  float r = size * (0.6 + 2.0 * mag);
  float tw = 0.8 + 0.2 * sin(uTime * (0.7 + 2.5 * hash(cell + 9.1)) + h * 40.0);
  float core = 1.0 - smoothstep(0.0, r, dist);
  float t = hash(cell + 5.5);
  vec3 tint = t < 0.35 ? vec3(0.7, 0.82, 1.0) : t > 0.85 ? vec3(1.0, 0.78, 0.6) : vec3(1.0, 0.96, 0.92);
  return tint * core * (0.12 + 0.9 * mag) * tw;
}

// A spiral galaxy seen at a tilt: log-spiral arms, a warm core, dust lanes
// and pink knots of star birth along the arms.
vec3 galaxy(vec3 d) {
  vec3 g = uGalaxy;
  vec3 t = normalize(cross(g, vec3(0.0, 1.0, 0.0)));
  vec3 b = cross(t, g);
  float along = dot(d, g);
  if (along < 0.5) return vec3(0.0);
  vec2 q = vec2(dot(d, t), dot(d, b)) / along;
  // Tilt the disc: rotate, then squash one axis.
  float ca = cos(0.5), sa = sin(0.5);
  q = mat2(ca, -sa, sa, ca) * q;
  q.y /= 0.42;
  q /= 0.62;                                   // angular size
  float r = length(q);
  float th = atan(q.y, q.x);
  float spin = uTime * 0.004;
  float arms = 0.5 + 0.5 * cos(2.0 * (th - 2.6 * log(r + 0.04) - spin));
  arms = pow(arms, 3.0);
  vec3 p3 = vec3(q * 3.0, 1.7);
  float clump = fbm(p3 + vec3(0.0, 0.0, spin));
  float disc = exp(-r * 2.6);
  float lanes = smoothstep(0.55, 0.85, arms) * smoothstep(0.45, 0.7, fbm(p3 * 3.1 + 9.0)) * 0.6;
  vec3 col = vec3(0.0);
  col += vec3(1.0, 0.86, 0.66) * exp(-r * 9.0) * 1.6;          // core
  col += vec3(0.95, 0.8, 0.7) * exp(-r * 4.0) * 0.35;           // bulge
  col += vec3(0.55, 0.68, 1.0) * arms * disc * (0.35 + 0.9 * clump) * 0.75; // arms
  float knots = smoothstep(0.78, 0.95, fbm(p3 * 6.0 + 2.0)) * arms * disc;
  col += vec3(1.0, 0.35, 0.65) * knots * 1.2;                   // HII regions
  col *= 1.0 - lanes;
  return col * smoothstep(1.6, 0.9, r);
}

void main() {
  vec3 d = normalize(vDir);

  // Deep violet near the galaxy's side of the sky, blue-black elsewhere.
  float g = max(dot(d, uGalaxy), 0.0);
  vec3 col = mix(vec3(0.004, 0.006, 0.016), vec3(0.03, 0.012, 0.05), pow(g, 3.0));

  // Nebulae: two domain-warped clouds, magenta and teal, torn by dark dust.
  vec3 w = d * 2.2 + vec3(fbm(d * 3.0), fbm(d * 3.0 + 4.1), fbm(d * 3.0 + 8.3)) * 1.4;
  float n1 = smoothstep(0.48, 0.85, fbm(w + 1.7));
  float n2 = smoothstep(0.5, 0.85, fbm(w * 1.3 + 6.2));
  float dust = smoothstep(0.52, 0.75, fbm(d * 7.0 + 3.3));
  float band = exp(-pow(dot(d, normalize(vec3(0.5, 0.8, -0.3))), 2.0) * 6.0);
  col += vec3(0.55, 0.12, 0.5) * n1 * 0.22 * band;
  col += vec3(0.05, 0.4, 0.5) * n2 * 0.18 * band;
  col *= 1.0 - dust * 0.6 * band;

  col += stars(d, 160.0, 0.16, 0.0014) + stars(d, 380.0, 0.2, 0.0008) * 0.6 + stars(d, 700.0, 0.22, 0.0005) * (0.2 + 0.6 * band);
  col += galaxy(d);

  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;
