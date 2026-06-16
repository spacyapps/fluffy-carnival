import type { MetadataRoute } from 'next';
import { APPS } from './data/apps';
import { POSTS } from './data/journal';

const BASE = 'https://spacyapps.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    { url: `${BASE}/journal`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
  ];

  // Real app pages only (skip noPage entries like Conduit).
  const appPages: MetadataRoute.Sitemap = APPS.filter((app) => !app.noPage).map((app) => ({
    url: `${BASE}/apps/${app.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  // Real journal posts only — skip link-only entries and "Coming soon" placeholders.
  const journalPages: MetadataRoute.Sitemap = POSTS.filter((p) => !p.link && p.date).map((p) => ({
    url: `${BASE}/journal/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: 'yearly',
    priority: 0.6,
  }));

  return [...staticPages, ...appPages, ...journalPages];
}
