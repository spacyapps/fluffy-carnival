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
    title: 'Journal — 3 posts live',
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
    date: 'May 10',
    status: 'Prototyping',
    statusColor: 'oklch(0.78 0.16 70)',
    title: 'Conduit — new Mac app, early stage',
    tag: 'Mac',
  },
  {
    date: 'Apr 26',
    status: 'Drafting',
    statusColor: 'oklch(0.72 0.14 250)',
    title: 'TsukiBase — early development',
    tag: 'iOS',
  },
  {
    date: 'May 10',
    status: 'Live',
    statusColor: 'oklch(0.72 0.17 145)',
    title: 'Checkpoint — build your own guide live',
    tag: 'web',
  },
];
