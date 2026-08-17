const ACCENT = '#e8a87c';
const INK = '#ece6d6';
const DIM = 'rgba(236,230,214,0.62)';
const HAIR = 'rgba(236,230,214,0.18)';

const MONO = 'var(--font-mono)';
const BODY = 'var(--font-body)';

/**
 * The resolve. Same grammar as the dead-gap diagram — bracket, two dots,
 * two timestamps — with the gap between them collapsed to nothing.
 */
export default function PanelOpenSVG() {
  return (
    <svg viewBox="0 0 380 100" style={{ width: '100%', height: 'auto', display: 'block' }}>
      {/* the bracket that measured 39 minutes, now almost invisible */}
      <path d="M 22,34 H 16 V 54 H 22" fill="none" stroke={HAIR} strokeWidth={1} />

      <circle cx={40} cy={34} r={4} fill={ACCENT} />
      <text x={58} y={31} fill={ACCENT} fontSize={11} fontFamily={MONO} letterSpacing="1">14:02</text>
      <text x={114} y={31} fill={DIM} fontSize={10.5} fontFamily={BODY}>the agent stops.</text>

      <circle cx={40} cy={54} r={4} fill="none" stroke={INK} strokeWidth={1.4} />
      <text x={58} y={58} fill={INK} fontSize={11} fontFamily={MONO} letterSpacing="1">14:02</text>
      <text x={114} y={58} fill={DIM} fontSize={10.5} fontFamily={BODY}>you already know.</text>

      <text x={16} y={84} fill={ACCENT} fontSize={8.5} fontFamily={MONO} letterSpacing="2" opacity="0.75">
        0 MINUTES
      </text>
    </svg>
  );
}
