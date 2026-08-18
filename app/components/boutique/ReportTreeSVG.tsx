const ACCENT = '#e8a87c';
const INK = '#ece6d6';
const DIM = 'rgba(236,230,214,0.62)';
const FAINT = 'rgba(236,230,214,0.34)';
const HAIR = 'rgba(236,230,214,0.18)';

const DONE = '#7bbf9e';
const WAITING = '#e0705e';
const WORKING = '#9bb5c9';

const MONO = 'var(--font-mono)';

const LEAVES = [
  { x: 4, label: 'done', colour: DONE },
  { x: 134, label: 'waiting', colour: WAITING },
  { x: 264, label: 'working', colour: WORKING },
] as const;

/** Two steps and a branch: the report arrives, the panel listens, you see three states. */
export default function ReportTreeSVG() {
  return (
    <svg viewBox="0 0 380 232" style={{ width: '100%', height: 'auto', display: 'block' }}>
      {/* trunk */}
      <rect x={70} y={6} width={240} height={38} rx={9} fill="rgba(0,0,0,0.25)" stroke={HAIR} strokeWidth={1} />
      <text x={190} y={30} textAnchor="middle" fill={DIM} fontSize={11} fontFamily={MONO} letterSpacing="1">
        Your agent reports in
      </text>

      <line x1={190} y1={44} x2={190} y2={66} stroke={ACCENT} strokeWidth={1} strokeOpacity={0.6} />

      <rect x={70} y={66} width={240} height={38} rx={9} fill="rgba(0,0,0,0.25)" stroke={HAIR} strokeWidth={1} />
      <text x={190} y={90} textAnchor="middle" fill={DIM} fontSize={11} fontFamily={MONO} letterSpacing="1">
        Ground Control listens
      </text>

      {/* branch */}
      <line x1={190} y1={104} x2={190} y2={126} stroke={ACCENT} strokeWidth={1} strokeOpacity={0.6} />
      <text x={190} y={122} textAnchor="middle" fill={FAINT} fontSize={8.5} fontFamily={MONO} letterSpacing="2">
        <tspan x={190} dy={0}>YOU SEE WHAT IS</tspan>
      </text>
      <line x1={60} y1={136} x2={320} y2={136} stroke={ACCENT} strokeWidth={1} strokeOpacity={0.45} />
      {LEAVES.map((l) => (
        <line key={l.label} x1={l.x + 56} y1={136} x2={l.x + 56} y2={156} stroke={ACCENT} strokeWidth={1} strokeOpacity={0.45} />
      ))}

      {/* leaves */}
      {LEAVES.map((l) => (
        <g key={l.label}>
          <rect x={l.x} y={156} width={112} height={52} rx={9} fill="rgba(0,0,0,0.25)" stroke={l.colour} strokeOpacity={0.4} strokeWidth={1} />
          <circle cx={l.x + 56} cy={176} r={4} fill={l.colour} />
          <text x={l.x + 56} y={198} textAnchor="middle" fill={INK} fontSize={11.5} fontFamily={MONO} letterSpacing="1">
            {l.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
