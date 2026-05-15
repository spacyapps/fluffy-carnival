'use client';
import { useState } from 'react';

type Slide = { src: string; caption: string; type?: 'video' };

export default function FeatureSlideshow({ slides, color }: { slides: Slide[]; color: string }) {
  const [active, setActive] = useState(0);

  return (
    <div style={{ padding: '48px 0 40px' }}>

      {/* Phone row */}
      <div style={{ display: 'flex', gap: 20, justifyContent: 'center', alignItems: 'flex-end' }}>
        {slides.map((slide, i) => {
          const isActive = i === active;
          return (
            <button
              key={i}
              onClick={() => setActive(i)}
              style={{
                background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                flexShrink: 0, transition: 'transform 0.3s, opacity 0.3s',
                transform: isActive ? 'scale(1)' : 'scale(0.88)',
                opacity: isActive ? 1 : 0.45,
              }}
            >
              <div style={{
                width: 180,
                borderRadius: 32,
                background: 'linear-gradient(160deg, #1a1c22, #0d0e11)',
                padding: 8,
                boxShadow: isActive
                  ? `0 20px 56px rgba(0,0,0,0.7), 0 0 0 2px ${color}`
                  : '0 8px 24px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.06)',
                transition: 'box-shadow 0.3s',
              }}>
                <div style={{ borderRadius: 24, overflow: 'hidden', aspectRatio: '9 / 19.5', background: '#000' }}>
                  {slide.type === 'video' ? (
                    <video src={slide.src} autoPlay muted loop playsInline
                      style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <img
                      src={slide.src}
                      alt={slide.caption}
                      style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Caption */}
      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <span style={{
          fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 16,
          color: 'var(--ink-dim)', letterSpacing: 0.2,
        }}>
          {slides[active].caption}
        </span>
      </div>

      {/* Dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
        {slides.map((_, i) => (
          <button key={i} onClick={() => setActive(i)} style={{
            width: i === active ? 20 : 6, height: 6, borderRadius: 3,
            border: 'none', cursor: 'pointer', padding: 0,
            background: i === active ? color : 'var(--line)',
            transition: 'width 0.3s, background 0.2s',
          }} />
        ))}
      </div>
    </div>
  );
}
