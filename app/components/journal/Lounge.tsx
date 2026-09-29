'use client';

// The journal index as a lounge (scene in loungeScene.ts): files about the
// apps and the tech on the left, magazines for everything else on the right.
// Titles are on the covers. Tap one, or drag it, and it slides into her lap
// with its card below; tap it there to open it. Tap elsewhere (or Esc) and
// it goes back to its pile.

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { type Post } from '../../data/journal';
import type { Item, Lounge as Scene } from './loungeScene';

// Which pile an entry goes on. Files are about our apps and how they're
// built; magazines are the wider ideas.
// post -> pile (why)
const PILE: Record<string, Item['kind']> = {
  'fl-06': 'file',     // the Secret Stuff signature algorithm
  'fl-05': 'file',     // Secret Stuff's first release
  'dr-02': 'magazine', // Checkpoint and Conduit, built by AI
  'dr-03': 'magazine', // where code comments belong
  'dr-01': 'magazine', // working with AI, as a practice
  'dr-04': 'magazine', // where innovation comes from
};

// The app a file is about, shown as its icon.
// post -> icon (why)
const ICON: Record<string, string> = {
  'fl-06': '/icon-secret-stuff.png', // the algorithm behind its lock
  'fl-05': '/icon-secret-stuff.png', // its release story
};

// A magazine's cover photo when it isn't the post's first image.
// post -> image (why)
const COVER_IMAGE: Record<string, string> = {
  'dr-02': '/checkpoint-screenshot-v2.png', // no image in the post; Checkpoint was the first trial
  'dr-04': '/basketball-envisioning.jpg',    // reads better as a cover than the first image
};

const firstImage = (p: Post) => p.body.find(b => b.kind === 'image')?.src;

