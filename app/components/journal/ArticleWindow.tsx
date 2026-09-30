'use client';

// A post opened from the lounge, in the lounge's window (LoungeWindow). The
// lounge puts the post's address in the bar while it's open, so a refresh or
// a shared link gives the full standalone page.

import ScrollFX from '../starsystem/ScrollFX';
import LoungeWindow from './LoungeWindow';
import { PostBody } from './JournalShell';
import type { Post, Topic } from '../../data/journal';

export default function ArticleWindow({ post, topic, onClose }: { post: Post; topic: Topic; onClose: () => void }) {
  const close = onClose;
  return (
    <LoungeWindow
      title={`${post.title} — SpacyApps Journal`}
      label={`${post.dateLabel.toUpperCase()} · ${post.read.toUpperCase()} READ`}
      accent={topic.color}
      fullHref={`/journal/${post.slug}`}
      onClose={close}
      scrolls
    >
      <ScrollFX />
      <article style={{ maxWidth: 680, margin: '0 auto', padding: '40px 36px 64px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 42, fontWeight: 300, letterSpacing: -1.2, lineHeight: 1.06, margin: '0 0 40px', textAlign: 'center' }}>
          {post.title}
        </h1>
        <PostBody blocks={post.body} topic={topic} />
        <div style={{ textAlign: 'center', marginTop: 48, fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 16, color: 'var(--ink-faint)' }}>
          fin —
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 28 }}>
          <button onClick={close} className="bo-link" style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 16, color: topic.color, background: 'none', border: 'none', cursor: 'pointer' }}>
            ← back to the lounge
          </button>
        </div>
      </article>
    </LoungeWindow>
  );
}
