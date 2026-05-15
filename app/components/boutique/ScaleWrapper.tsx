'use client';
import { useLayoutEffect } from 'react';

let mountCount = 0;

export default function ScaleWrapper({ children }: { children: React.ReactNode }) {
  useLayoutEffect(() => {
    mountCount++;

    const meta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement | null;
    if (meta) {
      const deviceWidth = window.screen.width; // physical CSS pixels, unaffected by viewport meta
      if (deviceWidth < 1080) {
        const scale = deviceWidth / 1080;
        meta.content = `width=1080, initial-scale=${scale}`;
      }
    }

    return () => {
      mountCount--;
      if (mountCount === 0 && meta) {
        meta.content = 'width=device-width, initial-scale=1';
      }
    };
  }, []);

  return <>{children}</>;
}
