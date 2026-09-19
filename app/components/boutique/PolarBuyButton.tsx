/**
 * url === null renders "Coming Soon" — not a link, not clickable, no
 * checkout script involved. Filling in a URL is the only change needed to
 * make a product live.
 *
 * When a URL exists, it's a plain link to Polar's hosted checkout page —
 * full two-column layout with the product art and description, not the
 * compact embed overlay. Walter preferred the full page once he saw both;
 * it also means nothing here depends on Polar's embed-hosts allowlist.
 */
export default function PolarBuyButton({
  url,
  label,
  size = 'default',
}: {
  url: string | null;
  label: string;
  size?: 'default' | 'large';
}) {
  if (!url) {
    return (
      <span
        style={{
          display: 'inline-block',
          fontFamily: 'var(--font-mono)',
          fontSize: size === 'large' ? 12 : 10,
          letterSpacing: 1.3,
          color: 'var(--ink-faint)',
          cursor: 'default',
          padding: size === 'large' ? '13px 26px' : 0,
          border: size === 'large' ? '1px solid var(--line)' : 'none',
          borderRadius: size === 'large' ? 999 : 0,
        }}
      >
        COMING SOON
      </span>
    );
  }

  if (size === 'large') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-block',
          fontFamily: 'var(--font-body)',
          fontWeight: 600,
          fontSize: 15,
          color: '#1a1610',
          background: 'var(--accent)',
          borderRadius: 999,
          padding: '15px 32px',
          textDecoration: 'none',
        }}
      >
        {label}
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--accent)', textDecoration: 'none' }}
    >
      {label}
    </a>
  );
}
