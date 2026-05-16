'use client';

import { useRef, useState } from 'react';

export default function VideoWithProgress({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);

  function handleTimeUpdate() {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    setProgress(v.currentTime / v.duration);
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 32, overflow: 'hidden' }}>
      <video
        ref={videoRef}
        src={src}
        autoPlay
        muted
        loop
        playsInline
        onTimeUpdate={handleTimeUpdate}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '105%',
          height: '105%',
          transform: 'translate(-50%, -50%)',
          objectFit: 'cover',
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
