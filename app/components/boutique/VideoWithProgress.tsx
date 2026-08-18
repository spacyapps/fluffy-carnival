'use client';

import { useEffect, useRef, useState } from 'react';

export default function VideoWithProgress({
  src,
  fit = 'cover',
  radius = 32,
}: {
  src: string;
  fit?: 'cover' | 'contain';
  radius?: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => {
      if (mq.matches) {
        v.pause();
        v.currentTime = 0;
      } else {
        v.play().catch(() => {});
      }
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  function handleTimeUpdate() {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    setProgress(v.currentTime / v.duration);
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: radius, overflow: 'hidden' }}>
      <video
        ref={videoRef}
        src={src}
        muted
        preload="metadata"
        loop
        playsInline
        onTimeUpdate={handleTimeUpdate}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: fit === 'contain' ? '100%' : '105%',
          height: fit === 'contain' ? '100%' : '105%',
          transform: 'translate(-50%, -50%)',
          objectFit: fit,
        }}
      />
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        background: 'rgba(255,255,255,0.12)',
      }}>
        <div style={{
          height: '100%',
          width: `${progress * 100}%`,
          background: 'rgba(255,255,255,0.7)',
          transition: 'width 0.25s linear',
        }} />
      </div>
    </div>
  );
}
