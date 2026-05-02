import Link from 'next/link';
import Stars from './components/boutique/Stars';
import BigPlanet from './components/boutique/BigPlanet';
import Marquee from './components/boutique/Marquee';
import Logotype from './components/boutique/Logotype';
import Nav from './components/boutique/Nav';
import AppIcon from './components/boutique/AppIcon';
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
    <div style={{ width: '100%', background: 'var(--bg)', color: 'var(--ink)', fontFamily: 'var(--font-body)' }}>

      {/* HERO */}
      <section style={{ position: 'relative', minHeight: 920, padding: '24px 56px 80px', overflow: 'hidden' }}>
        <Stars density={100} />
        <Nav />

        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', marginTop: 40, zIndex: 2 }}>
          <BigPlanet size={400} />
        </div>

        <div style={{ position: 'absolute', top: '38%', right: '8%', opacity: 0.6, animation: 'bo-float 5s ease-in-out infinite' }}>
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
            <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--ink)' }}>SPACYAPPS</span> is a one-person studio building iOS &amp; Safari apps to assist certain user types. The site is also a space log — there&apos;s writing here when it&apos;s received from orbit.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 36 }}>
            <Link
              href="#apps"
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
              href="#journal"
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
              Read the journal
            </Link>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <Marquee />

      {/* APPS */}
      <section id="missions" style={{ padding: '96px 56px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 56 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 3, color: 'var(--accent)', marginBottom: 14 }}>
              I.  MISSIONS
            </div>
            <h2
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
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-faint)', letterSpacing: 1.5 }}>
            02 SHIPPED · 01 INCOMING
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {APPS.map((app, i) => (
            <Link
              key={app.slug}
              href={`/apps/${app.slug}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div
                className="bo-card"
                style={{
                  position: 'relative',
                  padding: '36px 30px 28px',
                  background: 'var(--bg-panel)',
                  border: '1px solid var(--line)',
                  borderRadius: 14,
                  cursor: 'pointer',
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
                <p style={{ fontSize: 14.5, lineHeight: 1.6, color: 'var(--ink-dim)', margin: '0 0 24px', fontWeight: 300, minHeight: 70, fontFamily: 'var(--font-body)' }}>
                  {app.tagline}
                </p>
                <div style={{ paddingTop: 16, borderTop: '1px solid var(--line)', fontSize: 13, fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--accent)' }}>
                  Open the briefing →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* NOW */}
      <section id="now" style={{ padding: '88px 56px', borderTop: '1px solid var(--line)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 64, alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 3, color: 'var(--accent-3)', marginBottom: 14 }}>
              II.  ON THE WORKBENCH
            </div>
            <h2
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
              Borrowed from Derek Sivers — a public snapshot of what&apos;s on my desk right now. Updated whenever something ships, breaks, or gets gently shelved.
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
              LAST PINGED 04.30.2026 — 22:17 PT
            </div>
          </div>
          <div>
            {NOW.map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '70px 130px 1fr 90px',
                  gap: 20,
                  padding: '20px 0',
                  alignItems: 'baseline',
                  borderBottom: '1px solid var(--line)',
                }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-faint)', letterSpacing: 1 }}>{item.date}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: item.statusColor, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 600 }}>● {item.status}</span>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 400, color: 'var(--ink)', letterSpacing: -0.4, lineHeight: 1.3 }}>{item.title}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-faint)', textAlign: 'right', letterSpacing: 1, textTransform: 'uppercase' }}>{item.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* JOURNAL */}
      <section id="journal" style={{ padding: '96px 56px', borderTop: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 56 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 3, color: 'var(--accent-2)', marginBottom: 14 }}>
              III.  THE JOURNAL
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontWeight: 300,
                fontSize: 60,
                margin: 0,
                letterSpacing: -1.8,
                lineHeight: 0.95,
              }}
            >
              Field notes from <span style={{ fontStyle: 'italic', color: 'var(--accent-2)' }}>orbit.</span>
            </h2>
          </div>
          <Link href="#" className="bo-link" style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 17, color: 'var(--ink-dim)' }}>
            All entries →
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 48 }}>
          <article
            className="bo-card"
            style={{
              padding: '44px 40px',
              cursor: 'pointer',
              background: 'var(--bg-panel)',
              border: '1px solid var(--line)',
              borderRadius: 14,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', top: -40, right: -40, opacity: 0.5 }}>
              <BigPlanet size={220} />
            </div>
            <div style={{ position: 'relative' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', letterSpacing: 2, marginBottom: 18 }}>
                ✦ FEATURED  ·  {POSTS[0].date.toUpperCase()}
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 44,
                  fontWeight: 300,
                  margin: '0 0 18px',
                  letterSpacing: -1,
                  lineHeight: 1.05,
                }}
              >
                {POSTS[0].title}
              </h3>
              <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--ink-dim)', fontWeight: 300, margin: '0 0 24px', maxWidth: 480, fontFamily: 'var(--font-body)' }}>
                {POSTS[0].excerpt}
              </p>
              <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 16, color: 'var(--accent)' }}>Keep reading →</span>
            </div>
          </article>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {POSTS.slice(1).map((p, i) => (
              <article
                key={i}
                className="bo-card"
                style={{
                  padding: '24px 4px',
                  cursor: 'pointer',
                  borderBottom: i < POSTS.length - 2 ? '1px solid var(--line)' : 'none',
                }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-faint)', letterSpacing: 1.5, marginBottom: 10 }}>
                  {p.date.toUpperCase()}  ·  {p.read.toUpperCase()}
                </div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 400, margin: '0 0 8px', letterSpacing: -0.5, lineHeight: 1.2 }}>{p.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--ink-dim)', margin: 0, fontWeight: 300, fontFamily: 'var(--font-body)' }}>{p.excerpt}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" style={{ position: 'relative', padding: '96px 56px 64px', borderTop: '1px solid var(--line)', textAlign: 'center', overflow: 'hidden' }}>
        <Stars density={30} />
        <div style={{ position: 'relative' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 3, color: 'var(--accent)', marginBottom: 18 }}>
            IV.  SIGNAL STATUS
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 300,
              fontSize: 88,
              margin: 0,
              letterSpacing: -3,
              lineHeight: 0.95,
            }}
          >
            <span style={{ fontStyle: 'italic' }}>Transmissions</span> closed.
          </h2>
          <p style={{ fontSize: 17, color: 'var(--ink-dim)', lineHeight: 1.6, fontWeight: 300, margin: '24px auto 0', maxWidth: 480, fontFamily: 'var(--font-body)' }}>
            Monitoring from orbit.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer
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
        <Logotype size={12} color="var(--ink-faint)" />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-faint)', letterSpacing: 1.5 }}>
          © MMXXVI  ·  ORBITING SAN FRANCISCO  ·  RSS · MASTODON · @SPACYAPPS
        </span>
      </footer>

    </div>
  );
}
