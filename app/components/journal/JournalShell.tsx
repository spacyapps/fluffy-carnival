'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Stars from '../boutique/Stars';
import Logotype from '../boutique/Logotype';
import { POSTS, type Post, type Topic } from '../../data/journal';
import RefineLoopSVG from './RefineLoopSVG';
import HumanEdgeSVG from './HumanEdgeSVG';
import CommentContextSVG from './CommentContextSVG';
import SonarCommentSVG from './SonarCommentSVG';
import Lounge from './Lounge';

// ── useIsMobile ───────────────────────────────────────────────────────────────
function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    setMobile(mq.matches);
    const h = (e: MediaQueryListEvent) => setMobile(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);
  return mobile;
}

// ── Flourish ─────────────────────────────────────────────────────────────────
function Flourish({ glyph, color }: { glyph: string; color: string }) {
  if (glyph === 'orbit') return (
    <svg width="200" height="48" viewBox="0 0 200 48" style={{ display: 'block' }}>
      <ellipse cx="100" cy="24" rx="72" ry="14" fill="none" stroke={color} strokeOpacity="0.4" strokeWidth="1" />
      <ellipse cx="100" cy="24" rx="72" ry="14" fill="none" stroke={color} strokeOpacity="0.6" strokeWidth="1" strokeDasharray="1 6" />
      <circle cx="100" cy="24" r="4" fill={color} />
      <circle cx="172" cy="24" r="2.5" fill={color} opacity="0.7" />
      <circle cx="28"  cy="24" r="2.5" fill={color} opacity="0.4" />
    </svg>
  );
  if (glyph === 'star') return (
    <svg width="200" height="32" viewBox="0 0 200 32" style={{ display: 'block' }}>
      <line x1="0" y1="16" x2="80" y2="16" stroke={color} strokeOpacity="0.3" strokeWidth="1" />
      <line x1="120" y1="16" x2="200" y2="16" stroke={color} strokeOpacity="0.3" strokeWidth="1" />
      <g transform="translate(100 16)">
        <path d="M 0 -10 L 2.5 -2.5 L 10 0 L 2.5 2.5 L 0 10 L -2.5 2.5 L -10 0 L -2.5 -2.5 Z" fill={color} />
      </g>
    </svg>
  );
  return (
    <svg width="200" height="20" viewBox="0 0 200 20" style={{ display: 'block' }}>
      <line x1="0" y1="10" x2="88" y2="10" stroke={color} strokeOpacity="0.3" strokeWidth="1" />
      <line x1="112" y1="10" x2="200" y2="10" stroke={color} strokeOpacity="0.3" strokeWidth="1" />
      <rect x="94" y="6" width="12" height="8" rx="1" transform="rotate(45 100 10)" fill="none" stroke={color} strokeOpacity="0.7" strokeWidth="1.2" />
    </svg>
  );
}

// ── TopicSeal ────────────────────────────────────────────────────────────────
export function TopicSeal({ topic, size = 88 }: { topic: Topic; size?: number }) {
  const c = topic.color;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: 'block' }}>
      <defs>
        <radialGradient id={`seal-${topic.id}`} cx="0.4" cy="0.35">
          <stop offset="0" stopColor={c} stopOpacity="0.9" />
          <stop offset="0.6" stopColor={c} />
          <stop offset="1" stopColor={c} stopOpacity="0.3" />
        </radialGradient>
      </defs>
      <g style={{ animation: 'jr-spin 60s linear infinite', transformOrigin: '50px 50px' }}>
        <ellipse cx="50" cy="50" rx="46" ry="14" fill="none" stroke={c} strokeOpacity="0.3" strokeWidth="0.8" transform="rotate(-25 50 50)" />
        <ellipse cx="50" cy="50" rx="46" ry="14" fill="none" stroke={c} strokeOpacity="0.7" strokeWidth="0.8" strokeDasharray="0.5 3" transform="rotate(-25 50 50)" />
      </g>
      <circle cx="50" cy="50" r="22" fill={`url(#seal-${topic.id})`} />
      <circle cx="42" cy="42" r="6" fill="rgba(255,255,255,0.2)" />
      <text x="50" y="56" textAnchor="middle" fontFamily="var(--font-serif)" fontStyle="italic" fontSize="16" fontWeight="500" fill="#fff" opacity="0.92">
        {topic.glyph}
      </text>
    </svg>
  );
}

