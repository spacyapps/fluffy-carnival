import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import Stars from '../../../components/boutique/Stars';
import Logotype from '../../../components/boutique/Logotype';
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
  blurb: string;
  image: string;
  free?: boolean;
};

const FREE_THEME: Theme = {
  slug: 'lunar',
  name: 'Lunar Avatar',
  tagline: 'A woman working a night shift on an orbital station.',
  blurb:
    'Photoreal-leaning sci-fi rather than cartoon. She barely moves — the only theme here that plays its moods as lighting rather than pose, and the colour of the room tells you everything.',
  image: '/gc-theme-lunar-moods.png',
  free: true,
};

const THEMES: Theme[] = [
  {
    slug: 'aquarium',
    name: 'Aquarium',
    tagline: 'A real aquarium, four fish for four moods.',
    blurb:
      'Painted rather than drawn — soft light through water, real scales and coral. A shark slides in the moment something needs you; a school of goldfish shoals while it works.',
    image: '/gc-theme-aquarium-moods.png',
  },
  {
    slug: 'gopher-garden',
    name: 'Gopher Garden',
    tagline: 'A gopher who has taken up gardening.',
    blurb:
      'Round, sticker-style, big expressive eyes. A hard hat and a trowel while it works, two glowing question marks held up when it is stuck, a cabbage hugged tight when it is done.',
    image: '/gc-theme-gopher-garden-moods.png',
  },
  {
    slug: 'gopher-golf',
    name: 'Gopher Golf',
    tagline: 'One gopher, playing golf badly and taking it personally.',
    blurb:
      'The same animal in all four moods, having one very long day — a golf cart at speed while it works, a worried little flag when it is stuck, a green jacket the moment it wins.',
    image: '/gc-theme-gopher-golf-moods.png',
  },
  {
    slug: 'skybird',
    name: 'Sky Bird',
    tagline: 'A barn swallow, and a quiet garden to live in.',
    blurb:
      'The calmest theme in the set. Painted plumage, a proper forked tail — it sleeps, it flies, and when it is blocked it stops flying just to shout at you.',
    image: '/gc-theme-skybird-moods.png',
  },
  {
    slug: 'unicorn-overlord',
    name: 'Unicorn Overlord',
    tagline: 'Enormous eyes, a gold horn, a jewelled purple frame.',
    blurb:
      'The sweetest-looking theme in the set — and the only frame treated like a keepsake box. She looks pleased even when she is stuck; the red does the shouting for her.',
    image: '/gc-theme-unicorn-moods.png',
  },
];

function ThemeCard({ theme }: { theme: Theme }) {
  return (
    <div>
      <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--line)', background: '#0b0c10' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={theme.image} alt={`${theme.name} — the four mood states it draws`} style={{ display: 'block', width: '100%', height: 'auto' }} />
      </div>
      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 400, margin: '20px 0 6px', letterSpacing: -0.5 }}>
        {theme.name}
      </h3>
      <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 16, lineHeight: 1.4, color: 'var(--ink)', fontWeight: 300, margin: '0 0 10px' }}>
        {theme.tagline}
      </p>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.7, color: 'var(--ink-dim)', fontWeight: 300, margin: '0 0 16px' }}>
        {theme.blurb}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid var(--line)' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 1.5, color: 'var(--ink-faint)' }}>
          PRICE TBD
        </span>
        <a href="#notify" style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--accent)', textDecoration: 'none' }}>
          Join the list →
        </a>
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', marginBottom: 72 }}>
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
        <div style={{ maxWidth: 760, marginBottom: 28 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', letterSpacing: 3 }}>◈ GROUND CONTROL THEMES</span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 52, margin: '22px 0 20px', letterSpacing: -1.4, lineHeight: 1.05 }}>
            Ground Control has <span style={{ fontStyle: 'italic', color: 'var(--accent-2)' }}>more than one face.</span>
          </h1>
          <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 19, lineHeight: 1.5, color: 'var(--ink)', fontWeight: 300, margin: '0 0 22px' }}>
            One character ships in the box. Five more exist if you want the panel to feel unmistakably yours.
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14.5, lineHeight: 1.75, color: 'var(--ink-dim)', fontWeight: 300, margin: 0 }}>
            A theme is a folder of art and a JSON file — drop it in and the panel re-skins on the spot, nothing to restart. Everything below is the same engine wearing a different character.{' '}
            <Link href="/apps/ground-control" style={{ color: 'var(--accent)' }}>See how theming actually works →</Link>
          </p>
        </div>

        {/* Reassurance line */}
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 1, color: 'var(--ink-faint)', margin: '0 0 64px' }}>
          Themes are art, not the app. Ground Control stays free and open source either way.
        </p>

        {/* Free theme */}
        <div style={{ marginBottom: 88 }}>
          <div style={{ height: 2, width: 28, background: 'var(--accent-2)', opacity: 0.8, marginBottom: 20 }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 2.5, color: 'var(--accent-2)' }}>COMES WITH THE APP</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start', marginTop: 18 }}>
            <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--line)', background: '#0b0c10' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={FREE_THEME.image} alt={`${FREE_THEME.name} — the four mood states it draws`} style={{ display: 'block', width: '100%', height: 'auto' }} />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 34, fontWeight: 400, margin: '0 0 10px', letterSpacing: -0.6 }}>
                {FREE_THEME.name}
              </h2>
              <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 18, lineHeight: 1.45, color: 'var(--ink)', fontWeight: 300, margin: '0 0 14px' }}>
                {FREE_THEME.tagline}
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14.5, lineHeight: 1.75, color: 'var(--ink-dim)', fontWeight: 300, margin: '0 0 20px' }}>
                {FREE_THEME.blurb}
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, lineHeight: 1.7, color: 'var(--ink-faint)', fontWeight: 300, margin: 0 }}>
                This is the one every install starts with — the proof of what the engine can draw before you decide whether to go further.
              </p>
            </div>
          </div>
        </div>

        {/* Paid themes */}
        <div style={{ marginBottom: 88 }}>
          <div style={{ height: 2, width: 28, background: 'var(--accent)', opacity: 0.7, marginBottom: 20 }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 2.5, color: 'var(--accent)' }}>THE OTHER FIVE</span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 30, margin: '16px 0 44px', letterSpacing: -0.6, maxWidth: 600 }}>
            <span style={{ fontStyle: 'italic' }}>Characters, not colour schemes.</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '56px 48px' }}>
            {THEMES.map((t) => (
              <ThemeCard key={t.slug} theme={t} />
            ))}
          </div>
        </div>

        {/* Waitlist */}
        <div id="notify" style={{ paddingTop: 56, borderTop: '1px solid var(--line)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 2.5, color: 'var(--accent)' }}>◈ NOT OPEN YET</span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 32, margin: '16px 0 14px', letterSpacing: -0.7 }}>
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
