export interface Post {
  slug: string;
  title: string;
  date: string;
  read: string;
  excerpt: string;
  link?: string;
}

export const POSTS: Post[] = [
  {
    slug: 'expansion-01',
    title: 'Mastering Human-AI Collaboration.',
    date: 'May 9, 2026',
    read: '6 min read',
    excerpt: 'AI adaptation isn\'t about resistance — it\'s about thoughtful partnership. A practical guide to staying ahead by keeping your own thinking in the driver\'s seat.',
    link: '/journal/expansion-01',
  },
  {
    slug: 'secret-stuff-algo-deep-dive',
    title: 'The Signature Gesture Matching Algorithm.',
    date: 'May 8, 2026',
    read: '8 min read',
    excerpt: 'How a greedy pointer walk and overlapping tolerance boxes turn two imperfect hand-drawn paths into a reliable authentication lock — written in Obj-C circa 2010, still running today.',
    link: '/apps/secret-stuff#dive-original-signature-algorithm',
  },
  {
    slug: 'coming-soon-2',
    title: 'Coming soon.',
    date: 'Coming soon',
    read: '— min read',
    excerpt: 'This entry is on its way. Check back soon.',
  },
  {
    slug: 'coming-soon-3',
    title: 'Coming soon.',
    date: 'Coming soon',
    read: '— min read',
    excerpt: 'This entry is on its way. Check back soon.',
  },
  {
    slug: 'coming-soon-4',
    title: 'Coming soon.',
    date: 'Coming soon',
    read: '— min read',
    excerpt: 'This entry is on its way. Check back soon.',
  },
];
