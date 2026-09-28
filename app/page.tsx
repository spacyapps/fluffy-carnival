import type { Metadata, Viewport } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};
import ContactLink from './components/boutique/ContactLink';
import BigPlanet from './components/boutique/BigPlanet';
import AppIcon from './components/boutique/AppIcon';
import ScaleWrapper from './components/boutique/ScaleWrapper';
import { APPS } from './data/apps';
import { POSTS } from './data/posts';
import { POSTS as JOURNAL } from './data/journal';
import ScrollFX from './components/starsystem/ScrollFX';
import CardGlow from './components/boutique/CardGlow';
import RelaySweep from './components/boutique/RelaySweep';
import StarSystemHero, { type MissionStop, type JournalStop } from './components/starsystem/StarSystemHero';

const missions: MissionStop[] = APPS.map(a => ({
  slug: a.slug,
  name: a.name,
  color: a.color,
  phase: a.phase,
  platform: a.platform,
  version: a.version,
  tagline: a.tagline,
  href: a.noPage ? null : `/apps/${a.slug}`,
}));

// Cards grouped by phase, numbered in the order they appear.
const PHASE_ROWS = (['live', 'in-play'] as const)
  .map(phase => APPS.filter(a => a.phase === phase))
  .map((row, r, rows) => row.map((app, j) => ({ app, i: rows.slice(0, r).reduce((n, x) => n + x.length, 0) + j })));

// The newest dated journal entry — undated ones are placeholders.
const newest = JOURNAL.filter(p => p.date).sort((a, b) => b.date.localeCompare(a.date))[0];
const latest: JournalStop = {
  title: newest.title,
  date: newest.dateLabel,
  href: newest.link ?? `/journal/${newest.slug}`,
};

