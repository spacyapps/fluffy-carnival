'use client';
import { useState, useEffect } from 'react';

type Slide = { src: string; caption?: string };

export default function CrossfadeSlides({
  slides,
  color,
  aspectRatio,
  interval = 4200,
}: {
  slides: Slide[];
  color: string;
  aspectRatio: string;
  interval?: number;
}) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive(a => (a + 1) % slides.length), interval);
    return () => clearInterval(id);
  }, [slides.length, interval]);

  return (
    <div style={{ maxWidth: 380, width: '100%' }}>
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio,
          borderRadius: 16,
          overflow: 'hidden',
          background: 'var(--bg)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.6), inset 0 0 0 1.5px rgba(255,255,255,0.08)',
        }}
      >
        {slides.map((slide, i) => (
          <img
            key={i}
            src={slide.src}
            alt={slide.caption ?? ''}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              opacity: i === active ? 1 : 0,
              transition: 'opacity 0.9s ease',
            }}
          />
        ))}
      </div>

      {/* Dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`Show slide ${i + 1}`}
            style={{
              width: i === active ? 20 : 6,
              height: 6,
              borderRadius: 3,
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              background: i === active ? color : 'var(--line)',
              transition: 'width 0.3s, background 0.2s',
            }}
          />
        ))}
      </div>

      {slides[active].caption && (
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            letterSpacing: 2,
            color: 'var(--ink-faint)',
            textAlign: 'center',
            marginTop: 12,
            minHeight: 12,
          }}
        >
          {slides[active].caption!.toUpperCase()}
        </div>
      )}
    </div>
  );
}
