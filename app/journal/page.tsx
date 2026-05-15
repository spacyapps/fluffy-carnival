import type { Viewport } from 'next';
import JournalShell from '../components/journal/JournalShell';

export const metadata = { title: 'Journal — SpacyApps' };

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function JournalPage() {
  return <JournalShell />;
}
