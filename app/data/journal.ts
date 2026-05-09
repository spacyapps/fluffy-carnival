export type BlockKind = 'lede' | 'p' | 'h' | 'pull' | 'list' | 'code' | 'flourish';

export interface Block {
  kind: BlockKind;
  text?: string;
  items?: string[];
  lang?: string;
  glyph?: 'orbit' | 'star' | 'dots';
}

export interface Post {
  id: string;
  slug: string;
  topic: string;
  title: string;
  date: string;
  dateLabel: string;
  read: string;
  kind: 'essay' | 'photo' | 'code';
  pinned?: boolean;
  link?: string;
  cx: number;
  cy: number;
  ring: number;
  angle: number;
  excerpt: string;
  body: Block[];
}

export interface Topic {
  id: string;
  name: string;
  subtitle: string;
  color: string;
  glyph: string;
  blurb: string;
}

export const TOPICS: Record<string, Topic> = {
  first_light: {
    id: 'first_light',
    name: 'First Light',
    subtitle: 'How spacyapps started and evolved',
    color: '#e8a87c',
    glyph: '✦',
    blurb: 'Origin notes — first domain, first ship, the surprises along the way.',
  },
  drift: {
    id: 'drift',
    name: 'Expansion',
    subtitle: 'AI and development — where the work is heading',
    color: '#9bb5c9',
    glyph: '✧',
    blurb: 'The expanding edge of how software gets made. New tools, new instincts, new questions.',
  },
};

export const POSTS: Post[] = [
  {
    id: 'fl-01', slug: 'first-light-01', topic: 'first_light',
    title: 'First Light · 01', date: '', dateLabel: 'Coming soon',
    read: '—', kind: 'essay', cx: 230, cy: 540, ring: 0, angle: 200,
    excerpt: 'Incoming.',
    body: [],
  },
  {
    id: 'fl-02', slug: 'first-light-02', topic: 'first_light',
    title: 'First Light · 02', date: '', dateLabel: 'Coming soon',
    read: '—', kind: 'essay', cx: 400, cy: 360, ring: 0, angle: 245,
    excerpt: 'Incoming.',
    body: [],
  },
  {
    id: 'fl-03', slug: 'first-light-03', topic: 'first_light',
    title: 'First Light · 03', date: '', dateLabel: 'Coming soon',
    read: '—', kind: 'essay', cx: 570, cy: 540, ring: 0, angle: 285,
    excerpt: 'Incoming.',
    body: [],
  },
  {
    id: 'fl-04', slug: 'first-light-04', topic: 'first_light',
    title: 'First Light · 04', date: '', dateLabel: 'Coming soon',
    read: '—', kind: 'essay', cx: 740, cy: 350, ring: 0, angle: 320,
    excerpt: 'Incoming.',
    body: [],
  },
  {
    id: 'fl-05', slug: 'secret-stuff-first-release', topic: 'first_light',
    title: 'Secret Stuff — First Release', date: '', dateLabel: 'Coming soon',
    read: '—', kind: 'essay', cx: 910, cy: 540, ring: 0, angle: 0,
    excerpt: 'The story of shipping Secret Stuff for the first time — what it took, what broke, and what stuck.',
    body: [],
  },
  {
    id: 'fl-06', slug: 'signature-gesture-algorithm', topic: 'first_light',
    title: 'Signature Gesture Matching Algorithm', date: '2026-05-08', dateLabel: 'May 8, 2026',
    read: '8 min', kind: 'essay', pinned: true,
    link: '/apps/secret-stuff#dive-original-signature-algorithm',
    cx: 1060, cy: 160, ring: 0, angle: 35,
    excerpt: 'How a greedy pointer walk and overlapping tolerance boxes turn two imperfect hand-drawn paths into a reliable authentication lock — written in Obj-C circa 2010, still running today.',
    body: [],
  },
  {
    id: 'dr-01', slug: 'expansion-01', topic: 'drift',
    title: 'Expansion · 01', date: '', dateLabel: 'Coming soon',
    read: '—', kind: 'essay', cx: 1050, cy: 360, ring: 1, angle: 30,
    excerpt: 'Incoming.',
    body: [],
  },
  {
    id: 'dr-02', slug: 'expansion-02', topic: 'drift',
    title: 'Expansion · 02', date: '', dateLabel: 'Coming soon',
    read: '—', kind: 'essay', cx: 1230, cy: 270, ring: 1, angle: 75,
    excerpt: 'Incoming.',
    body: [],
  },
  {
    id: 'dr-03', slug: 'expansion-03', topic: 'drift',
    title: 'Expansion · 03', date: '', dateLabel: 'Coming soon',
    read: '—', kind: 'essay', cx: 1380, cy: 380, ring: 1, angle: 130,
    excerpt: 'Incoming.',
    body: [],
  },
  {
    id: 'dr-04', slug: 'expansion-04', topic: 'drift',
    title: 'Expansion · 04', date: '', dateLabel: 'Coming soon',
    read: '—', kind: 'essay', cx: 1430, cy: 590, ring: 1, angle: 185,
    excerpt: 'Incoming.',
    body: [],
  },
  {
    id: 'dr-05', slug: 'expansion-05', topic: 'drift',
    title: 'Expansion · 05', date: '', dateLabel: 'Coming soon',
    read: '—', kind: 'essay', cx: 1300, cy: 750, ring: 1, angle: 240,
    excerpt: 'Incoming.',
    body: [],
  },
];

export const CONSTELLATION_LINES: Record<string, [number, number][]> = {
  first_light: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]],
  drift:       [[0, 1], [1, 2], [2, 3], [3, 4]],
};

export const SKY = { width: 1600, height: 1000 };
