'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Nav from '../boutique/Nav';
import Stars from '../boutique/Stars';
import BigPlanet from '../boutique/BigPlanet';
import ContactLink from '../boutique/ContactLink';
import { depart } from './DepartureVeil';
import type { BodySpec, StarSystem } from './scene';

export interface MissionStop {
  slug: string;
  name: string;
  color: string;
  phase: 'live' | 'in-play';
  platform: string;
  version: string;
  tagline: string;
  href: string | null;
}

export interface JournalStop {
  title: string;
  date: string;
  href: string;
}

// How each mission is drawn. Orbits run in APPS order, inner to outer.
// slug -> look (why)
const LOOKS: Record<string, Pick<BodySpec, 'surface' | 'radius' | 'orbit' | 'rings' | 'moon'>> = {
  'secret-stuff':   { surface: 'ocean',  radius: 0.72, orbit: 7.5 },               // inhabited world: its lights show on the night side
  'ground-control': { surface: 'gas',    radius: 1.3,  orbit: 11.5, rings: true }, // the big ringed one: mission control
  'checkpoint':     { surface: 'ocean',  radius: 0.58, orbit: 15.5 },              // small, settled, live
  'tsukibase':      { surface: 'molten', radius: 0.85, orbit: 19.5, moon: true },  // still forming; LunarArray is its moon
  'conduit':        { surface: 'molten', radius: 0.62, orbit: 30 },                // past the belt, still forming
};

// What each phase is called on screen.
// phase -> words (why)
const PHASE_LABEL = {
  'live':   'Live',               // released and in people's hands
  'in-play': 'Under construction', // being built; the scaffold in the scene says the same
} as const;

const REEL_SECONDS = { system: 8, stop: 6.5 };
const HERO_HEIGHT = 900;
const JOURNAL_ID = 'journal';
const CONTACT_ID = 'contact';
const MIST = '#9bb5c9';
const PEACH = '#e8a87c';
const GREEN = 'var(--live)'; // live signal: soft phosphor green, muted to sit beside peach and mist

type Chapter = { id: string | null; label: string };

// A plain left click is ours to animate; anything with a modifier (new tab,
// new window) is left to the browser.
const plainClick = (e: React.MouseEvent) => e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;

