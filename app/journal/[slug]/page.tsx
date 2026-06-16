import { notFound } from 'next/navigation';
import { POSTS, TOPICS } from '../../data/journal';
import PostReaderShell from '../../components/journal/PostReaderShell';

export async function generateStaticParams() {
  return POSTS.filter(p => !p.link).map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = POSTS.find(p => p.slug === slug);
  if (!post) return {};
  // "Coming soon" placeholders have no date and an empty body — keep them out
  // of the index until they have real content, or Google clusters them as duplicates.
  const isPlaceholder = !post.date;
  return {
    title: `${post.title} — SpacyApps Journal`,
    alternates: { canonical: `/journal/${post.slug}` },
    ...(isPlaceholder ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function JournalPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = POSTS.find(p => p.slug === slug);
  if (!post) notFound();

  const topic = TOPICS[post.topic];
  const siblings = POSTS.filter(p => p.topic === post.topic && p.id !== post.id).slice(0, 2);

  return <PostReaderShell post={post} topic={topic} siblings={siblings} />;
}
