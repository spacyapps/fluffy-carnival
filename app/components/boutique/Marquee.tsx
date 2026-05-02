const PHRASES = [
  'Secret Stuff',
  'Checkpoint',
  'Sole Space Adventurer',
  'Made in Space?',
  'AI as my ally',
  'Old school vibes',
];

export default function Marquee() {
  return (
    <div
      style={{
        overflow: 'hidden',
        borderTop: '1px solid var(--line)',
        borderBottom: '1px solid var(--line)',
        padding: '20px 0',
      }}
    >
      <div
        style={{
          display: 'flex',
          whiteSpace: 'nowrap',
          animation: 'bo-marquee 40s linear infinite',
          fontFamily: 'var(--font-serif)',
          fontStyle: 'italic',
          fontWeight: 300,
          fontSize: 22,
          color: 'var(--ink-dim)',
          gap: 48,
        }}
      >
        {[0, 1].map((k) => (
          <div key={k} style={{ display: 'flex', gap: 48, paddingRight: 48 }}>
            {PHRASES.map((t, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 36 }}>
                {t}
                <span style={{ color: 'var(--accent)' }}>✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
