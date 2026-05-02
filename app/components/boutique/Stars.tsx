'use client';

import { useEffect, useState } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  delay: number;
  dur: number;
}

export default function Stars({ density = 70 }: { density?: number }) {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    setStars(
      Array.from({ length: density }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() < 0.85 ? 1 : 2,
        opacity: 0.3 + Math.random() * 0.6,
        delay: Math.random() * 5,
        dur: 3 + Math.random() * 4,
      }))
    );
  }, [density]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {stars.map((s, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            background: '#fff',
            opacity: s.opacity,
            borderRadius: '50%',
            animation: `bo-twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
