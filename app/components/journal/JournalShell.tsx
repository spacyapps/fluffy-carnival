'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Stars from '../boutique/Stars';
import Logotype from '../boutique/Logotype';
import { POSTS, TOPICS, CONSTELLATION_LINES, SKY, type Post, type Topic } from '../../data/journal';
import RefineLoopSVG from './RefineLoopSVG';
import HumanEdgeSVG from './HumanEdgeSVG';

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
    <svg width="120" height="20" viewBox="0 0 120 20" style={{ display: 'block' }}>
      <circle cx="40" cy="10" r="2" fill={color} opacity="0.5" />
      <circle cx="60" cy="10" r="2.5" fill={color} />
      <circle cx="80" cy="10" r="2" fill={color} opacity="0.5" />
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

// ── PostBody ─────────────────────────────────────────────────────────────────
export function PostBody({ blocks, topic }: { blocks: Post['body']; topic: Topic }) {
  const ink = 'var(--ink)';

  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < blocks.length) {
    const b = blocks[i];

    if (b.kind === 'image' && b.src) {
      const next = blocks[i + 1];
      if (next?.kind === 'p') {
        elements.push(
          <div key={i} style={{ display: 'flex', gap: 32, alignItems: 'flex-start', margin: '16px 0 36px' }}>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 17, lineHeight: 1.8, color: ink, fontWeight: 300, margin: 0, flex: '1 1 0' }}>{next.text}</p>
            <div style={{ flex: '0 0 260px', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--line)', background: 'rgba(236,230,214,0.04)' }}>
              <img src={b.src} alt="" style={{ display: 'block', width: '100%', height: 400, objectFit: 'contain' }} />
            </div>
          </div>
        );
        i += 2;
        continue;
      }
      elements.push(
        <div key={i} style={{ margin: '16px 0 36px', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--line)', background: 'rgba(236,230,214,0.04)' }}>
          <img src={b.src} alt="" style={{ display: 'block', width: '100%', height: 400, objectFit: 'contain' }} />
        </div>
      );
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
      elements.push(
        <pre key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.7, color: ink, background: '#0a0c10', border: '1px solid var(--line)', borderRadius: 8, padding: '20px 22px', margin: '0 0 28px', overflowX: 'auto', whiteSpace: 'pre' }}>
          <div style={{ fontSize: 10, letterSpacing: 2, color: 'var(--ink-faint)', marginBottom: 12 }}>── {(b.lang || 'text').toUpperCase()} ──</div>
          {b.text}
        </pre>
      );
    } else if (b.kind === 'animation' && b.name === 'refine-loop') {
      elements.push(<RefineLoopSVG key={i} />);
    } else if (b.kind === 'animation' && b.name === 'human-edge') {
      elements.push(<HumanEdgeSVG key={i} />);
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

// ── ConstellationMap ──────────────────────────────────────────────────────────
function ConstellationMap({ posts, topics, hovered, setHovered, activeTopicId }: {
  posts: Post[]; topics: Record<string, Topic>;
  hovered: Post | null; setHovered: (p: Post | null) => void;
  activeTopicId: string | null;
}) {
  const router = useRouter();
  const byTopic = useMemo(() => {
    const o: Record<string, Post[]> = { first_light: [], drift: [] };
    for (const p of posts) o[p.topic]?.push(p);
    return o;
  }, [posts]);

  return (
    <svg viewBox={`0 0 ${SKY.width} ${SKY.height}`} preserveAspectRatio="xMidYMid meet"
      style={{ width: '100%', height: '100%', display: 'block' }}>
      <defs>
        {Object.values(topics).map(t => (
          <radialGradient key={t.id} id={`cstar-${t.id}`} cx="0.5" cy="0.5">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.3" stopColor={t.color} />
            <stop offset="1" stopColor={t.color} stopOpacity="0" />
          </radialGradient>
        ))}
      </defs>

      {/* Constellation lines */}
      {Object.values(topics).map(topic => {
        const list = byTopic[topic.id] || [];
        const segs = CONSTELLATION_LINES[topic.id] || [];
        return (
          <g key={`lines-${topic.id}`} opacity="0.35">
            {segs.map(([a, b], i) => list[a] && list[b] ? (
              <line key={i} x1={list[a].cx} y1={list[a].cy} x2={list[b].cx} y2={list[b].cy}
                stroke={topic.color} strokeWidth="1" strokeDasharray="2 4" />
            ) : null)}
          </g>
        );
      })}

      {/* Topic labels */}
      {Object.values(topics).map(topic => {
        const list = byTopic[topic.id] || [];
        if (!list.length) return null;
        const avgCx = list.reduce((s, p) => s + p.cx, 0) / list.length;
        const avgCy = list.reduce((s, p) => s + p.cy, 0) / list.length;
        return (
          <g key={`tlabel-${topic.id}`} opacity="0.8">
            <text x={avgCx} y={avgCy - 110} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="13" letterSpacing="6" fill={topic.color} fillOpacity="0.7">
              {topic.glyph}   {topic.name.toUpperCase()}   {topic.glyph}
            </text>
            <text x={avgCx} y={avgCy + 145} textAnchor="middle" fontFamily="var(--font-serif)" fontStyle="italic" fontSize="16" fill="var(--ink-faint)">
              — {topic.subtitle} —
            </text>
          </g>
        );
      })}

      {/* Stars */}
      {POSTS.map(post => {
        const t = topics[post.topic];
        if (!t) return null;
        const isHovered = hovered?.id === post.id;
        const dimmed = activeTopicId && post.topic !== activeTopicId;
        const r = post.pinned ? 8 : 6.5;
        return (
          <g key={post.id} opacity={dimmed ? 0.15 : 1} style={{ transition: 'opacity .3s' }}>
            <circle cx={post.cx} cy={post.cy} r={r * 5} fill={`url(#cstar-${post.topic})`} opacity={isHovered ? 1 : 0.55} />
            {post.pinned && (
              <circle cx={post.cx} cy={post.cy} r={r * 2.5} fill="none" stroke={t.color} strokeWidth="1"
                opacity="0.5" style={{ animation: 'jr-pulse 3s ease-out infinite', transformOrigin: `${post.cx}px ${post.cy}px` }} />
            )}
            <circle className="jr-star" cx={post.cx} cy={post.cy} r={r} fill="#fff"
              onMouseEnter={() => !dimmed && setHovered(post)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => !dimmed && router.push(post.link ?? `/journal/${post.slug}`)} />
            <text x={post.cx} y={post.cy + r + 24} textAnchor="middle"
              fontFamily="var(--font-serif)" fontStyle={post.pinned ? 'italic' : 'normal'}
              fontSize={post.pinned ? 17 : 14} fontWeight={post.pinned ? 500 : 400}
              fill={isHovered ? '#fff' : 'var(--ink)'} opacity={isHovered ? 1 : 0.85}
              style={{ pointerEvents: 'none' }}>
              {post.title}
            </text>
            <text x={post.cx} y={post.cy + r + 42} textAnchor="middle"
              fontFamily="var(--font-mono)" fontSize="10" letterSpacing="2" fill="var(--ink-faint)"
              style={{ pointerEvents: 'none' }}>
              {post.dateLabel.toUpperCase()} · {post.read.toUpperCase()}
            </text>
          </g>
        );
      })}

      {/* Compass plate */}
      <g transform={`translate(${SKY.width - 200}, ${SKY.height - 80})`} opacity="0.4">
        <line x1="0" y1="0" x2="120" y2="0" stroke="var(--ink-dim)" strokeWidth="1" />
        <line x1="0" y1="-4" x2="0" y2="4" stroke="var(--ink-dim)" strokeWidth="1" />
        <line x1="120" y1="-4" x2="120" y2="4" stroke="var(--ink-dim)" strokeWidth="1" />
        <text x="60" y="20" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" letterSpacing="2" fill="var(--ink-faint)">~ 5 LIGHT-MONTHS</text>
      </g>
    </svg>
  );
}

// ── OrbitsMap ─────────────────────────────────────────────────────────────────
const RING_CONFIG = [
  { rx: 320, ry: 130, topic: 'first_light', tilt: -10 },
  { rx: 580, ry: 220, topic: 'drift',       tilt: -10 },
] as const;

// deg/s so each ring completes one orbit in its period
const RING_SPEED: Record<string, number> = {
  first_light: 360 / 200,
  drift:       360 / 350,
};

function OrbitsMap({ topics, hovered, setHovered, activeTopicId }: {
  topics: Record<string, Topic>;
  hovered: Post | null; setHovered: (p: Post | null) => void;
  activeTopicId: string | null;
}) {
  const router = useRouter();
  const cx = SKY.width / 2;
  const cy = SKY.height / 2;
  const [reducedMotion, setReducedMotion] = useState(false);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const h = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const start = performance.now();
    const id = setInterval(() => {
      setTime((performance.now() - start) / 1000);
    }, 50);
    return () => clearInterval(id);
  }, [reducedMotion]);

  const nodeAt = (ring: typeof RING_CONFIG[number], angleDeg: number) => {
    const a = (angleDeg * Math.PI) / 180;
    const t = (ring.tilt * Math.PI) / 180;
    const x = ring.rx * Math.cos(a);
    const y = ring.ry * Math.sin(a);
    return { x: cx + x * Math.cos(t) - y * Math.sin(t), y: cy + x * Math.sin(t) + y * Math.cos(t) };
  };

  return (
    <svg viewBox={`0 0 ${SKY.width} ${SKY.height}`} preserveAspectRatio="xMidYMid meet"
      style={{ width: '100%', height: '100%', display: 'block' }}>
      <defs>
        <radialGradient id="orb-sun" cx="0.5" cy="0.5">
          <stop offset="0" stopColor="#fff8e8" />
          <stop offset="0.4" stopColor="var(--accent)" />
          <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
        </radialGradient>
        {Object.values(topics).map(t => (
          <radialGradient key={t.id} id={`orb-node-${t.id}`} cx="0.5" cy="0.5">
            <stop offset="0" stopColor="#fff" />
            <stop offset="0.4" stopColor={t.color} />
            <stop offset="1" stopColor={t.color} stopOpacity="0" />
          </radialGradient>
        ))}
      </defs>

      {/* Sun */}
      <circle cx={cx} cy={cy} r="140" fill="url(#orb-sun)" opacity="0.35" />
      {/* Back rings */}
      <g transform={`rotate(-14, ${cx}, ${cy})`}>
        <ellipse cx={cx} cy={cy} rx="56" ry="18" fill="none" stroke="rgba(210,160,80,0.07)" strokeWidth="3" />
        <ellipse cx={cx} cy={cy} rx="62" ry="20" fill="none" stroke="rgba(220,175,100,0.12)" strokeWidth="6" />
        <ellipse cx={cx} cy={cy} rx="68" ry="22" fill="none" stroke="rgba(230,190,110,0.15)" strokeWidth="4" />
        <ellipse cx={cx} cy={cy} rx="75" ry="25" fill="none" stroke="rgba(215,165,90,0.10)" strokeWidth="7" />
      </g>
      <circle cx={cx} cy={cy} r="32" fill="var(--accent)" opacity="0.95" />
      <circle cx={cx} cy={cy} r="32" fill="none" stroke="#fff" strokeOpacity="0.3" strokeWidth="1" />
      {/* Front rings (clipped to lower half) */}
      <clipPath id="sun-ring-front">
        <rect x={cx - 100} y={cy} width="200" height="50" />
      </clipPath>
      <g transform={`rotate(-14, ${cx}, ${cy})`} clipPath="url(#sun-ring-front)">
        <ellipse cx={cx} cy={cy} rx="56" ry="18" fill="none" stroke="rgba(210,160,80,0.10)" strokeWidth="3" />
        <ellipse cx={cx} cy={cy} rx="62" ry="20" fill="none" stroke="rgba(220,175,100,0.20)" strokeWidth="6" />
        <ellipse cx={cx} cy={cy} rx="68" ry="22" fill="none" stroke="rgba(230,190,110,0.22)" strokeWidth="4" />
        <ellipse cx={cx} cy={cy} rx="75" ry="25" fill="none" stroke="rgba(215,165,90,0.16)" strokeWidth="7" />
      </g>
      <text x={cx} y={cy + 58} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11" letterSpacing="5" fill="var(--ink)" opacity="0.5">✦ SPACYAPPS ✦</text>
      <text x={cx} y={cy + 80} textAnchor="middle" fontFamily="var(--font-serif)" fontStyle="italic" fontSize="14" fill="var(--ink-faint)">the journal, in orbit</text>

      {/* Rings */}
      {RING_CONFIG.map(ring => {
        const topic = topics[ring.topic];
        if (!topic) return null;
        return (
          <g key={ring.topic} transform={`rotate(${ring.tilt} ${cx} ${cy})`}>
            <ellipse cx={cx} cy={cy} rx={ring.rx} ry={ring.ry} fill="none" stroke={topic.color} strokeOpacity="0.25" strokeWidth="1" />
            <ellipse cx={cx} cy={cy} rx={ring.rx} ry={ring.ry} fill="none" stroke={topic.color} strokeOpacity="0.5" strokeWidth="1" strokeDasharray="1 14" />
          </g>
        );
      })}

      {/* Ring topic labels — fixed at top of each ellipse */}
      {RING_CONFIG.map(ring => {
        const topic = topics[ring.topic];
        if (!topic) return null;
        const pos = nodeAt(ring, 270);
        return (
          <text key={`rl-${ring.topic}`} x={pos.x} y={pos.y - 14} textAnchor="middle"
            fontFamily="var(--font-mono)" fontSize="11" letterSpacing="4" fill={topic.color} opacity="0.8">
            {topic.glyph} {topic.name.toUpperCase()} {topic.glyph}
          </text>
        );
      })}

      {/* Nodes — position re-computed each tick from animated angle */}
      {POSTS.map(post => {
        const ring = RING_CONFIG.find(r => r.topic === post.topic);
        if (!ring) return null;
        const topic = topics[post.topic];
        if (!topic) return null;

        const speed = RING_SPEED[post.topic] ?? 0;
        const animAngle = post.angle + time * speed;
        const pos = nodeAt(ring, animAngle);
        const isHovered = hovered?.id === post.id;
        const dimmed = activeTopicId && post.topic !== activeTopicId;
        const r = post.pinned ? 10 : 8;

        const a = (animAngle * Math.PI) / 180;
        const tilt = (ring.tilt * Math.PI) / 180;
        const ux = Math.cos(a) * Math.cos(tilt) - Math.sin(a) * Math.sin(tilt);
        const uy = Math.cos(a) * Math.sin(tilt) + Math.sin(a) * Math.cos(tilt);
        const labelX = pos.x + ux * 32;
        const labelY = pos.y + uy * 32;
        const anchor = ux > 0.2 ? 'start' : ux < -0.2 ? 'end' : 'middle';

        return (
          <g key={post.id} opacity={dimmed ? 0.12 : 1} style={{ transition: 'opacity .3s' }}>
            <circle cx={pos.x} cy={pos.y} r={r * 4} fill={`url(#orb-node-${post.topic})`} opacity={isHovered ? 1 : 0.55} />
            {post.pinned && (
              <circle cx={pos.x} cy={pos.y} r={r * 2.2} fill="none" stroke={topic.color} strokeOpacity="0.6" strokeWidth="1"
                style={{ animation: 'jr-pulse 3s ease-out infinite', transformOrigin: `${pos.x}px ${pos.y}px` }} />
            )}
            <circle className="jr-orbit-node" cx={pos.x} cy={pos.y} r={r}
              fill="#fff" stroke={topic.color} strokeWidth="2"
              onMouseEnter={() => !dimmed && setHovered(post)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => !dimmed && router.push(post.link ?? `/journal/${post.slug}`)} />
            <text x={labelX} y={labelY - 4} textAnchor={anchor}
              fontFamily="var(--font-serif)" fontStyle={post.pinned ? 'italic' : 'normal'}
              fontSize={post.pinned ? 16 : 13} fontWeight={post.pinned ? 500 : 400}
              fill={isHovered ? '#fff' : 'var(--ink)'} opacity={isHovered ? 1 : 0.82}
              style={{ pointerEvents: 'none' }}>
              {post.title}
            </text>
            <text x={labelX} y={labelY + 14} textAnchor={anchor}
              fontFamily="var(--font-mono)" fontSize="10" letterSpacing="2" fill="var(--ink-faint)"
              style={{ pointerEvents: 'none' }}>
              {post.dateLabel.toUpperCase()} · {post.read.toUpperCase()}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── IndexView ─────────────────────────────────────────────────────────────────
function IndexView() {
  const router = useRouter();
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 56px 64px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 56 }}>
        {Object.values(TOPICS).map(t => {
          const list = POSTS.filter(p => p.topic === t.id);
          return (
            <section key={t.id}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
                <span style={{ color: t.color, fontFamily: 'var(--font-mono)', fontSize: 14 }}>{t.glyph}</span>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 28, fontWeight: 400, margin: 0, letterSpacing: -0.6, color: t.color }}>{t.name}</h3>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 2, color: 'var(--ink-faint)', marginBottom: 24 }}>
                {String(list.length).padStart(2, '0')} ENTRIES
              </div>
              <div>
                {list.map((post, i) => (
                  <div key={post.id} onClick={() => router.push(post.link ?? `/journal/${post.slug}`)}
                    style={{ display: 'grid', gridTemplateColumns: '32px 1fr', gap: 12, alignItems: 'baseline', padding: '16px 6px', cursor: 'pointer', borderBottom: '1px dotted var(--line)', borderRadius: 4, transition: 'background .2s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(236,230,214,0.03)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-faint)', letterSpacing: 1 }}>{String(i + 1).padStart(2, '0')}.</span>
                    <div>
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 400, fontStyle: post.pinned ? 'italic' : 'normal', color: 'var(--ink)', lineHeight: 1.2, letterSpacing: -0.4, marginBottom: 4 }}>
                        {post.title}{post.pinned && <span style={{ color: t.color, marginLeft: 8, fontStyle: 'normal', fontSize: 13 }}>✦</span>}
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-faint)', letterSpacing: 1.5 }}>
                        {post.dateLabel.toUpperCase()} · {post.read.toUpperCase()} · {post.kind.toUpperCase()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

// ── HoverCard ─────────────────────────────────────────────────────────────────
function HoverCard({ post }: { post: Post }) {
  const t = TOPICS[post.topic];
  return (
    <div style={{ position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)', background: 'var(--bg-panel)', border: '1px solid var(--line)', borderRadius: 12, padding: '14px 22px', maxWidth: 520, width: 'max-content', color: 'var(--ink)', zIndex: 50, boxShadow: '0 12px 40px rgba(0,0,0,0.4)', textAlign: 'center', animation: 'jr-fadein .25s ease-out', pointerEvents: 'none' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 2, color: t.color, marginBottom: 6 }}>
        {t.glyph} {t.name.toUpperCase()} · {post.dateLabel.toUpperCase()} · {post.read.toUpperCase()}
      </div>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 17, fontStyle: post.pinned ? 'italic' : 'normal', marginBottom: 4 }}>{post.title}</div>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 13, color: 'var(--ink-dim)', fontWeight: 300, lineHeight: 1.5 }}>{post.excerpt}</div>
    </div>
  );
}

// ── JournalShell ──────────────────────────────────────────────────────────────
export default function JournalShell() {
  const [metaphor, setMetaphor] = useState<'orbits' | 'constellation' | 'index'>('orbits');
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [hovered, setHovered] = useState<Post | null>(null);

  const visibleTopics = activeTopicId
    ? Object.fromEntries([[activeTopicId, TOPICS[activeTopicId]]])
    : TOPICS;

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)', fontFamily: 'var(--font-body)', position: 'relative', overflowX: 'hidden' }}>
      <Stars density={100} />

      {/* NAV */}
      <nav style={{ position: 'relative', zIndex: 5, display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', padding: '24px 56px 0' }}>
        <div style={{ display: 'flex', gap: 28, fontSize: 13, color: 'var(--ink-dim)', fontFamily: 'var(--font-body)', fontWeight: 500 }}>
          <Link href="/#missions" className="bo-link" style={{ color: 'inherit', textDecoration: 'none' }}>Missions</Link>
          <span style={{ color: 'var(--ink)', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400, fontSize: 13 }}>Journal</span>
          <Link href="/#now" className="bo-link" style={{ color: 'inherit', textDecoration: 'none' }}>Now</Link>
        </div>
        <Logotype size={13} />
        <div style={{ display: 'flex', gap: 28, justifyContent: 'flex-end', fontSize: 13, color: 'var(--ink-dim)' }}>
          <Link href="/#contact" className="bo-link" style={{ color: 'inherit', textDecoration: 'none' }}>About</Link>
          <Link href="/#contact" className="bo-link" style={{ color: 'inherit', textDecoration: 'none' }}>Contact</Link>
        </div>
      </nav>

      {/* HERO */}
      <header style={{ position: 'relative', zIndex: 2, padding: '64px 56px 24px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 4, color: 'var(--accent)', marginBottom: 22 }}>
          ✦  THE JOURNAL  ·  EST. MMXXIV  ·  CHARTED  ✦
        </div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 'clamp(60px, 8vw, 112px)', margin: 0, letterSpacing: -3, lineHeight: 0.95 }}>
          A <span style={{ fontStyle: 'italic', color: 'var(--accent)' }}>star chart</span> of the writing.
        </h1>
        <p style={{ maxWidth: 620, margin: '32px auto 0', fontSize: 17, lineHeight: 1.65, color: 'var(--ink-dim)', fontWeight: 300 }}>
          Posts here are organised like a sky — by <em style={{ color: 'var(--ink)' }}>constellation</em>, not by date. Each topic is its own shape; pick a star to read what&apos;s there.
        </p>
      </header>

      {/* CONTROLS */}
      <div style={{ position: 'relative', zIndex: 3, maxWidth: 1320, margin: '36px auto 0', padding: '0 56px', display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center' }}>
        {/* Metaphor switch */}
        <div style={{ display: 'flex', padding: 4, borderRadius: 999, border: '1px solid var(--line)', background: 'rgba(0,0,0,0.18)' }}>
          {(['orbits', 'constellation', 'index'] as const).map(opt => (
            <button key={opt} onClick={() => setMetaphor(opt)} style={{ padding: '10px 22px', borderRadius: 999, background: metaphor === opt ? 'var(--accent)' : 'transparent', color: metaphor === opt ? 'var(--bg)' : 'var(--ink-dim)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 2, fontWeight: 600, transition: 'background .25s, color .25s' }}>
              {opt.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Topic legend — hidden in index view */}
        {metaphor !== 'index' && (
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
            {Object.values(TOPICS).map(t => {
              const active = activeTopicId === t.id;
              return (
                <button key={t.id} onClick={() => setActiveTopicId(active ? null : t.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', background: active ? `${t.color}20` : 'transparent', border: `1px solid ${active ? t.color + '88' : 'var(--line)'}`, borderRadius: 999, color: 'var(--ink)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 1.5, transition: 'background .25s, border-color .25s' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: t.color, boxShadow: `0 0 8px ${t.color}`, display: 'inline-block' }} />
                  <span style={{ fontWeight: 600 }}>{t.name.toUpperCase()}</span>
                  <span style={{ color: 'var(--ink-faint)' }}>·</span>
                  <span style={{ color: 'var(--ink-dim)', fontWeight: 400 }}>{t.subtitle}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* MAP SURFACE */}
      <main style={{ position: 'relative', zIndex: 1, padding: '36px 0 80px' }}>
        {metaphor === 'orbits' && (
          <div style={{ width: '100%', maxWidth: 1500, margin: '0 auto', aspectRatio: '8 / 5' }}>
            <OrbitsMap topics={visibleTopics} hovered={hovered} setHovered={setHovered} activeTopicId={activeTopicId} />
          </div>
        )}
        {metaphor === 'constellation' && (
          <div style={{ width: '100%', maxWidth: 1500, margin: '0 auto', aspectRatio: '8 / 5' }}>
            <ConstellationMap posts={POSTS} topics={visibleTopics} hovered={hovered} setHovered={setHovered} activeTopicId={activeTopicId} />
          </div>
        )}
        {metaphor === 'index' && <IndexView />}
      </main>

      {/* HOVER CARD */}
      {hovered && <HoverCard post={hovered} />}

      {/* FOOTER */}
      <footer style={{ position: 'relative', zIndex: 2, padding: '40px 56px 32px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <Logotype size={11} color="var(--ink-faint)" />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 2, color: 'var(--ink-faint)' }}>
          {POSTS.length} ENTRIES · {Object.keys(TOPICS).length} CONSTELLATIONS
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 2, color: 'var(--ink-faint)' }}>
          © MMX–MMXXVI SPACYAPPS
        </span>
      </footer>
    </div>
  );
}
