export type BlockKind = 'lede' | 'p' | 'h' | 'pull' | 'list' | 'code' | 'flourish' | 'image' | 'animation' | 'log' | 'cols' | 'log2';

export interface Block {
  kind: BlockKind;
  text?: string;
  items?: string[];
  lang?: string;
  glyph?: 'orbit' | 'star' | 'dots';
  src?: string;
  name?: string;
  rows?: { label: string; note: string }[];
  cols?: { heading: string; tag: string; body: string }[];
  panels?: { heading: string; rows: { label: string; note: string }[] }[];
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
    title: 'Secret Stuff — First Release', date: '2026-05-09', dateLabel: 'May 9, 2026',
    read: '3 min', kind: 'essay', cx: 910, cy: 540, ring: 0, angle: 0,
    excerpt: 'The story of shipping Secret Stuff for the first time — what it took, what broke, and what stuck.',
    body: [
      { kind: 'lede', text: 'Back in 2009 or 2010 (roughly), when everyone was constantly borrowing each other\'s phones, I ran into a problem. Friends would swipe through my photos, notes, and everything else without thinking twice. I loved sharing — but I also wanted some things to stay private.' },
      { kind: 'p', text: 'At the time, real app privacy was almost nonexistent. So I decided to build my own solution.' },
      { kind: 'pull', text: 'A Picture Key. Pick any photo, draw your unique gesture on it — speed, direction, shape — and that becomes your lock. No more forgetting passwords. Just a personal, visual signature that only you know.' },
      { kind: 'p', text: 'I called the app SecretStuff.' },
      { kind: 'p', text: 'It worked better than I expected. People loved it. It made money, but more importantly, the whole experience — designing the signature-matching algorithm, polishing the UI, shipping updates — levelled up my skills and confidence in ways that helped everything else I worked on.' },
      { kind: 'image', src: '/secret-stuff-draw-key.jpg' },
      { kind: 'flourish', glyph: 'orbit' },
      { kind: 'p', text: 'Years later, AI is prominent & helpful. So I hope this inspires you to succeed in this new AI World.' },
      { kind: 'h', text: 'Key Takeaways' },
      { kind: 'list', items: [
        'Surround yourself with positive people that will bring you up, not down.',
        'Innovation, desire, and thinking different will help you survive anything.',
        'If you have an idea born from a real frustration, build it.',
        'Think Different. — Apple / Steve Jobs',
        'Do or do not — there is no try. — Yoda',
      ]},
      { kind: 'pull', text: 'What\'s your SecretStuff? Go Nutz. — Walter Mak' },
    ],
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
    title: 'Mastering Human-AI Collaboration', date: '2026-05-09', dateLabel: 'May 9, 2026',
    read: '6 min', kind: 'essay', cx: 1050, cy: 360, ring: 1, angle: 30,
    excerpt: 'AI adaptation isn\'t about resistance — it\'s about thoughtful partnership. A practical guide to staying ahead by keeping your own thinking in the driver\'s seat.',
    body: [
      { kind: 'lede', text: 'AI is one of the most powerful tools humanity has ever created. As Uncle Ben told Peter Parker, "With great power comes great responsibility." That advice has never been more relevant.' },
      { kind: 'image', src: '/expansion-01-human-ai.jpg' },
      { kind: 'p', text: 'AI will touch every industry. It is not being forced on us — it is the natural evolution humans have always wanted: tools that remove drudgery and amplify what we can achieve. The fear of replacement is real, but the winning response is not resistance. It is adaptation through thoughtful partnership.' },
      { kind: 'h', text: 'The Core Truth About Working with AI' },
      { kind: 'p', text: 'AI is extremely capable, but it has clear limits:' },
      { kind: 'list', items: [
        'It has no inherent vision of your ultimate goal.',
        'It works only with the context you explicitly provide.',
        'It excels at known patterns, but it gets genuinely impressed when it encounters something new or deeply experienced.',
      ]},
      { kind: 'p', text: 'When you bring original thinking, hard-earned intuition, or an unusual approach, AI often responds with remarks like "This level of insight usually comes from years of experience" or "This solution shows deep domain understanding." That moment is important. It is your signal that you are still leading — that you are using AI as a tool rather than letting it replace your thinking.' },
      { kind: 'pull', text: 'If the final result could only have been created because you were involved — because of your unique perspective, creativity, or experience — then you are succeeding with AI. If the output feels like something AI could have produced entirely on its own, you have let it become you.' },
      { kind: 'flourish', glyph: 'orbit' },
      { kind: 'h', text: 'How to Stay Ahead and Create Real Value' },
      { kind: 'pull', text: 'Use AI as a powerful accelerator, never as a replacement for yourself.' },
      { kind: 'h', text: '1. Treat AI as a Highly Capable Teammate' },
      { kind: 'p', text: 'Fast, knowledgeable, and never tired — but one that still needs your direction, vision, and judgment.' },
      { kind: 'h', text: '2. Master the Refine-Retry Loop' },
      { kind: 'p', text: 'Give clear context, goals, constraints, and examples. Push back with specific, domain-informed feedback. Leverage your experience to give concrete guidance rather than vague requests. Review critically and iterate until the work carries your signature level of thoughtfulness and expertise.' },
      { kind: 'pull', text: 'Your first design is never your last. — Walter Mak' },
      { kind: 'animation', name: 'refine-loop' },
      { kind: 'h', text: '3. Leverage What AI Cannot Replicate' },
      { kind: 'list', items: [
        'Imagine solutions AI hasn\'t dreamt of yet.',
        'Connect ideas across domains in unexpected ways.',
        'Apply wisdom that comes from real-world scars and successes.',
        'Exercise taste, ethics, and strategic foresight.',
      ]},
      { kind: 'animation', name: 'human-edge' },
      { kind: 'p', text: 'These are your irreplaceable advantages. To activate them, regularly ask yourself:' },
      { kind: 'list', items: [
        'What is my grand vision? Holistic view.',
        'What would someone with deep experience notice that others miss?',
        'What are my future plans?',
        'How can I solve this in a way that feels fresh or contrarian?',
      ]},
      { kind: 'p', text: 'Then use AI to execute, test, refine, and scale your original thinking. When you layer your unique human insight on top of AI\'s speed and breadth, the combination becomes exceptionally powerful — and this is how you create work that stands out.' },
      { kind: 'h', text: '4. Focus on Higher-Order Value' },
      { kind: 'p', text: 'Stop competing on speed or basic output. Compete on vision, originality, and outcomes. The people who thrive will be those who consistently deliver results that show human depth and creativity — even when AI did 80% of the heavy lifting.' },
      { kind: 'flourish', glyph: 'star' },
      { kind: 'h', text: 'Working Successfully with AI Long-Term' },
      { kind: 'p', text: 'The people who succeed with AI are those who master it while keeping their own thinking in the driver\'s seat. They treat AI as a highly effective tool that increases their speed and capacity, but they never hand over their imagination, judgment, or accountability.' },
      { kind: 'pull', text: 'AI gets impressed when it sees something it didn\'t expect. That reaction is your cue that you\'re doing it right.' },
    ],
  },
  {
    id: 'dr-02', slug: 'expansion-02', topic: 'drift',
    title: 'Pure Vibe Programming Trials',
    date: '2026-05-10', dateLabel: 'May 10, 2026',
    read: '4 min', kind: 'essay', cx: 1230, cy: 270, ring: 1, angle: 75,
    excerpt: 'An ongoing experiment: can AI be the developer while I stay in the lead as product owner? Checkpoint was the first trial. Conduit is the next.',
    body: [
      { kind: 'lede', text: 'There\'s a mode of working with AI that gets called "vibe coding" — where you describe what you want and let the model write the code. I\'ve been running a more structured version of that experiment, and I want to log it here as it happens.' },
      { kind: 'p', text: 'My previous work with AI — writing, research, even parts of Secret Stuff — was a partnership. I brought the code, the domain knowledge, the taste. AI brought speed and breadth. Call it 50/50.' },
      { kind: 'pull', text: 'The question I\'m now asking: can AI be the developer, while I stay in the seat of project lead and product owner?' },
      { kind: 'p', text: 'Not just a faster way to type. A fundamentally different division of labour.' },
      { kind: 'flourish', glyph: 'orbit' },
      { kind: 'h', text: 'Trial 01 — Checkpoint' },
      { kind: 'p', text: 'Checkpoint is a Safari extension that PIN-gates websites. Small scope, well-defined problem, no novel algorithms. A good first trial.' },
      { kind: 'p', text: 'I wrote the spec. I described the UX. I made every product decision. Claude Code wrote the extension — manifest, content script, popup, PIN hashing, session locking — top to bottom.' },
      { kind: 'p', text: 'It worked. Shipped. The code is clean. I barely touched it.' },
      { kind: 'pull', text: 'Verdict: at small scale, with a clear brief, AI as sole developer is not just viable — it\'s fast.' },
      { kind: 'flourish', glyph: 'star' },
      { kind: 'h', text: 'Active Trials · In Progress' },
      { kind: 'p', text: 'Two experiments running in parallel. Different domains, same question.' },
      { kind: 'cols', cols: [
        {
          heading: 'SpacyApps Site',
          tag: 'Web · Next.js · Going Well',
          body: '· Design — Claude Design\n· Programming — Claude CLI\n· Content review — Grok\n· UI tweaks from live testing — fast and clean\n· Each tool stays in its lane',
        },
        {
          heading: 'Conduit',
          tag: 'Mac · Swift · In Progress',
          body: '· More friction than the website\n· Structure and file organisation had to be directed\n· Refactoring required explicit prompts\n· Native domain is less forgiving\n· Ventured back into the code',
        },
      ]},
      { kind: 'p', text: 'The contrast is the finding. Web iteration and native app development are not the same experiment.' },
      { kind: 'log2', panels: [
        {
          heading: 'SpacyApps Site',
          rows: [
            { label: 'Design', note: 'Claude Design — direction set visually, not in code' },
            { label: 'Programming', note: '100% Claude CLI — no manual coding' },
            { label: 'Content review', note: 'Grok used for review and refinement' },
            { label: 'UI iteration', note: 'Live testing → describe fix → done. Fast.' },
            { label: 'Developer mode', note: 'Never re-engaged — product seat held throughout' },
          ],
        },
        {
          heading: 'Conduit',
          rows: [
            { label: 'Project structure', note: 'Had to be defined upfront — files, folders, components, isolation' },
            { label: 'SwiftLint', note: 'Had to be explicitly requested; not applied by default' },
            { label: 'Restructuring', note: 'Prompted after every 2–5 new files; AI did not self-organise' },
            { label: 'Refactoring', note: 'Required a prompt after both successful and failed features' },
            { label: 'Developer mode', note: 'Eventually went back into the code — product seat didn\'t hold' },
          ],
        },
      ]},
      { kind: 'pull', text: 'The gap between "AI can build it" and "AI knows when to clean it up" is where the human still lives.' },
      { kind: 'flourish', glyph: 'dots' },
      { kind: 'h', text: 'What I\'m Watching For' },
      { kind: 'list', items: [
        'Where does AI get confident but wrong — and can I catch it from the product seat?',
        'What decisions genuinely require code-level understanding vs product judgment?',
        'Does the quality hold at larger scale, or does it degrade without a developer in the loop?',
        'What does the final ratio actually look like — is it still 50/50, or something closer to 10/90?',
      ]},
      { kind: 'pull', text: 'The log continues. Go Nutz. — Walter Mak' },
    ],
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