export default function Lounge({ posts, onFail }: { posts: Post[]; onFail: () => void }) {
  const router = useRouter();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const filesLabel = useRef<HTMLDivElement>(null);
  const magsLabel = useRef<HTMLDivElement>(null);
  const lapCard = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<Post | null>(null);
  const [lap, setLapPost] = useState<Post | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current, canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    let cancelled = false;
    let cleanup = () => {};

    Promise.all([import('./loungeScene'), import('./loungeTextures')]).then(async ([{ createLounge }, { loadFonts }]) => {
      const fonts = await loadFonts();
      if (cancelled) return;
      // Numbered in the order they were written; each pile shows its lead
      // (the pinned entry, else the newest) first.
      const oldestFirst = [...posts].sort((a, b) => a.date.localeCompare(b.date));
      const num = (p: Post) => String(oldestFirst.indexOf(p) + 1).padStart(2, '0');
      const pile = (kind: Item['kind']) => posts
        .filter(p => (PILE[p.id] ?? 'magazine') === kind)
        .sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned) || b.date.localeCompare(a.date));
      const items: Item[] = [...pile('file'), ...pile('magazine')].map(p => ({
        id: p.id, kind: PILE[p.id] ?? 'magazine',
        num: num(p), title: p.title, dateLabel: p.dateLabel, read: p.read,
        icon: ICON[p.id], image: COVER_IMAGE[p.id] ?? firstImage(p),
      }));

      let scene: Scene;
      try {
        // ?body=1 draws her whole figure (the head isn't modelled); ?view=side
        // or ?view=front looks at her from outside; ?pose=cross|side|lift holds a
        // pose. For working on the figure.
        const q = new URLSearchParams(window.location.search);
        scene = createLounge(canvas, items, fonts, {
          reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
          upper: q.get('body') === '1',
          view: q.get('view'),
          pose: q.get('pose'),
        });
      } catch {
        onFail();
        return;
      }
      const size = () => scene.resize(wrap.clientWidth, wrap.clientHeight);
      size();
      scene.ready.then(() => { if (!cancelled) setLoaded(true); }, () => { if (!cancelled) onFail(); });
      scene.onFrame(a => {
        if (filesLabel.current) filesLabel.current.style.transform = `translate(${a.files.x}px, ${a.files.y}px) translate(-50%, -100%)`;
        if (magsLabel.current) magsLabel.current.style.transform = `translate(${a.magazines.x}px, ${a.magazines.y}px) translate(-50%, -100%)`;
        // The card's details sit just left of it.
        if (lapCard.current) {
          // Left of the card when there's room, else to its right.
          const fitsLeft = a.lapLeft.x - 20 - lapCard.current.offsetWidth > 16;
          lapCard.current.style.transform = fitsLeft
            ? `translate(${a.lapLeft.x - 20}px, ${a.lapLeft.y}px) translate(-100%, -50%)`
            : `translate(${a.lapRight.x + 20}px, ${a.lapRight.y}px) translate(0, -50%)`;
        }
      });
      const ro = new ResizeObserver(size);
      ro.observe(wrap);
      const io = new IntersectionObserver(([e]) => (e.isIntersecting ? scene.start() : scene.stop()));
      io.observe(wrap);

      const local = (e: PointerEvent) => {
        const r = wrap.getBoundingClientRect();
        return { x: (e.clientX - r.left) * (wrap.clientWidth / r.width), y: (e.clientY - r.top) * (wrap.clientHeight / r.height) };
      };
      const find = (id: string | null) => (id ? posts.find(p => p.id === id) ?? null : null);
      let over: string | null = null;
      let inLap: string | null = null;
      let press: { id: string | null; x: number; y: number; dragging: boolean } | null = null;
      const toLap = (id: string | null) => {
        inLap = id;
        scene.setLap(id);
        setLapPost(find(id));
      };
      const onDown = (e: PointerEvent) => {
        const { x, y } = local(e);
        press = { id: scene.pick(x, y), x, y, dragging: false };
        if (press.id) canvas.setPointerCapture(e.pointerId);
      };
      const onMove = (e: PointerEvent) => {
        const { x, y } = local(e);
        if (press?.id) {
          if (!press.dragging && Math.hypot(x - press.x, y - press.y) > 6) {
            press.dragging = true;
            if (inLap === press.id) toLap(null);
            canvas.style.cursor = 'grabbing';
          }
          if (press.dragging) { scene.drag(press.id, x, y); return; }
        }
        scene.look((x / wrap.clientWidth) * 2 - 1, (y / wrap.clientHeight) * 2 - 1);
        const id = scene.pick(x, y);
        if (id === over) return;
        over = id;
        scene.setHovered(id);
        setHovered(id && id !== inLap ? find(id) : null);
        canvas.style.cursor = id ? 'pointer' : 'default';
      };
      const onUp = (e: PointerEvent) => {
        const { x, y } = local(e);
        const p = press;
        press = null;
        if (!p) return;
        if (p.dragging && p.id) {
          const landed = scene.drop(p.id, x, y);
          toLap(landed ? p.id : inLap);
          canvas.style.cursor = 'pointer';
          return;
        }
        const id = scene.pick(x, y);
        if (!id) { toLap(null); return; }
        if (id === inLap) {
          const post = find(id);
          if (post) router.push(post.link ?? `/journal/${post.slug}`);
          return;
        }
        toLap(id);
        setHovered(null);
      };
      const onLeave = () => { over = null; scene.setHovered(null); scene.look(0, 0); setHovered(null); };
      const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') toLap(null); };
      canvas.addEventListener('pointerdown', onDown);
      canvas.addEventListener('pointermove', onMove);
      canvas.addEventListener('pointerup', onUp);
      canvas.addEventListener('pointerleave', onLeave);
      window.addEventListener('keydown', onKey);

      cleanup = () => {
        canvas.removeEventListener('pointerdown', onDown);
        canvas.removeEventListener('pointermove', onMove);
        window.removeEventListener('keydown', onKey);
        canvas.removeEventListener('pointerup', onUp);
        canvas.removeEventListener('pointerleave', onLeave);
        ro.disconnect(); io.disconnect(); scene.dispose();
      };
    });

    return () => { cancelled = true; cleanup(); };
    // The scene is built once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const label: React.CSSProperties = {
    position: 'absolute', left: 0, top: 0, whiteSpace: 'nowrap', pointerEvents: 'none', textAlign: 'center',
    fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, letterSpacing: 3.5, color: 'var(--ink)', transition: 'opacity .6s', opacity: loaded ? 1 : 0,
    // A soft dark pill so the labels read over bright sky and window glow.
    padding: '8px 16px', borderRadius: 999, background: 'rgba(8,9,13,0.62)', border: '1px solid rgba(236,230,214,0.16)',
    backdropFilter: 'blur(6px)', textShadow: '0 1px 8px rgba(0,0,0,0.8)',
  };

  return (
    <div ref={wrapRef} style={{
      position: 'relative', width: '100%', height: '100%',
      maskImage: 'linear-gradient(to bottom, transparent 0, #000 7%, #000 92%, transparent 100%)',
      WebkitMaskImage: 'linear-gradient(to bottom, transparent 0, #000 7%, #000 92%, transparent 100%)',
    }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', opacity: loaded ? 1 : 0, transition: 'opacity 1.4s ease' }} />
      <div ref={filesLabel} style={label}>FILES<div style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: 2.5, color: 'var(--accent)', marginTop: 4 }}>APPS &amp; TECH</div></div>
      <div ref={magsLabel} style={label}>MAGAZINES<div style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: 2.5, color: 'var(--accent)', marginTop: 4 }}>IDEAS</div></div>

      {lap && (
        <div key={'lap-' + lap.id} ref={lapCard} style={{ position: 'absolute', left: 0, top: 0, width: 300, padding: '14px 20px', borderRadius: 12, background: 'rgba(12,13,18,0.85)', border: '1px solid var(--line)', backdropFilter: 'blur(8px)', animation: 'jr-fadein .3s ease-out' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 2, color: 'var(--accent)', marginBottom: 6 }}>
            {lap.dateLabel.toUpperCase()} · {lap.read.toUpperCase()} READ
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 14, color: 'var(--ink-dim)', fontWeight: 300, lineHeight: 1.5, marginBottom: 10 }}>{lap.excerpt}</div>
          <a href={lap.link ?? `/journal/${lap.slug}`} onClick={e => { e.preventDefault(); router.push(lap.link ?? `/journal/${lap.slug}`); }} className="bo-link" style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 15.5, color: 'var(--accent)', textDecoration: 'none', display: 'inline-block', animation: 'ss-beckon 1.6s ease-in-out .6s 3' }}>
            Tap it again to read →
          </a>
        </div>
      )}

      {hovered && !lap && (
        <div key={hovered.id} style={{ position: 'absolute', left: '50%', bottom: '4%', transform: 'translateX(-50%)', maxWidth: 520, width: 'max-content', padding: '14px 22px', borderRadius: 12, background: 'rgba(12,13,18,0.82)', border: '1px solid var(--line)', backdropFilter: 'blur(8px)', textAlign: 'center', pointerEvents: 'none', animation: 'jr-fadein .25s ease-out' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 2, color: 'var(--accent)', marginBottom: 6 }}>
            {hovered.dateLabel.toUpperCase()} · {hovered.read.toUpperCase()} READ
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 19, marginBottom: 4 }}>{hovered.title}</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 13.5, color: 'var(--ink-dim)', fontWeight: 300, lineHeight: 1.5 }}>{hovered.excerpt}</div>
        </div>
      )}
    </div>
  );
}
