const ACCENT = '#e8a87c';
const INK = '#ece6d6';
const DIM = 'rgba(236,230,214,0.62)';
const FAINT = 'rgba(236,230,214,0.34)';
const HAIR = 'rgba(236,230,214,0.18)';
const RED = '#e0705e';

const MONO = 'var(--font-mono)';
const BODY = 'var(--font-body)';

/**
 * Illustration only. Two very different requests, arriving as the same
 * notification. Nothing here is a runnable command.
 */
export default function SameYesSVG() {
  return (
    <svg viewBox="0 0 480 268" style={{ width: '100%', height: 'auto', display: 'block' }}>
      <text x={0} y={12} fill={FAINT} fontSize={8.5} fontFamily={MONO} letterSpacing="2">
        WHAT ARRIVES ON YOUR PHONE
      </text>

      {/* the notification */}
      <rect x={64} y={28} width={352} height={88} rx={12}
        fill="rgba(0,0,0,0.32)" stroke={HAIR} strokeWidth={1} />
      <circle cx={84} cy={50} r={3.5} fill={ACCENT} />
      <text x={96} y={53} fill={FAINT} fontSize={8.5} fontFamily={MONO} letterSpacing="1.8">
        GROUND CONTROL
      </text>
      <text x={84} y={78} fill={INK} fontSize={13} fontFamily={BODY}>
        A session is waiting on your answer.
      </text>
      <rect x={84} y={88} width={70} height={20} rx={10} fill="none" stroke={ACCENT} strokeOpacity={0.55} strokeWidth={1} />
      <text x={119} y={102} fill={ACCENT} fontSize={10} fontFamily={BODY} textAnchor="middle">Approve</text>
      <rect x={162} y={88} width={54} height={20} rx={10} fill="none" stroke={HAIR} strokeWidth={1} />
      <text x={189} y={102} fill={FAINT} fontSize={10} fontFamily={BODY} textAnchor="middle">Deny</text>

      {/* the fork */}
      <path d="M 240,116 V 134 H 142 V 156" fill="none" stroke={HAIR} strokeWidth={1} strokeDasharray="2 5" />
      <path d="M 240,116 V 134 H 338 V 156" fill="none" stroke={HAIR} strokeWidth={1} strokeDasharray="2 5" />

      <text x={0} y={150} fill={FAINT} fontSize={8.5} fontFamily={MONO} letterSpacing="2">
        WHAT IT WAS ASKING
      </text>

      {/* benign */}
      <rect x={52} y={158} width={180} height={54} rx={10} fill="none" stroke={HAIR} strokeWidth={1} />
      <text x={142} y={182} fill={DIM} fontSize={12.5} fontFamily={BODY} textAnchor="middle">
        install a package
      </text>
      <text x={142} y={199} fill={FAINT} fontSize={8} fontFamily={MONO} letterSpacing="1.8" textAnchor="middle">
        UNDO IT IN A MINUTE
      </text>

      {/* destructive */}
      <rect x={248} y={158} width={180} height={54} rx={10} fill="rgba(224,112,94,0.06)" stroke={RED} strokeOpacity={0.5} strokeWidth={1} />
      <text x={338} y={182} fill={RED} fontSize={12.5} fontFamily={BODY} textAnchor="middle">
        drop the production table
      </text>
      <text x={338} y={199} fill={RED} fillOpacity={0.7} fontSize={8} fontFamily={MONO} letterSpacing="1.8" textAnchor="middle">
        DO NOT
      </text>

      <text x={240} y={240} fill={INK} fontSize={11.5} fontFamily={BODY} textAnchor="middle" fillOpacity={0.85}>
        On a lock screen, these are the same notification.
      </text>
      <text x={240} y={259} fill={FAINT} fontSize={8} fontFamily={MONO} letterSpacing="2" textAnchor="middle" opacity={0.75}>
        AN ILLUSTRATION · NOT A FEATURE
      </text>
    </svg>
  );
}
