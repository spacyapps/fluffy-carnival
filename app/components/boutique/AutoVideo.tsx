'use client';

import { useEffect, useRef } from 'react';

/**
 * A looping, muted demo clip that respects prefers-reduced-motion.
 * Playback starts from JS rather than the autoplay attribute, so a viewer
 * who has asked for reduced motion gets a still first frame instead.
 */
export default function AutoVideo({
  src,
  ariaLabel,
  radius = 0,
}: {
  src: string;
  ariaLabel: string;
  radius?: number;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
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

  return (
    <video
      ref={ref}
      src={src}
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={ariaLabel}
      style={{ display: 'block', width: '100%', height: 'auto', borderRadius: radius || undefined }}
    />
  );
}
