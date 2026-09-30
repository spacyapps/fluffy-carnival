'use client';

// The window a journal entry opens in, inside the lounge's view (the
// #lounge-window layer), spanning from about her left hand across to the
// right, so the reader stays in the room with her. Used for posts
// (ArticleWindow) and for entries that live on another page of the site,
// shown as that page. Closing (the × button, Esc, a click outside) calls
// onClose. If the lounge isn't on the page, the window covers the screen.

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export default function LoungeWindow({ title, label, accent, fullHref, onClose, scrolls, children }: {
  title: string;              // the tab's title while it's open
  label: string;              // the small line top-left
  accent: string;
  fullHref: string;           // FULL PAGE ↗
  onClose: () => void;
  scrolls: boolean;           // the window scrolls its content (and shows progress), or the content scrolls itself
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; });
  // Only ever rendered client-side, after a tap in the lounge.
  const [host] = useState(() => (typeof document === 'undefined' ? null : document.getElementById('lounge-window')));

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    // Covering the screen, the page behind stays put; inside the lounge, the
    // page is left alone.
    const overflow = document.body.style.overflow;
    if (!host) document.body.style.overflow = 'hidden';
    const before = document.activeElement as HTMLElement | null;
    panel.focus({ preventScroll: true });
    const was = document.title;
    document.title = title;

    // Reading progress along the window's top edge.
    const scroller = scrollRef.current;
    let raf = 0;
    const measure = () => {
      raf = 0;
      if (!scroller) return;
      const max = scroller.scrollHeight - scroller.clientHeight;
      panel.style.setProperty('--read', (max > 0 ? scroller.scrollTop / max : 0).toFixed(4));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(measure); };
    scroller?.addEventListener('scroll', onScroll, { passive: true });

    // Esc closes; Tab stays inside the window.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); closeRef.current(); return; }
      if (e.key !== 'Tab') return;
      const items = panel.querySelectorAll<HTMLElement>('a[href], button, iframe, [tabindex]:not([tabindex="-1"])');
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = overflow;
      document.title = was;
      scroller?.removeEventListener('scroll', onScroll);
      window.removeEventListener('keydown', onKey);
      cancelAnimationFrame(raf);
      before?.focus?.({ preventScroll: true });
    };
  }, [host, title]);

  const win = (
    <div style={{ position: host ? 'absolute' : 'fixed', inset: 0, zIndex: 60, pointerEvents: 'auto' }}>
      {/* The room behind, dimmed and softened; a click here closes. */}
      <div onClick={() => closeRef.current()} aria-hidden="true" style={{
        position: 'absolute', inset: 0, background: host ? 'rgba(5,6,10,0.4)' : 'rgba(5,6,10,0.58)',
        backdropFilter: host ? 'blur(1.5px)' : 'blur(3px)', WebkitBackdropFilter: host ? 'blur(1.5px)' : 'blur(3px)',
        animation: 'jr-veil-in .45s ease-out',
      }} />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        style={{
          '--read': 0,
          position: 'absolute',
          // In the lounge: from about her left hand across to the right.
          ...(host
            ? { left: '15%', right: '11%', top: '4%', bottom: '8%' }
            : { left: '50%', top: '50%', width: 'min(780px, 94vw)', height: 'min(88vh, 1100px)', translate: '-50% -50%' }),
          display: 'flex', flexDirection: 'column',
          background: 'rgba(14,16,20,0.97)', border: '1px solid var(--line)', borderRadius: 16,
          boxShadow: '0 30px 90px rgba(0,0,0,0.6)', color: 'var(--ink)', outline: 'none', overflow: 'hidden',
          animation: 'jr-window-grow .5s cubic-bezier(.2,.8,.2,1)',
        } as unknown as React.CSSProperties}
      >
        {/* TOP STRIP */}
        <div style={{ position: 'relative', flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px 12px 26px', borderBottom: '1px solid var(--line)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: 2.5, color: accent }}>{label}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <a href={fullHref} className="bo-link" style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 2, color: 'var(--ink-faint)', textDecoration: 'none' }}>
              FULL PAGE ↗
            </a>
            <button onClick={() => closeRef.current()} aria-label="Close" style={{
              width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--line)', background: 'transparent',
              color: 'var(--ink-dim)', cursor: 'pointer', fontSize: 18, lineHeight: '28px', padding: 0,
            }}>
              ×
            </button>
          </div>
          {scrolls && (
            <div aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, bottom: -1, height: 1 }}>
              <div style={{ height: '100%', background: `linear-gradient(90deg, transparent, ${accent})`, transform: 'scaleX(var(--read))', transformOrigin: 'left' }} />
            </div>
          )}
        </div>

        <div ref={scrolls ? scrollRef : undefined} style={{ flex: '1 1 auto', minHeight: 0, overflowY: scrolls ? 'auto' : 'hidden', overscrollBehavior: 'contain' }}>
          {children}
        </div>
      </div>
    </div>
  );
  return host ? createPortal(win, host) : win;
}