// ── PanelSlider ───────────────────────────────────────────────────────────────
function PanelSlider({ panels, color }: { panels: { heading: string; rows: { label: string; note: string }[] }[]; color: string }) {
  const [active, setActive] = useState(0);
  return (
    <div style={{ margin: '32px 0 40px', border: '1px solid var(--line)', borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ display: 'flex', borderBottom: '1px solid var(--line)', background: 'var(--surface)' }}>
        {panels.map((panel, pi) => (
          <button key={pi} onClick={() => setActive(pi)} style={{
            flex: 1,
            padding: '10px 16px',
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: 2.5,
            background: 'none',
            border: 'none',
            borderBottom: active === pi ? `2px solid ${color}` : '2px solid transparent',
            color: active === pi ? color : 'var(--ink-faint)',
            cursor: 'pointer',
            transition: 'color 0.2s, border-color 0.2s',
          }}>
            {panel.heading.toUpperCase()}
          </button>
        ))}
      </div>
      <div style={{ overflow: 'hidden' }}>
        {panels[active].rows.map((row, ri) => (
          <div key={ri} style={{
            display: 'grid',
            gridTemplateColumns: '160px 1fr',
            gap: 16,
            padding: '11px 20px',
            borderBottom: ri < panels[active].rows.length - 1 ? '1px solid var(--line)' : 'none',
            background: ri % 2 === 0 ? 'transparent' : 'var(--surface)',
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color, letterSpacing: 0.5, paddingTop: 2 }}>{row.label}</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-dim)', lineHeight: 1.6, fontWeight: 300 }}>{row.note}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── PostBody ─────────────────────────────────────────────────────────────────
export function PostBody({ blocks, topic }: { blocks: Post['body']; topic: Topic }) {
  const ink = 'var(--ink)';

  const elements: React.ReactNode[] = [];
  let i = 0;
  // Figures (diagrams, images, code, panels) rise into place as the reader
  // reaches them; prose stays put. ScrollFX drives data-reveal.
  const figure = (key: number, node: React.ReactNode) => <div key={key} data-reveal="">{node}</div>;

  while (i < blocks.length) {
    const b = blocks[i];

    if (b.kind === 'image' && b.src) {
      const next = blocks[i + 1];
      if (next?.kind === 'p') {
        elements.push(figure(i,
          <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', margin: '16px 0 36px' }}>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 17, lineHeight: 1.8, color: ink, fontWeight: 300, margin: 0, flex: '1 1 0' }}>{next.text}</p>
            <div style={{ flex: '0 0 260px', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--line)', background: 'rgba(236,230,214,0.04)' }}>
              <img src={b.src} alt="" style={{ display: 'block', width: '100%', height: 400, objectFit: 'contain' }} />
            </div>
          </div>
        ));
        i += 2;
        continue;
      }
      elements.push(figure(i,
        <div style={{ margin: '16px 0 36px', display: 'flex', justifyContent: b.maxWidth ? 'center' : undefined }}>
          <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid var(--line)', maxWidth: b.maxWidth ?? '100%', width: '100%' }}>
            <img src={b.src} alt="" style={{ display: 'block', width: '100%', height: 'auto' }} />
          </div>
        </div>
      ));
      i++;
      continue;
    }

    if (b.kind === 'lede') {
      const first = b.text![0];
      const rest = b.text!.slice(1);
      elements.push(
        <p key={i} style={{ fontFamily: 'var(--font-serif)', fontSize: 20, lineHeight: 1.75, color: ink, fontWeight: 300, margin: '0 0 28px' }}>
          <span style={{ float: 'left', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 88, lineHeight: 0.82, fontWeight: 400, color: topic.color, paddingRight: 14, paddingTop: 6 }}>{first}</span>
          {rest}
        </p>
      );
    } else if (b.kind === 'p') {
      elements.push(<p key={i} style={{ fontFamily: 'var(--font-serif)', fontSize: 19, lineHeight: 1.75, color: ink, fontWeight: 300, margin: '0 0 28px' }}>{b.text}</p>);
    } else if (b.kind === 'h') {
      elements.push(<h3 key={i} style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 28, fontWeight: 400, color: ink, letterSpacing: -0.4, margin: '52px 0 18px', lineHeight: 1.2 }}>{b.text}</h3>);
    } else if (b.kind === 'pull') {
      elements.push(
        <blockquote key={i} style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 26, fontWeight: 300, color: topic.color, lineHeight: 1.35, margin: '40px 0', padding: '0 0 0 28px', borderLeft: `2px solid ${topic.color}`, letterSpacing: -0.3 }}>
          &ldquo;{b.text}&rdquo;
        </blockquote>
      );
    } else if (b.kind === 'list') {
      elements.push(
        <ul key={i} style={{ margin: '0 0 28px', padding: '0 0 0 4px', listStyle: 'none' }}>
          {b.items!.map((item, j) => (
            <li key={j} style={{ fontFamily: 'var(--font-serif)', fontSize: 19, lineHeight: 1.7, color: ink, fontWeight: 300, margin: '0 0 12px', paddingLeft: 28, position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, top: '0.35em', color: topic.color, fontFamily: 'var(--font-mono)', fontSize: 12 }}>✦</span>
              {item}
            </li>
          ))}
        </ul>
      );
    } else if (b.kind === 'code') {
      elements.push(figure(i,
        <pre style={{ fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.7, color: ink, background: '#0a0c10', border: '1px solid var(--line)', borderRadius: 8, padding: '20px 22px', margin: '0 0 28px', overflowX: 'auto', whiteSpace: 'pre' }}>
          <div style={{ fontSize: 10, letterSpacing: 2, color: 'var(--ink-faint)', marginBottom: 12 }}>── {(b.lang || 'text').toUpperCase()} ──</div>
          {b.text}
        </pre>
      ));
    } else if (b.kind === 'animation' && b.name === 'refine-loop') {
      elements.push(figure(i, <RefineLoopSVG />));
    } else if (b.kind === 'animation' && b.name === 'human-edge') {
      elements.push(figure(i, <HumanEdgeSVG />));
    } else if (b.kind === 'animation' && b.name === 'comment-context') {
      elements.push(figure(i, <CommentContextSVG />));
    } else if (b.kind === 'animation' && b.name === 'sonar-comment') {
      elements.push(figure(i, <SonarCommentSVG />));
    } else if (b.kind === 'cols' && b.cols) {
      elements.push(figure(i,
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, margin: '28px 0 36px' }}>
          {b.cols.map((col, ci) => (
            <div key={ci} style={{ border: '1px solid var(--line)', borderRadius: 10, padding: '24px 28px', background: 'var(--surface)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 2.5, color: topic.color, marginBottom: 10 }}>{col.tag.toUpperCase()}</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 400, letterSpacing: -0.3, color: 'var(--ink)', marginBottom: 14 }}>{col.heading}</div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, lineHeight: 1.9, color: 'var(--ink-dim)', fontWeight: 300, margin: 0, whiteSpace: 'pre-line' }}>{col.body}</p>
            </div>
          ))}
        </div>
      ));
    } else if (b.kind === 'log2' && b.panels) {
      elements.push(figure(i, <PanelSlider panels={b.panels} color={topic.color} />));
    } else if (b.kind === 'log' && b.rows) {
      elements.push(figure(i,
        <div style={{ margin: '32px 0 40px', border: '1px solid var(--line)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: '10px 20px', borderBottom: '1px solid var(--line)', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 3, color: 'var(--accent)', background: 'var(--surface)' }}>
            FIELD LOG
          </div>
          {b.rows.map((row, ri) => (
            <div key={ri} style={{
              display: 'grid',
              gridTemplateColumns: '200px 1fr',
              gap: 24,
              padding: '12px 20px',
              borderBottom: ri < b.rows!.length - 1 ? '1px solid var(--line)' : 'none',
              background: ri % 2 === 0 ? 'transparent' : 'var(--surface)',
            }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: topic.color, letterSpacing: 0.5, paddingTop: 1 }}>{row.label}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--ink-dim)', lineHeight: 1.6, fontWeight: 300 }}>{row.note}</div>
            </div>
          ))}
        </div>
      ));
    } else if (b.kind === 'flourish') {
      elements.push(
        <div key={i} style={{ display: 'flex', justifyContent: 'center', margin: '40px 0' }}>
          <Flourish glyph={b.glyph || 'dots'} color={topic.color} />
        </div>
      );
    }

    i++;
  }

  return <div>{elements}</div>;
}

// Posts without a date are placeholders; the index leaves them out entirely.
// Newest first, so the drawer's front sleeve is the latest entry.
const PUBLISHED = POSTS.filter(p => p.date).sort((a, b) => b.date.localeCompare(a.date));

// ── IndexView ─────────────────────────────────────────────────────────────────
// The plain list: the selected entry large on top, the rest below it.
function IndexView({ isMobile }: { isMobile: boolean }) {
  const lead = PUBLISHED.find(p => p.pinned) ?? PUBLISHED[0];
  const rest = PUBLISHED.filter(p => p !== lead);
  const href = (p: Post) => p.link ?? `/journal/${p.slug}`;
  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: isMobile ? '16px 16px 40px' : '32px 56px 64px' }}>
      <Link href={href(lead)} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
        <article className="bo-card" style={{ padding: isMobile ? '24px 22px' : '36px 40px', border: '1px solid var(--line)', borderRadius: 14, background: 'rgba(236,230,214,0.03)', marginBottom: 40 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: 2.5, color: 'var(--accent)', marginBottom: 14 }}>
            ✦ {lead.pinned ? 'SELECTED' : 'LATEST'} · {lead.dateLabel.toUpperCase()} · {lead.read.toUpperCase()}
          </div>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: isMobile ? 30 : 42, lineHeight: 1.08, letterSpacing: -1, margin: '0 0 14px' }}>{lead.title}</h3>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 16, lineHeight: 1.6, color: 'var(--ink-dim)', fontWeight: 300, margin: 0 }}>{lead.excerpt}</p>
        </article>
      </Link>
      {rest.map((post, i) => (
        <Link key={post.id} href={href(post)} style={{ textDecoration: 'none', color: 'inherit', display: 'grid', gridTemplateColumns: '40px 1fr', gap: 12, alignItems: 'baseline', padding: '18px 6px', borderBottom: '1px dotted var(--line)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-faint)', letterSpacing: 1 }}>{String(i + 1).padStart(2, '0')}.</span>
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 400, lineHeight: 1.2, letterSpacing: -0.4, marginBottom: 6 }}>{post.title}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-faint)', letterSpacing: 1.5, marginBottom: 8 }}>{post.dateLabel.toUpperCase()} · {post.read.toUpperCase()}</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 14.5, lineHeight: 1.55, color: 'var(--ink-dim)', fontWeight: 300 }}>{post.excerpt}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}

