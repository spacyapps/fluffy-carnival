import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import Stars from '../../../components/boutique/Stars';
import Logotype from '../../../components/boutique/Logotype';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

// Prelim, unlinked page — keep it out of search until there's something to sell.
export const metadata: Metadata = {
  title: 'Ground Control Themes — SpacyApps',
  description: 'Characters for Ground Control. One ships free; five more are on the way.',
  robots: { index: false, follow: false },
};

type Theme = {
  slug: string;
  name: string;
  // Trimmed from each theme's "what you actually see" in theme-notes.md.
  blurb: string;
  image: string;
  free?: boolean;
};

const THEMES: Theme[] = [
  {
    slug: 'lunar',
    name: 'Lunar Avatar',
    blurb: 'A woman working a night shift in orbit — photoreal rather than cartoon. She barely moves; the colour of the room tells you everything.',
    image: '/gc-theme-lunar-hero.png',
    free: true,
  },
  {
    slug: 'aquarium',
    name: 'Aquarium',
    blurb: 'A lit aquarium seen side-on — four different fish playing four different moods, painted rather than drawn, real light through the water.',
    image: '/gc-theme-aquarium-hero.png',
  },
  {
    slug: 'gopher-garden',
    name: 'Gopher Garden',
    blurb: 'A gopher who has taken up gardening, and the small ecosystem that puts up with it. Round, sticker-style, big expressive eyes.',
    image: '/gc-theme-gopher-garden-hero.png',
  },
  {
    slug: 'gopher-golf',
    name: 'Gopher Golf',
    blurb: 'One gopher, playing golf badly and taking it personally — the same animal in all four moods, having one very long day.',
    image: '/gc-theme-gopher-golf-hero.png',
  },
  {
    slug: 'skybird',
    name: 'Sky Bird',
    blurb: 'One barn swallow, and a quiet garden to live in. Painted rather than cartooned — the calmest theme in the set.',
    image: '/gc-theme-skybird-hero.png',
  },
  {
    slug: 'unicorn-overlord',
    name: 'Unicorn Overlord',
    blurb: 'Enormous eyes, a gold spiral horn, a mane that fills most of every frame — and a jewelled frame built like a keepsake box.',
    image: '/gc-theme-unicorn-hero.png',
  },
];

function ThemeCard({ theme }: { theme: Theme }) {
  return (
    <div>
      <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--line)', background: '#0b0c10', aspectRatio: '1652 / 1240' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={theme.image} alt={`${theme.name}, running in Ground Control`} loading="lazy" style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 21, fontWeight: 400, margin: '16px 0 6px', letterSpacing: -0.4 }}>
        {theme.name}
      </h3>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, lineHeight: 1.6, color: 'var(--ink-dim)', fontWeight: 300, margin: '0 0 14px' }}>
        {theme.blurb}
      </p>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: 1.3, color: theme.free ? 'var(--accent-2)' : 'var(--ink-faint)' }}>
        {theme.free ? 'INCLUDED FREE' : 'PRICE TBD'}
      </span>
    </div>
  );
}

export default function GroundControlThemesPage() {
  return (
    <div style={{ width: '100%', background: 'var(--bg)', color: 'var(--ink)', fontFamily: 'var(--font-body)', position: 'relative' }}>
      <Stars density={50} />
      <div style={{ position: 'relative', padding: '28px 56px 100px', maxWidth: 1240, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', marginBottom: 64 }}>
          <Link
            href="/apps/ground-control"
            style={{ color: 'var(--ink-dim)', fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: 1.5, textDecoration: 'none', justifySelf: 'flex-start' }}
          >
            ← Back to Ground Control
          </Link>
          <Logotype size={12} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-faint)', letterSpacing: 1.5, justifySelf: 'flex-end' }}>
            PRELIM · NOT LIVE
          </span>
        </div>

        {/* Hero */}
        <div style={{ maxWidth: 760, marginBottom: 20 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', letterSpacing: 3 }}>◈ GROUND CONTROL THEMES</span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 48, margin: '20px 0 18px', letterSpacing: -1.3, lineHeight: 1.05 }}>
            Ground Control has <span style={{ fontStyle: 'italic', color: 'var(--accent-2)' }}>more than one face.</span>
          </h1>
          <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 18, lineHeight: 1.5, color: 'var(--ink)', fontWeight: 300, margin: '0 0 20px' }}>
            One character ships in the box. More exist if you want the panel to feel unmistakably yours.
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.7, color: 'var(--ink-dim)', fontWeight: 300, margin: 0 }}>
            A theme is a folder of art and a JSON file — drop it in and the panel re-skins on the spot, nothing to restart.{' '}
            <Link href="/apps/ground-control" style={{ color: 'var(--accent)' }}>See how theming actually works →</Link>
          </p>
        </div>

        {/* Reassurance line */}
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 1, color: 'var(--ink-faint)', margin: '0 0 56px' }}>
          Themes are art, not the app. Ground Control stays free and open source either way.
        </p>

        {/* Themes grid */}
        <div>
          <div style={{ height: 2, width: 28, background: 'var(--accent)', opacity: 0.7, marginBottom: 20 }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 2.5, color: 'var(--accent)' }}>◈ THE CHARACTERS</span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 26, margin: '14px 0 40px', letterSpacing: -0.5, maxWidth: 600 }}>
            <span style={{ fontStyle: 'italic' }}>One free, more on the way.</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '48px 32px' }}>
            {THEMES.map((t) => (
              <ThemeCard key={t.slug} theme={t} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
