import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { APPS, type App } from '../../data/apps';
import Stars from '../../components/boutique/Stars';
import Logotype from '../../components/boutique/Logotype';
import AppIcon from '../../components/boutique/AppIcon';
import GestureMatchAnimation from '../../components/boutique/GestureMatchAnimation';
import AuthMatchSVG from '../../components/boutique/AuthMatchSVG';
import PictureKeyConceptSVG from '../../components/boutique/PictureKeyConceptSVG';
import FeatureSlideshow from '../../components/boutique/FeatureSlideshow';
import CrossfadeSlides from '../../components/boutique/CrossfadeSlides';
import VideoWithProgress from '../../components/boutique/VideoWithProgress';
import ScaleWrapper from '../../components/boutique/ScaleWrapper';
import DeadGapSVG from '../../components/boutique/DeadGapSVG';
import PanelOpenSVG from '../../components/boutique/PanelOpenSVG';
import AutoVideo from '../../components/boutique/AutoVideo';
import ReportTreeSVG from '../../components/boutique/ReportTreeSVG';
import SameYesSVG from '../../components/boutique/SameYesSVG';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

function ToleranceRectSVG() {
  const accent = '#e8a87c';
  const faint = 'rgba(236,230,214,0.34)';
  const mono = 'var(--font-mono)';

  // Match scenario: P and Q close, boxes overlap
  const mPx = 72, mPy = 88, mQx = 100, mQy = 100, half = 28;
  // Fail scenario: P and Q far apart, no overlap
  const fPx = 194, fPy = 72, fQx = 230, fQy = 108, fHalf = 28;

  // Overlap rect for match scenario
  const ox1 = Math.max(mPx - half, mQx - half);
  const oy1 = Math.max(mPy - half, mQy - half);
  const ox2 = Math.min(mPx + half, mQx + half);
  const oy2 = Math.min(mPy + half, mQy + half);

  return (
    <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--line)', background: 'rgba(0,0,0,0.25)' }}>
      <svg width="100%" viewBox="0 0 296 190" style={{ display: 'block' }}>
        {/* header label */}
        <text x="148" y="18" textAnchor="middle" fontFamily={mono} fontSize="8" letterSpacing="2" fill={faint}>
          RECTANGLES OF TOLERANCE
        </text>

        {/* ── MATCH SCENARIO ── */}
        {/* P box */}
        <rect x={mPx - half} y={mPy - half} width={half * 2} height={half * 2}
          fill="none" stroke={accent} strokeOpacity="0.5" strokeWidth="1" strokeDasharray="3 3" />
        {/* Q box */}
        <rect x={mQx - half} y={mQy - half} width={half * 2} height={half * 2}
          fill="none" stroke="#9bb5c9" strokeOpacity="0.5" strokeWidth="1" strokeDasharray="3 3" />
        {/* overlap fill */}
        {ox2 > ox1 && oy2 > oy1 && (
          <rect x={ox1} y={oy1} width={ox2 - ox1} height={oy2 - oy1}
            fill={accent} fillOpacity="0.12" />
        )}
        {/* P dot + label */}
        <circle cx={mPx} cy={mPy} r="3" fill={accent} />
        <text x={mPx - 2} y={mPy - half - 6} textAnchor="middle" fontFamily={mono} fontSize="9" fill={accent} fillOpacity="0.9">P</text>
        {/* Q dot + label */}
        <circle cx={mQx} cy={mQy} r="3" fill="#9bb5c9" />
        <text x={mQx + 2} y={mQy + half + 14} textAnchor="middle" fontFamily={mono} fontSize="9" fill="#9bb5c9" fillOpacity="0.9">Q</text>
        {/* result label */}
        <text x="88" y="168" textAnchor="middle" fontFamily={mono} fontSize="8.5" letterSpacing="1" fill={accent} fillOpacity="0.85">boxes overlap → match</text>

        {/* divider */}
        <line x1="148" y1="32" x2="148" y2="162" stroke="rgba(236,230,214,0.1)" strokeWidth="1" />

        {/* ── FAIL SCENARIO ── */}
        {/* P box */}
        <rect x={fPx - fHalf} y={fPy - fHalf} width={fHalf * 2} height={fHalf * 2}
          fill="none" stroke={accent} strokeOpacity="0.5" strokeWidth="1" strokeDasharray="3 3" />
        {/* Q box */}
        <rect x={fQx - fHalf} y={fQy - fHalf} width={fHalf * 2} height={fHalf * 2}
          fill="none" stroke="#9bb5c9" strokeOpacity="0.5" strokeWidth="1" strokeDasharray="3 3" />
        {/* P dot + label */}
        <circle cx={fPx} cy={fPy} r="3" fill={accent} />
        <text x={fPx} y={fPy - fHalf - 6} textAnchor="middle" fontFamily={mono} fontSize="9" fill={accent} fillOpacity="0.9">P</text>
        {/* Q dot + label */}
        <circle cx={fQx} cy={fQy} r="3" fill="#9bb5c9" />
        <text x={fQx} y={fQy + fHalf + 14} textAnchor="middle" fontFamily={mono} fontSize="9" fill="#9bb5c9" fillOpacity="0.9">Q</text>
        {/* no-overlap cross */}
        <line x1={fPx + fHalf + 2} y1={fPy} x2={fQx - fHalf - 2} y2={fQy}
          stroke="rgba(236,230,214,0.15)" strokeWidth="1" strokeDasharray="2 4" />
        {/* result label */}
        <text x="212" y="168" textAnchor="middle" fontFamily={mono} fontSize="8.5" letterSpacing="1" fill="rgba(236,230,214,0.4)">no overlap → fail</text>
      </svg>
    </div>
  );
}

