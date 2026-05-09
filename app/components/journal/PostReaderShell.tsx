'use client';

import Link from 'next/link';
import Stars from '../boutique/Stars';
import Logotype from '../boutique/Logotype';
import BigPlanet from '../boutique/BigPlanet';
import { PostBody, TopicSeal } from './JournalShell';
import { type Post, type Topic } from '../../data/journal';

function SiblingCard({ post, topic }: { post: Post; topic: Topic }) {
  return (
    <Link href={`/journal/${post.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
      <article className="bo-card" style={{
        padding: '22px 24px', cursor: 'pointer',
        border: '1px solid var(--line)', borderRadius: 12,
        background: 'rgba(236,230,214,0.025)',
      }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-faint)', letterSpacing: 1.5, marginBottom: 10 }}>
          {post.dateLabel.toUpperCase()} · {post.read.toUpperCase()}
        </div>
        <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 400, margin: '0 0 8px', letterSpacing: -0.4, lineHeight: 1.2, color: 'var(--ink)' }}>
          {post.title}
        </h4>
        <p style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--ink-dim)', margin: 0, fontWeight: 300, fontFamily: 'var(--font-serif)' }}>
          {post.excerpt}
        </p>
      </article>
    </Link>
  );
}

export default function PostReaderShell({ post, topic, siblings }: {
  post: Post;
  topic: Topic;
  siblings: Post[];
}) {
  return (
    <div style={{ width: '100%', minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)', fontFamily: 'var(--font-body)', position: 'relative', overflowX: 'hidden' }}>
      <Stars density={60} />

      {/* STICKY TOP STRIP */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(14,16,20,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--line)',
        padding: '14px 56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link href="/journal" style={{
          fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 2, color: 'var(--ink-dim)',
          textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          ← THE MAP
        </Link>
        <Logotype size={11} />
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 2, color: 'var(--ink-faint)' }}>
          {topic.glyph} {topic.name.toUpperCase()} · {post.dateLabel.toUpperCase()}
        </div>
      </div>

      {/* HEADER */}
      <header style={{ position: 'relative', padding: '88px 56px 48px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, opacity: 0.45, pointerEvents: 'none' }}>
          <BigPlanet size={260} variant="rings" />
        </div>

        <div style={{ position: 'relative', maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
            <TopicSeal topic={topic} size={88} />
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 3, color: topic.color, marginBottom: 18 }}>
            {topic.glyph} &nbsp; {topic.name.toUpperCase()} &nbsp; {topic.glyph}
          </div>
          <h1 style={{
            fontFamily: 'var(--font-serif)', fontSize: 'clamp(40px, 5.5vw, 64px)', fontWeight: 300,
            margin: 0, letterSpacing: -1.6, lineHeight: 1.05, color: 'var(--ink)',
          }}>
            {post.title}
          </h1>
          <div style={{ marginTop: 28, display: 'flex', justifyContent: 'center', gap: 28, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-faint)', letterSpacing: 2 }}>
            <span>{post.dateLabel.toUpperCase()}</span>
            <span style={{ opacity: 0.4 }}>✦</span>
            <span>{post.read.toUpperCase()} READ</span>
            <span style={{ opacity: 0.4 }}>✦</span>
            <span>{post.kind.toUpperCase()}</span>
          </div>
        </div>
      </header>

      {/* BODY */}
      <article style={{ position: 'relative', maxWidth: 720, margin: '0 auto', padding: '36px 56px 64px' }}>
        {post.body.length === 0 ? (
          <div style={{ margin: '64px auto', maxWidth: 440, padding: '32px 36px', border: '1px solid var(--line)', borderRadius: 8, fontFamily: 'var(--font-mono)' }}>
            <div style={{ fontSize: 10, letterSpacing: 3, color: topic.color, marginBottom: 28 }}>
              ▓ INCOMING TRANSMISSION ▓
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-faint)', lineHeight: 2.2, letterSpacing: 1 }}>
              <div>SIGNAL DETECTED ·············· OK</div>
              <div>AUTHOR VERIFIED ············· OK</div>
              <div>DECRYPTING ENTRY ···· <span style={{ color: topic.color, animation: 'jr-blink 1.1s step-start infinite' }}>█</span></div>
            </div>
            <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--line)', fontSize: 12, color: 'var(--ink-faint)', lineHeight: 1.7 }}>
              This entry is en route.<br />Stand by for transmission.
            </div>
          </div>
        ) : (
          <PostBody blocks={post.body} topic={topic} />
        )}

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 56 }}>
          <svg width="200" height="48" viewBox="0 0 200 48" style={{ display: 'block' }}>
            <ellipse cx="100" cy="24" rx="72" ry="14" fill="none" stroke={topic.color} strokeOpacity="0.4" strokeWidth="1" />
            <ellipse cx="100" cy="24" rx="72" ry="14" fill="none" stroke={topic.color} strokeOpacity="0.6" strokeWidth="1" strokeDasharray="1 6" />
            <circle cx="100" cy="24" r="4" fill={topic.color} />
            <circle cx="172" cy="24" r="2.5" fill={topic.color} opacity="0.7" />
            <circle cx="28"  cy="24" r="2.5" fill={topic.color} opacity="0.4" />
          </svg>
        </div>
        <div style={{ textAlign: 'center', marginTop: 16, fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 16, color: 'var(--ink-faint)' }}>
          fin —
        </div>
      </article>

      {/* SIBLINGS */}
      {siblings.length > 0 && (
        <section style={{ maxWidth: 880, margin: '0 auto', padding: '0 56px 96px' }}>
          <div style={{ marginTop: 96, paddingTop: 48, borderTop: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 3, color: topic.color }}>
                {topic.glyph} MORE FROM {topic.name.toUpperCase()}
              </div>
              <Link href="/journal" style={{
                fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 16,
                color: topic.color, textDecoration: 'none',
              }}>
                ← back to the map
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
              {siblings.map(s => <SiblingCard key={s.id} post={s} topic={topic} />)}
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer style={{ padding: '32px 56px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Logotype size={11} color="var(--ink-faint)" />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 2, color: 'var(--ink-faint)' }}>
          © MMX–MMXXVI SPACYAPPS
        </span>
      </footer>
    </div>
  );
}
