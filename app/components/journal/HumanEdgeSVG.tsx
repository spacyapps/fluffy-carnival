'use client';
import { useEffect, useState } from 'react';

const BLUE  = '#9bb5c9';   // AI — known patterns
const AMBER = '#e8a87c';   // Human — experience / vision
const NEW   = '#c89bd1';   // Result — original, unreplicable
const MONO  = 'var(--font-mono)';
const T     = 'opacity 0.8s ease';

function CodeBar({ x, y, w, color, h = 22 }: { x: number; y: number; w: number; color: string; h?: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={3}
        fill={color} fillOpacity="0.18" stroke={color} strokeOpacity="0.5" strokeWidth="1" />
      <rect x={x + 8} y={y + 6} width={w * 0.55} height={3} rx={1} fill={color} fillOpacity="0.4" />
      <rect x={x + 8} y={y + 13} width={w * 0.32} height={3} rx={1} fill={color} fillOpacity="0.22" />
    </g>
  );
}

function Arrow({ x1, y1, x2, y2, color }: { x1: number; y1: number; x2: number; y2: number; color: string }) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / len, uy = dy / len;
  const tip = { x: x2, y: y2 };
  const base1 = { x: x2 - ux * 10 - uy * 5, y: y2 - uy * 10 + ux * 5 };
  const base2 = { x: x2 - ux * 10 + uy * 5, y: y2 - uy * 10 - ux * 5 };
  return (
    <g stroke={color} strokeOpacity="0.5" fill="none">
      <line x1={x1} y1={y1} x2={x2 - ux * 8} y2={y2 - uy * 8} strokeWidth="1.5" strokeDasharray="5 3" />
      <polygon points={`${tip.x},${tip.y} ${base1.x},${base1.y} ${base2.x},${base2.y}`}
        fill={color} fillOpacity="0.5" stroke="none" />
    </g>
  );
}

export default function HumanEdgeSVG() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) return;
    const durations = [3000, 2500, 3200];
    let p = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      p = (p + 1) % 3;
      setPhase(p);
      timer = setTimeout(tick, durations[p]);
    };
    timer = setTimeout(tick, durations[0]);
    return () => clearTimeout(timer);
  }, []);

  // AI column (left): 4 bars — known patterns
  const aiX = 28, aiW = 130;
  const aiBars = [40, 68, 96, 124];

  // Human column (right): 3 bars — experience / unique vision
  const hX = 312, hW = 130;
  const hBars = [54, 82, 110];

  // Result column (center): 4 bars in NEW color
  const rX = 162, rW = 156;
  const rBars = [44, 74, 104, 134];

  const centerY = 90;  // arrow target y

  return (
    <div style={{ margin: '28px 0 36px', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--line)', background: 'rgba(0,0,0,0.22)' }}>
      <svg width="100%" viewBox="0 0 480 210" style={{ display: 'block' }}>

        {/* ── PHASE 0 + 1 shared: AI column ── */}
        <g opacity={phase < 2 ? 1 : 0} style={{ transition: T }}>
          <text x={aiX + aiW / 2} y={22} textAnchor="middle" fontFamily={MONO} fontSize="8" letterSpacing="2" fill={BLUE} fillOpacity="0.65">AI PATTERNS</text>
          {aiBars.map((y, i) => <CodeBar key={i} x={aiX} y={y} w={aiW} color={BLUE} />)}
        </g>

        {/* ── PHASE 0 + 1 shared: Human column ── */}
        <g opacity={phase < 2 ? 1 : 0} style={{ transition: T }}>
          <text x={hX + hW / 2} y={22} textAnchor="middle" fontFamily={MONO} fontSize="8" letterSpacing="2" fill={AMBER} fillOpacity="0.65">YOUR VISION</text>
          {hBars.map((y, i) => <CodeBar key={i} x={hX} y={y} w={hW} color={AMBER} />)}
        </g>

        {/* ── PHASE 0 label ── */}
        <g opacity={phase === 0 ? 1 : 0} style={{ transition: T }}>
          <text x={240} y={195} textAnchor="middle" fontFamily={MONO} fontSize="8" letterSpacing="2" fill="rgba(236,230,214,0.28)">two inputs</text>
        </g>

        {/* ── PHASE 1: synthesis arrows ── */}
        <g opacity={phase === 1 ? 1 : 0} style={{ transition: T }}>
          <text x={240} y={18} textAnchor="middle" fontFamily={MONO} fontSize="8.5" letterSpacing="3" fill="rgba(236,230,214,0.5)">UNIQUE SYNTHESIS</text>
          <Arrow x1={aiX + aiW + 12} y1={centerY} x2={218} y2={centerY} color={BLUE} />
          <Arrow x1={hX - 12}        y1={centerY} x2={262} y2={centerY} color={AMBER} />
          <circle cx={240} cy={centerY} r={14}
            fill="none" stroke={NEW} strokeOpacity="0.35" strokeWidth="1" strokeDasharray="3 4" />
          <text x={240} y={centerY + 5} textAnchor="middle" fontFamily={MONO} fontSize="11" fill={NEW} fillOpacity="0.6">✦</text>
        </g>

        {/* ── PHASE 2: new result ── */}
        <g opacity={phase === 2 ? 1 : 0} style={{ transition: T }}>
          <text x={rX + rW / 2} y={22} textAnchor="middle" fontFamily={MONO} fontSize="8.5" letterSpacing="3" fill={NEW} fillOpacity="0.7">ORIGINAL ✦</text>
          {rBars.map((y, i) => <CodeBar key={i} x={rX} y={y} w={rW} color={NEW} />)}
          {/* legend */}
          <g transform="translate(342 74)">
            <rect width={9} height={9} rx={2} fill={BLUE} fillOpacity="0.35" stroke={BLUE} strokeOpacity="0.55" strokeWidth="1" />
            <text x={14} y={8} fontFamily={MONO} fontSize="7" fill="rgba(236,230,214,0.35)">AI patterns</text>
          </g>
          <g transform="translate(342 90)">
            <rect width={9} height={9} rx={2} fill={AMBER} fillOpacity="0.35" stroke={AMBER} strokeOpacity="0.55" strokeWidth="1" />
            <text x={14} y={8} fontFamily={MONO} fontSize="7" fill="rgba(236,230,214,0.35)">your vision</text>
          </g>
          <g transform="translate(342 106)">
            <rect width={9} height={9} rx={2} fill={NEW} fillOpacity="0.35" stroke={NEW} strokeOpacity="0.55" strokeWidth="1" />
            <text x={14} y={8} fontFamily={MONO} fontSize="7" fill="rgba(236,230,214,0.35)">new result</text>
          </g>
        </g>

        {/* Phase dots */}
        {[0, 1, 2].map(i => (
          <circle key={i} cx={232 + i * 14} cy={200} r={2.5}
            fill={phase === i ? 'rgba(236,230,214,0.55)' : 'rgba(236,230,214,0.15)'}
            style={{ transition: 'fill 0.5s' }} />
        ))}
      </svg>
    </div>
  );
}
