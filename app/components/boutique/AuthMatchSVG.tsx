const SC = '#3dd5e8';
const AC = '#3de87a';
const BOX = 28;

// Saved key: 7 dots, evenly spaced along a wavy signature-like path
const P = [[28,65],[108,52],[190,68],[270,52],[350,65],[430,52],[492,62]] as const;
// Attempt: 7 dots at different x-positions — same path, different drawing speed
const Q = [[28,103],[92,114],[168,101],[248,112],[322,103],[408,112],[492,106]] as const;

// Three pairs where tolerance boxes visibly overlap
const PAIRS = [[0,0],[2,2],[4,4]] as const;

function overlap(si: number, ai: number) {
  const [sx, sy] = P[si], [ax, ay] = Q[ai];
  const ox1 = Math.max(sx - BOX, ax - BOX);
  const oy1 = Math.max(sy - BOX, ay - BOX);
  const ox2 = Math.min(sx + BOX, ax + BOX);
  const oy2 = Math.min(sy + BOX, ay + BOX);
  return ox2 > ox1 && oy2 > oy1 ? { x: ox1, y: oy1, w: ox2 - ox1, h: oy2 - oy1 } : null;
}

export default function AuthMatchSVG() {
  return (
    <svg viewBox="0 0 520 180" style={{ width: '100%', height: 'auto', display: 'block' }}>
      {/* Track labels */}
      <text x={8} y={16} fill={SC} fontSize={8} fontFamily="monospace" letterSpacing="2.5" opacity="0.65">
        SAVED KEY
      </text>
      <text x={8} y={155} fill={AC} fontSize={8} fontFamily="monospace" letterSpacing="2.5" opacity="0.65">
        LOGIN ATTEMPT
      </text>

      {/* Tolerance zone annotation */}
      <text x={200} y={36} fill="rgba(236,230,214,0.22)" fontSize={7} fontFamily="monospace" letterSpacing="1.5" textAnchor="middle">
        tolerance zone
      </text>
      <line x1={200} y1={38} x2={200} y2={43} stroke="rgba(236,230,214,0.15)" strokeWidth={0.7} />

      {/* Saved path */}
      <path
        d="M 28,65 C 62,42 82,52 108,52 C 134,52 160,72 190,68 C 220,64 248,44 270,52 C 292,60 322,72 350,65 C 378,58 408,44 430,52 C 452,60 474,64 492,62"
        fill="none" stroke={SC} strokeWidth="1.5" opacity="0.4"
      />
      {/* Attempt path */}
      <path
        d="M 28,103 C 56,118 72,110 92,114 C 112,118 136,97 168,101 C 200,105 224,118 248,112 C 272,106 300,98 322,103 C 344,108 384,118 408,112 C 432,106 472,100 492,106"
        fill="none" stroke={AC} strokeWidth="1.5" opacity="0.4"
      />

      {/* Tolerance boxes at highlighted pairs */}
      {PAIRS.map(([si, ai], k) => {
        const [sx, sy] = P[si], [ax, ay] = Q[ai];
        const ov = overlap(si, ai);
        return (
          <g key={k}>
            <rect x={sx - BOX} y={sy - BOX} width={BOX * 2} height={BOX * 2}
              fill={SC} fillOpacity={0.06} stroke={SC} strokeWidth={0.7}
              strokeDasharray="3 2" strokeOpacity={0.45} />
            <rect x={ax - BOX} y={ay - BOX} width={BOX * 2} height={BOX * 2}
              fill={AC} fillOpacity={0.06} stroke={AC} strokeWidth={0.7}
              strokeDasharray="3 2" strokeOpacity={0.45} />
            {ov && (
              <rect x={ov.x} y={ov.y} width={ov.w} height={ov.h}
                fill="rgba(255,255,255,0.12)" stroke="none" rx={2} />
            )}
          </g>
        );
      })}

      {/* Saved dots */}
      {P.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={3.5} fill={SC} opacity={0.9} />
      ))}
      {/* Attempt dots */}
      {Q.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={3.5} fill={AC} opacity={0.9} />
      ))}

      {/* Bottom caption */}
      <text x="260" y="174" textAnchor="middle"
        fill="rgba(236,230,214,0.28)" fontSize={8} fontFamily="monospace" letterSpacing="2">
        DIFFERENT POINTS · SAME PATH · BOXES OVERLAP → MATCH
      </text>
    </svg>
  );
}
