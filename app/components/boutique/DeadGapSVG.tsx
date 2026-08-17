const ACCENT = '#e8a87c';
const INK = '#ece6d6';
const DIM = 'rgba(236,230,214,0.62)';
const FAINT = 'rgba(236,230,214,0.34)';
const HAIR = 'rgba(236,230,214,0.18)';

const MONO = 'var(--font-mono)';
const BODY = 'var(--font-body)';
const SERIF = 'var(--font-serif)';

// Nine glances. Eight found nothing; the last one found something.
const GLANCES = Array.from({ length: 9 }, (_, i) => 78 + i * 34);
const LAST = GLANCES[GLANCES.length - 1];

export default function DeadGapSVG() {
  return (
    <svg viewBox="0 0 400 426" style={{ width: '100%', height: 'auto', display: 'block' }}>
      {/* ─────────── 1. THE DEAD GAP ─────────── */}
      <text x={0} y={22} fill={ACCENT} fontSize={8.5} fontFamily={MONO} letterSpacing="2.5" opacity="0.85">
        IF YOU FORGET
      </text>

      {/* the stop */}
      <circle cx={78} cy={52} r={4} fill={ACCENT} />
      <text x={96} y={49} fill={ACCENT} fontSize={11} fontFamily={MONO} letterSpacing="1">14:02</text>
      <text x={96} y={66} fill={DIM} fontSize={10.5} fontFamily={BODY}>the agent stops.</text>
      <text x={96} y={81} fill={DIM} fontSize={10.5} fontFamily={BODY}>it needs one word from you.</text>

      {/* the gap itself — deliberately the tallest empty thing on the page */}
      <line x1={78} y1={60} x2={78} y2={248} stroke={HAIR} strokeWidth={1} strokeDasharray="2 7" />
      <path d="M 58,60 H 52 V 248 H 58" fill="none" stroke={HAIR} strokeWidth={1} />
      <text
        x={40}
        y={154}
        fill={FAINT}
        fontSize={8.5}
        fontFamily={MONO}
        letterSpacing="2"
        textAnchor="middle"
        transform="rotate(-90 40 154)"
      >
        39 MINUTES
      </text>
      <text x={96} y={158} fill={FAINT} fontSize={14} fontFamily={SERIF} fontStyle="italic">
        nothing happens.
      </text>

      {/* the noticing */}
      <circle cx={78} cy={254} r={4} fill="none" stroke={INK} strokeWidth={1.4} />
      <text x={96} y={251} fill={INK} fontSize={11} fontFamily={MONO} letterSpacing="1">14:41</text>
      <text x={96} y={268} fill={DIM} fontSize={10.5} fontFamily={BODY}>you go back and look.</text>

      {/* ─────────── 2. THE WASTED CHECKS ─────────── */}
      <text x={0} y={312} fill={ACCENT} fontSize={8.5} fontFamily={MONO} letterSpacing="2.5" opacity="0.85">
        IF YOU CHECK INSTEAD
      </text>

      <line x1={78} y1={356} x2={LAST} y2={356} stroke={HAIR} strokeWidth={1} />
      {GLANCES.map((x) => {
        const found = x === LAST;
        return (
          <g key={x}>
            <line
              x1={x}
              y1={found ? 336 : 343}
              x2={x}
              y2={356}
              stroke={found ? ACCENT : FAINT}
              strokeWidth={found ? 1.6 : 1}
              opacity={found ? 1 : 0.55}
            />
            {found && <circle cx={x} cy={332} r={3} fill={ACCENT} />}
          </g>
        );
      })}
      <text x={78} y={380} fill={DIM} fontSize={10.5} fontFamily={BODY}>eight glances that found nothing.</text>
      <text x={78} y={395} fill={DIM} fontSize={10.5} fontFamily={BODY}>one that did.</text>

      {/* scenario, not a measurement */}
      <text x={0} y={420} fill={FAINT} fontSize={7.5} fontFamily={MONO} letterSpacing="2" opacity="0.7">
        AN ILLUSTRATION, NOT A MEASUREMENT
      </text>
    </svg>
  );
}
