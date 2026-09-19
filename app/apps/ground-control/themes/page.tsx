import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Stars from '../../../components/boutique/Stars';
import Logotype from '../../../components/boutique/Logotype';
import BigPlanet from '../../../components/boutique/BigPlanet';
import ThemeCard from '../../../components/boutique/ThemeCard';

// Lazy-loaded: while every product is "Coming Soon", nothing ever imports
// Polar's checkout script — not just doesn't run it, doesn't fetch it.
const PolarInit = dynamic(() => import('../../../components/boutique/PolarInit'));

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

// Prelim, unlinked page — keep it out of search until there's something to sell.
export const metadata: Metadata = {
  title: 'Ground Control Themes — SpacyApps',
  description: 'Characters for Ground Control. One ships free; five more are $11.99 CAD each.',
  robots: { index: false, follow: false },
};

// Settled 2026-09-18. Single CAD anchor price — Polar converts at checkout,
// so a page-side USD figure would just be a second number to keep in sync.
const PRICE_CAD = '11.99';

// Polar embedded-checkout links — one entry per theme. Polar shows the
// buyer their own currency at checkout; the prices above are for display
// only.
//
// null = not selling yet: the card shows "Coming Soon" instead of a buy
// button, and nothing is clickable. Filling in a URL here is the only
// change needed to make that one product live — Walter is minting a
// separate link per placement (site vs Instagram vs README) so Polar can
// attribute which channel actually sells, so don't reuse a link from
// elsewhere for this map.
const CHECKOUT_LINKS: Record<string, string | null> = {
  aquarium: null,
  'gopher-garden': null,
  'gopher-golf': null,
  skybird: null,
  'unicorn-overlord': null,
};

const hasAnyLiveLink = Object.values(CHECKOUT_LINKS).some(Boolean);

type Theme = {
  slug: string;
  name: string;
  // Trimmed from each theme's "what you actually see" in theme-notes.md.
  blurb: string;
  image: string;
  // Muted loop of the theme running in the actual panel — plays on hover
  // (desktop) or tap (touch); the static image above is what loads by default.
  loop: string;
  free?: boolean;
  // Same character, different theme (e.g. the gopher in both Garden and Golf) —
  // groups them in the grid and tags them once a family has more than one member.
  family?: string;
};

// Ordered so a family's members sit next to each other. Add new themes near
// their family, not just at the end.
const THEMES: Theme[] = [
  {
    slug: 'aquarium',
    name: 'Aquarium',
    blurb: 'A lit aquarium seen side-on — four different fish playing four different moods, painted rather than drawn, real light through the water.',
    image: '/gc-theme-aquarium-hero.png',
    loop: '/gc-theme-aquarium-loop.mp4',
  },
  {
    slug: 'gopher-garden',
    name: 'Gopher Garden',
    blurb: 'A gopher who has taken up gardening, and the small ecosystem that puts up with it. Round, sticker-style, big expressive eyes.',
    image: '/gc-theme-gopher-garden-hero.png',
    loop: '/gc-theme-gopher-garden-loop.mp4',
    family: 'Gopher',
  },
  {
    slug: 'gopher-golf',
    name: 'Gopher Golf',
    blurb: 'One gopher, playing golf badly and taking it personally — the same animal in all four moods, having one very long day.',
    image: '/gc-theme-gopher-golf-hero.png',
    loop: '/gc-theme-gopher-golf-loop.mp4',
    family: 'Gopher',
  },
  {
    slug: 'skybird',
    name: 'Sky Bird',
    blurb: 'One barn swallow, and a quiet garden to live in. Painted rather than cartooned — the calmest theme in the set.',
    image: '/gc-theme-skybird-hero.png',
    loop: '/gc-theme-skybird-loop.mp4',
  },
  {
    slug: 'unicorn-overlord',
    name: 'Unicorn Overlord',
    blurb: 'Enormous eyes, a gold spiral horn, a mane that fills most of every frame — and a jewelled frame built like a keepsake box.',
    image: '/gc-theme-unicorn-hero.png',
    loop: '/gc-theme-unicorn-loop.mp4',
  },
];

// Only worth labelling once a family actually has company.
const familyCounts = THEMES.reduce<Record<string, number>>((acc, t) => {
  if (t.family) acc[t.family] = (acc[t.family] ?? 0) + 1;
  return acc;
}, {});

// The viewport's glow ring — a family gets its own tint, everything else
// shares the default. Gopher's warm amber echoes its own palette.
const FAMILY_TINT: Record<string, string> = {
  Gopher: '232,168,124',
};
const DEFAULT_TINT = '155,181,201';

export default function GroundControlThemesPage() {
  return (
    <div style={{ width: '100%', background: 'var(--bg)', color: 'var(--ink)', fontFamily: 'var(--font-body)', position: 'relative' }}>
      <Stars density={50} />
      {hasAnyLiveLink && <PolarInit />}
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
          Themes are art, not the app. Ground Control stays free and open source.
        </p>

        {/* Themes grid */}
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 8 }}>
            <BigPlanet variant="rings" size={130} />
            <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--ink-faint)', margin: '4px 0 0' }}>
              Ground Control, orbited
            </p>
          </div>
          <div style={{ height: 2, width: 28, background: 'var(--accent)', opacity: 0.7, margin: '36px auto 20px' }} />
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 2.5, color: 'var(--accent)' }}>◈ THE CHARACTERS</span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 26, margin: '14px auto 40px', letterSpacing: -0.5, maxWidth: 600 }}>
              <span style={{ fontStyle: 'italic' }}>Five so far. More on the way.</span>
            </h2>
          </div>
          <div style={{ position: 'relative' }}>
            {/* Faint orbit arcs — decoration only, echoes the journal's rings */}
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }} aria-hidden>
              <div style={{ position: 'absolute', top: '-14%', left: '50%', width: 1500, height: 480, marginLeft: -750, border: '1px dashed rgba(155,181,201,0.10)', borderRadius: '50%', transform: 'rotate(-5deg)' }} />
              <div style={{ position: 'absolute', top: '38%', left: '50%', width: 1700, height: 560, marginLeft: -850, border: '1px dashed rgba(232,168,124,0.08)', borderRadius: '50%', transform: 'rotate(4deg)' }} />
            </div>
            <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '48px 32px' }}>
              {THEMES.map((t) => {
                const showFamily = t.family && familyCounts[t.family] > 1;
                const tint = (t.family && FAMILY_TINT[t.family]) || DEFAULT_TINT;
                return (
                  <ThemeCard
                    key={t.slug}
                    name={t.name}
                    blurb={t.blurb}
                    image={t.image}
                    loopSrc={t.loop}
                    price={`$${PRICE_CAD} CAD`}
                    checkoutUrl={CHECKOUT_LINKS[t.slug]}
                    familyLabel={showFamily ? `${t.family!.toUpperCase()} FAMILY` : undefined}
                    tint={tint}
                    free={t.free}
                  />
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
