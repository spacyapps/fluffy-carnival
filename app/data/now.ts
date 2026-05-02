export interface NowEntry {
  date: string;
  status: string;
  statusColor: string;
  title: string;
  tag: string;
}

export const NOW: NowEntry[] = [
  {
    date: 'May 26',
    status: 'Live',
    statusColor: 'oklch(0.72 0.17 145)',
    title: 'Secret Stuff — legacy revival on the App Store',
    tag: 'iOS',
  },
  {
    date: 'May 26',
    status: 'Live',
    statusColor: 'oklch(0.72 0.17 145)',
    title: 'Checkpoint — Safari extension in the wild',
    tag: 'Safari',
  },
  {
    date: 'May 26',
    status: 'Building',
    statusColor: 'oklch(0.75 0.16 70)',
    title: 'TsukiBase — early development',
    tag: 'iOS',
  },
  {
    date: 'May 26',
    status: 'Building',
    statusColor: 'oklch(0.75 0.16 70)',
    title: 'SpacyApps site — Cosmic Boutique launch',
    tag: 'web',
  },
  {
    date: 'May 26',
    status: 'Sketching',
    statusColor: 'oklch(0.72 0.14 250)',
    title: 'Checkpoint guide — teaching page in progress',
    tag: 'content',
  },
];
