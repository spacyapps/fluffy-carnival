import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import Stars from '../../../components/boutique/Stars';
import Logotype from '../../../components/boutique/Logotype';
import AutoVideo from '../../../components/boutique/AutoVideo';
import ThemeWaitlistForm from '../../../components/boutique/ThemeWaitlistForm';

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
  tagline: string;
  video: string;
  free?: boolean;
};

const THEMES: Theme[] = [
  {
    slug: 'lunar',
    name: 'Lunar Avatar',
    tagline: 'A night shift on an orbital station.',
    video: '/gc-theme-lunar-working.mp4',
    free: true,
  },
  {
    slug: 'aquarium',
    name: 'Aquarium',
    tagline: 'A real aquarium, four fish for four moods.',
    video: '/gc-theme-aquarium-working.mp4',
  },
  {
    slug: 'gopher-garden',
    name: 'Gopher Garden',
    tagline: 'A gopher who has taken up gardening.',
    video: '/gc-theme-gopher-garden-working.mp4',
  },
  {
    slug: 'gopher-golf',
    name: 'Gopher Golf',
    tagline: "One gopher, playing golf badly and taking it personally.",
    video: '/gc-theme-gopher-golf-working.mp4',
  },
  {
    slug: 'skybird',
    name: 'Sky Bird',
    tagline: 'A barn swallow, and a quiet garden to live in.',
    video: '/gc-theme-skybird-working.mp4',
  },
  {
    slug: 'unicorn-overlord',
    name: 'Unicorn Overlord',
    tagline: 'Enormous eyes, a gold horn, a jewelled frame.',
    video: '/gc-theme-unicorn-working.mp4',
  },
];

function ThemeCard({ theme }: { theme: Theme }) {
  return (
    <div>
      <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--line)', background: '#0b0c10', aspectRatio: '1 / 1' }}>
        <AutoVideo src={theme.video} ariaLabel={`${theme.name} — its working state, looping`} />
      </div>
      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 19, fontWeight: 400, margin: '14px 0 3px', letterSpacing: -0.3 }}>
        {theme.name}
      </h3>
      <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 13.5, lineHeight: 1.4, color: 'var(--ink-dim)', fontWeight: 300, margin: '0 0 12px', minHeight: 36 }}>
        {theme.tagline}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: 1.3, color: theme.free ? 'var(--accent-2)' : 'var(--ink-faint)' }}>
          {theme.free ? 'INCLUDED FREE' : 'PRICE TBD'}
        </span>
        {!theme.free && (
          <a href="#notify" style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 12.5, color: 'var(--accent)', textDecoration: 'none' }}>
            Join the list →
          </a>
        )}
      </div>
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
        <div style={{ marginBottom: 80 }}>
          <div style={{ height: 2, width: 28, background: 'var(--accent)', opacity: 0.7, marginBottom: 20 }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 2.5, color: 'var(--accent)' }}>◈ THE CHARACTERS</span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 26, margin: '14px 0 40px', letterSpacing: -0.5, maxWidth: 600 }}>
            <span style={{ fontStyle: 'italic' }}>One free, more on the way. Every one shown running, not posed.</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '36px 28px' }}>
            {THEMES.map((t) => (
              <ThemeCard key={t.slug} theme={t} />
            ))}
          </div>
        </div>

        {/* Waitlist */}
        <div id="notify" style={{ paddingTop: 48, borderTop: '1px solid var(--line)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 2.5, color: 'var(--accent)' }}>◈ NOT OPEN YET</span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 30, margin: '16px 0 14px', letterSpacing: -0.7 }}>
            <span style={{ fontStyle: 'italic', color: 'var(--accent-2)' }}>Be there on day one.</span>
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14.5, lineHeight: 1.75, color: 'var(--ink-dim)', fontWeight: 300, margin: '0 0 26px', maxWidth: 520 }}>
            No store yet — that takes a little setting up, and there is no price on any of this until it does. Leave an email and it is the first thing you hear about.
          </p>
          <ThemeWaitlistForm />
        </div>

      </div>
    </div>
  );
}
