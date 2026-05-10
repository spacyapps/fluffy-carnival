'use client';

export default function ContactLink() {
  const address = ['spacyapps', 'gmail.com'].join('@');
  return (
    <a
      href={`mailto:${address}`}
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 13,
        letterSpacing: 2,
        color: 'var(--ink-dim)',
        textDecoration: 'none',
        borderBottom: '1px solid var(--line)',
        paddingBottom: 2,
        transition: 'color 0.2s, border-color 0.2s',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent)';
        (e.currentTarget as HTMLAnchorElement).style.borderBottomColor = 'var(--accent)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLAnchorElement).style.color = 'var(--ink-dim)';
        (e.currentTarget as HTMLAnchorElement).style.borderBottomColor = 'var(--line)';
      }}
    >
      {address}
    </a>
  );
}
