'use client';

import { useEffect, useState } from 'react';

// [x, y] for each path — uneven spacing mimics real hand-drawn points
const SAVED   = [[30,60],[85,54],[135,62],[174,57],[254,63],[344,56],[414,61],[474,58]] as const;
const ATTEMPT = [[30,126],[72,131],[120,124],[190,130],[238,125],[288,132],[348,127],[418,130],[474,127]] as const;

// yo-yo sequence: [savedIdx, attemptIdx, who-advanced]
const SEQ: [number, number, 's'|'a'|null][] = [
  [0,0,null],[1,0,'s'],[1,1,'a'],[2,1,'s'],[2,2,'a'],[2,3,'a'],
  [3,3,'s'],[4,3,'s'],[4,4,'a'],[4,5,'a'],[5,5,'s'],[5,6,'a'],
  [6,6,'s'],[6,7,'a'],[7,7,'s'],[7,8,'a'],
];

const SC = '#3dd5e8'; // saved — cyan
const AC = '#3de87a'; // attempt — green

export default function YoYoAnimation() {
  const [step, setStep] = useState(0);
  const isLast = step === SEQ.length - 1;

  useEffect(() => {
    const t = setTimeout(
      () => setStep(s => (s + 1) % SEQ.length),
      isLast ? 2200 : 750,
    );
    return () => clearTimeout(t);
  }, [step]);

  const [si, ai, who] = SEQ[step];
  const [sx, sy] = SAVED[si];
  const [ax, ay] = ATTEMPT[ai];

  const dist    = Math.sqrt((sx - ax) ** 2 + (sy - ay) ** 2);
  const tension = Math.min(1, Math.max(0, (dist - 50) / 100));
  const bungeeColor = tension > 0.5 ? '#e85c3a' : '#e8a87c';

  const label = isLast          ? '✓  MATCH'
              : who === 's'     ? 'SAVED advances →'
              : who === 'a'     ? '← ATTEMPT advances'
              : 'START';

  return (
    <div style={{ lineHeight: 0, fontSize: 0 }}>
      <svg
        viewBox="0 0 510 178"
        style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
      >
        {/* Path connectors */}
        {SAVED.slice(0, -1).map(([x, y], i) => (
          <line key={i} x1={x} y1={y} x2={SAVED[i + 1][0]} y2={SAVED[i + 1][1]}
            stroke={SC} strokeWidth="1" opacity={i < si ? 0.45 : 0.1} />
        ))}
        {ATTEMPT.slice(0, -1).map(([x, y], i) => (
          <line key={i} x1={x} y1={y} x2={ATTEMPT[i + 1][0]} y2={ATTEMPT[i + 1][1]}
            stroke={AC} strokeWidth="1" opacity={i < ai ? 0.45 : 0.1} />
        ))}

        {/* Dots */}
        {SAVED.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y}
            r={i === si ? 6 : 3.5}
            fill={SC}
            opacity={i === si ? 1 : i < si ? 0.4 : 0.12}
          />
        ))}
        {ATTEMPT.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y}
            r={i === ai ? 6 : 3.5}
            fill={AC}
            opacity={i === ai ? 1 : i < ai ? 0.4 : 0.12}
          />
        ))}

        {/* Glow halos on active dots */}
        <circle cx={sx} cy={sy} r={15} fill={SC} opacity={0.1} />
        <circle cx={ax} cy={ay} r={15} fill={AC} opacity={0.1} />

        {/* Bungee cord */}
        <line
          x1={sx} y1={sy} x2={ax} y2={ay}
          stroke={bungeeColor}
          strokeWidth={1.5 + tension * 1.2}
          strokeDasharray="5 3"
          opacity={0.85}
        />

        {/* Bungee label at midpoint */}
        <text
          x={(sx + ax) / 2 + 7}
          y={(sy + ay) / 2 + 4}
          fill={bungeeColor} fontSize={9}
          fontFamily="monospace" letterSpacing="1" opacity="0.75"
        >
          bungee
        </text>

        {/* Track labels */}
        <text x="4" y={SAVED[0][1] - 12}
          fill={SC} fontSize={9} fontFamily="monospace" letterSpacing="2.5" opacity="0.75">
          SAVED KEY
        </text>
        <text x="4" y={ATTEMPT[0][1] + 20}
          fill={AC} fontSize={9} fontFamily="monospace" letterSpacing="2.5" opacity="0.75">
          LIVE TRACE
        </text>

        {/* Step label */}
        <text x="255" y="172" textAnchor="middle"
          fill={isLast ? AC : 'rgba(236,230,214,0.4)'}
          fontSize={9} fontFamily="monospace" letterSpacing="2.5">
          {label}
        </text>
      </svg>
    </div>
  );
}
