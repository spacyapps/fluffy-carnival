'use client';

// Feeds the pointer position into whichever .bo-glow card it's over, as
// --mx/--my percentages (percentages, so ScaleWrapper's scaling doesn't
// matter). One listener for the whole page; touch screens skip it.

import { useEffect } from 'react';

export default function CardGlow() {
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    let raf = 0, last: PointerEvent | null = null;
    const apply = () => {
      raf = 0;
      const e = last!;
      const card = (e.target as Element | null)?.closest?.('.bo-glow') as HTMLElement | null;
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${((e.clientX - r.left) / r.width * 100).toFixed(1)}%`);
      card.style.setProperty('--my', `${((e.clientY - r.top) / r.height * 100).toFixed(1)}%`);
    };
    const onMove = (e: PointerEvent) => { last = e; if (!raf) raf = requestAnimationFrame(apply); };
    document.addEventListener('pointermove', onMove, { passive: true });
    return () => { document.removeEventListener('pointermove', onMove); cancelAnimationFrame(raf); };
  }, []);
  return null;
}
