'use client';
import { useEffect, useState } from 'react';

const AMBER  = '#e8a87c';
const BLUE   = '#9bb5c9';
const PURPLE = '#c89bd1';
const MONO   = 'var(--font-mono)';
const FAINT  = 'rgba(236,230,214,0.34)';
const T      = 'opacity 0.8s ease';

export default function PictureKeyConceptSVG() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) return;
    const durations = [3200, 3500, 3200];
    let p = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => { p = (p + 1) % 3; setPhase(p); timer = setTimeout(tick, durations[p]); };
    timer = setTimeout(tick, durations[0]);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--line)', background: 'rgba(0,0,0,0.22)' }}>
      <svg width="100%" viewBox="0 0 440 230" style={{ display: 'block' }}>

        {/* ── PHASE 0: The Problem ── */}
        <g opacity={phase === 0 ? 1 : 0} style={{ transition: T }}>
          <text x="220" y="22" textAnchor="middle" fontFamily={MONO} fontSize="8.5" letterSpacing="2" fill={FAINT}>THE PROBLEM</text>
          {/* Password field */}
          <rect x="120" y="48" width="200" height="44" rx="8"
            fill="rgba(236,230,214,0.03)" stroke="rgba(236,230,214,0.12)" strokeWidth="1" />
          {[0,1,2,3,4,5,6,7].map(i => (
            <circle key={i} cx={148 + i * 24} cy={70} r="5" fill="rgba(236,230,214,0.18)" />
          ))}
          {/* Scattered arbitrary characters */}
          {[
            { x: 105, y: 120, t: '4' }, { x: 150, y: 135, t: '7' }, { x: 192, y: 118, t: 'X' },
            { x: 228, y: 134, t: '2' }, { x: 264, y: 119, t: 'q' }, { x: 302, y: 133, t: '9' }, { x: 338, y: 118, t: 'K' },
          ].map(({ x, y, t }, i) => (
            <text key={i} x={x} y={y} textAnchor="middle" fontFamily={MONO} fontSize="20"
              fill="rgba(236,230,214,0.16)">{t}</text>
          ))}
          <text x="220" y="175" textAnchor="middle" fontFamily={MONO} fontSize="8" letterSpacing="1.5" fill={FAINT}>
            no context · arbitrary · hint is last resort
          </text>
        </g>

        {/* ── PHASE 1: The Idea ── */}
        <g opacity={phase === 1 ? 1 : 0} style={{ transition: T }}>
          <text x="220" y="22" textAnchor="middle" fontFamily={MONO} fontSize="8.5" letterSpacing="2" fill={AMBER} fillOpacity="0.65">THE IDEA</text>
          {/* Photo frame */}
          <rect x="145" y="34" width="150" height="130" rx="10"
            fill="rgba(232,168,124,0.05)" stroke={AMBER} strokeOpacity="0.28" strokeWidth="1.5" />
          {/* Image content */}
          <rect x="155" y="44" width="130" height="76" rx="6"
            fill="rgba(155,181,201,0.07)" stroke="rgba(155,181,201,0.18)" strokeWidth="0.5" />
          <rect x="155" y="44" width="130" height="36" rx="6" fill="rgba(155,181,201,0.09)" />
          <line x1="155" y1="80" x2="285" y2="80" stroke="rgba(155,181,201,0.15)" strokeWidth="0.5" />
          {/* Gesture path */}
          <path d="M 172 108 C 188 86, 218 82, 238 96 S 268 126, 262 140"
            fill="none" stroke={AMBER} strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.85" />
          <circle cx="172" cy="108" r="3.5" fill={AMBER} fillOpacity="0.9" />
          <circle cx="205" cy="88" r="2.5" fill={AMBER} fillOpacity="0.65" />
          <circle cx="238" cy="96" r="2.5" fill={AMBER} fillOpacity="0.65" />
          <circle cx="258" cy="122" r="2.5" fill={AMBER} fillOpacity="0.65" />
          <circle cx="262" cy="140" r="3.5" fill={AMBER} fillOpacity="0.9" />
          {/* Finger */}
          <path d="M 257 153 L 264 141 L 271 153 Z" fill={AMBER} fillOpacity="0.45" />
          <text x="220" y="195" textAnchor="middle" fontFamily={MONO} fontSize="8" letterSpacing="1.5" fill={FAINT}>
            image you know · signature you draw
          </text>
        </g>

        {/* ── PHASE 2: Three Memory Anchors ── */}
        <g opacity={phase === 2 ? 1 : 0} style={{ transition: T }}>
          <text x="220" y="22" textAnchor="middle" fontFamily={MONO} fontSize="8.5" letterSpacing="2" fill="rgba(236,230,214,0.5)">THREE MEMORY ANCHORS</text>

          {/* Box 1: Image */}
          <rect x="30" y="38" width="106" height="96" rx="8"
            fill="rgba(155,181,201,0.05)" stroke={BLUE} strokeOpacity="0.3" strokeWidth="1" />
          <rect x="42" y="50" width="82" height="54" rx="5"
            fill="rgba(155,181,201,0.07)" stroke="rgba(155,181,201,0.18)" strokeWidth="0.5" />
          <rect x="42" y="50" width="82" height="26" rx="5" fill="rgba(155,181,201,0.09)" />
          <text x="83" y="126" textAnchor="middle" fontFamily={MONO} fontSize="7" letterSpacing="1.5" fill={BLUE} fillOpacity="0.65">YOU PICKED IT</text>

          {/* Plus */}
          <text x="163" y="93" textAnchor="middle" fontFamily={MONO} fontSize="20" fill="rgba(236,230,214,0.18)">+</text>

          {/* Box 2: Gesture */}
          <rect x="183" y="38" width="106" height="96" rx="8"
            fill="rgba(232,168,124,0.05)" stroke={AMBER} strokeOpacity="0.3" strokeWidth="1" />
          <path d="M 202 92 C 210 70, 232 67, 244 80 S 264 108, 268 118"
            fill="none" stroke={AMBER} strokeWidth="2" strokeLinecap="round" strokeOpacity="0.75" />
          <circle cx="202" cy="92" r="3" fill={AMBER} fillOpacity="0.75" />
          <circle cx="268" cy="118" r="3" fill={AMBER} fillOpacity="0.75" />
          <text x="236" y="126" textAnchor="middle" fontFamily={MONO} fontSize="7" letterSpacing="1.5" fill={AMBER} fillOpacity="0.65">YOU PRACTISED IT</text>

          {/* Equals */}
          <text x="316" y="93" textAnchor="middle" fontFamily={MONO} fontSize="20" fill="rgba(236,230,214,0.18)">=</text>

          {/* Box 3: Lock open */}
          <rect x="336" y="38" width="106" height="96" rx="8"
            fill="rgba(200,155,209,0.05)" stroke={PURPLE} strokeOpacity="0.3" strokeWidth="1" />
          <rect x="371" y="76" width="40" height="30" rx="5"
            fill="rgba(200,155,209,0.12)" stroke={PURPLE} strokeOpacity="0.55" strokeWidth="1.5" />
          <path d="M 377 76 L 377 64 A 12 12 0 0 1 405 64"
            fill="none" stroke={PURPLE} strokeOpacity="0.55" strokeWidth="1.5" strokeLinecap="round" />
          <text x="389" y="126" textAnchor="middle" fontFamily={MONO} fontSize="7" letterSpacing="1.5" fill={PURPLE} fillOpacity="0.65">YOU REMEMBER IT</text>

          <text x="220" y="175" textAnchor="middle" fontFamily={MONO} fontSize="8" letterSpacing="1.5" fill={FAINT}>
            cognitive psychology + muscle memory = new lock
          </text>
        </g>

        {/* Phase dots */}
        {[0, 1, 2].map(i => (
          <circle key={i} cx={211 + i * 14} cy={218} r={2.5}
            fill={phase === i ? 'rgba(236,230,214,0.55)' : 'rgba(236,230,214,0.15)'}
            style={{ transition: 'fill 0.5s' }} />
        ))}
      </svg>
    </div>
  );
}