export default function StarSystemHero({ missions, latest }: { missions: MissionStop[]; latest: JournalStop }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const systemRef = useRef<StarSystem | null>(null);
  const labelRefs = useRef(new Map<string, HTMLElement>());
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [chapter, setChapter] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hovering, setHovering] = useState(false);
  const [away, setAway] = useState(false);

  const chapters: Chapter[] = [
    { id: null, label: 'System' },
    ...missions.map(m => ({ id: m.slug, label: m.name })),
    { id: JOURNAL_ID, label: 'Journal' },
    { id: CONTACT_ID, label: 'Contact' },
  ];
  const current = chapters[chapter];
  const seconds = current.id ? REEL_SECONDS.stop : REEL_SECONDS.system;

  // Build the scene once. three.js is loaded only here, in the browser.
  useEffect(() => {
    const canvas = canvasRef.current, wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    let disposed = false;
    let cleanup = () => {};
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    import('./scene').then(({ createStarSystem }) => {
      if (disposed) return;
      const specs: BodySpec[] = [
        ...missions.map((m, i) => ({
          id: m.slug, kind: 'mission' as const, color: m.color, phase: m.phase,
          ...(LOOKS[m.slug] ?? { surface: m.phase === 'live' ? 'ocean' as const : 'molten' as const, radius: 0.6, orbit: 7.5 + i * 4 }),
        })),
        { id: JOURNAL_ID, kind: 'journal' },
        { id: CONTACT_ID, kind: 'contact', orbit: 36 },
      ];
      let system: StarSystem;
      try {
        system = createStarSystem(canvas, specs, {
          reducedMotion: reduced,
          onFrame(points) {
            for (const p of points) {
              const el = labelRefs.current.get(p.id);
              if (!el) continue;
              el.style.transform = `translate3d(${p.x.toFixed(1)}px, ${(p.y - p.r - 10).toFixed(1)}px, 0) translate(-50%, -100%)`;
              el.style.opacity = p.visible ? '' : '0';
              el.style.pointerEvents = p.visible ? 'auto' : 'none';
            }
          },
        });
      } catch {
        setFailed(true);
        return;
      }
      systemRef.current = system;
      if (reduced) setPlaying(false);
      const size = () => system.resize(wrap.clientWidth, wrap.clientHeight);
      size();
      const ro = new ResizeObserver(size);
      ro.observe(wrap);

      // Frames are spent only while the hero can be seen: on screen, and not
      // yet covered by the page sliding up over it.
      let inView = true, covered = false;
      const run = () => (inView && !covered ? system.start() : system.stop());
      const io = new IntersectionObserver(([e]) => { inView = e.isIntersecting; run(); });
      io.observe(wrap);

      // Scroll: the camera pulls back and rises, the type drifts up and out.
      let queued = false;
      const onScroll = () => {
        if (queued) return;
        queued = true;
        requestAnimationFrame(() => {
          queued = false;
          const p = Math.min(1, Math.max(0, window.scrollY / HERO_HEIGHT));
          system.setScroll(p);
          if (overlayRef.current) {
            overlayRef.current.style.transform = `translate3d(0, ${(-p * 110).toFixed(1)}px, 0)`;
            overlayRef.current.style.opacity = String(Math.max(0, 1 - p * 1.7));
          }
          if (labelsRef.current) labelsRef.current.style.opacity = String(Math.max(0, 1 - p * 2.2));
          const nowCovered = p >= 1;
          if (nowCovered !== covered) { covered = nowCovered; run(); }
          setAway(p > 0.35);
        });
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();

      setReady(true);
      cleanup = () => {
        window.removeEventListener('scroll', onScroll);
        ro.disconnect(); io.disconnect(); system.dispose(); systemRef.current = null;
      };
    });

    return () => { disposed = true; cleanup(); };
  }, [missions]);

  useEffect(() => { systemRef.current?.setFocus(current.id); }, [current.id, ready]);

  // The reel: advance on a timer while playing, and hold while the pointer
  // is on a label or the caption, or the hero is scrolled away.
  const rolling = playing && !hovering && !away && ready;
  useEffect(() => {
    if (!rolling) return;
    const t = setTimeout(() => setChapter(c => (c + 1) % chapters.length), seconds * 1000);
    return () => clearTimeout(t);
  }, [rolling, chapter, seconds, chapters.length]);

  const goTo = (i: number) => { setChapter(i); setPlaying(false); };

  const hrefFor = (id: string): string | null => {
    if (id === JOURNAL_ID) return '/journal';
    if (id === CONTACT_ID) return `mailto:${['spacyapps', 'gmail.com'].join('@')}`;
    return missions.find(m => m.slug === id)?.href ?? null;
  };

  // Tapping a body, its label or a caption link: the camera dives at it and
  // the veil carries the visitor to its page.
  const travel = (id: string, x: number, y: number, hrefOverride?: string, labelOverride?: string) => {
    const href = hrefOverride ?? hrefFor(id);
    const i = chapters.findIndex(c => c.id === id);
    if (i >= 0) goTo(i);
    if (!href) return;
    if (href.startsWith('mailto:')) { window.location.assign(href); return; }
    systemRef.current?.dive(id);
    const m = missions.find(x => x.slug === id);
    depart({
      href, x, y,
      color: m ? m.color : MIST,
      label: labelOverride ?? (m ? m.name : 'The Journal'),
      kicker: m ? `Approaching · Mission ${String(i).padStart(2, '0')} · ${PHASE_LABEL[m.phase]}` : 'Approaching · The Journal',
    });
  };
  const travelOnClick = (id: string, hrefOverride?: string, labelOverride?: string) => (e: React.MouseEvent) => {
    if (!plainClick(e)) return;
    e.preventDefault();
    travel(id, e.clientX, e.clientY, hrefOverride, labelOverride);
  };

  const localPoint = (e: React.MouseEvent | React.PointerEvent) => {
    const wrap = wrapRef.current!;
    const r = wrap.getBoundingClientRect();
    const sx = r.width / wrap.clientWidth || 1;
    return { x: (e.clientX - r.left) / sx, y: (e.clientY - r.top) / sx, w: wrap.clientWidth, h: wrap.clientHeight };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const system = systemRef.current;
    if (!wrapRef.current || !system) return;
    const { x, y, w, h } = localPoint(e);
    system.setPointer((x / w) * 2 - 1, (y / h) * 2 - 1);
    if (canvasRef.current) canvasRef.current.style.cursor = system.pick(x, y) ? 'pointer' : '';
  };

  const onCanvasClick = (e: React.MouseEvent) => {
    const system = systemRef.current;
    if (!wrapRef.current || !system) return;
    const { x, y } = localPoint(e);
    const id = system.pick(x, y);
    if (id) travel(id, e.clientX, e.clientY);
  };

  const liveCount = missions.filter(m => m.phase === 'live').length;
  const labels = [
    ...missions.map(m => ({ id: m.slug, text: m.name, kind: m.phase as string })),
    { id: JOURNAL_ID, text: 'The Journal', kind: 'journal' },
    { id: CONTACT_ID, text: 'Contact', kind: 'contact' },
  ];

  return (
    <section
      className="bo-hero"
      style={{ position: 'sticky', top: 0, zIndex: 0, height: HERO_HEIGHT, overflow: 'hidden', background: '#07090c' }}
    >
      <div ref={wrapRef} onPointerMove={onPointerMove} style={{ position: 'absolute', inset: 0 }}>
        {failed ? (
          <>
            <Stars density={100} />
            <div style={{ position: 'absolute', top: 130, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
              <BigPlanet size={400} />
            </div>
          </>
        ) : (
          <canvas
            ref={canvasRef}
            onClick={onCanvasClick}
            aria-hidden="true"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', opacity: ready ? 1 : 0, transition: 'opacity 1.6s ease' }}
          />
        )}

        {/* Labels ride on their bodies; the scene moves them every frame. */}
        {!failed && (
          <div ref={labelsRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: ready ? 1 : 0, transition: 'opacity 1.2s ease 0.6s' }}>
            {labels.map(l => {
              const active = current.id === l.id;
              const href = hrefFor(l.id);
              const building = l.kind === 'in-play';
              const dot = l.kind === 'live' ? GREEN : building || l.kind === 'journal' ? MIST : PEACH;
              const style: React.CSSProperties = {
                position: 'absolute', left: 0, top: 0,
                display: 'inline-flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap',
                padding: '6px 11px 6px 10px', borderRadius: 999,
                fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: 2,
                color: active ? 'var(--ink)' : 'rgba(236,230,214,0.82)',
                background: active ? 'rgba(10,12,16,0.78)' : 'rgba(10,12,16,0.58)',
                border: `1px solid ${active ? 'rgba(232,168,124,0.45)' : 'rgba(236,230,214,0.14)'}`,
                boxShadow: '0 4px 18px rgba(0,0,0,0.45)',
                backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
                textDecoration: 'none', pointerEvents: 'auto',
                transition: 'color .4s, background .4s, border-color .4s, opacity .4s',
                willChange: 'transform',
              };
              const inner = (
                <>
                  {building ? (
                    <span style={{ width: 7, height: 7, borderRadius: '50%', border: `1px dashed ${dot}`, animation: 'jr-spin 6s linear infinite' }} />
                  ) : (
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot, boxShadow: `0 0 8px ${dot}`, animation: 'bo-pulse 2.4s ease-in-out infinite' }} />
                  )}
                  {l.text.toUpperCase()}
                  {(l.kind === 'live' || building) && (
                    <span
                      style={{
                        fontSize: 8.5, letterSpacing: 1.5, padding: '2px 6px', borderRadius: 4,
                        color: building ? '#0e1014' : GREEN,
                        background: building ? `repeating-linear-gradient(-45deg, ${MIST} 0 5px, #c9d6e0 5px 10px)` : 'rgba(143,212,160,0.12)',
                        border: building ? 'none' : '1px solid rgba(143,212,160,0.3)',
                        fontWeight: 600,
                      }}
                    >
                      {building ? 'BUILDING' : 'LIVE'}
                    </span>
                  )}
                </>
              );
              const register = (el: HTMLElement | null) => { if (el) labelRefs.current.set(l.id, el); else labelRefs.current.delete(l.id); };
              const hover = { onMouseEnter: () => setHovering(true), onMouseLeave: () => setHovering(false) };
              if (!href) return <button key={l.id} ref={register} onClick={() => goTo(chapters.findIndex(c => c.id === l.id))} style={{ ...style, cursor: 'pointer' }} {...hover}>{inner}</button>;
              if (href.startsWith('mailto:')) return <a key={l.id} ref={register} href={href} style={style} {...hover}>{inner}</a>;
              return <Link key={l.id} ref={register} href={href} onClick={travelOnClick(l.id)} style={style} {...hover}>{inner}</Link>;
            })}
          </div>
        )}
      </div>

      {/* Top and bottom falloff: the nav stays legible, and the hero melts into the page. */}
      <div style={{ position: 'absolute', inset: '0 0 auto 0', height: 180, background: 'linear-gradient(#07090c, rgba(7,9,12,0))', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 'auto 0 0 0', height: 320, background: 'linear-gradient(rgba(14,16,20,0), var(--bg))', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', padding: '24px 56px 0', zIndex: 3 }}>
        <Nav />
      </div>

      <div ref={overlayRef} style={{ position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none', willChange: 'transform, opacity' }}>
        {/* Headline, lower left */}
        <div style={{ position: 'absolute', left: 56, bottom: 128, maxWidth: 520 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 3, color: 'var(--accent)', marginBottom: 18 }}>
            A ONE-PERSON STUDIO · IN ORBIT SINCE MMX
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 84, margin: 0, letterSpacing: -2.6, lineHeight: 0.92, color: 'var(--ink)', textShadow: '0 2px 30px rgba(7,9,12,0.8)' }}>
            Small missions,<br />
            <span style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--accent)' }}>far-flung</span> ideas.
          </h1>
        </div>

        {/* Lower third: what the camera is looking at */}
        <div
          key={chapter}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          style={{
            position: 'absolute', right: 56, bottom: 128, width: 372, pointerEvents: 'auto',
            padding: '22px 24px 20px',
            background: 'rgba(14,16,20,0.56)', border: '1px solid var(--line)', borderRadius: 14,
            backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
            animation: 'bo-fadein .7s ease-out both',
          }}
        >
          <Caption chapter={current} index={chapter} missions={missions} latest={latest} liveCount={liveCount} travelOnClick={travelOnClick} />
        </div>

        {/* Reel chapters */}
        <div style={{ position: 'absolute', left: 56, right: 56, bottom: 40, display: 'flex', alignItems: 'center', gap: 18, pointerEvents: 'auto' }}>
          <button
            onClick={() => setPlaying(p => !p)}
            aria-label={playing ? 'Pause the tour' : 'Play the tour'}
            style={{ flex: 'none', width: 30, height: 30, borderRadius: '50%', border: '1px solid var(--line)', background: 'rgba(14,16,20,0.5)', color: 'var(--ink-dim)', cursor: 'pointer', display: 'grid', placeItems: 'center', padding: 0 }}
          >
            {playing ? (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><rect x="1.5" y="1" width="2.4" height="8" /><rect x="6.1" y="1" width="2.4" height="8" /></svg>
            ) : (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M2 1 L9 5 L2 9 Z" /></svg>
            )}
          </button>
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: `repeat(${chapters.length}, 1fr)`, gap: 8 }}>
            {chapters.map((c, i) => {
              const on = i === chapter;
              return (
                <button
                  key={c.label}
                  onClick={() => goTo(i)}
                  style={{ background: 'none', border: 'none', padding: '10px 0 0', cursor: 'pointer', textAlign: 'left', position: 'relative' }}
                >
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, borderRadius: 2, background: 'var(--line)', overflow: 'hidden' }}>
                    <div
                      key={on ? `${chapter}-${rolling}` : 'off'}
                      style={{
                        height: '100%',
                        width: on ? undefined : i < chapter ? '100%' : '0%',
                        background: on ? 'var(--accent)' : 'rgba(236,230,214,0.3)',
                        animation: on && rolling ? `ss-progress ${seconds}s linear both` : undefined,
                        ...(on && !rolling ? { width: '100%', opacity: 0.6 } : {}),
                      }}
                    />
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: 1.6, color: on ? 'var(--ink)' : 'var(--ink-faint)', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', transition: 'color .3s' }}>
                    {c.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function Caption({ chapter, index, missions, latest, liveCount, travelOnClick }: {
  chapter: Chapter; index: number; missions: MissionStop[]; latest: JournalStop; liveCount: number;
  travelOnClick: (id: string, href?: string, label?: string) => (e: React.MouseEvent) => void;
}) {
  const kicker: React.CSSProperties = { fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: 2.2, color: 'var(--ink-faint)', marginBottom: 12, textTransform: 'uppercase' };
  const title: React.CSSProperties = { fontFamily: 'var(--font-serif)', fontSize: 36, fontWeight: 300, letterSpacing: -0.8, lineHeight: 1.02, margin: '0 0 10px', color: 'var(--ink)' };
  const body: React.CSSProperties = { fontSize: 14, lineHeight: 1.6, color: 'var(--ink-dim)', fontWeight: 300, margin: '0 0 16px', fontFamily: 'var(--font-body)' };
  const cta: React.CSSProperties = { fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 15.5, color: 'var(--accent)', textDecoration: 'none' };

  if (chapter.id === null) {
    return (
      <>
        <div style={kicker}>System overview</div>
        <h2 style={title}>The <span style={{ fontStyle: 'italic' }}>SpacyApps</span> system.</h2>
        <p style={body}>
          {`${liveCount} worlds live, ${missions.length - liveCount} under construction. A journal on a long orbit, and a relay that's always listening.`}
        </p>
        <Link href="#missions" className="bo-link" style={cta}>Tour the missions →</Link>
      </>
    );
  }

  if (chapter.id === JOURNAL_ID) {
    return (
      <>
        <div style={kicker}><span style={{ color: 'var(--accent-2)' }}>●</span>&nbsp; The Journal · long orbit</div>
        <h2 style={title}>Filed from <span style={{ fontStyle: 'italic', color: 'var(--accent-2)' }}>orbit.</span></h2>
        <p style={body}>
          Latest, {latest.date}:{' '}
          <Link href={latest.href} onClick={travelOnClick(JOURNAL_ID, latest.href, latest.title)} className="bo-link" style={{ color: 'var(--ink)' }}>{latest.title}</Link>
        </p>
        <Link href="/journal" onClick={travelOnClick(JOURNAL_ID)} className="bo-link" style={cta}>Explore the journal star map →</Link>
      </>
    );
  }

  if (chapter.id === CONTACT_ID) {
    return (
      <>
        <div style={kicker}><span style={{ color: 'var(--accent)' }}>●</span>&nbsp; Contact · channel open</div>
        <h2 style={title}><span style={{ fontStyle: 'italic' }}>Transmissions</span> open.</h2>
        <p style={{ ...body, marginBottom: 14 }}>Questions, ideas, or just saying hello —</p>
        <ContactLink />
        <div style={{ marginTop: 14, display: 'flex', gap: 18, fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 1.6 }}>
          <a href="https://www.instagram.com/spacyappsofficial" target="_blank" rel="noopener noreferrer" className="bo-link" style={{ color: 'var(--ink-faint)' }}>@spacyappsofficial</a>
          <a href="https://x.com/spacyapps" target="_blank" rel="noopener noreferrer" className="bo-link" style={{ color: 'var(--ink-faint)' }}>@spacyapps</a>
        </div>
      </>
    );
  }

  const m = missions.find(x => x.slug === chapter.id)!;
  const live = m.phase === 'live';
  return (
    <>
      <div style={kicker}>
        Mission {String(index).padStart(2, '0')} ·{' '}
        <span style={{ color: live ? GREEN : 'var(--accent-2)' }}>{live ? '●' : '◌'} {PHASE_LABEL[m.phase]}</span>
        {' '}· {m.platform}{m.version !== '—' && ` v${m.version}`}
      </div>
      <h2 style={title}>{m.name}</h2>
      <p style={body}>{m.tagline}</p>
      {m.href
        ? <Link href={m.href} onClick={travelOnClick(m.slug)} className="bo-link" style={cta}>{live ? 'Open the briefing →' : 'See the construction site →'}</Link>
        : <span style={{ ...cta, color: 'var(--ink-faint)' }}>Plans still on the drawing board…</span>}
    </>
  );
}
