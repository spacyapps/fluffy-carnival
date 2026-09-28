// GLSL for the home page star system. Everything outputs linear HDR colour:
// the composer's bloom picks out values above ~1, and OutputPass tone-maps.

// Ashima Arts 3D simplex noise (MIT) + a 5-octave fbm on top of it.
export const NOISE = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

float fbm(vec3 p) {
  float f = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { f += a * snoise(p); p = p * 2.02 + 17.1; a *= 0.5; }
  return f;
}
`;

// Shared by every lit sphere: object-space position for the surface pattern
// (so it turns with the mesh), world normal and position for the lighting.
export const SPHERE_VERT = /* glsl */ `
varying vec3 vObj;
varying vec3 vN;
varying vec3 vW;
void main() {
  vObj = position;
  vN = normalize(mat3(modelMatrix) * normal);
  vec4 w = modelMatrix * vec4(position, 1.0);
  vW = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}
`;

export const SUN_FRAG = /* glsl */ `
uniform float uTime;
varying vec3 vObj;
varying vec3 vN;
varying vec3 vW;
${NOISE}
void main() {
  vec3 p = normalize(vObj);
  vec3 V = normalize(cameraPosition - vW);
  float mu = max(dot(normalize(vN), V), 0.0);
  float cells = fbm(p * 3.2 + vec3(0.0, uTime * 0.04, 0.0));
  float gran = snoise(p * 26.0 + vec3(uTime * 0.12));
  float heat = clamp(0.55 + 0.35 * cells + 0.12 * gran, 0.0, 1.0);
  vec3 deep = vec3(1.0, 0.36, 0.12);
  vec3 hot = vec3(1.0, 0.86, 0.64);
  vec3 col = mix(deep, hot, heat);
  float limb = pow(mu, 0.5);
  col *= mix(0.55, 1.0, limb) * 3.4;
  gl_FragColor = vec4(col, 1.0);
}
`;

export const BILLBOARD_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// The corona plane is ~7 sun radii across: disc edge sits at d ≈ 0.14.
export const CORONA_FRAG = /* glsl */ `
uniform float uTime;
uniform vec3 uColor;
uniform float uIntensity;
varying vec2 vUv;
${NOISE}
void main() {
  vec2 c = vUv - 0.5;
  float d = length(c) * 2.0;
  float a = atan(c.y, c.x);
  float streamers = fbm(vec3(cos(a) * 2.2, sin(a) * 2.2, uTime * 0.05));
  float glow = exp(-d * 7.0) * 1.6 + 0.035 / (d + 0.04);
  glow *= 0.7 + 0.6 * smoothstep(-0.4, 0.6, streamers) * smoothstep(0.1, 0.35, d);
  glow *= 1.0 - smoothstep(0.55, 1.0, d);
  gl_FragColor = vec4(uColor * glow * uIntensity, 1.0);
}
`;

// uKind: 0 gas giant · 1 ocean world · 2 molten protoplanet · 3 barren moon.
// uLive lights cities on the night side — only inhabited (live) worlds.
export const PLANET_FRAG = /* glsl */ `
uniform vec3 uSunPos;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uAtmo;
uniform float uTime;
uniform float uSeed;
uniform float uKind;
uniform float uLive;
varying vec3 vObj;
varying vec3 vN;
varying vec3 vW;
${NOISE}
void main() {
  vec3 p = normalize(vObj);
  vec3 N = normalize(vN);
  vec3 L = normalize(uSunPos - vW);
  vec3 V = normalize(cameraPosition - vW);
  float ndl = dot(N, L);
  float diff = max(ndl, 0.0);
  float day = smoothstep(-0.12, 0.2, ndl);
  vec3 albedo;
  vec3 emissive = vec3(0.0);
  float spec = 0.0;

  if (uKind < 0.5) {
    float warp = fbm(p * vec3(1.4, 5.0, 1.4) + uSeed + vec3(uTime * 0.012, 0.0, 0.0));
    float bands = sin(p.y * 13.0 + warp * 3.6 + uSeed);
    float fine = fbm(p * vec3(2.5, 22.0, 2.5) + uSeed * 2.0);
    albedo = mix(uColorA, uColorB, 0.5 + 0.5 * bands);
    albedo *= 0.8 + 0.35 * fine;
    vec3 sp = p - normalize(vec3(0.7, -0.32, 0.64));
    float storm = smoothstep(0.2, 0.0, length(sp * vec3(1.0, 2.2, 1.0)) + 0.04 * snoise(p * 20.0));
    albedo = mix(albedo, uColorB * 1.25, storm * 0.8);
  } else if (uKind < 1.5) {
    float h = fbm(p * 1.8 + uSeed) + 0.45 * fbm(p * 6.0 + uSeed);
    float land = smoothstep(0.03, 0.09, h);
    vec3 ocean = mix(uColorA * 0.22, uColorA * 0.45, smoothstep(-0.4, 0.03, h));
    vec3 ground = mix(uColorB * 0.55, vec3(0.42, 0.37, 0.3), 0.55 + 0.3 * fbm(p * 9.0));
    albedo = mix(ocean, ground, land);
    float ice = smoothstep(0.8, 0.9, abs(p.y) + 0.08 * fbm(p * 5.0));
    albedo = mix(albedo, vec3(0.86, 0.88, 0.9), ice);
    spec = (1.0 - land) * (1.0 - ice);
    float cloud = smoothstep(0.05, 0.55, fbm(p * 2.6 + vec3(uTime * 0.018, 0.0, uSeed) + 9.0));
    albedo = mix(albedo, vec3(0.92), cloud * 0.8);
    spec *= 1.0 - cloud;
    float towns = smoothstep(0.62, 0.9, snoise(p * 38.0 + uSeed) * 0.5 + 0.5)
                * smoothstep(0.0, 0.5, fbm(p * 4.0 + 3.0 + uSeed));
    float city = uLive * land * (1.0 - ice) * (1.0 - cloud * 0.85) * towns;
    emissive += vec3(1.0, 0.66, 0.36) * city * (1.0 - day) * 2.2;
  } else if (uKind < 2.5) {
    float crust = fbm(p * 2.8 + uSeed);
    float seams = pow(1.0 - abs(snoise(p * 2.6 + uSeed + vec3(0.0, uTime * 0.02, 0.0))), 26.0);
    float cracks = seams * smoothstep(-0.1, 0.35, crust);
    cracks += 0.25 * pow(1.0 - abs(snoise(p * 7.0 + uSeed * 3.0)), 30.0);
    albedo = mix(vec3(0.07, 0.06, 0.055), uColorB * 0.4, 0.5 + 0.5 * crust);
    float breathe = 0.9 + 0.25 * sin(uTime * 1.1 + crust * 7.0);
    emissive = uColorA * cracks * breathe * (0.6 + 0.4 * (1.0 - day));
  } else {
    float maria = smoothstep(0.0, 0.3, fbm(p * 1.6 + uSeed));
    float grit = fbm(p * 14.0 + uSeed);
    albedo = mix(vec3(0.5, 0.49, 0.47), vec3(0.24, 0.23, 0.23), maria) * (0.85 + 0.2 * grit);
  }

  vec3 col = albedo * (diff * 1.25 + 0.006);
  vec3 H = normalize(L + V);
  col += spec * pow(max(dot(N, H), 0.0), 70.0) * 0.9 * step(0.0, ndl) * vec3(1.0, 0.9, 0.8);
  float fres = pow(1.0 - max(dot(N, V), 0.0), 3.0);
  col += uAtmo * fres * day * 1.1;
  col += emissive;
  gl_FragColor = vec4(col, 1.0);
}
`;

// Rendered on the back faces of a slightly larger shell, added on top: the
// thin bright limb you see around a lit planet, gone on the night side.
export const ATMO_FRAG = /* glsl */ `
uniform vec3 uSunPos;
uniform vec3 uAtmo;
uniform float uStrength;
varying vec3 vObj;
varying vec3 vN;
varying vec3 vW;
void main() {
  vec3 N = normalize(vN);
  vec3 V = normalize(cameraPosition - vW);
  vec3 L = normalize(uSunPos - vW);
  float edge = clamp(-dot(N, V) * 2.6, 0.0, 1.0);
  float i = pow(edge, 2.2) * smoothstep(-0.45, 0.6, dot(N, L));
  gl_FragColor = vec4(uAtmo * i * uStrength, 1.0);
}
`;

export const RING_VERT = /* glsl */ `
varying vec3 vW;
varying float vR;
void main() {
  vR = length(position.xy);
  vec4 w = modelMatrix * vec4(position, 1.0);
  vW = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}
