'use client';

// Scroll choreography for the home page below the hero: elements marked
// data-reveal rise into place as they enter. Everything shows as-is without
// JS, and for reduced motion the 'fx' class is never added.

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

    return () => {
      io.disconnect();
      root.classList.remove('fx');
    };
  }, []);
  return null;
}
