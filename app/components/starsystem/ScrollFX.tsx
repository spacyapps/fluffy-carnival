'use client';

// Scroll choreography for the home page below the hero: elements marked
// data-reveal rise into place as they enter, and --scroll-skew leans the
// marquee with scroll speed. Everything shows as-is without JS, and for
// reduced motion the 'fx' class is never added.

import { useEffect } from 'react';

export default function ScrollFX() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const root = document.documentElement;
    root.classList.add('fx');

    // A "line" reveal starts fully clipped, which the observer counts as
    // zero area, so its parent is watched in its place.
    const watched = new Map<Element, Element>();
    const io = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        (watched.get(e.target) ?? e.target).setAttribute('data-in', '');
        io.unobserve(e.target);
      }
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.06 });
    document.querySelectorAll('[data-reveal]').forEach(el => {
      const target = el.getAttribute('data-reveal') === 'line' && el.parentElement ? el.parentElement : el;
      watched.set(target, el);
      io.observe(target);
    });

    // Skew eases toward the scroll velocity and settles back to zero; the
    // loop runs only while there's motion to show.
    let last = window.scrollY, skew = 0, raf = 0;
    const step = () => {
      const v = window.scrollY - last;
      last = window.scrollY;
      const target = Math.max(-6, Math.min(6, v * 0.1));
      skew += (target - skew) * 0.14;
      root.style.setProperty('--scroll-skew', `${skew.toFixed(2)}deg`);
      raf = Math.abs(skew) > 0.02 || v !== 0 ? requestAnimationFrame(step) : 0;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(step); };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
      root.classList.remove('fx');
      root.style.removeProperty('--scroll-skew');
    };
  }, []);
  return null;
}
