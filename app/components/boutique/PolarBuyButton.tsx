'use client';

import { useEffect, useState } from 'react';

/**
 * url === null renders "Coming Soon" — not a link, not clickable, no
 * checkout script involved. Filling in a URL is the only change needed to
 * make a product live.
 *
 * When a URL exists, the element is always a real <a href> to Polar's
 * hosted checkout page — it works as a plain link with no script at all.
 * On a fine-pointer device (a mouse) it additionally gets
 * data-polar-checkout, so PolarInit's script opens it as an overlay
 * instead. Touch devices keep the plain link: SpacyApps runs a fixed
 * width=1080 viewport even on phones, and an overlay checkout inside that
 * hasn't been verified usable at phone size. A plain link opens Polar's
 * own hosted page, which resizes correctly on its own.
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
  const [embed, setEmbed] = useState(false);

  useEffect(() => {
    if (url && window.matchMedia('(pointer: fine)').matches) {
      setEmbed(true);
    }
  }, [url]);

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

  const embedProps = embed ? { 'data-polar-checkout': '', 'data-polar-checkout-theme': 'dark' } : {};

  if (size === 'large') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        {...embedProps}
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
      {...embedProps}
      style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--accent)', textDecoration: 'none' }}
    >
      {label}
    </a>
  );
}