function highlightTerms(text: string) {
  const terms = ['greedy traversal', 'greedy'];
  const pattern = new RegExp(`(${terms.join('|')})`, 'gi');
  return text.split(pattern).map((part, i) =>
    terms.some(t => t.toLowerCase() === part.toLowerCase())
      ? <span key={i} style={{ color: 'var(--accent)', fontStyle: 'italic' }}>{part}</span>
      : part
  );
}

type Section = {
  heading?: string;
  body: string;
  callout?: string;
  analogy?: { body: string[]; diagram: string; caption: string; footer: string };
};

function renderSection(section: Section) {
  return (
    <div>
      {section.heading && (
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 400, margin: '0 0 12px', letterSpacing: -0.3, color: 'var(--accent)' }}>
          {section.heading}
        </h3>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {section.body.split('\n\n').map((para, k) => (
          <p key={k} style={{ fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.75, color: 'var(--ink-dim)', fontWeight: 300, margin: 0 }}>
            {highlightTerms(para)}
          </p>
        ))}
        {section.callout && (
          <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 19, lineHeight: 1.5, color: 'var(--ink)', fontWeight: 300, margin: '8px 0 0', paddingLeft: 16, borderLeft: '2px solid var(--accent)' }}>
            {section.callout}
          </p>
        )}
        {section.analogy && (
          <div style={{ marginTop: 24, background: 'rgba(232,168,124,0.04)', border: '1px solid rgba(232,168,124,0.18)', borderRadius: 12, padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 3, color: 'var(--accent)', marginBottom: 4 }}>✦ IN PLAIN ENGLISH</div>
            {section.analogy.body.map((p, k) => (
              <p key={k} style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.75, color: 'var(--ink-dim)', fontWeight: 300, margin: 0, fontStyle: 'italic' }}>
                {highlightTerms(p)}
              </p>
            ))}
            <div style={{ margin: '4px 0', background: 'rgba(0,0,0,0.25)', borderRadius: 8, padding: '16px 12px' }}>
              <GestureMatchAnimation />
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: 1.65, color: 'var(--ink-faint)', fontWeight: 300, margin: 0, fontStyle: 'italic' }}>
              {section.analogy.caption}
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.75, color: 'var(--ink-dim)', fontWeight: 300, margin: '4px 0 0', fontStyle: 'italic' }}>
              {highlightTerms(section.analogy.footer)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  return APPS.filter((app) => !app.noPage).map((app) => ({ slug: app.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const app = APPS.find((a) => a.slug === slug);
  if (!app) return {};
  return {
    title: `${app.name} — SpacyApps`,
    description: app.tagline,
    alternates: { canonical: `/apps/${app.slug}` },
  };
}

const FEATURES: NonNullable<App['features']> = [
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
    <ScaleWrapper>
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
      <div className="bo-app-wrap" style={{ position: 'relative', padding: '28px 56px 80px' }}>

        {/* Header */}
        <div
          className="bo-app-header"
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
            className="bo-hide-mobile"
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
          className="bo-app-hero"
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
              className="bo-h-app"
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
            {app.status && (
              <div
                style={{
                  display: 'inline-block',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  letterSpacing: 2,
                  color: 'var(--accent)',
                  border: '1px solid rgba(232,168,124,0.35)',
                  borderRadius: 999,
                  padding: '6px 14px',
                  margin: '-14px 0 26px',
                }}
              >
                {app.status.toUpperCase()}
              </div>
            )}
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
              {app.descriptionPoints ? (
                app.descriptionPoints.map((point, j) => (
                  <div key={j} style={{ display: 'grid', gridTemplateColumns: '14px 1fr', gap: 12, alignItems: 'start' }}>
                    <div
                      aria-hidden
                      style={{ height: 2, width: 14, background: 'var(--accent)', opacity: 0.8, marginTop: 11 }}
                    />
                    <p style={{ margin: 0 }}>
                      {point.split('**').map((seg, s) =>
                        s % 2 === 1 ? <strong key={s} style={{ fontWeight: 600, color: 'var(--ink)' }}>{seg}</strong> : seg
                      )}
                    </p>
                  </div>
                ))
              ) : (
                (app.description ?? `Built for one job, sharpened over a lot of late nights. ${app.name} is part of a small fleet of apps for people who'd rather their software disappear into the background than fight for attention.`)
                  .split('\n\n').map((para, j) => (
                    <p key={j} style={{ margin: 0 }}>
                      {para.split('\n').map((line, k, arr) => (
                        <span key={k}>
                          {line.split('**').map((seg, s) =>
                            s % 2 === 1 ? <strong key={s} style={{ fontWeight: 600, color: 'var(--ink)' }}>{seg}</strong> : seg
                          )}
                          {k < arr.length - 1 && <br />}
                        </span>
                      ))}
                    </p>
                  ))
              )}
            </div>
            {app.situationImages && app.situationImages.length === 2 && (
              <div style={{ display: 'flex', gap: 10, maxWidth: 480, margin: '0 0 36px' }}>
                {(['Before', 'After'] as const).map((label, j) => (
                  <div key={j} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--line)', background: 'rgba(0,0,0,0.2)' }}>
                      <img
                        src={app.situationImages![j]}
                        alt={label}
                        style={{ display: 'block', width: '100%', height: 'auto' }}
                      />
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: 2, color: 'var(--ink-faint)', textAlign: 'center' }}>
                      {label.toUpperCase()}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {app.heroQuote && (
              <div style={{ maxWidth: 480, margin: '4px 0 36px' }}>
                <div style={{ height: 2, width: 34, background: 'var(--accent)', opacity: 0.7, marginBottom: 20 }} />
                <p style={{
                  fontFamily: 'var(--font-serif)',
                  fontStyle: 'italic',
                  fontWeight: 300,
                  fontSize: 27,
                  lineHeight: 1.4,
                  letterSpacing: -0.5,
                  color: 'var(--ink)',
                  margin: 0,
                }}>
                  &ldquo;{app.heroQuote}&rdquo;
                </p>
              </div>
            )}
            <div className="bo-cta-wrap" style={{ display: 'flex', gap: 12 }}>
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
            </div>
          </div>

          {/* Mockup */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', gap: 24 }}>
            {app.videoUrl && app.videoFrame === 'desktop' ? (
              <div style={{ width: '100%' }}>
                <div style={{
                  maxWidth: '82%',
                  margin: '0 auto',
                  borderRadius: 14,
                  overflow: 'hidden',
                  background: '#08090b',
                  border: '1px solid var(--line)',
                  boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
                }}>
                  {/* window chrome, same three dots the briefing panel uses */}
                  <div style={{ padding: '11px 14px', borderBottom: '1px solid var(--line)', display: 'flex', gap: 7 }}>
                    {[0, 1, 2].map((d) => (
                      <div key={d} style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                    ))}
                  </div>
                  <div style={{ position: 'relative', aspectRatio: '1106 / 1016', background: '#000' }}>
                    <VideoWithProgress src={app.videoUrl} fit="contain" radius={0} />
                  </div>
                </div>
                {app.videoCaption && (
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 2.5, color: 'var(--ink-faint)', marginTop: 16, textAlign: 'center' }}>
                    {app.videoCaption.toUpperCase()}
                  </div>
                )}
                {app.videoSecondary && (
                  <div style={{ margin: '28px auto 0', width: '82%' }}>
                    <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--line)', background: '#0b0c10' }}>
                      <AutoVideo src={app.videoSecondary.src} ariaLabel={app.videoSecondary.alt} />
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 2.5, color: 'var(--ink-faint)', marginTop: 14, textAlign: 'center' }}>
                      {app.videoSecondary.caption.toUpperCase()}
                    </div>
                  </div>
                )}
              </div>
            ) : app.situationSolo && app.screenshot ? (
              <CrossfadeSlides
                color={app.color}
                aspectRatio="1070 / 1164"
                slides={[
                  { src: app.situationSolo.src, caption: app.situationSolo.caption },
                  { src: app.screenshot, caption: 'The Checkpoint gate, live on a restricted site' },
                ]}
              />
            ) : app.screenshot ? (
              <div style={{
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow: '0 30px 80px rgba(0,0,0,0.6), inset 0 0 0 1.5px rgba(255,255,255,0.08)',
                maxWidth: 380,
                width: '100%',
              }}>
                <img
                  src={app.screenshot}
                  alt={`${app.name} screenshot`}
                  style={{ display: 'block', width: '100%', height: 'auto' }}
                />
              </div>
            ) : (
              <div
                style={{
                  width: 290,
                  height: 590,
                  borderRadius: 44,
                  background: 'linear-gradient(160deg, #20242c, #0e1014)',
                  padding: 10,
                  boxShadow: '0 30px 80px rgba(0,0,0,0.6), inset 0 0 0 1.5px rgba(255,255,255,0.08)',
                }}
              >
                {app.videoUrl ? (
                  <VideoWithProgress src={app.videoUrl} />
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

        {/* Companion site showcase */}
        {app.companion && (
          <div style={{
            marginBottom: 100,
            background: '#08090b',
            borderRadius: 20,
            border: '1px solid var(--line)',
            overflow: 'hidden',
          }}>
            <div style={{ padding: '20px 40px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', letterSpacing: 3 }}>
                ↳ {app.companion.kicker}
              </span>
            </div>
            <div className="bo-companion-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.35fr', gap: 56, alignItems: 'center', padding: '48px 40px' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 52, margin: '0 0 20px', letterSpacing: -1.5, lineHeight: 1 }}>
                  {app.companion.name}
                  <span style={{ fontStyle: 'italic', color: 'var(--accent)' }}>.</span>
                </h2>
                <div style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--ink-dim)', fontWeight: 300, fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
                  {app.companion.blurb.split('\n\n').map((para, j) => (
                    <p key={j} style={{ margin: 0 }}>{para}</p>
                  ))}
                </div>
                <a
                  href={app.companion.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
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
                  Visit {app.companion.name} ↗
                </a>
              </div>
              <a
                href={app.companion.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  borderRadius: 12,
                  overflow: 'hidden',
                  border: '1px solid var(--line)',
                  boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
                }}
              >
                <img
                  src={app.companion.screenshot}
                  alt={`${app.companion.name} website preview`}
                  style={{ display: 'block', width: '100%', height: 'auto' }}
                />
              </a>
            </div>
          </div>
        )}

        {/* The problem — opening argument, before the feature cards.
            Left: the two failure modes in point form. Right: the same two as diagrams.
            Bottom: the resolve, full width. */}
        {app.problem && (
          <div style={{ marginTop: 20, marginBottom: 88 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', letterSpacing: 3 }}>◈ WHY IT EXISTS</span>
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 300,
              fontSize: 52,
              margin: '28px 0 40px',
              letterSpacing: -1.6,
              lineHeight: 1.08,
              maxWidth: 900,
            }}>
              <span style={{ fontStyle: 'italic', color: 'var(--accent)' }}>{app.problem.heading}</span>
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 64, alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {app.problem.body.split('\n\n').map((para, j) => (
                    <p key={j} style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: 1.8, color: 'var(--ink-dim)', fontWeight: 300, margin: 0 }}>
                      {para}
                    </p>
                  ))}
                </div>

                <div style={{ margin: '30px 0 30px', display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {app.problem.points.map((pt, j) => (
                    <div key={j} style={{ display: 'grid', gridTemplateColumns: '18px 1fr', gap: 16, alignItems: 'start' }}>
                      <div
                        aria-hidden
                        style={{ height: 2, width: 18, background: 'var(--accent)', opacity: 0.75, marginTop: 13 }}
                      />
                      <div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 2.5, color: 'var(--accent)', opacity: 0.85, marginBottom: 8 }}>
                          {pt.label.toUpperCase()}
                        </div>
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: 1.75, color: 'var(--ink-dim)', fontWeight: 300, margin: 0 }}>
                          {pt.body}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: 1.8, color: 'var(--ink-dim)', fontWeight: 300, margin: 0 }}>
                  {app.problem.closing}
                </p>
              </div>

              <div style={{ paddingTop: 4 }}>
                <DeadGapSVG />
              </div>
            </div>

            {/* The resolve — full width under both columns */}
            <div style={{
              marginTop: 56,
              paddingTop: 40,
              borderTop: '1px solid var(--line)',
              display: 'grid',
              gridTemplateColumns: '0.85fr 1.15fr',
              gap: 64,
              alignItems: 'center',
            }}>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 2.5, color: 'var(--accent)', opacity: 0.85, marginBottom: 18 }}>
                  {app.problem.resolveLabel.toUpperCase()}
                </div>
                <PanelOpenSVG />
              </div>
              <p style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontSize: 26,
                lineHeight: 1.45,
                color: 'var(--ink)',
                fontWeight: 300,
                margin: 0,
                paddingLeft: 24,
                borderLeft: '2px solid var(--accent)',
              }}>
                {app.problem.pull}
              </p>
            </div>
          </div>
        )}

        {/* Feature slideshow */}
        {app.slides && app.slides.length > 0 && (
          <FeatureSlideshow slides={app.slides} color={app.color} />
        )}

        {/* Features */}
        {app.featuresHeading && (
          <div style={{ marginBottom: 36 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', letterSpacing: 3 }}>◈ FEATURES</span>
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 300,
              fontSize: 44,
              margin: '26px 0 0',
              letterSpacing: -1.4,
              lineHeight: 1.1,
            }}>
              <span style={{ fontStyle: 'italic', color: 'var(--accent)' }}>{app.featuresHeading}</span>
            </h2>
          </div>
        )}
        <div className="bo-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
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
                      <span key={k}>
                        {line.split('**').map((seg, s) =>
                          s % 2 === 1 ? <strong key={s} style={{ fontWeight: 600, color: 'var(--ink)' }}>{seg}</strong> : seg
                        )}
                        {k < arr.length - 1 && <br />}
                      </span>
                    ))}
                  </p>
                ))}
              </div>
              {f.images && f.images.length === 2 && (
                <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
                  {(['Before', 'After'] as const).map((label, j) => (
                    <div key={j} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--line)', background: 'rgba(0,0,0,0.2)' }}>
                        <img
                          src={f.images![j]}
                          alt={label}
                          style={{ display: 'block', width: '100%', height: 'auto' }}
                        />
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: 2, color: 'var(--ink-faint)', textAlign: 'center' }}>
                        {label.toUpperCase()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {f.detail && (
                <a href={`#dive-${f.title.toLowerCase().replace(/\s+/g, '-')}`} style={{ textDecoration: 'none' }}>
                  <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--line)', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--accent)' }}>
                    See deep dive ↓
                  </div>
                </a>
              )}
            </div>
          ))}
        </div>

        {/* How it works — paired with what it refuses to do */}
        {app.howItWorks && (
          <div style={{ marginTop: 80, background: '#08090b', borderRadius: 20, border: '1px solid var(--line)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 40px', borderBottom: '1px solid var(--line)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', letterSpacing: 3 }}>
                ◈ HOW IT WORKS
              </span>
            </div>
            <div style={{ padding: '48px 40px', display: 'grid', gridTemplateColumns: app.howItWorks.counterpoint ? '0.85fr 1.15fr' : '1fr 1.25fr', gap: 56, alignItems: 'flex-start' }}>
              {/* left — what it does */}
              <div>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 34, margin: '0 0 22px', letterSpacing: -1, lineHeight: 1.15 }}>
                  <span style={{ fontStyle: 'italic', color: 'var(--accent)' }}>{app.howItWorks.heading}</span>
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {app.howItWorks.body.split('\n\n').map((para, j) => (
                    <div key={j}>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.75, color: 'var(--ink-dim)', fontWeight: 300, margin: 0 }}>
                        {para.split('**').map((seg, sIdx) =>
                          sIdx % 2 === 1
                            ? <strong key={sIdx} style={{ fontWeight: 500, color: 'var(--ink)' }}>{seg}</strong>
                            : seg
                        )}
                      </p>
                      {app.howItWorks!.points && (app.howItWorks!.pointsAfter ?? 0) === j && (
                        <ul style={{ listStyle: 'none', margin: '14px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
                          {app.howItWorks!.points.map((pt, k) => (
                            <li key={k} style={{ display: 'grid', gridTemplateColumns: '14px 1fr', gap: 12, alignItems: 'start' }}>
                              <span aria-hidden style={{ height: 2, width: 14, background: 'var(--accent)', opacity: 0.8, marginTop: 11 }} />
                              <span style={{ fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.65, color: 'var(--ink-dim)', fontWeight: 300 }}>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
                {/* signal chain — conceptual only; mechanism lives in the repo, not here */}
                <div style={{ marginTop: 28 }}>
                  <ReportTreeSVG />
                </div>
              </div>

              {/* right — what it refuses to do */}
              {app.howItWorks.counterpoint && (
                <div style={{ borderLeft: '1px solid var(--line)', paddingLeft: 56 }}>
                  {app.howItWorks.counterpoint.label && (
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 2.5, color: 'var(--ink-faint)', marginBottom: 16 }}>
                      {app.howItWorks.counterpoint.label.toUpperCase()}
                    </div>
                  )}
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 34, margin: '0 0 22px', letterSpacing: -1, lineHeight: 1.15 }}>
                    <span style={{ fontStyle: 'italic' }}>{app.howItWorks.counterpoint.heading}</span>
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {app.howItWorks.counterpoint.body.split('\n\n').map((para, j) => (
                      <p key={j} style={{ fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.75, color: 'var(--ink-dim)', fontWeight: 300, margin: 0 }}>
                        {para.split('**').map((seg, sIdx) =>
                          sIdx % 2 === 1
                            ? <strong key={sIdx} style={{ fontWeight: 500, color: 'var(--ink)' }}>{seg}</strong>
                            : seg
                        )}
                      </p>
                    ))}
                  </div>
                  <div style={{ marginTop: 32, padding: '24px 26px', background: 'rgba(0,0,0,0.22)', border: '1px solid var(--line)', borderRadius: 14 }}>
                    <SameYesSVG />
                  </div>
                  <p style={{
                    fontFamily: 'var(--font-serif)',
                    fontStyle: 'italic',
                    fontSize: 19,
                    lineHeight: 1.5,
                    color: 'var(--ink)',
                    fontWeight: 300,
                    margin: '28px 0 0',
                    paddingLeft: 20,
                    borderLeft: '2px solid var(--accent)',
                  }}>
                    {app.howItWorks.counterpoint.quote}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* How it was made — the recursion */}
        {app.challenges && (
          <div style={{ marginTop: 88 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', letterSpacing: 3 }}>
              {`◈ ${app.challenges.kicker.toUpperCase()}`}
            </span>
            <div style={{ marginTop: 26, display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 64, alignItems: 'flex-start' }}>
              <h2 style={{
                fontFamily: 'var(--font-serif)',
                fontWeight: 300,
                fontSize: 44,
                margin: 0,
                letterSpacing: -1.4,
                lineHeight: 1.1,
              }}>
                <span style={{ fontStyle: 'italic', color: 'var(--accent)' }}>{app.challenges.heading}</span>
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {app.challenges.body.split('\n\n').map((para, j) => (
                  <p key={j} style={{ fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.8, color: 'var(--ink-dim)', fontWeight: 300, margin: 0 }}>
                    {para}
                  </p>
                ))}
                {app.challenges.points && (
                  <ul style={{ listStyle: 'none', margin: '2px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
                    {app.challenges.points.map((pt, j) => (
                      <li key={j} style={{ display: 'grid', gridTemplateColumns: '14px 1fr', gap: 12, alignItems: 'start' }}>
                        <span aria-hidden style={{ height: 2, width: 14, background: 'var(--accent)', opacity: 0.8, marginTop: 11 }} />
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.65, color: 'var(--ink-dim)', fontWeight: 300 }}>{pt}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {app.challenges.closing && (
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.8, color: 'var(--ink-dim)', fontWeight: 300, margin: '4px 0 0' }}>
                    {app.challenges.closing.split('**').map((seg, sIdx) =>
                      sIdx % 2 === 1
                        ? <strong key={sIdx} style={{ fontWeight: 500, color: 'var(--ink)' }}>{seg}</strong>
                        : seg
                    )}
                  </p>
                )}
              </div>
            </div>
            <p style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontSize: 24,
              lineHeight: 1.45,
              color: 'var(--ink)',
              fontWeight: 300,
              margin: '40px 0 0',
              paddingLeft: 22,
              borderLeft: '2px solid var(--accent)',
              maxWidth: 720,
            }}>
              {app.challenges.pull.split('\n').map((line, j, arr) => (
                <span key={j}>
                  {line}
                  {j < arr.length - 1 && <br />}
                </span>
              ))}
            </p>
          </div>
        )}

        {/* Themes / fun — the largest block on the page, by intent */}
        {app.themes && (
          <div style={{ marginTop: 88 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', letterSpacing: 3 }}>◈ FUN IS A FEATURE</span>
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 300,
              fontSize: 52,
              margin: '28px 0 26px',
              letterSpacing: -1.6,
              lineHeight: 1.08,
            }}>
              <span style={{ fontStyle: 'italic', color: 'var(--accent)' }}>{app.themes.heading}</span>
            </h2>
            <p style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontSize: 24,
              lineHeight: 1.45,
              color: 'var(--ink)',
              fontWeight: 300,
              margin: '0 0 56px',
              maxWidth: 720,
            }}>
              {app.themes.lead}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(app.themes.blocks.length + 1, 3)}, 1fr)`, gap: 44, alignItems: 'flex-start' }}>
              {app.themes.blocks.map((b, j) => (
                <div key={j}>
                  <div style={{ height: 2, width: 28, background: 'var(--accent)', opacity: 0.7, marginBottom: 20 }} />
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 400, margin: '0 0 14px', letterSpacing: -0.4, lineHeight: 1.2 }}>
                    {b.heading}
                  </h3>
                  {b.image && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '0 0 16px' }}>
                      <img
                        src={b.image.src}
                        alt={b.image.alt}
                        width={72}
                        height={72}
                        style={{ display: 'block', width: 72, height: 72, borderRadius: 12, background: 'rgba(0,0,0,0.3)' }}
                      />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: 2, color: 'var(--ink-faint)', lineHeight: 1.6 }}>
                        {b.image.caption.toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {b.body.split('\n\n').map((para, k) => (
                      <p key={k} style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.75, color: 'var(--ink-dim)', fontWeight: 300, margin: 0 }}>
                        {para}
                      </p>
                    ))}
                  </div>
                  {b.points && (
                    <ul style={{ listStyle: 'none', margin: '14px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
                      {b.points.map((pt, k) => (
                        <li key={k} style={{ display: 'grid', gridTemplateColumns: '12px 1fr', gap: 10, alignItems: 'start' }}>
                          <span aria-hidden style={{ height: 2, width: 12, background: 'var(--accent)', opacity: 0.75, marginTop: 10 }} />
                          <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.6, color: 'var(--ink-dim)', fontWeight: 300 }}>
                            {pt}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {b.footer && (
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.75, color: 'var(--ink-dim)', fontWeight: 300, margin: '16px 0 0' }}>
                      {b.footer}
                    </p>
                  )}
                </div>
              ))}

              {/* third column — the argument, quieter than the two beside it */}
              <div style={{ gridRow: 'span 2' }}>
                <div style={{ height: 2, width: 28, background: 'var(--accent)', opacity: 0.7, marginBottom: 20 }} />
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 400, margin: '0 0 14px', letterSpacing: -0.4, lineHeight: 1.2 }}>
                  It has your unicorns?
                </h3>
                {app.themes.closingMedia && (
                  <div style={{ margin: '0 0 16px' }}>
                    <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--line)', background: '#0b0c10' }}>
                      <AutoVideo src={app.themes.closingMedia.src} ariaLabel={app.themes.closingMedia.alt} />
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: 1.8, color: 'var(--ink-faint)', marginTop: 10 }}>
                      {app.themes.closingMedia.caption.toUpperCase()}
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                  {app.themes.closing.split('\n\n').map((para, j) => (
                    <p key={j} style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, lineHeight: 1.75, color: 'var(--ink-dim)', fontWeight: 300, margin: 0 }}>
                      {para.split('**').map((seg, sIdx) =>
                        sIdx % 2 === 1
                          ? <strong key={sIdx} style={{ fontWeight: 500, color: 'var(--ink)' }}>{seg}</strong>
                          : seg
                      )}
                    </p>
                  ))}
                </div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: 1.5, color: 'var(--ink-faint)', margin: '16px 0 0', lineHeight: 1.7 }}>
                  {app.themes.note.toUpperCase()}
                </p>
              </div>

              {app.themes.strip && (
                <div style={{ gridColumn: 'span 2', alignSelf: 'start' }}>
                  <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--line)', background: '#0b0c10' }}>
                    {app.themes.strip.src.endsWith('.mp4') ? (
                      <AutoVideo src={app.themes.strip.src} ariaLabel={app.themes.strip.alt} />
                    ) : (
                      <img
                        src={app.themes.strip.src}
                        alt={app.themes.strip.alt}
                        style={{ display: 'block', width: '100%', height: 'auto' }}
                      />
                    )}
                  </div>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: 1.5, color: 'var(--ink-faint)', lineHeight: 1.8, margin: '14px 0 0' }}>
                    {app.themes.strip.caption.toUpperCase()}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* The theme tool */}
        {app.themeTool && (
          <div style={{ marginTop: 88 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', letterSpacing: 3 }}>
              {`◈ ${app.themeTool.kicker.toUpperCase()}`}
            </span>
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 300,
              fontSize: 36,
              margin: '24px 0 18px',
              letterSpacing: -1.1,
              lineHeight: 1.12,
            }}>
              <span style={{ fontStyle: 'italic', color: 'var(--accent)' }}>{app.themeTool.heading}</span>
            </h2>
            <p style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontSize: 18,
              lineHeight: 1.5,
              color: 'var(--ink)',
              fontWeight: 300,
              margin: '0 0 22px',
              maxWidth: 680,
            }}>
              {app.themeTool.lead}
            </p>
            {app.themeTool.steps && (
              <ul style={{ listStyle: 'none', margin: '0 0 44px', padding: 0, display: 'flex', flexDirection: 'column', gap: 9, maxWidth: 680 }}>
                {app.themeTool.steps.map((st, j) => (
                  <li key={j} style={{ display: 'grid', gridTemplateColumns: '14px 1fr', gap: 12, alignItems: 'start' }}>
                    <span aria-hidden style={{ height: 2, width: 14, background: 'var(--accent)', opacity: 0.8, marginTop: 10 }} />
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 14.5, lineHeight: 1.65, color: 'var(--ink-dim)', fontWeight: 300 }}>{st}</span>
                  </li>
                ))}
              </ul>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'flex-start' }}>
              {app.themeTool.blocks.map((b, j) => (
                <div key={j}>
                  <div style={{ height: 2, width: 28, background: 'var(--accent)', opacity: 0.7, marginBottom: 20 }} />
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 21, fontWeight: 400, margin: '0 0 13px', letterSpacing: -0.35, lineHeight: 1.25 }}>
                    {b.heading}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {b.body.split('\n\n').map((para, k) => (
                      <p key={k} style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.75, color: 'var(--ink-dim)', fontWeight: 300, margin: 0 }}>
                        {para}
                      </p>
                    ))}
                  </div>
                  {b.media && (
                    <div style={{ marginTop: 18 }}>
                      {b.media.heading && (
                        <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 17, lineHeight: 1.4, color: 'var(--ink)', fontWeight: 300, margin: '0 0 14px' }}>
                          {b.media.heading}
                        </p>
                      )}
                      <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--line)', background: '#0b0c10' }}>
                        {b.media.src.endsWith('.mp4') ? (
                          <AutoVideo src={b.media.src} ariaLabel={b.media.alt} />
                        ) : (
                          <img
                            src={b.media.src}
                            alt={b.media.alt}
                            style={{ display: 'block', width: '100%', height: 'auto' }}
                          />
                        )}
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: 1.8, color: 'var(--ink-faint)', marginTop: 10 }}>
                        {b.media.caption.toUpperCase()}
                      </div>
                      {b.media.attribution && (
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, lineHeight: 1.7, color: 'var(--ink-faint)', fontWeight: 300, margin: '8px 0 0' }}>
                          {b.media.attribution}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {app.themeTool.demo && (
              <div style={{ marginTop: 52, textAlign: 'center' }}>
                <div style={{ height: 2, width: 28, background: 'var(--accent)', opacity: 0.7, margin: '0 auto 20px' }} />
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 21, fontWeight: 400, margin: '0 0 13px', letterSpacing: -0.35, lineHeight: 1.25 }}>
                  {app.themeTool.demo.heading}
                </h3>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.75, color: 'var(--ink-dim)', fontWeight: 300, margin: '0 auto 26px', maxWidth: 680 }}>
                  {app.themeTool.demo.body}
                </p>
                <div style={{ maxWidth: 720, margin: '0 auto' }}>
                  {app.themeTool.demo.title && (
                    <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 17, lineHeight: 1.4, color: 'var(--ink)', fontWeight: 300, margin: '0 0 14px' }}>
                      {app.themeTool.demo.title}
                    </p>
                  )}
                  <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--line)', background: '#0b0c10' }}>
                    <AutoVideo src={app.themeTool.demo.src} ariaLabel={app.themeTool.demo.alt} />
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: 1.8, color: 'var(--ink-faint)', marginTop: 10 }}>
                    {app.themeTool.demo.caption.toUpperCase()}
                  </div>
                </div>
              </div>
            )}
            <p style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontSize: 19,
              lineHeight: 1.5,
              color: 'var(--ink)',
              fontWeight: 300,
              margin: '44px auto 0',
              maxWidth: 640,
              textAlign: 'center',
            }}>
              {app.themeTool.pull}
            </p>
          </div>
        )}

        {/* Feature deep dives */}
        {(app.features ?? []).filter(f => f.detail).map((f, i) => {
          const secs = f.detail!.sections as Section[];
          const preamble = f.detail!.preamble;
          return (
            <div key={i} id={`dive-${f.title.toLowerCase().replace(/\s+/g, '-')}`}>
              {preamble && (
                <div style={{ marginTop: 60 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', letterSpacing: 3 }}>◈ INSPIRATION</span>
                  <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.75, color: 'var(--ink-dim)', fontWeight: 300, margin: 0 }}>
                        {preamble.body}
                      </p>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.75, color: 'var(--ink-dim)', fontWeight: 300, margin: 0 }}>
                        {preamble.listIntro}
                      </p>
                      <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {preamble.items.map((item, j) => (
                          <li key={j} style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.7, color: 'var(--ink-dim)', fontWeight: 300 }}>
                            {item}
                          </li>
                        ))}
                      </ul>
                      <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 18, lineHeight: 1.5, color: 'var(--ink)', fontWeight: 300, margin: 0, paddingLeft: 20, borderLeft: '2px solid var(--accent)' }}>
                        {preamble.footer}
                      </p>
                    </div>
                    <PictureKeyConceptSVG />
                  </div>
                </div>
              )}
            <div style={{ marginTop: preamble ? 40 : 60, background: '#08090b', borderRadius: 20, border: '1px solid var(--line)', overflow: 'hidden' }}>
              <div style={{ padding: '20px 40px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', letterSpacing: 3 }}>
                  ◈ ALGORITHM DEEP DIVE
                </span>
              </div>
              <div style={{ padding: '48px 40px', display: 'flex', flexDirection: 'column', gap: 44 }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 36, margin: 0, letterSpacing: -1, lineHeight: 1.15 }}>
                  <span style={{ fontStyle: 'italic', color: 'var(--accent)' }}>{f.detail!.title}</span>
                </h2>

                {/* Sections 0+1 (intro + Rectangles of Tolerance) alongside images */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 48, alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                    {secs[0] && renderSection(secs[0])}
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 2, color: 'var(--ink-faint)', marginTop: -8 }}>
                      Algorithm Implemented · August 2010
                    </div>
                    {secs[1] && (
                      <div style={{ borderTop: '1px solid var(--line)', paddingTop: 28 }}>
                        {renderSection(secs[1])}
                      </div>
                    )}
                  </div>
                  {f.detail!.images && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {f.detail!.images.map((src, j) => (
                        <div key={j} style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--line)' }}>
                          <img
                            src={src}
                            alt=""
                            style={{
                              display: 'block',
                              width: '100%',
                              height: '190px',
                              objectFit: 'cover',
                              objectPosition: 'top right',
                            }}
                          />
                        </div>
                      ))}
                      <ToleranceRectSVG />
                    </div>
                  )}
                </div>

                {/* Section 2: The Greedy Traversal — full width (contains the analogy + animation) */}
                {secs[2] && renderSection(secs[2])}

                {/* Section 3: Why It Works + auth match SVG — side by side */}
                {secs[3] && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
                    <div>{renderSection(secs[3])}</div>
                    <div style={{ padding: '24px', background: 'rgba(0,0,0,0.2)', borderRadius: 12, border: '1px solid var(--line)' }}>
                      <AuthMatchSVG />
                    </div>
                  </div>
                )}

                {/* Closing */}
                <p style={{
                  fontFamily: 'var(--font-serif)',
                  fontStyle: 'italic',
                  fontSize: 19,
                  lineHeight: 1.5,
                  color: 'var(--ink)',
                  fontWeight: 300,
                  margin: 0,
                  paddingLeft: 16,
                  borderLeft: '2px solid var(--accent)',
                }}>
                  15+ years in production. Not a line of the hand written algorithm has changed.
                </p>

                {/* Copyright */}
                <div style={{ borderTop: '1px solid var(--line)', paddingTop: 24 }}>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 1.5, color: 'var(--ink-faint)', margin: 0, lineHeight: 1.9 }}>
                    Signature Gesture Matching Algorithm for Hand-Drawn Authentication<br />
                    Authored 14 August 2010 &nbsp;·&nbsp; &copy; MMX Walter Mak / SpacyApps. All rights reserved.
                  </p>
                </div>
              </div>
            </div>
            </div>
          );
        })}

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
            <div className="bo-guide-title" style={{ padding: '48px 40px 0' }}>
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
            <div className="bo-guide-body" style={{ padding: '40px 40px 48px', display: 'flex', flexDirection: 'column', gap: 0 }}>
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
                    {step.prompt && (
                      <pre style={{
                        marginTop: 20,
                        padding: '20px 24px',
                        background: 'var(--surface)',
                        border: '1px solid var(--line)',
                        borderRadius: 10,
                        fontFamily: 'var(--font-mono)',
                        fontSize: 12,
                        lineHeight: 1.75,
                        color: 'var(--ink-dim)',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        overflowX: 'auto',
                      }}>
                        {step.prompt}
                      </pre>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Availability
            TODO(link): github.com/spacyapps/ground-control is private and no release exists.
            Once the repo is public, add a source/releases link here — not before, it 404s today. */}
        {app.availability && (
          <div style={{ marginTop: 80, textAlign: 'center' }}>
            <div style={{
              display: 'inline-block',
              maxWidth: 620,
              border: '1px dashed rgba(236,230,214,0.2)',
              borderRadius: 16,
              padding: '40px 44px',
              background: 'rgba(0,0,0,0.2)',
            }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 32, margin: '0 0 16px', letterSpacing: -1, lineHeight: 1.15 }}>
                <span style={{ fontStyle: 'italic', color: 'var(--accent)' }}>{app.availability.heading}</span>
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {app.availability.body.split('\n\n').map((para, j) => (
                  <p key={j} style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.7, color: 'var(--ink-dim)', fontWeight: 300, margin: 0 }}>
                    {para}
                  </p>
                ))}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 3, color: 'var(--ink-faint)', marginTop: 26, paddingTop: 22, borderTop: '1px solid var(--line)' }}>
                {app.availability.note.toUpperCase()}
              </div>
            </div>
          </div>
        )}

        {/* Legacy video link */}
        {app.legacyVideoUrl && (
          <div style={{ marginTop: 80, textAlign: 'center' }}>
            <a
              href={app.legacyVideoUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none', display: 'inline-block' }}
            >
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 14,
                border: '1px dashed rgba(236,230,214,0.2)',
                borderRadius: 12,
                padding: '18px 28px',
                transition: 'border-color 0.3s ease, background 0.3s ease',
              }}
                className="bo-card"
              >
                <span style={{ fontSize: 28 }}>📼</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 3, color: 'var(--accent)', marginBottom: 4 }}>
                    THE OG · CIRCA 2012
                  </div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 17, color: 'var(--ink)', letterSpacing: -0.3 }}>
                    Watch the original launch video ↗
                  </div>
                </div>
              </div>
            </a>
          </div>
        )}

      </div>
    </div>
    </ScaleWrapper>
  );
}
