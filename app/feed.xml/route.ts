import { POSTS } from '../data/journal';

const BASE = 'https://spacyapps.com';

function toRFC2822(dateStr: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toUTCString();
}

export async function GET() {
  const published = POSTS
    .filter(p => p.date)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const items = published.map(p => {
    const url = p.link?.startsWith('http')
      ? p.link
      : p.link
        ? `${BASE}${p.link}`
        : `${BASE}/journal/${p.slug}`;
    return `
    <item>
      <title><![CDATA[${p.title}]]></title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description><![CDATA[${p.excerpt}]]></description>
      <pubDate>${toRFC2822(p.date)}</pubDate>
    </item>`;
  }).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>SpacyApps Journal</title>
    <link>${BASE}/journal</link>
    <atom:link href="${BASE}/feed.xml" rel="self" type="application/rss+xml" />
    <description>Writing from orbit — on apps, algorithms, and AI.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  });
}