// ── JournalShell ──────────────────────────────────────────────────────────────
export default function JournalShell() {
  const isMobile = useIsMobile();
  const [metaphor, setMetaphor] = useState<'lounge' | 'index'>('lounge');

  useEffect(() => {
    if (isMobile) setMetaphor('index');
  }, [isMobile]);

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)', fontFamily: 'var(--font-body)', position: 'relative', overflowX: 'hidden' }}>
      <Stars density={100} />

      {/* NAV */}
      {isMobile ? (
        <nav style={{ position: 'relative', zIndex: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 16px 0' }}>
          <Link href="/" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 1, color: 'var(--ink-dim)', textDecoration: 'none' }}>← Home</Link>
          <Logotype size={12} />
          <span style={{ width: 48 }} />
        </nav>
      ) : (
        <nav style={{ position: 'relative', zIndex: 5, display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', padding: '24px 56px 0' }}>
          <div style={{ display: 'flex', gap: 28, fontSize: 13, color: 'var(--ink-dim)', fontFamily: 'var(--font-body)', fontWeight: 500 }}>
            <Link href="/#missions" className="bo-link" style={{ color: 'inherit', textDecoration: 'none' }}>Missions</Link>
            <span style={{ color: 'var(--ink)', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400, fontSize: 13 }}>Journal</span>
          </div>
          <Logotype size={13} />
          <div style={{ display: 'flex', gap: 28, justifyContent: 'flex-end', fontSize: 13, color: 'var(--ink-dim)' }}>
            <Link href="/#contact" className="bo-link" style={{ color: 'inherit', textDecoration: 'none' }}>About</Link>
            <Link href="/#contact" className="bo-link" style={{ color: 'inherit', textDecoration: 'none' }}>Contact</Link>
          </div>
        </nav>
      )}

      {/* HERO */}
      <header style={{ position: 'relative', zIndex: 2, padding: isMobile ? '28px 16px 12px' : '28px 56px 4px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 4, color: 'var(--accent)', marginBottom: 14 }}>
          ✦  THE JOURNAL  ·  EST. MMXXIV  ✦
        </div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: isMobile ? 'clamp(32px, 9vw, 48px)' : 'clamp(40px, 4.4vw, 60px)', margin: 0, letterSpacing: -1.5, lineHeight: 1 }}>
          Notes from <span style={{ fontStyle: 'italic', color: 'var(--accent)' }}>orbit</span>.
        </h1>
        {!isMobile && (
          <p style={{ margin: '14px auto 0', fontSize: 15, lineHeight: 1.6, color: 'var(--ink-dim)', fontWeight: 300 }}>
            Files on the apps to the left, magazines on the ideas to the right.
          </p>
        )}
      </header>

      {/* CONTROLS */}
      <div style={{ position: 'relative', zIndex: 3, maxWidth: 1320, margin: isMobile ? '28px auto 0' : '20px auto 0', padding: isMobile ? '0 16px' : '0 56px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', flexWrap: 'wrap', gap: isMobile ? 20 : 16, alignItems: 'center', justifyContent: 'center' }}>
        {/* Metaphor switch */}
        <div style={{ display: 'flex', padding: 4, borderRadius: 999, border: '1px solid var(--line)', background: 'rgba(0,0,0,0.18)' }}>
          {(['lounge', 'index'] as const).map(opt => (
            <button key={opt} onClick={() => setMetaphor(opt)} style={{ padding: isMobile ? '8px 14px' : '10px 22px', borderRadius: 999, background: metaphor === opt ? 'var(--accent)' : 'transparent', color: metaphor === opt ? 'var(--bg)' : 'var(--ink-dim)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 2, fontWeight: 600, transition: 'background .25s, color .25s' }}>
              {opt.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* MAP SURFACE */}
      <main style={{ position: 'relative', zIndex: 1, padding: '12px 0 80px' }}>
        {metaphor === 'lounge' && (
          <div style={{ width: '100%', maxWidth: 1600, margin: '0 auto', aspectRatio: '16 / 9' }}>
            <Lounge posts={PUBLISHED} onFail={() => setMetaphor('index')} />
          </div>
        )}
        {metaphor === 'index' && <IndexView isMobile={isMobile} />}
      </main>

      {/* FOOTER */}
      <footer style={{ position: 'relative', zIndex: 2, padding: isMobile ? '24px 16px 20px' : '40px 56px 32px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <Logotype size={11} color="var(--ink-faint)" />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 2, color: 'var(--ink-faint)' }}>
          {PUBLISHED.length} ENTRIES
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 2, color: 'var(--ink-faint)' }}>
          © MMX–MMXXVI SPACYAPPS
        </span>
      </footer>
    </div>
  );
}