`;

// Radial bands with a Cassini-style gap; the planet's shadow is a ray-sphere
// test toward the sun.
export const RING_FRAG = /* glsl */ `
uniform vec3 uSunPos;
uniform vec3 uPlanetPos;
uniform float uPlanetR;
uniform float uInner;
uniform float uOuter;
uniform vec3 uColorA;
uniform vec3 uColorB;
varying vec3 vW;
varying float vR;
${NOISE}
void main() {
  float u = (vR - uInner) / (uOuter - uInner);
  float bands = 0.5 + 0.5 * snoise(vec3(u * 38.0, 0.0, 0.0));
  bands = mix(bands, 0.5 + 0.5 * snoise(vec3(u * 140.0, 3.0, 0.0)), 0.35);
  float alpha = smoothstep(0.0, 0.06, u) * smoothstep(1.0, 0.9, u);
  alpha *= 1.0 - 0.9 * smoothstep(0.03, 0.0, abs(u - 0.62));
  alpha *= 0.25 + 0.6 * bands;
  vec3 col = mix(uColorA, uColorB, bands) * 0.95;
  vec3 d = normalize(uSunPos - vW);
  vec3 oc = vW - uPlanetPos;
  float b = dot(oc, d);
  float h = b * b - (dot(oc, oc) - uPlanetR * uPlanetR);
  float lit = (h > 0.0 && b < 0.0) ? 0.06 : 1.0;
  gl_FragColor = vec4(col * lit, alpha);
}
`;

// Orbit lines carry each vertex's angle, so a comet-like trail can glow just
// behind the body and in-play orbits can be dashed in the same shader.
export const ORBIT_VERT = /* glsl */ `
attribute float aAngle;
varying float vAngle;
void main() {
  vAngle = aAngle;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const ORBIT_FRAG = /* glsl */ `
uniform float uBodyAngle;
uniform float uDashed;
uniform float uBase;
uniform float uFocus;
uniform vec3 uColor;
uniform vec3 uTrail;
varying float vAngle;
const float TAU = 6.28318530718;
void main() {
  if (uDashed > 0.5 && fract(vAngle / TAU * 120.0) > 0.5) discard;
  float behind = mod(uBodyAngle - vAngle + TAU, TAU);
  float trail = exp(-behind * 2.4);
  vec3 col = uColor * (uBase + uFocus * 0.18) + uTrail * trail * 0.9;
  gl_FragColor = vec4(col, 1.0);
}
`;

// Screen-sized points, for the stars at infinity.
export const STAR_VERT = /* glsl */ `
attribute float aSize;
attribute vec3 aColor;
attribute float aPhase;
uniform float uTime;
uniform float uPR;
varying vec3 vColor;
void main() {
  vColor = aColor * (0.72 + 0.28 * sin(uTime * (0.5 + aPhase * 1.8) + aPhase * 40.0));
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = aSize * uPR;
}
`;

export const POINT_FRAG = /* glsl */ `
varying vec3 vColor;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  gl_FragColor = vec4(vColor * a * a, 1.0);
}
`;

// World-sized points, for comet particles and the forming worlds' debris.
export const PARTICLE_VERT = /* glsl */ `
attribute float aSize;
attribute vec3 aColor;
uniform float uPR;
uniform float uScale;
varying vec3 vColor;
void main() {
  vColor = aColor;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = aSize * uPR * uScale / -mv.z;
}
`;

// Faint galactic band and dust behind everything, on a sphere that follows
// the camera. Kept very dim: the page background must still read as --bg.
export const SKY_FRAG = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uBand;
varying vec3 vObj;
varying vec3 vN;
varying vec3 vW;
${NOISE}
void main() {
  vec3 dir = normalize(vObj);
  float lat = dot(dir, normalize(uBand));
  float band = exp(-lat * lat * 14.0);
  float n = 0.5 + 0.5 * fbm(dir * 2.4);
  float dust = smoothstep(0.1, 0.5, fbm(dir * 5.0 + 4.0)) * exp(-lat * lat * 60.0);
  vec3 col = mix(uColorA, uColorB, smoothstep(0.3, 0.8, 0.5 + 0.5 * fbm(dir * 1.3 + 8.0)));
  float i = band * n * (1.0 - 0.45 * dust) * 0.045 + 0.006 * n;
  gl_FragColor = vec4(col * i, 1.0);
}
`;

// Final grade after tone mapping: vignette, a touch of lens fringe at the
// edges, and film grain so the gradients don't band.
export const GRADE_FRAG = /* glsl */ `
uniform sampler2D tDiffuse;
uniform float uTime;
varying vec2 vUv;
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main() {
  vec2 c = vUv - 0.5;
  float r2 = dot(c, c);
  vec2 off = c * r2 * 0.012;
  vec3 col;
  col.r = texture2D(tDiffuse, vUv + off).r;
  col.g = texture2D(tDiffuse, vUv).g;
  col.b = texture2D(tDiffuse, vUv - off).b;
  col *= 1.0 - smoothstep(0.12, 0.62, r2) * 0.55;
  col += (hash(vUv * 1000.0 + fract(uTime) * 91.0) - 0.5) * 0.028;
  gl_FragColor = vec4(col, 1.0);
}
`;

export const GRADE_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Construction scaffold around an in-play world: a geodesic lattice that is
// only built up to uFront (a height from -1 to 1). Struts just placed glow
// like fresh welds; some are still missing; above the front, a faint dashed
// blueprint of what's planned.
export const SCAFFOLD_VERT = /* glsl */ `
attribute float aRand;
attribute float aH;
attribute float aT;
varying float vRand;
varying float vH;
varying float vT;
void main() {
  vRand = aRand;
  vH = aH;
  vT = aT;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const SCAFFOLD_FRAG = /* glsl */ `
uniform float uFront;
uniform float uTime;
uniform vec3 uColor;
uniform vec3 uWeld;
varying float vRand;
varying float vH;
varying float vT;
void main() {
  if (vRand < 0.14) discard;
  float built = step(vH, uFront);
  float fresh = built * smoothstep(0.16, 0.0, uFront - vH);
  float blueprint = (1.0 - built) * step(0.45, vRand) * step(0.5, fract(vT * 6.0)) * 0.22;
  float shimmer = 0.75 + 0.25 * sin(uTime * 2.0 + vRand * 40.0);
  vec3 col = uColor * (built * 0.55 * shimmer + blueprint) + uWeld * fresh * 2.4;
  if (dot(col, vec3(1.0)) < 0.002) discard;
  gl_FragColor = vec4(col, 1.0);
}
`;
