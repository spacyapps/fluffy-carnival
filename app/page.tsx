import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import Stars from './components/boutique/Stars';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};
import ContactLink from './components/boutique/ContactLink';
import BigPlanet from './components/boutique/BigPlanet';
import Marquee from './components/boutique/Marquee';
import Nav from './components/boutique/Nav';
import AppIcon from './components/boutique/AppIcon';
import ScaleWrapper from './components/boutique/ScaleWrapper';
import { APPS } from './data/apps';
import { POSTS } from './data/posts';
import { NOW } from './data/now';

function Comet() {
  return (
    <svg width="150" height="50" viewBox="0 0 150 50" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="cmt-tail" x1="0" x2="1">
          <stop offset="0" stopColor="#e8a87c" stopOpacity="0" />
          <stop offset="1" stopColor="#e8a87c" stopOpacity="0.8" />
        </linearGradient>
      </defs>
      <path d="M 0 25 Q 60 18, 130 25" stroke="url(#cmt-tail)" strokeWidth="2" fill="none" />
      <circle cx="132" cy="25" r="5" fill="#e8a87c" />
      <circle cx="132" cy="25" r="9" fill="#e8a87c" opacity="0.3" />
    </svg>
  );
}

export default function Home() {
  return (
    <ScaleWrapper>
    <div style={{ width: '100%', background: 'var(--bg)', color: 'var(--ink)', fontFamily: 'var(--font-body)' }}>

      {/* HERO */}
      <section className="bo-hero" style={{ position: 'relative', minHeight: 920, padding: '24px 56px 80px', overflow: 'hidden' }}>
        <Stars density={100} />
        <Nav />

        <div className="bo-planet-hero" style={{ position: 'relative', display: 'flex', justifyContent: 'center', marginTop: 40, zIndex: 2 }}>
          <BigPlanet size={400} />
        </div>

        <div className="bo-hide-mobile" style={{ position: 'absolute', top: '38%', right: '8%', opacity: 0.6, animation: 'bo-float 5s ease-in-out infinite' }}>
          <Comet />
        </div>

        <div style={{ position: 'relative', textAlign: 'center', marginTop: 40, zIndex: 3 }}>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 300,
              fontSize: 'clamp(80px, 11vw, 160px)',
              margin: 0,
              letterSpacing: -4,
              lineHeight: 0.92,
              color: 'var(--ink)',
            }}
          >
            Small missions,<br />
            <span style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--accent)' }}>far-flung</span> ideas.
          </h1>
        </div>

        <div style={{ position: 'relative', textAlign: 'center', marginTop: 40, maxWidth: 620, marginLeft: 'auto', marginRight: 'auto', zIndex: 3 }}>
          <p style={{ fontSize: 18, lineHeight: 1.6, color: 'var(--ink-dim)', fontWeight: 300, margin: 0 }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--ink)' }}>SPACYAPPS</span>{' '}is a one-person studio building Apple apps to assist certain user types. The site is also a space log — there&apos;s writing here when it&apos;s received from orbit.
          </p>
          <div className="bo-cta-wrap" style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 36 }}>
            <Link
              href="#missions"
              style={{
                background: 'var(--accent)',
                color: 'var(--bg)',
                border: 'none',
                padding: '14px 28px',
                borderRadius: 999,
                fontSize: 14,
                fontWeight: 600,
                fontFamily: 'var(--font-body)',
                letterSpacing: 0.2,
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Tour the missions →
            </Link>
            <Link
              href="/journal"
              style={{
                background: 'transparent',
                color: 'var(--ink)',
                border: '1px solid var(--line)',
                padding: '14px 28px',
                borderRadius: 999,
                fontSize: 14,
                fontWeight: 500,
                fontFamily: 'var(--font-body)',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Explore the journal star map
            </Link>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <Marquee />

      {/* APPS */}
      <section id="missions" className="bo-section" style={{ padding: '96px 56px' }}>
        <div className="bo-flex-col" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 56 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 3, color: 'var(--accent)', marginBottom: 14 }}>
              I.  MISSIONS
            </div>
            <h2
              className="bo-h-xl"
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
          <div className="bo-hide-mobile" style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-faint)', letterSpacing: 1.5 }}>
            03 SHIPPED · 01 INCOMING
          </div>
        </div>

        <div className="bo-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          {APPS.map((app, i) => {
            const cardInner = (
              <div
                className="bo-card"
                style={{
                  position: 'relative',
                  padding: '36px 30px 28px',
                  background: 'var(--bg-panel)',
                  border: '1px solid var(--line)',
                  borderRadius: 14,
                  cursor: app.noPage ? 'default' : 'pointer',
                  animation: `bo-fadein .55s ease-out ${i * 0.06}s both`,
                  height: '100%',
                  boxSizing: 'border-box',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                  <AppIcon glyph={app.glyph} color={app.color} size={56} icon={app.icon} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-faint)', letterSpacing: 1.5, textAlign: 'right', lineHeight: 1.6 }}>
                    №{String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, fontWeight: 400, margin: '0 0 4px', letterSpacing: -0.7, lineHeight: 1 }}>
                  {app.name}
                </h3>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-faint)', letterSpacing: 1.5, marginBottom: 16 }}>
                  {app.platform.toUpperCase()}  ·  v{app.version}
                </div>
                <p style={{ fontSize: 14.5, lineHeight: 1.6, color: 'var(--ink-dim)', margin: (app.companion || app.milestones) ? '0 0 16px' : '0 0 24px', fontWeight: 300, minHeight: 70, fontFamily: 'var(--font-body)' }}>
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
                <div style={{ paddingTop: 16, borderTop: '1px solid var(--line)', fontSize: 13, fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: app.noPage ? 'var(--ink-faint)' : 'var(--accent)' }}>
                  {app.noPage ? 'In development...' : (app.cta ?? 'Open the briefing →')}
                </div>
              </div>
            );
            return app.noPage ? (
              <div key={app.slug}>{cardInner}</div>
            ) : (
              <Link key={app.slug} href={`/apps/${app.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                {cardInner}
              </Link>
            );
          })}
        </div>
      </section>

      {/* NOW */}
      <section id="now" className="bo-section" style={{ padding: '88px 56px', borderTop: '1px solid var(--line)' }}>
        <div className="bo-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 64, alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 3, color: 'var(--accent-3)', marginBottom: 14 }}>
              II.  ON THE WORKBENCH
            </div>
            <h2
              className="bo-h-lg"
              style={{
                fontFamily: 'var(--font-serif)',
                fontWeight: 300,
                fontSize: 60,
                margin: '0 0 24px',
                letterSpacing: -1.8,
                lineHeight: 0.95,
              }}
            >
              <span style={{ fontStyle: 'italic' }}>Now</span> — what I&apos;m actually building.
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--ink-dim)', fontWeight: 300, maxWidth: 360, fontFamily: 'var(--font-body)', margin: 0 }}>
              Current mission status — updated when things ship, break, or get gently shelved.
            </p>
            <div style={{ marginTop: 28, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-faint)', letterSpacing: 1.5, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  display: 'inline-block',
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: 'var(--accent)',
                  animation: 'bo-pulse 2s ease-in-out infinite',
                }}
              />
              LAST PINGED 05.08.2026 — 22:17 PT
            </div>
          </div>
          <div>
            {NOW.map((item, i) => (
              <div
                key={i}
                className="bo-now-row"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '70px 130px 1fr 90px',
                  gap: 20,
                  padding: '20px 0',
                  alignItems: 'baseline',
                  borderBottom: '1px solid var(--line)',
                }}
              >
                <span className="bo-now-date" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-faint)', letterSpacing: 1 }}>{item.date}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: item.statusColor, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 600 }}>● {item.status}</span>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 400, color: 'var(--ink)', letterSpacing: -0.4, lineHeight: 1.3 }}>{item.title}</span>
                <span className="bo-now-tag" style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-faint)', textAlign: 'right', letterSpacing: 1, textTransform: 'uppercase' }}>{item.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LOG */}
      <section id="journal" className="bo-section" style={{ padding: '96px 56px', borderTop: '1px solid var(--line)' }}>
        <div className="bo-flex-col" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 56 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 3, color: 'var(--accent-2)', marginBottom: 14 }}>
              III.  THE JOURNAL
            </div>
            <h2
              className="bo-h-lg"
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
          <Link href={POSTS[0].link ?? '/journal'} style={{ textDecoration: 'none', color: 'inherit' }}>
            <article
              className="bo-card"
              style={{
                padding: '44px 48px',
                cursor: 'pointer',
                background: 'var(--bg-panel)',
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
            {POSTS.slice(1).filter(p => !p.title.startsWith('Coming')).map(post => (
              <Link key={post.slug} href={post.link ?? `/journal/${post.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <article className="bo-card" style={{ padding: '28px 32px', cursor: 'pointer', background: 'var(--bg-panel)', border: '1px solid var(--line)', borderRadius: 14 }}>
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
        <Stars density={30} />
        <div style={{ position: 'relative' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 3, color: 'var(--accent)', marginBottom: 18 }}>
            IV.  SIGNAL STATUS
          </div>
          <h2
            className="bo-h-xxl"
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
          <p style={{ fontSize: 17, color: 'var(--ink-dim)', lineHeight: 1.6, fontWeight: 300, margin: '24px 0 0', fontFamily: 'var(--font-body)' }}>
            Questions, ideas, or just saying hello —
          </p>
          <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
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
    </ScaleWrapper>
  );
}
