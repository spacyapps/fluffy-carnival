'use client';

// The journal index as an orrery (scene in orreryScene.ts). The canvas draws
// the instrument; titles are HTML laid over it, moved every frame, so the type
// stays crisp. Labels that would collide step up or down out of each other's
// way, easing there rather than jumping.

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { POSTS, type Post, type Topic } from '../../data/journal';
import type { Orrery as OrrerySystem, BeadPoint, ScreenXY } from './orreryScene';

// Hoops, inside out. Opposite tilts so they cross like an armillary's.
// topic -> hoop (why)
const HOOPS = [
  { topic: 'first_light', radius: 2.1, tilt: -9, period: 200 }, // inner, the origin story
  { topic: 'drift',       radius: 3.6, tilt: 6,  period: 350 }, // outer, still expanding
] as const;

const unlit = (p: Post) => !p.date;
const metaLine = (p: Post) => (unlit(p) ? p.dateLabel : `${p.dateLabel} · ${p.read}`).toUpperCase();
const NUDGES = [0, 22, -22, 44, -44, 66, -66];

type Box = { x0: number; x1: number; y0: number; y1: number };
const hits = (a: Box, b: Box) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;

export default function Orrery({ topics, hovered, setHovered, activeTopicId, onFail }: {
  topics: Record<string, Topic>;
  hovered: Post | null;
  setHovered: (p: Post | null) => void;
  activeTopicId: string | null;
  onFail: () => void;
}) {
  const router = useRouter();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const systemRef = useRef<OrrerySystem | null>(null);
  const labelRefs = useRef(new Map<string, HTMLDivElement>());
  const hoopRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hoveredRef = useRef<string | null>(null);
  const activeRef = useRef<string | null>(activeTopicId);
  const posts = POSTS.filter(p => HOOPS.some(h => h.topic === p.topic));

  useEffect(() => {
    activeRef.current = activeTopicId;
    const i = HOOPS.findIndex(h => h.topic === activeTopicId);
    systemRef.current?.setDimmed(i < 0 ? null : i);
  }, [activeTopicId]);

  useEffect(() => {
    hoveredRef.current = hovered?.id ?? null;
    systemRef.current?.setHovered(hoveredRef.current);
  }, [hovered]);

  useEffect(() => {
    const wrap = wrapRef.current, canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    let cancelled = false;
    let cleanup = () => {};
    const eased = new Map<string, number>();

    const layout = (points: BeadPoint[], ringTops: ScreenXY[]) => {
      // Hoop names go down first, so entry labels step around them too.
      const placed: Box[] = [];
      ringTops.forEach((t, i) => {
        const el = hoopRefs.current[i];
        if (!el) return;
        const x0 = t.x - el.offsetWidth / 2, y0 = t.y - 30;
        el.style.transform = `translate(${x0.toFixed(1)}px, ${y0.toFixed(1)}px)`;
        placed.push({ x0: x0 - 6, x1: x0 + el.offsetWidth + 6, y0: y0 - 4, y1: y0 + el.offsetHeight + 4 });
      });

      const mid = wrap.clientWidth / 2;
      const byId = new Map(posts.map(p => [p.id, p]));
      // priority -> hovered, then pinned, then published, then unwritten
      const rank = (id: string) => {
        const p = byId.get(id)!;
        return id === hoveredRef.current ? 0 : p.pinned ? 1 : unlit(p) ? 3 : 2;
      };
      // Keep clear of every bead's glass, not just its centre.
      const obstacles: Box[] = points.map(pt => ({ x0: pt.x - 20, x1: pt.x + 20, y0: pt.y - 20, y1: pt.y + 20 }));
      for (const pt of [...points].sort((a, b) => rank(a.id) - rank(b.id))) {
        const el = labelRefs.current.get(pt.id);
        const post = byId.get(pt.id);
        if (!el || !post) continue;
        const lw = el.offsetWidth, lh = el.offsetHeight;
        // Labels sit on the outward side of the bead; the far side is the
        // fallback. The side switches instantly; only the vertical step eases.
        const outward = pt.x >= mid;
        const xFor = (right: boolean) => (right ? pt.x + 24 : pt.x - 24 - lw);
        const boxAt = (right: boolean, d: number): Box => {
          const x0 = xFor(right);
          return { x0, x1: x0 + lw, y0: pt.y - lh / 2 + d, y1: pt.y + lh / 2 + d };
        };
        const own = obstacles[points.indexOf(pt)];
        let slot: { right: boolean; d: number } | undefined;
        for (const right of [outward, !outward]) {
          const d = NUDGES.find(d => {
            const b = boxAt(right, d);
            return !placed.some(p => hits(b, p)) && !obstacles.some(o => o !== own && hits(b, o));
          });
          if (d !== undefined) { slot = { right, d }; break; }
        }
        // No room anywhere: a published entry keeps its label; an unwritten one gives way.
        const yields = !slot && unlit(post);
        const right = slot?.right ?? outward;
        const target = slot?.d ?? 0;
        const x0 = xFor(right);
        const d = (eased.get(pt.id) ?? target) + (target - (eased.get(pt.id) ?? target)) * 0.15;
        eased.set(pt.id, d);
        if (!yields) placed.push(boxAt(right, target));

        const dimmed = activeRef.current !== null && post.topic !== activeRef.current;
        const isHovered = hoveredRef.current === pt.id;
        el.style.transform = `translate(${x0.toFixed(1)}px, ${(pt.y - lh / 2 + d).toFixed(1)}px)`;
        el.style.textAlign = right ? 'left' : 'right';
        el.style.opacity = String(yields ? 0 : dimmed ? 0.12 : isHovered ? 1 : pt.behind ? 0.5 : 0.9);
        el.style.zIndex = pt.behind ? '1' : '2';
      }
    };

    import('./orreryScene').then(({ createOrrery }) => {
      if (cancelled) return;
      let system: OrrerySystem;
      try {
        system = createOrrery(
          canvas,
          HOOPS.map(h => ({ radius: h.radius, tilt: h.tilt, period: h.period, color: topics[h.topic]?.color ?? '#9bb5c9' })),
          posts.map(p => ({ id: p.id, ring: HOOPS.findIndex(h => h.topic === p.topic), angle: p.angle, pinned: !!p.pinned, lit: !unlit(p) })),
          { reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches, onFrame: layout },
        );
      } catch {
        onFail();
        return;
      }
      systemRef.current = system;
      const i = HOOPS.findIndex(h => h.topic === activeRef.current);
      system.setDimmed(i < 0 ? null : i);

      const size = () => system.resize(wrap.clientWidth, wrap.clientHeight);
      size();
      const ro = new ResizeObserver(size);
      ro.observe(wrap);
      const io = new IntersectionObserver(([e]) => (e.isIntersecting ? system.start() : system.stop()));
      io.observe(wrap);

      // Drag turns the instrument; a press that barely moves is a click.
      let down: { x: number; y: number; lx: number; ly: number; dragged: boolean } | null = null;
      const local = (e: PointerEvent) => {
        const r = wrap.getBoundingClientRect();
        // ScaleWrapper may shrink the page; map back to canvas pixels.
        return { x: (e.clientX - r.left) * (wrap.clientWidth / r.width), y: (e.clientY - r.top) * (wrap.clientHeight / r.height) };
      };
      const hover = (id: string | null) => {
        if (id === hoveredRef.current) return;
        hoveredRef.current = id;
        system.setHovered(id);
        const post = id ? posts.find(p => p.id === id) ?? null : null;
        setHovered(post);
      };
      const onDown = (e: PointerEvent) => {
        const p = local(e);
        down = { x: p.x, y: p.y, lx: p.x, ly: p.y, dragged: false };
        wrap.setPointerCapture(e.pointerId);
      };
      const onMove = (e: PointerEvent) => {
        const p = local(e);
        if (down) {
          if (!down.dragged && Math.hypot(p.x - down.x, p.y - down.y) > 4) {
            down.dragged = true;
            system.setDragging(true);
            hover(null);
            wrap.style.cursor = 'grabbing';
          }
          if (down.dragged) system.dragBy(p.x - down.lx, p.y - down.ly);
          down.lx = p.x; down.ly = p.y;
          return;
        }
        const id = system.pick(p.x, p.y);
        const post = id ? posts.find(q => q.id === id) : null;
        const blocked = post && activeRef.current !== null && post.topic !== activeRef.current;
        hover(blocked ? null : id);
        wrap.style.cursor = id && !blocked ? 'pointer' : 'grab';
      };
      const onUp = (e: PointerEvent) => {
        if (down && !down.dragged) {
          const p = local(e);
          const id = system.pick(p.x, p.y);
          const post = id ? posts.find(q => q.id === id) : null;
          if (post && !(activeRef.current !== null && post.topic !== activeRef.current)) router.push(post.link ?? `/journal/${post.slug}`);
        }
        if (down?.dragged) { system.setDragging(false); wrap.style.cursor = 'grab'; }
        down = null;
      };
      const onLeave = () => { if (!down) hover(null); };
      wrap.addEventListener('pointerdown', onDown);
      wrap.addEventListener('pointermove', onMove);
      wrap.addEventListener('pointerup', onUp);
      wrap.addEventListener('pointercancel', onUp);
      wrap.addEventListener('pointerleave', onLeave);

      cleanup = () => {
        wrap.removeEventListener('pointerdown', onDown);
        wrap.removeEventListener('pointermove', onMove);
        wrap.removeEventListener('pointerup', onUp);
        wrap.removeEventListener('pointercancel', onUp);
        wrap.removeEventListener('pointerleave', onLeave);
        ro.disconnect(); io.disconnect(); system.dispose(); systemRef.current = null;
      };
    });

    return () => { cancelled = true; cleanup(); };
    // The scene is built once; hover and filter reach it through refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%', height: '100%', cursor: 'grab', touchAction: 'pan-y', userSelect: 'none' }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }} />

      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {HOOPS.map((h, i) => {
          const t = topics[h.topic];
          if (!t) return null;
          return (
            <div key={h.topic} ref={el => { hoopRefs.current[i] = el; }}
              style={{ position: 'absolute', left: 0, top: 0, whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 4, color: t.color, opacity: activeTopicId && activeTopicId !== h.topic ? 0.2 : 0.8, transition: 'opacity .3s' }}>
              {t.glyph} {t.name.toUpperCase()} {t.glyph}
            </div>
          );
        })}

        {posts.map(post => {
          const off = unlit(post);
          const isHovered = hovered?.id === post.id;
          return (
            <div key={post.id} ref={el => { if (el) labelRefs.current.set(post.id, el); else labelRefs.current.delete(post.id); }}
              style={{ position: 'absolute', left: 0, top: 0, whiteSpace: 'nowrap', transition: 'opacity .3s' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontStyle: post.pinned ? 'italic' : 'normal', fontSize: post.pinned ? 16 : 13.5, fontWeight: post.pinned ? 500 : 400, color: off ? 'var(--ink-faint)' : isHovered ? '#fff' : 'var(--ink)', lineHeight: 1.25 }}>
                {post.title}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 2, color: 'var(--ink-faint)', opacity: off ? 0.7 : 1, marginTop: 3 }}>
                {metaLine(post)}
              </div>
            </div>
          );
        })}

        <div style={{ position: 'absolute', right: 24, bottom: 8, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 2, color: 'var(--ink-faint)', opacity: 0.6 }}>
          DRAG TO TURN
        </div>
      </div>
    </div>
  );
}
