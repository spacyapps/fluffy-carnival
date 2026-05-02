'use client';

import { useEffect, useState } from 'react';

const RING_PHRASES = [
  'Secret Stuff',
  'Checkpoint',
  'Sole Space Adventurer',
  'Made in Space?',
  'AI as my ally',
  'Old school vibes',
];

const ringText = RING_PHRASES.join('   ✦   ') + '   ✦   ';
const ringFull = (ringText + ringText + ringText).toUpperCase();

const cx = 200, cy = 200, rx = 180, ry = 60;
const tilt = -14;

const RING_PARTICLES = Array.from({ length: 60 }, (_, i) => {
  const angle = (i / 60) * Math.PI * 2;
  const v = 1 + Math.sin(i * 7.3 + 1.1) * 0.1;
  return {
    x: cx + 170 * v * Math.cos(angle),
    y: cy + 57 * v * Math.sin(angle),
    r: 0.5 + Math.abs(Math.cos(i * 2.7 + 0.5)) * 1.4,
    opacity: 0.07 + Math.abs(Math.sin(i * 3.1 + 0.8)) * 0.16,
  };
});

export default function BigPlanet({ size = 380 }: { size?: number }) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <div style={{ animation: reducedMotion ? 'none' : 'bo-float 7s ease-in-out infinite' }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 400 400"
        style={{ display: 'block', overflow: 'visible' }}
      >
        <defs>
          <radialGradient id="bp-body" cx="0.35" cy="0.28">
            <stop offset="0" stopColor="#f0d5a0" />
            <stop offset="0.18" stopColor="#d4956a" />
            <stop offset="0.42" stopColor="#9e5e2e" />
            <stop offset="0.66" stopColor="#5c2b0e" />
            <stop offset="0.84" stopColor="#2a1208" />
            <stop offset="1" stopColor="#0e0603" />
          </radialGradient>
          <radialGradient id="bp-glow" cx="0.5" cy="0.5">
            <stop offset="0" stopColor="#c97a4a" stopOpacity="0.38" />
            <stop offset="1" stopColor="#c97a4a" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="bp-moon1" cx="0.35" cy="0.3">
            <stop offset="0" stopColor="#e8d5b0" />
            <stop offset="0.6" stopColor="#a8936a" />
            <stop offset="1" stopColor="#5a4830" />
          </radialGradient>
          <radialGradient id="bp-moon2" cx="0.35" cy="0.3">
            <stop offset="0" stopColor="#d4c0a0" />
            <stop offset="0.6" stopColor="#8a7058" />
            <stop offset="1" stopColor="#3a2c1a" />
          </radialGradient>
          <clipPath id="bp-planet-clip">
            <circle cx={cx} cy={cy} r="120" />
          </clipPath>
          <path
            id="bp-ring"
            d={`M ${cx - rx},${cy} A ${rx},${ry} 0 0,0 ${cx + rx},${cy} A ${rx},${ry} 0 0,0 ${cx - rx},${cy} Z`}
          />
          <clipPath id="bp-front-clip">
            <rect x={cx - rx - 20} y={cy} width={(rx + 20) * 2} height={ry + 20} />
          </clipPath>
          <clipPath id="bp-moon-front">
            <rect x={cx - 340} y={cy} width={680} height={340} />
          </clipPath>
        </defs>

        {/* Outer glow */}
        <circle cx={cx} cy={cy} r="195" fill="url(#bp-glow)" />

        {/* ── BACK LAYER ── rings + moons before planet */}
        <g style={{ transform: `rotate(${tilt}deg)`, transformOrigin: `${cx}px ${cy}px` }}>
          <ellipse cx={cx} cy={cy} rx={146} ry={48} fill="none" stroke="rgba(210,160,80,0.05)" strokeWidth="3" />
          <ellipse cx={cx} cy={cy} rx={155} ry={51} fill="none" stroke="rgba(220,175,100,0.10)" strokeWidth="7" />
          <ellipse cx={cx} cy={cy} rx={163} ry={54} fill="none" stroke="rgba(230,190,110,0.13)" strokeWidth="5" />
          <ellipse cx={cx} cy={cy} rx={171} ry={57} fill="none" stroke="rgba(215,165,90,0.09)" strokeWidth="8" />
          <ellipse cx={cx} cy={cy} rx={180} ry={60} fill="none" stroke="rgba(200,150,75,0.06)" strokeWidth="4" />
          <ellipse cx={cx} cy={cy} rx={188} ry={63} fill="none" stroke="rgba(185,135,65,0.05)" strokeWidth="3" />
          <ellipse cx={cx} cy={cy} rx={196} ry={65} fill="none" stroke="rgba(170,120,55,0.03)" strokeWidth="4" />
          {RING_PARTICLES.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={p.r} fill="rgba(230,185,110,1)" opacity={p.opacity} />
          ))}
          <text fill="var(--ink)" fontFamily="var(--font-display)" fontSize="13" fontWeight="600" letterSpacing="5" style={{ opacity: 0.35 }}>
            <textPath href="#bp-ring" startOffset="0">
              {ringFull}
              {!reducedMotion && <animate attributeName="startOffset" from="0%" to="-100%" dur="40s" repeatCount="indefinite" />}
            </textPath>
          </text>
        </g>

        {/* Moon 1 back (retrograde) */}
        <g style={{ transform: `rotate(${tilt}deg)`, transformOrigin: `${cx}px ${cy}px` }}>
          <g>
            {!reducedMotion && <animateTransform attributeName="transform" type="rotate" from={`360 ${cx} ${cy}`} to={`0 ${cx} ${cy}`} dur="22s" repeatCount="indefinite" />}
            <circle cx={cx + 258} cy={cy} r="13" fill="url(#bp-moon1)" opacity="0.42" />
            <circle cx={cx + 258} cy={cy} r="13" fill="none" stroke="rgba(220,185,130,0.2)" strokeWidth="0.8" />
          </g>
        </g>

        {/* Moon 2 back */}
        <g style={{ transform: `rotate(${tilt}deg)`, transformOrigin: `${cx}px ${cy}px` }}>
          <g>
            {!reducedMotion && <animateTransform attributeName="transform" type="rotate" from={`0 ${cx} ${cy}`} to={`360 ${cx} ${cy}`} dur="38s" repeatCount="indefinite" />}
            <circle cx={cx + 308} cy={cy} r="8" fill="url(#bp-moon2)" opacity="0.42" />
          </g>
        </g>

        {/* ── PLANET ── */}
        <circle cx={cx} cy={cy} r="120" fill="url(#bp-body)" />

        {/* Cloud bands clipped to planet */}
        <g clipPath="url(#bp-planet-clip)">
          {/* Light cream zones */}
          <ellipse cx={cx} cy={cy - 52} rx="120" ry="9"  fill="rgba(240,215,160,0.20)" />
          <ellipse cx={cx} cy={cy - 16} rx="120" ry="10" fill="rgba(232,196,132,0.16)" />
          <ellipse cx={cx} cy={cy + 20} rx="120" ry="9"  fill="rgba(228,192,128,0.15)" />
          <ellipse cx={cx} cy={cy + 54} rx="120" ry="8"  fill="rgba(218,178,115,0.13)" />
          {/* Dark belts between zones */}
          <ellipse cx={cx} cy={cy - 34} rx="120" ry="5"  fill="rgba(80,34,8,0.30)" />
          <ellipse cx={cx} cy={cy + 2}  rx="120" ry="6"  fill="rgba(85,38,10,0.28)" />
          <ellipse cx={cx} cy={cy + 36} rx="120" ry="5"  fill="rgba(75,32,7,0.25)" />
        </g>

        {/* Limb highlight */}
        <circle cx={cx - 34} cy={cy - 34} r="26" fill="rgba(255,225,170,0.09)" />

        {/* ── FRONT RINGS ── */}
        <g style={{ transform: `rotate(${tilt}deg)`, transformOrigin: `${cx}px ${cy}px` }} clipPath="url(#bp-front-clip)">
          <ellipse cx={cx} cy={cy} rx={146} ry={48} fill="none" stroke="rgba(210,160,80,0.07)" strokeWidth="3" />
          <ellipse cx={cx} cy={cy} rx={155} ry={51} fill="none" stroke="rgba(220,175,100,0.16)" strokeWidth="7" />
          <ellipse cx={cx} cy={cy} rx={163} ry={54} fill="none" stroke="rgba(230,190,110,0.20)" strokeWidth="5" />
          <ellipse cx={cx} cy={cy} rx={171} ry={57} fill="none" stroke="rgba(215,165,90,0.15)" strokeWidth="8" />
          <ellipse cx={cx} cy={cy} rx={180} ry={60} fill="none" stroke="rgba(200,150,75,0.10)" strokeWidth="4" />
          <ellipse cx={cx} cy={cy} rx={188} ry={63} fill="none" stroke="rgba(185,135,65,0.07)" strokeWidth="3" />
          <ellipse cx={cx} cy={cy} rx={196} ry={65} fill="none" stroke="rgba(170,120,55,0.05)" strokeWidth="4" />
          {RING_PARTICLES.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={p.r} fill="rgba(235,195,120,1)" opacity={Math.min(p.opacity * 1.8, 0.35)} />
          ))}
          <text fill="var(--ink)" fontFamily="var(--font-display)" fontSize="13" fontWeight="600" letterSpacing="5" style={{ opacity: 0.95 }}>
            <textPath href="#bp-ring" startOffset="0">
              {ringFull}
              {!reducedMotion && <animate attributeName="startOffset" from="0%" to="-100%" dur="40s" repeatCount="indefinite" />}
            </textPath>
          </text>
        </g>

        {/* Moon 1 front */}
        <g style={{ transform: `rotate(${tilt}deg)`, transformOrigin: `${cx}px ${cy}px` }} clipPath="url(#bp-moon-front)">
          <g>
            {!reducedMotion && <animateTransform attributeName="transform" type="rotate" from={`360 ${cx} ${cy}`} to={`0 ${cx} ${cy}`} dur="22s" repeatCount="indefinite" />}
            <circle cx={cx + 258} cy={cy} r="13" fill="url(#bp-moon1)" />
            <circle cx={cx + 258} cy={cy} r="13" fill="none" stroke="rgba(220,185,130,0.3)" strokeWidth="0.8" />
          </g>
        </g>

        {/* Moon 2 front */}
        <g style={{ transform: `rotate(${tilt}deg)`, transformOrigin: `${cx}px ${cy}px` }} clipPath="url(#bp-moon-front)">
          <g>
            {!reducedMotion && <animateTransform attributeName="transform" type="rotate" from={`0 ${cx} ${cy}`} to={`360 ${cx} ${cy}`} dur="38s" repeatCount="indefinite" />}
            <circle cx={cx + 308} cy={cy} r="8" fill="url(#bp-moon2)" />
          </g>
        </g>
      </svg>
    </div>
  );
}
