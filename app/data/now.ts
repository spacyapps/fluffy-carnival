export interface NowEntry {
  date: string;
  status: string;
  statusColor: string;
  title: string;
  tag: string;
}

export const NOW: NowEntry[] = [
  {
    date: 'May 9',
    status: 'Live',
    statusColor: 'oklch(0.72 0.17 145)',
    title: 'Journal — 2 posts live',
    tag: 'web',
  },
  {
    date: 'May 9',
    status: 'Live',
    statusColor: 'oklch(0.72 0.17 145)',
    title: 'SpacyApps site — Active',
    tag: 'web',
  },
  {
    date: 'May 7',
    status: 'Live',
    statusColor: 'oklch(0.72 0.17 145)',
    title: 'Secret Stuff — Legacy revival at 10.2, algorithm deep dive published',
    tag: 'iOS',
  },

  {
    date: 'Apr 26',
    status: 'Building',
    statusColor: 'oklch(0.75 0.16 70)',
    title: 'TsukiBase — early development',
    tag: 'iOS',
  },
  {
    date: 'Apr 26',
    status: 'Sketching',
    statusColor: 'oklch(0.72 0.14 250)',
    title: 'Checkpoint guide — teaching page in progress',
    tag: 'content',
  },
];
