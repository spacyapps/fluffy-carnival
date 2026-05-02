export interface App {
  slug: string;
  name: string;
  glyph: string;
  color: string;
  platform: string;
  version: string;
  tagline: string;
  icon?: string;
  storeUrl?: string;
  websiteUrl?: string;
  videoUrl?: string;
  screenshot?: string;
  description?: string;
  features?: { title: string; body: string }[];
  guide?: { heading: string; steps: { title: string; body: string }[] };
}

export const APPS: App[] = [
  {
    slug: 'secret-stuff',
    name: 'Secret Stuff',
    glyph: 'S',
    color: '#7d4ad9',
    platform: 'iOS',
    version: '10',
    tagline: 'An iOS app to keep those prying eyes away.',
    icon: '/icon-secret-stuff.png',
    storeUrl: 'https://apps.apple.com/us/app/secret-stuff/id437415402',
    videoUrl: 'https://7knhs8epftmuaeae.public.blob.vercel-storage.com/secret-stuff-demo.mov',
    description: 'Built sometime around 2010 — my first fully deployed app, spanning multiple countries. That reach opened up opportunities throughout my life and career that I never expected. I\'m happy to bring it back as a legacy app, a reminder of where it all started.',
    features: [
      {
        title: 'Original signature algorithm',
        body: 'Written in Obj-C, the algorithm uses gesture point distances, relative locations, and per-metric thresholds to build a reliable single signature matching system. Kept in Obj-C for compatibility.',
      },
      {
        title: 'Obj-C → SwiftUI migration',
        body: 'The original 2010 Obj-C project was migrated into modern SwiftUI with AI assistance. Because the original data design was structured and organised well, the migration was predictable and reliable — not pure vibe-coding.\n\nA good experience to trial how AI can assist app-building, and a reaffirmation that a well-structured plan and vision is key to a maintainable codebase.',
      },
      {
        title: 'Redesigned UI',
        body: 'A fresh, modern interface built for a more pleasant experience. Same trusted app, new look. Enjoy!',
      },
    ],
  },
  {
    slug: 'checkpoint',
    name: 'Checkpoint',
    glyph: '🔒',
    color: '#3a8fb7',
    icon: '/icon-checkpoint.jpg',
    platform: 'Safari',
    version: '1',
    tagline: 'A simple Safari extension to easily hide websites before showing your screen in public.',
    screenshot: '/checkpoint-screenshot-v2.png',
    description: 'Situation:\nOut in public, around coworkers, or with kids nearby — some websites you\'d rather wait before pulling up on screen.\n\nSolution:\nCheckpoint is a lightweight Safari extension that\'s easier to manage than Parental Controls. Just add a site to your list and whenever you visit it, Checkpoint blocks it first until you enter your code.',
    features: [
      {
        title: 'An interesting experiment',
        body: 'Ask AI for "a Safari Extension", then "build it simply" — and see what comes back. A good way to explore how AI interprets a vague brief and scaffolds a working starting point.',
      },
      {
        title: 'Refinement via test and updates',
        body: 'Found out that keeping steps simple is key. Build a little, test a lot — iteration and patience get you further than trying to do everything at once.',
      },
      {
        title: 'Make your own Checkpoint!',
        body: 'Since this is a simple app, I\'ll teach you how to build your own version. A great first project for anyone curious about Safari extensions.',
      },
    ],
    guide: {
      heading: 'Build your own Checkpoint',
      steps: [
        {
          title: 'Step 1 — coming soon',
          body: 'Content coming soon.',
        },
        {
          title: 'Step 2 — coming soon',
          body: 'Content coming soon.',
        },
        {
          title: 'Step 3 — coming soon',
          body: 'Content coming soon.',
        },
      ],
    },
  },
  {
    slug: 'tsukibase',
    name: 'TsukiBase',
    glyph: '月',
    color: '#c0392b',
    platform: 'Web',
    version: '1',
    tagline: 'Visionary thinking...',
    websiteUrl: 'https://www.tsukibase.com',
    screenshot: '/tsukibase-screenshot.png',
    description: '月 (Tsuki) means Moon in Japanese. 基地 (Kichi) means Base.\nTsukiBase — 月基地 — is a lunar observation post, watching from the Sea of Tranquility.\n\nWhat will become of the Moon? What mission will this become?',
    features: [
      {
        title: 'Gate to the Moon',
        body: '鳥居 — Torii Gate established... initiating scans.',
      },
      {
        title: 'Scanning...',
        body: 'Systems active. Surveying the terrain.',
      },
      {
        title: 'Planning...',
        body: 'Mission parameters under review. More to come.',
      },
    ],
  },
];
