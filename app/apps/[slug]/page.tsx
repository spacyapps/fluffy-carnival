import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { APPS } from '../../data/apps';
import Stars from '../../components/boutique/Stars';
import Logotype from '../../components/boutique/Logotype';
import AppIcon from '../../components/boutique/AppIcon';

export async function generateStaticParams() {
  return APPS.map((app) => ({ slug: app.slug }));
}

const FEATURES = [
  {
    title: 'Designed for focus',
    body: 'No streaks. No nudges. No dark patterns. Just the feature you came for.',
  },
  {
    title: 'Private by default',
    body: 'Your data stays on your device. iCloud sync if you want it, never a server.',
  },
  {
    title: 'Built to last',
    body: 'One-time purchase, lifetime updates. No subscription required, ever.',
  },
];

export default async function AppPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const app = APPS.find((a) => a.slug === slug);
  if (!app) notFound();

  return (
    <div
      style={{
        width: '100%',
        background: 'var(--bg)',
        color: 'var(--ink)',
        fontFamily: 'var(--font-body)',
        position: 'relative',
      }}
    >
      <Stars density={50} />
      <div style={{ position: 'relative', padding: '28px 56px 80px' }}>

        {/* Header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            marginBottom: 80,
          }}
        >
          <Link
            href="/"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--ink-dim)',
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              letterSpacing: 1.5,
              cursor: 'pointer',
              padding: 0,
              justifySelf: 'flex-start',
              textDecoration: 'none',
            }}
          >
            ← Back to the fleet
          </Link>
          <Logotype size={12} />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--ink-faint)',
              letterSpacing: 1.5,
              justifySelf: 'flex-end',
            }}
          >
            №{app.slug.toUpperCase()}
          </span>
        </div>

        {/* Hero grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 72,
            alignItems: 'center',
            marginBottom: 100,
          }}
        >
          <div>
            <AppIcon glyph={app.glyph} color={app.color} size={84} icon={app.icon} />
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontWeight: 300,
                fontSize: 96,
                margin: '32px 0 8px',
                letterSpacing: -3,
                lineHeight: 0.92,
              }}
            >
              {app.name}
              <span style={{ fontStyle: 'italic', color: 'var(--accent)' }}>.</span>
            </h1>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--ink-faint)',
                letterSpacing: 2,
                marginBottom: 28,
              }}
            >
              {app.platform.toUpperCase()}  ·  v{app.version}
            </div>
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontSize: 26,
                lineHeight: 1.4,
                color: 'var(--ink)',
                fontWeight: 300,
                margin: '0 0 24px',
                maxWidth: 480,
              }}
            >
              &ldquo;{app.tagline}&rdquo;
            </p>
            <div
              style={{
                fontSize: 15,
                lineHeight: 1.7,
                color: 'var(--ink-dim)',
                fontWeight: 300,
                margin: '0 0 36px',
                maxWidth: 480,
                fontFamily: 'var(--font-body)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              {(app.description ?? `Built for one job, sharpened over a lot of late nights. ${app.name} is part of a small fleet of apps for people who'd rather their software disappear into the background than fight for attention.`)
                .split('\n\n').map((para, j) => (
                  <p key={j} style={{ margin: 0 }}>
                    {para.split('\n').map((line, k, arr) => (
                      <span key={k}>{line}{k < arr.length - 1 && <br />}</span>
                    ))}
                  </p>
                ))}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              {app.guide && (
                <a
                  href="#guide"
                  style={{
                    background: 'var(--accent)',
                    color: 'var(--bg)',
                    padding: '14px 26px',
                    borderRadius: 999,
                    fontSize: 14,
                    fontWeight: 600,
                    fontFamily: 'var(--font-body)',
                    textDecoration: 'none',
                    display: 'inline-block',
                  }}
                >
                  Read the guide ↓
                </a>
              )}
              {app.storeUrl && (
                <a
                  href={app.storeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: 'var(--accent)',
                    color: 'var(--bg)',
                    border: 'none',
                    padding: '14px 26px',
                    borderRadius: 999,
                    fontSize: 14,
                    fontWeight: 600,
                    fontFamily: 'var(--font-body)',
                    textDecoration: 'none',
                    display: 'inline-block',
                  }}
                >
                  Download on the App Store ↗
                </a>
              )}
              {app.websiteUrl && (
                <a
                  href={app.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: 'var(--accent)',
                    color: 'var(--bg)',
                    border: 'none',
                    padding: '14px 26px',
                    borderRadius: 999,
                    fontSize: 14,
                    fontWeight: 600,
                    fontFamily: 'var(--font-body)',
                    textDecoration: 'none',
                    display: 'inline-block',
                  }}
                >
                  Visit website ↗
                </a>
              )}
              <a
                href="#"
                style={{
                  background: 'transparent',
                  color: 'var(--ink)',
                  border: '1px solid var(--line)',
                  padding: '14px 26px',
                  borderRadius: 999,
                  fontSize: 14,
                  fontWeight: 500,
                  fontFamily: 'var(--font-body)',
                  textDecoration: 'none',
                  display: 'inline-block',
                }}
              >
                Changelog
              </a>
            </div>
          </div>

          {/* Mockup */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
            {app.screenshot ? (
              <div style={{
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow: '0 30px 80px rgba(0,0,0,0.6), inset 0 0 0 1.5px rgba(255,255,255,0.08)',
                maxWidth: 380,
                width: '100%',
              }}>
                <Image
                  src={app.screenshot}
                  alt={`${app.name} screenshot`}
                  width={563}
                  height={749}
                  loading="eager"
                  style={{ display: 'block', width: '100%', height: 'auto' }}
                />
              </div>
            ) : (
              <div
                style={{
                  width: 280,
                  height: 580,
                  borderRadius: 44,
                  background: 'linear-gradient(160deg, #20242c, #0e1014)',
                  padding: 12,
                  boxShadow: '0 30px 80px rgba(0,0,0,0.6), inset 0 0 0 1.5px rgba(255,255,255,0.08)',
                }}
              >
                {app.videoUrl ? (
                  <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 32, overflow: 'hidden' }}>
                    <video
                      src={app.videoUrl}
                      autoPlay
                      muted
                      loop
                      playsInline
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: '105%',
                        height: '105%',
                        transform: 'translate(-50%, -50%)',
                        objectFit: 'cover',
                      }}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: 32,
                      background: `linear-gradient(180deg, ${app.color}, oklch(0.18 0.06 from ${app.color} h))`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 18,
                      color: '#fff',
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: 100, fontWeight: 300, lineHeight: 1 }}>{app.glyph}</div>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: 30, fontStyle: 'italic', fontWeight: 400 }}>{app.name}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, opacity: 0.6, letterSpacing: 2 }}>SCREENSHOT</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {(app.features ?? FEATURES).map((f, i) => (
            <div
              key={i}
              style={{
                padding: 32,
                border: '1px solid var(--line)',
                borderRadius: 14,
                background: 'var(--bg-panel)',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: 'var(--accent)',
                  letterSpacing: 2,
                  marginBottom: 14,
                }}
              >
                I.{String(i + 1).padStart(2, '0')}
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 24,
                  fontWeight: 400,
                  margin: '0 0 10px',
                  letterSpacing: -0.4,
                }}
              >
                {f.title}
              </h3>
              <div
                style={{
                  fontSize: 14,
                  color: 'var(--ink-dim)',
                  lineHeight: 1.65,
                  fontWeight: 300,
                  fontFamily: 'var(--font-body)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                {f.body.split('\n\n').map((para, j) => (
                  <p key={j} style={{ margin: 0 }}>
                    {para.split('\n').map((line, k, arr) => (
                      <span key={k}>{line}{k < arr.length - 1 && <br />}</span>
                    ))}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Mission briefing guide */}
        {app.guide && (
          <div id="guide" style={{
            marginTop: 80,
            background: '#08090b',
            borderRadius: 20,
            border: '1px solid var(--line)',
            overflow: 'hidden',
          }}>
            {/* Header bar */}
            <div style={{
              padding: '20px 40px',
              borderBottom: '1px solid var(--line)',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}>
              <div style={{ display: 'flex', gap: 7 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', letterSpacing: 3 }}>
                ◈ MISSION BRIEFING
              </span>
            </div>

            {/* Title */}
            <div style={{ padding: '48px 40px 0' }}>
              <h2 style={{
                fontFamily: 'var(--font-serif)',
                fontWeight: 300,
                fontSize: 48,
                margin: '0 0 8px',
                letterSpacing: -1.5,
                lineHeight: 1,
              }}>
                <span style={{ fontStyle: 'italic', color: 'var(--accent)' }}>{app.guide.heading}</span>
              </h2>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-faint)', letterSpacing: 2, margin: 0 }}>
                {app.guide.steps.length} STEPS · FOLLOW IN ORDER
              </p>
            </div>

            {/* Steps */}
            <div style={{ padding: '40px 40px 48px', display: 'flex', flexDirection: 'column', gap: 0 }}>
              {app.guide.steps.map((step, i) => (
                <div key={i} style={{
                  display: 'grid',
                  gridTemplateColumns: '56px 1fr',
                  gap: 24,
                  padding: '28px 0',
                  borderBottom: i < app.guide!.steps.length - 1 ? '1px solid var(--line)' : 'none',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: 'var(--accent)',
                    letterSpacing: 2,
                    paddingTop: 4,
                  }}>
                    {String(i + 1).padStart(2, '0')}.
                  </div>
                  <div>
                    <h3 style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 22,
                      fontWeight: 400,
                      margin: '0 0 10px',
                      letterSpacing: -0.3,
                      lineHeight: 1.2,
                    }}>
                      {step.title}
                    </h3>
                    <p style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 14,
                      lineHeight: 1.7,
                      color: 'var(--ink-dim)',
                      fontWeight: 300,
                      margin: 0,
                    }}>
                      {step.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
