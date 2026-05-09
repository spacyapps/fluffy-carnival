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
  return { title: `${post.title} — SpacyApps Journal` };
}

export default async function JournalPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = POSTS.find(p => p.slug === slug);
  if (!post) notFound();

  const topic = TOPICS[post.topic];
  const siblings = POSTS.filter(p => p.topic === post.topic && p.id !== post.id).slice(0, 2);

  return <PostReaderShell post={post} topic={topic} siblings={siblings} />;
}