export default function Home() {
  return (
    <ScaleWrapper>
    <div style={{ width: '100%', background: 'var(--bg)', color: 'var(--ink)', fontFamily: 'var(--font-body)' }}>

      {/* HERO */}
      <StarSystemHero missions={missions} latest={latest} />

      {/* Everything below the hero is a curtain that slides up over it. */}
      <div style={{ position: 'relative', zIndex: 1, background: 'var(--bg)', borderRadius: '32px 32px 0 0', boxShadow: '0 -40px 90px rgba(0,0,0,0.55)', overflow: 'hidden' }}>
      <ScrollFX />
      <CardGlow />

      {/* APPS */}
      <section id="missions" className="bo-section" style={{ padding: '96px 56px' }}>
        <div style={{ marginBottom: 56 }}>
          <div>
            <div data-reveal="" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 3, color: 'var(--accent)', marginBottom: 14 }}>
              I.  MISSIONS
            </div>
            <h2
              className="bo-h-xl"
            data-reveal="line"
              style={{
                fontFamily: 'var(--font-serif)',
                fontWeight: 300,
                fontSize: 76,
                margin: 0,
                letterSpacing: -2.5,
                lineHeight: 0.95,
              }}
            >
              Missions,{' '}
              <span style={{ fontStyle: 'italic', color: 'var(--accent-2)' }}>currently in orbit.</span>
            </h2>
          </div>
        </div>

        {/* Live worlds first, construction sites on their own row beneath. */}
        {PHASE_ROWS.map((row, r) => (
        <div key={r} className="bo-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginTop: r ? 48 : 0 }}>
          {row.map(({ app, i }) => {
            const site = app.phase === 'in-play';
            const cardInner = (
              <div
                className={site ? 'bo-card bo-glow bo-site' : 'bo-card bo-glow'}
                style={{
                  '--glow': app.color,
                  position: 'relative',
                  padding: '36px 30px 28px',
                  backgroundColor: 'var(--bg-panel)',
                  border: site ? '1px dashed rgba(155,181,201,0.3)' : '1px solid var(--line)',
                  borderRadius: 14,
                  cursor: app.noPage ? 'default' : 'pointer',
                  height: '100%',
                  boxSizing: 'border-box',
                } as React.CSSProperties}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                  <div className="bo-site-dim"><AppIcon glyph={app.glyph} color={app.color} size={56} icon={app.icon} /></div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-faint)', letterSpacing: 1.5, textAlign: 'right', lineHeight: 1.6 }}>
                    №{String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <PhaseTag live={app.phase === 'live'} />
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, fontWeight: 400, margin: '0 0 4px', letterSpacing: -0.7, lineHeight: 1 }}>
                  {app.name}
                </h3>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-faint)', letterSpacing: 1.5, marginBottom: 16 }}>
                  {app.platform.toUpperCase()}{app.version !== '—' && <>  ·  v{app.version}</>}
                </div>
                <p className="bo-site-dim" style={{ fontSize: 14.5, lineHeight: 1.6, color: 'var(--ink-dim)', margin: (app.companion || app.milestones) ? '0 0 16px' : '0 0 24px', fontWeight: 300, minHeight: 70, fontFamily: 'var(--font-body)' }}>
                  {app.tagline}
                </p>
                {app.milestones && (
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 1, color: 'var(--ink-faint)', lineHeight: 1.7, margin: '0 0 24px' }}>
                    {app.milestones.map((m, j) => {
                      const [year, ...rest] = m.split(':');
                      return (
                        <div key={j}>
                          <span style={{ color: 'var(--accent)' }}>{year}:</span>{rest.join(':')}
                        </div>
                      );
                    })}
                  </div>
                )}
                {app.companion && (
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 1, color: 'var(--ink-faint)', lineHeight: 1.6, margin: '0 0 24px' }}>
                    ↳ <span style={{ color: 'var(--accent)' }}>{app.companion.name}</span> · {app.companion.cardLabel}
                  </div>
                )}
                <div style={{ paddingTop: 16, borderTop: '1px solid var(--line)' }}>
                  <div style={{ fontSize: 13, fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: app.noPage ? 'var(--ink-faint)' : 'var(--accent)' }}>
                    {app.noPage ? 'In development...' : (app.cta ?? 'Open the briefing →')}
                  </div>
                  {app.secondaryCta && (
                    <Link
                      href={app.secondaryCta.href}
                      style={{ position: 'relative', zIndex: 1, display: 'inline-block', marginTop: 8, fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--accent-2)', textDecoration: 'none' }}
                    >
                      {app.secondaryCta.label}
                    </Link>
                  )}
                </div>
                {/* Full-card click target for the briefing, kept beneath secondaryCta so that link stays clickable on its own. */}
                {app.secondaryCta && !app.noPage && (
                  <Link
                    href={`/apps/${app.slug}`}
                    aria-label={`Open the ${app.name} briefing`}
                    style={{ position: 'absolute', inset: 0, zIndex: 0 }}
                  />
                )}
              </div>
            );
            // Cards with a secondaryCta lay their own full-card link inside
            // cardInner instead (see above) — two <a> tags can't nest.
            const card = app.noPage || app.secondaryCta ? cardInner : (
              <Link href={`/apps/${app.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}>
                {cardInner}
              </Link>
            );
            return (
              <div key={app.slug} data-reveal="card" style={{ '--d': `${0.1 + i * 0.09}s` } as React.CSSProperties}>
                {card}
              </div>
            );
          })}
        </div>
        ))}
      </section>

      {/* LOG */}
      <section id="journal" className="bo-section" style={{ padding: '96px 56px', borderTop: '1px solid var(--line)' }}>
        <div className="bo-flex-col" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 56 }}>
          <div>
            <div data-reveal="" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 3, color: 'var(--accent-2)', marginBottom: 14 }}>
              II.  THE JOURNAL
            </div>
            <h2
              className="bo-h-lg"
            data-reveal="line"
              style={{
                fontFamily: 'var(--font-serif)',
                fontWeight: 300,
                fontSize: 60,
                margin: 0,
                letterSpacing: -1.8,
                lineHeight: 0.95,
              }}
            >
              Filed from <span style={{ fontStyle: 'italic', color: 'var(--accent-2)' }}>orbit.</span>
            </h2>
          </div>
          <Link href="/journal" className="bo-link" style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 17, color: 'var(--ink-dim)' }}>
            All entries →
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24, alignItems: 'stretch' }}>
          <Link href={POSTS[0].link ?? '/journal'} data-reveal="card" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <article
              className="bo-card bo-glow"
              style={{
                padding: '44px 48px',
                cursor: 'pointer',
                backgroundColor: 'var(--bg-panel)',
                border: '1px solid var(--line)',
                borderRadius: 14,
                position: 'relative',
                overflow: 'hidden',
                height: '100%',
              }}
            >
              <div style={{ position: 'absolute', top: -40, right: -40, opacity: 0.5 }}>
                <BigPlanet size={220} />
              </div>
              <div style={{ position: 'relative' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', letterSpacing: 2, marginBottom: 18 }}>
                  ✦ LATEST  ·  {POSTS[0].date.toUpperCase()}
                </div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 44, fontWeight: 300, margin: '0 0 18px', letterSpacing: -1, lineHeight: 1.05 }}>
                  {POSTS[0].title}
                </h3>
                <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--ink-dim)', fontWeight: 300, margin: '0 0 24px', fontFamily: 'var(--font-body)' }}>
                  {POSTS[0].excerpt}
                </p>
                <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 16, color: 'var(--accent)' }}>Keep reading →</span>
              </div>
            </article>
          </Link>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {POSTS.slice(1).filter(p => !p.title.startsWith('Coming')).map((post, i) => (
              <Link key={post.slug} href={post.link ?? `/journal/${post.slug}`} data-reveal="card" style={{ textDecoration: 'none', color: 'inherit', display: 'block', '--d': `${0.15 + i * 0.1}s` } as React.CSSProperties}>
                <article className="bo-card bo-glow" style={{ padding: '28px 32px', cursor: 'pointer', backgroundColor: 'var(--bg-panel)', border: '1px solid var(--line)', borderRadius: 14 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-faint)', letterSpacing: 2, marginBottom: 14 }}>
                    {post.date.toUpperCase()} · {post.read.toUpperCase()}
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 300, margin: '0 0 10px', letterSpacing: -0.4, lineHeight: 1.15 }}>
                    {post.title}
                  </h3>
                  <p style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--ink-dim)', fontWeight: 300, margin: '0 0 18px', fontFamily: 'var(--font-body)' }}>
                    {post.excerpt}
                  </p>
                  <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 15, color: 'var(--accent)' }}>Read →</span>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="bo-section" style={{ position: 'relative', padding: '96px 56px 64px', borderTop: '1px solid var(--line)', overflow: 'hidden' }}>
        <RelaySweep blips={APPS.map(a => ({ live: a.phase === 'live' }))} />
        <div style={{ position: 'relative' }}>
          <div data-reveal="" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 3, color: 'var(--accent)', marginBottom: 18 }}>
            III.  SIGNAL STATUS
          </div>
          <h2
            className="bo-h-xxl"
            data-reveal="line"
            style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 300,
              fontSize: 88,
              margin: 0,
              letterSpacing: -3,
              lineHeight: 0.95,
            }}
          >
            <span style={{ fontStyle: 'italic' }}>Transmissions</span> open.
          </h2>
          <p data-reveal="" style={{ fontSize: 17, color: 'var(--ink-dim)', lineHeight: 1.6, fontWeight: 300, margin: '24px 0 0', fontFamily: 'var(--font-body)', '--d': '0.15s' } as React.CSSProperties}>
            Questions, ideas, or just saying hello —
          </p>
          <div data-reveal="" style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap', '--d': '0.25s' } as React.CSSProperties}>
            <ContactLink />
            <a
              href="https://www.instagram.com/spacyappsofficial"
              target="_blank"
              rel="noopener noreferrer"
              className="bo-link"
              aria-label="SpacyApps on Instagram"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                letterSpacing: 2,
                color: 'var(--ink-dim)',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ flexShrink: 0 }}>
                <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 1.98c-3.15 0-3.52.01-4.76.07-1.15.05-1.77.24-2.19.4-.55.22-.94.47-1.35.88-.41.41-.66.8-.88 1.35-.16.42-.35 1.04-.4 2.19-.06 1.24-.07 1.61-.07 4.76s.01 3.52.07 4.76c.05 1.15.24 1.77.4 2.19.22.55.47.94.88 1.35.41.41.8.66 1.35.88.42.16 1.04.35 2.19.4 1.24.06 1.61.07 4.76.07s3.52-.01 4.76-.07c1.15-.05 1.77-.24 2.19-.4.55-.22.94-.47 1.35-.88.41-.41.66-.8.88-1.35.16-.42.35-1.04.4-2.19.06-1.24.07-1.61.07-4.76s-.01-3.52-.07-4.76c-.05-1.15-.24-1.77-.4-2.19a3.6 3.6 0 0 0-.88-1.35 3.6 3.6 0 0 0-1.35-.88c-.42-.16-1.04-.35-2.19-.4-1.24-.06-1.61-.07-4.76-.07zm0 3.37a4.49 4.49 0 1 1 0 8.98 4.49 4.49 0 0 1 0-8.98zm0 7.4a2.92 2.92 0 1 0 0-5.83 2.92 2.92 0 0 0 0 5.83zm5.72-7.6a1.05 1.05 0 1 1-2.1 0 1.05 1.05 0 0 1 2.1 0z" />
              </svg>
              @spacyappsofficial
            </a>
            <a
              href="https://x.com/spacyapps"
              target="_blank"
              rel="noopener noreferrer"
              className="bo-link"
              aria-label="SpacyApps on X"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                letterSpacing: 2,
                color: 'var(--ink-dim)',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ flexShrink: 0 }}>
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
              </svg>
              @spacyapps
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        className="bo-footer"
        style={{
          padding: '36px 56px 32px',
          borderTop: '1px solid var(--line)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 20,
        }}
      >
        <img src="/spacyapps-logo.png" alt="SpacyApps" style={{ height: 26, width: 'auto', display: 'block', opacity: 0.68 }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-faint)', letterSpacing: 1.5 }}>
          © MMX–MMXXVI  ·  @SPACYAPPS
        </span>
      </footer>
      </div>

    </div>
    </ScaleWrapper>
  );
}

// A card's status, in the hero's language: a pulsing green dot for a world
// that's live, a slowly turning dashed ring for one still being built.
function PhaseTag({ live }: { live: boolean }) {
  const color = live ? 'var(--live)' : 'var(--accent-2)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: 2, color }}>
      {live
        ? <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}`, animation: 'bo-pulse 2.4s ease-in-out infinite' }} />
        : <span style={{ width: 7, height: 7, borderRadius: '50%', border: `1px dashed ${color}`, animation: 'jr-spin 6s linear infinite' }} />}
      {live ? 'LIVE' : 'UNDER CONSTRUCTION'}
    </div>
  );
}
