'use client';
import { useEffect, useState } from 'react';

const AMBER = '#e8a87c';
const BLUE  = '#9bb5c9';
const MONO  = 'var(--font-mono)';

const T = 'opacity 0.8s ease';

function CodeBar({ x, y, w, h = 22, color }: { x: number; y: number; w: number; h?: number; color: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={3}
        fill={color} fillOpacity="0.18" stroke={color} strokeOpacity="0.5" strokeWidth="1" />
      <rect x={x + 8} y={y + 6} width={w * 0.55} height={3} rx={1} fill={color} fillOpacity="0.4" />
      <rect x={x + 8} y={y + 13} width={w * 0.32} height={3} rx={1} fill={color} fillOpacity="0.22" />
    </g>
  );
}

export default function RefineLoopSVG() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) return;

    const durations = [3000, 2800, 3200];
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

  // Human column: 3 bars
  const hX = 30, hW = 130;
  const hBars = [44, 76, 108];

  // AI column: 6 bars — top 3 kept, bottom 3 excess
  const aX = 300, aW = 148;
  const aBarsKept   = [32, 58, 84];
  const aBarsExcess = [110, 136, 162];

  // Merged result: 5 alternating bars, centered
  const mX = 162, mW = 156;
  const merged = [
    { y: 38,  c: AMBER },
    { y: 68,  c: BLUE  },
    { y: 98,  c: AMBER },
    { y: 128, c: BLUE  },
    { y: 158, c: AMBER },
  ];

  return (
    <div style={{ margin: '28px 0 36px', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--line)', background: 'rgba(0,0,0,0.22)' }}>
      <svg width="100%" viewBox="0 0 480 210" style={{ display: 'block' }}>

        {/* ── PHASE 0 + 1 shared: human column ── */}
        <g opacity={phase < 2 ? 1 : 0} style={{ transition: T }}>
          <text x={hX + hW / 2} y={22} textAnchor="middle" fontFamily={MONO} fontSize="8.5" letterSpacing="2" fill={AMBER} fillOpacity="0.65">YOUR CODE</text>
          {hBars.map((y, i) => <CodeBar key={i} x={hX} y={y} w={hW} color={AMBER} />)}
        </g>

        {/* ── PHASE 0: AI output (all 6 bars) ── */}
        <g opacity={phase === 0 ? 1 : 0} style={{ transition: T }}>
          <text x={aX + aW / 2} y={14} textAnchor="middle" fontFamily={MONO} fontSize="8.5" letterSpacing="2" fill={BLUE} fillOpacity="0.65">AI OUTPUT</text>
          {[...aBarsKept, ...aBarsExcess].map((y, i) => <CodeBar key={i} x={aX} y={y} w={aW} color={BLUE} />)}
        </g>

        {/* ── PHASE 1: code review — kept bars + excess struck out ── */}
        <g opacity={phase === 1 ? 1 : 0} style={{ transition: T }}>
          <text x={240} y={14} textAnchor="middle" fontFamily={MONO} fontSize="8.5" letterSpacing="3" fill="rgba(236,230,214,0.5)">CODE REVIEW</text>
          {/* kept AI bars */}
          {aBarsKept.map((y, i) => <CodeBar key={i} x={aX} y={y} w={aW} color={BLUE} />)}
          {/* excess AI bars — faded + dashed + ✕ */}
          {aBarsExcess.map((y, i) => (
            <g key={i} opacity="0.22">
              <rect x={aX} y={y} width={aW} height={22} rx={3}
                fill="none" stroke={BLUE} strokeOpacity="0.5" strokeWidth="1" strokeDasharray="4 3" />
              <line x1={aX + 6} y1={y + 11} x2={aX + aW - 6} y2={y + 11}
                stroke={BLUE} strokeOpacity="0.6" strokeWidth="1.5" />
            </g>
          ))}
          {/* "excess" label */}
          <text x={aX + aW + 10} y={aBarsExcess[1] + 11}
            textAnchor="start" fontFamily={MONO} fontSize="7.5" fill="rgba(236,230,214,0.3)" letterSpacing="1">
            removed
          </text>
          <line x1={aX + aW + 8} y1={aBarsExcess[0] + 4} x2={aX + aW + 8} y2={aBarsExcess[2] + 18}
            stroke="rgba(236,230,214,0.15)" strokeWidth="1" />
        </g>

        {/* ── PHASE 2: refined merged result ── */}
        <g opacity={phase === 2 ? 1 : 0} style={{ transition: T }}>
          <text x={mX + mW / 2} y={22} textAnchor="middle" fontFamily={MONO} fontSize="8.5" letterSpacing="3" fill="rgba(236,230,214,0.6)">REFINED ✦</text>
          {merged.map(({ y, c }, i) => <CodeBar key={i} x={mX} y={y} w={mW} color={c} />)}
          {/* legend */}
          <g transform="translate(348 80)">
            <rect width={9} height={9} rx={2} fill={AMBER} fillOpacity="0.35" stroke={AMBER} strokeOpacity="0.55" strokeWidth="1" />
            <text x={14} y={8} fontFamily={MONO} fontSize="7.5" fill="rgba(236,230,214,0.4)">human</text>
          </g>
          <g transform="translate(348 97)">
            <rect width={9} height={9} rx={2} fill={BLUE} fillOpacity="0.35" stroke={BLUE} strokeOpacity="0.55" strokeWidth="1" />
            <text x={14} y={8} fontFamily={MONO} fontSize="7.5" fill="rgba(236,230,214,0.4)">AI</text>
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
