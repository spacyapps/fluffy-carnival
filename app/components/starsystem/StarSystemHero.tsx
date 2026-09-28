'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Nav from '../boutique/Nav';
import Stars from '../boutique/Stars';
import BigPlanet from '../boutique/BigPlanet';
import ContactLink from '../boutique/ContactLink';
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

const REEL_SECONDS = { system: 8, stop: 6.5 };
const JOURNAL_ID = 'journal';
const CONTACT_ID = 'contact';

type Chapter = { id: string | null; label: string };

export default function StarSystemHero({ missions, latest }: { missions: MissionStop[]; latest: JournalStop }) {
  const router = useRouter();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const systemRef = useRef<StarSystem | null>(null);
  const labelRefs = useRef(new Map<string, HTMLElement>());
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [chapter, setChapter] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hovering, setHovering] = useState(false);

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
              el.style.pointerEvents = p.visible ? '' : 'none';
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
      // Only spend frames while the hero is on screen.
      const io = new IntersectionObserver(([e]) => (e.isIntersecting ? system.start() : system.stop()));
      io.observe(wrap);
      setReady(true);
      cleanup = () => { ro.disconnect(); io.disconnect(); system.dispose(); systemRef.current = null; };
    });

    return () => { disposed = true; cleanup(); };
  }, [missions]);

  useEffect(() => { systemRef.current?.setFocus(current.id); }, [current.id, ready]);

  // The reel: advance on a timer while playing, and hold while the pointer
  // is on a label or the caption.
  useEffect(() => {
    if (!playing || hovering || !ready) return;
    const t = setTimeout(() => setChapter(c => (c + 1) % chapters.length), seconds * 1000);
    return () => clearTimeout(t);
  }, [playing, hovering, ready, chapter, seconds, chapters.length]);

  const goTo = (i: number) => { setChapter(i); setPlaying(false); };
  const goToId = (id: string) => {
    const i = chapters.findIndex(c => c.id === id);
    if (i >= 0) goTo(i);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const wrap = wrapRef.current, system = systemRef.current;
    if (!wrap || !system) return;
    const r = wrap.getBoundingClientRect();
    const sx = r.width / wrap.clientWidth || 1;
    const x = (e.clientX - r.left) / sx, y = (e.clientY - r.top) / sx;
    system.setPointer((x / wrap.clientWidth) * 2 - 1, (y / wrap.clientHeight) * 2 - 1);
    if (canvasRef.current) canvasRef.current.style.cursor = system.pick(x, y) ? 'pointer' : '';
  };

  const onCanvasClick = (e: React.MouseEvent) => {
    const wrap = wrapRef.current, system = systemRef.current;
    if (!wrap || !system) return;
    const r = wrap.getBoundingClientRect();
    const sx = r.width / wrap.clientWidth || 1;
    const id = system.pick((e.clientX - r.left) / sx, (e.clientY - r.top) / sx);
    if (!id) return;
    // First click flies there; a click on the body already in frame opens it.
    if (id === current.id) {
      const href = hrefFor(id);
      if (href) open(href);
    } else goToId(id);
  };

  const hrefFor = (id: string): string | null => {
    if (id === JOURNAL_ID) return '/journal';
    if (id === CONTACT_ID) return `mailto:${['spacyapps', 'gmail.com'].join('@')}`;
    return missions.find(m => m.slug === id)?.href ?? null;
  };
  const open = (href: string) => {
    if (href.startsWith('mailto:')) window.location.href = href;
    else router.push(href);
  };

  const liveCount = missions.filter(m => m.phase === 'live').length;

  return (
    <section
      className="bo-hero"
      style={{ position: 'relative', height: 900, overflow: 'hidden', background: '#07090c' }}
    >
      <div
        ref={wrapRef}
        onPointerMove={onPointerMove}
        style={{ position: 'absolute', inset: 0 }}
      >
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
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: ready ? 1 : 0, transition: 'opacity 1.2s ease 0.6s' }}>
            {[...missions.map(m => ({ id: m.slug, text: m.name, phase: m.phase as string })), { id: JOURNAL_ID, text: 'The Journal', phase: 'journal' }, { id: CONTACT_ID, text: 'Contact', phase: 'contact' }].map(l => {
              const active = current.id === l.id;
              const href = hrefFor(l.id);
              const dot = l.phase === 'live' ? 'var(--accent)' : l.phase === 'in-play' ? 'var(--accent-2)' : l.phase === 'journal' ? 'var(--accent-2)' : 'var(--accent)';
              const inner = (
                <>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot, boxShadow: `0 0 8px ${dot}`, animation: l.phase === 'live' || l.phase === 'contact' ? 'bo-pulse 2.4s ease-in-out infinite' : undefined }} />
                  {l.text.toUpperCase()}
                </>
              );
              const style: React.CSSProperties = {
                position: 'absolute', left: 0, top: 0,
                display: 'inline-flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap',
                padding: '5px 10px', borderRadius: 999,
                fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: 2,
                color: active ? 'var(--ink)' : 'var(--ink-dim)',
                background: active ? 'rgba(14,16,20,0.55)' : 'transparent',
                border: `1px solid ${active ? 'var(--line)' : 'transparent'}`,
                backdropFilter: active ? 'blur(6px)' : undefined,
                textDecoration: 'none', pointerEvents: 'auto',
                transition: 'color .4s, background .4s, border-color .4s, opacity .4s',
                willChange: 'transform',
              };
              const register = (el: HTMLElement | null) => { if (el) labelRefs.current.set(l.id, el); else labelRefs.current.delete(l.id); };
              const hover = { onMouseEnter: () => setHovering(true), onMouseLeave: () => setHovering(false) };
              if (!href) return <span key={l.id} ref={register} style={style} {...hover}>{inner}</span>;
              if (href.startsWith('mailto:')) return <a key={l.id} ref={register} href={href} style={style} {...hover}>{inner}</a>;
              return <Link key={l.id} ref={register} href={href} style={style} {...hover}>{inner}</Link>;
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

      {/* Headline, lower left */}
      <div style={{ position: 'absolute', left: 56, bottom: 128, zIndex: 3, maxWidth: 520, pointerEvents: 'none' }}>
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
          position: 'absolute', right: 56, bottom: 128, zIndex: 3, width: 340,
          padding: '22px 24px 20px',
          background: 'rgba(14,16,20,0.52)', border: '1px solid var(--line)', borderRadius: 14,
          backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
          animation: 'bo-fadein .7s ease-out both',
        }}
      >
        <Caption
          chapter={current}
          index={chapter}
          missions={missions}
          latest={latest}
          liveCount={liveCount}
        />
      </div>

      {/* Reel chapters */}
      <div style={{ position: 'absolute', left: 56, right: 56, bottom: 40, zIndex: 3, display: 'flex', alignItems: 'center', gap: 18 }}>
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
                    key={on ? `${chapter}-${playing}-${hovering}` : 'off'}
                    style={{
                      height: '100%',
                      width: on ? undefined : i < chapter ? '100%' : '0%',
                      background: on ? 'var(--accent)' : 'rgba(236,230,214,0.3)',
                      animation: on && playing && !hovering ? `ss-progress ${seconds}s linear both` : undefined,
                      ...(on && !(playing && !hovering) ? { width: '100%', opacity: 0.6 } : {}),
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
    </section>
  );
}

function Caption({ chapter, index, missions, latest, liveCount }: {
  chapter: Chapter; index: number; missions: MissionStop[]; latest: JournalStop; liveCount: number;
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
          {`${liveCount} live worlds, ${missions.length - liveCount} still forming. A journal on a long orbit, and a relay that's always listening.`}
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
          Latest, {latest.date}: <Link href={latest.href} className="bo-link" style={{ color: 'var(--ink)' }}>{latest.title}</Link>
        </p>
        <Link href="/journal" className="bo-link" style={cta}>Explore the journal star map →</Link>
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
        <span style={{ color: live ? 'var(--accent)' : 'var(--accent-2)' }}>{live ? '● Live' : '◌ In play'}</span>
        {' '}· {m.platform}{m.version !== '—' && ` v${m.version}`}
      </div>
      <h2 style={title}>{m.name}</h2>
      <p style={body}>{m.tagline}</p>
      {m.href
        ? <Link href={m.href} className="bo-link" style={cta}>{live ? 'Open the briefing →' : 'Read the flight plan →'}</Link>
        : <span style={{ ...cta, color: 'var(--ink-faint)' }}>In development…</span>}
    </>
  );
}
