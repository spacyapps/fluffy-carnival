'use client';

import { useEffect, useState } from 'react';
import PolarBuyButton from './PolarBuyButton';

/**
 * Static hero.png by default. On a fine-pointer device the loop plays on
 * hover; on touch there's no hover, so a "tap to animate" pill invites the
 * same thing on tap. The <video> only mounts once activated — nothing is
 * fetched until someone actually asks for it.
 */
export default function ThemeCard({
  name,
  blurb,
  image,
  loopSrc,
  price,
  checkoutUrl,
  familyLabel,
  tint,
  free,
}: {
  name: string;
  blurb: string;
  image: string;
  loopSrc: string;
  price: string;
  checkoutUrl: string | null;
  familyLabel?: string;
  tint: string;
  free?: boolean;
}) {
  const [isTouch, setIsTouch] = useState<boolean | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setIsTouch(!window.matchMedia('(pointer: fine)').matches);
  }, []);

  const showTapHint = isTouch === true && !playing;

  return (
    <div>
      <div
        onMouseEnter={() => isTouch === false && setPlaying(true)}
        onMouseLeave={() => isTouch === false && setPlaying(false)}
        onClick={() => isTouch === true && setPlaying((p) => !p)}
        style={{
          position: 'relative',
          borderRadius: 16,
          overflow: 'hidden',
          background: '#0b0c10',
          aspectRatio: '1652 / 1240',
          boxShadow: `0 0 0 1px rgba(${tint},0.35), 0 0 32px -4px rgba(${tint},0.28)`,
          cursor: isTouch === true ? 'pointer' : 'default',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={`${name}, running in Ground Control`} loading="lazy" style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }} />
        {playing && (
          <video
            src={loopSrc}
            autoPlay
            muted
            loop
            playsInline
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
        {showTapHint && (
          <div
            style={{
              position: 'absolute',
              left: '50%',
              bottom: 14,
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              padding: '7px 14px',
              borderRadius: 999,
              background: 'rgba(11,12,16,0.72)',
              border: '1px solid rgba(255,255,255,0.18)',
              fontFamily: 'var(--font-mono)',
              fontSize: 9.5,
              letterSpacing: 1.3,
              color: 'var(--ink)',
              pointerEvents: 'none',
            }}
          >
            <span aria-hidden>▶</span> TAP TO ANIMATE
          </div>
        )}
      </div>
      {familyLabel && (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: 1.5, color: `rgb(${tint})`, display: 'block', marginTop: 12 }}>
          {familyLabel}
        </span>
      )}
      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 21, fontWeight: 400, margin: familyLabel ? '6px 0 6px' : '16px 0 6px', letterSpacing: -0.4 }}>
        {name}
      </h3>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, lineHeight: 1.6, color: 'var(--ink-dim)', fontWeight: 300, margin: '0 0 14px' }}>
        {blurb}
      </p>
      {free ? (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: 1.3, color: 'var(--accent-2)' }}>
          INCLUDED FREE
        </span>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: 0.5, color: 'var(--ink-faint)' }}>
            {price}
          </span>
          <PolarBuyButton url={checkoutUrl} label="Buy →" />
        </div>
      )}
    </div>
  );
}
