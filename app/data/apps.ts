export interface App {
  slug: string;
  name: string;
  glyph: string;
  color: string;
  platform: string;
  version: string;
  tagline: string;
  milestones?: string[];
  icon?: string;
  storeUrl?: string;
  websiteUrl?: string;
  videoUrl?: string;
  legacyVideoUrl?: string;
  screenshot?: string;
  description?: string;
  situationImages?: string[];
  situationSolo?: { src: string; caption: string };
  features?: {
    title: string;
    body: string;
    images?: string[];
    detail?: {
      title: string;
      preamble?: { body: string; listIntro: string; items: string[]; footer: string };
      images?: string[];
      sections: {
        heading?: string;
        body: string;
        callout?: string;
        analogy?: { body: string[]; diagram: string; caption: string; footer: string };
      }[];
    };
  }[];
  noPage?: boolean;
  cta?: string;
  companion?: {
    name: string;
    cardLabel: string;
    kicker: string;
    blurb: string;
    websiteUrl: string;
    screenshot: string;
  };
  slides?: { src: string; caption: string; type?: 'video' }[];
  guide?: { heading: string; steps: { title: string; body: string; prompt?: string }[] };
}

export const APPS: App[] = [
  {
    slug: 'secret-stuff',
    name: 'Secret Stuff',
    glyph: 'S',
    color: '#7d4ad9',
    platform: 'iOS',
    version: '10.4',
    tagline: 'Implementing v10.4',
    milestones: ['2010: v1 Released', '2026: v10 Huge Update Released!'],
    icon: '/icon-secret-stuff.png',
    storeUrl: 'https://apps.apple.com/us/app/secret-stuff/id437415402',
    legacyVideoUrl: 'https://www.youtube.com/watch?v=sJXtXjAEWOQ',
    videoUrl: '/secret-stuff-demo.mov',
    description: '**First released to the Apple App Store in 2010** — my first fully deployed app, spanning multiple countries. That reach opened up opportunities throughout my life and career that I never expected. I\'m happy to bring it back as a legacy app, a reminder of where it all started.',
    slides: [
      { src: '/ss-slide-picturekey.png', caption: 'Unique Picture Key Signature Unlock' },
      { src: '/ss-slide-greeting.png', caption: 'Personal Greeting for Person Images with Scrolling Backgrounds' },
      { src: '/ss-slide-backgrounds.png', caption: 'Backgrounds for Notes, Photos, Videos' },
      { src: '/ss-slide-filedetails.png', caption: 'File Details for your Photos and Videos' },
      { src: '/ss-slide-dynamicbg.mov', caption: 'Dynamic Time Changing Scrolling Backgrounds', type: 'video' },
    ],
    features: [
      {
        title: 'Original signature algorithm',
        body: 'Written in Obj-C, the algorithm uses gesture point distances, relative locations, and per-metric thresholds to build a reliable single signature matching system. Kept in Obj-C for compatibility.',
        detail: {
          title: 'Signature Gesture Matching Algorithm for Hand-Drawn Authentication',
          images: ['/secret-stuff-algo-code.png'],
          preamble: {
            body: 'Remembering a password is hard because numbers and letters have no personal context — they\'re arbitrary, and a hint is often your last resort. The problem was simple: find an easier, more natural way to unlock.',
            listIntro: 'Combining cognitive psychology and muscle memory — drawing a personal signature on an image you chose — the system creates three memory anchors:',
            items: [
              'the image you picked',
              'the gesture you practised',
              'whatever meaning you gave that gesture',
            ],
            footer: 'Together, a new kind of unlock.',
          },
          sections: [
            {
              body: 'When a user draws their Picture Key, the app records a sequence of points — the raw coordinates of a finger moving across the screen. The saved key is one sequence; the login attempt is another.',
              callout: 'The goal: decide if two hand-drawn paths are the same, knowing that no two drawings are ever identical.',
            },
            {
              heading: 'Rectangles of Tolerance',
              body: 'Every point in both sequences is given a tolerance rectangle — a square box centered on that point, extending outward by a fixed sensitivity distance on all sides. Two points "agree" if their boxes overlap. One sensitivity value governs the entire system — wider boxes for a more forgiving match, tighter for stricter — with no similarity score to calibrate and no preprocessing of the drawing required. This accommodates the natural imprecision of a human hand rather than demanding pixel-perfect accuracy.\n\nWhy a square, and not simply the straight-line distance between the two points? Checking whether two boxes overlap is itself a distance test — but one that measures drift on each axis independently: the points agree only if they are close enough horizontally and close enough vertically, judged separately. A plain point-to-point distance draws a circle instead, and a circle is strictest precisely on the diagonal — the direction a hand most often wanders, drifting in both axes at once. The square forgives that natural two-axis jitter where a circle would reject it.\n\nIt is also almost free to compute: rectangle intersection is a single built-in comparison, with no square root in the inner loop — which mattered on 2010 hardware, and still does.',
            },
            {
              heading: 'The Greedy Traversal',
              body: 'The comparison uses two pointers — one for the saved key, one for the attempt — that walk their respective sequences together. At each step, the algorithm checks whether the current box from the saved path overlaps the current box from the attempt. If they don\'t overlap, the match fails immediately.\n\nWhen they do overlap, the algorithm makes a greedy decision about which pointer to advance next. It measures two distances: how close the saved path\'s next point is to the attempt\'s current position, and vice versa. Whichever path\'s next point is closer to the other\'s current position gets to advance — no lookahead, no backtracking, just the locally best choice at each step. This creates a greedy traversal — the two pointers trade advances back and forth, one pulling ahead while the other catches up, keeping the boxes in contact as they move along both paths together.\n\nThis naturally handles the fact that two drawings of the same shape won\'t have the same number of sampled points. A faster draw produces fewer points; a slower one produces more. No preprocessing of the drawing is needed.',
              analogy: {
                body: [
                  'Imagine two hikers walking two different trails that run roughly parallel — one hiker on the saved path, one on the attempt path. They\'re connected by a bungee cord.',
                  'At every step, they check: are we still close enough that our boxes overlap? If yes, whoever is behind gets pulled forward by the bungee — they take the next step to catch up. If the lead hiker is way ahead, the trailing one advances several steps in a row until they\'re level again. Then the other one surges ahead and the dynamic flips.',
                  'The traversal follows that rhythm — one advancing, then the other — neither marching in lockstep, but always staying tethered within the tolerance distance.',
                ],
                diagram: 'Saved:   ●──●──●──────●──●\n                 ↕ bungee\nAttempt: ●────────●──●──●──●',
                caption: 'The moment the bungee stretches too far — boxes no longer touch — the match is over. They\'ve diverged.',
                footer: 'What gives the traversal its alternating rhythm — rather than two pointers advancing in lockstep — is that drawing speed oscillates. One path might have dense point clusters (slow careful drawing) while the other has sparse points (quick confident stroke) in the same region. The greedy step absorbs that mismatch naturally — the dense side advances many times while the sparse side waits, then the roles flip.',
              },
            },
            {
              heading: 'Why It Works for Authentication',
              body: 'The immediate-fail rule is a deliberate security decision. A drawing that drifts outside the tolerance zone — even once — is rejected. There is no averaging, no best-fit recovery, no forgiveness for a single bad segment. The path either stays within its tolerance envelope the entire way, or it doesn\'t. That strictness is what makes it a reliable lock rather than just a similarity score.',
            },
          ],
        },
      },
      {
        title: 'Obj-C → SwiftUI migration',
        body: 'The original 2010 Obj-C project was migrated into modern SwiftUI with AI assistance. Because the original data design was structured and organised well, the migration was predictable and reliable — not pure vibe-coding.\n\nA good experience to trial how AI can assist app-building, and a reaffirmation that a well-structured plan and vision is key to a maintainable codebase.',
      },
      {
        title: 'Redesigned UI',
        body: 'A fresh, modern interface built for a more pleasant experience. Same trusted app, new look. Enjoy!',
        images: ['/ss-ui-before.png', '/ss-ui-after.png'],
      },
    ],
  },
  {
    slug: 'checkpoint',
    name: 'Checkpoint',
    glyph: '🔒',
    color: '#3a8fb7',
    icon: '/icon-checkpoint.jpg',
    platform: 'Safari',
    version: '1',
    tagline: 'A simple Safari extension to easily hide websites before showing your screen in public.',
    screenshot: '/checkpoint-screenshot-v2.png',
    description: 'Situation:\nOut in public, around coworkers, or with kids nearby — some websites you\'d rather wait before pulling up on screen.\n\nFor example: mid-presentation you switch to the browser and the address bar auto-fills Gmail — Checkpoint blocks it first, so the room never sees your inbox.\n\nOr: your manager stops by your desk while you\'re browsing — the sites on your list stay gated behind your code until you decide to open them.\n\nSolution:\nCheckpoint is a lightweight Safari extension that\'s easier to manage than Parental Controls. Just add a site to your list and whenever you visit it, Checkpoint blocks it first until you enter your code.',
    situationImages: ['/checkpoint-before.svg', '/checkpoint-after.svg'],
    situationSolo: { src: '/checkpoint-manager-v2.svg', caption: 'Manager at your desk — check your surroundings' },
    features: [
      {
        title: 'An interesting experiment',
        body: 'Ask AI for "a Safari Extension", then "build it simply" — and see what comes back. A good way to explore how AI interprets a vague brief and scaffolds a working starting point.',
      },
      {
        title: 'Refinement via test and updates',
        body: 'Found out that keeping steps simple is key. Build a little, test a lot — iteration and patience get you further than trying to do everything at once.',
      },
      {
        title: 'Make your own Checkpoint!',
        body: 'Since this is a simple app, I\'ll teach you how to build your own version. A great first project for anyone curious about Safari extensions.',
      },
    ],
    guide: {
      heading: 'Build your own Checkpoint',
      steps: [
        {
          title: 'Install Claude Code',
          body: 'Claude Code is Anthropic\'s CLI for Claude — an AI coding agent that runs in your terminal and builds real projects from a prompt. You\'ll need a Mac with Xcode installed. Install Claude Code with npm, then authenticate with your Anthropic account.',
        },
        {
          title: 'Paste this prompt',
          body: 'Create a new folder, open it in Terminal, launch Claude Code, and paste the prompt below. Claude will build the full extension — manifest, content script, popup UI, PIN hashing, and session locking — ready to wrap in Xcode for Safari.',
          prompt: `Build a Safari Web Extension for Mac (Manifest V3, packaged via Xcode) that
PIN-gates specific websites — a calm "intentional access" checkpoint, not a
hard security wall.

ICON
- Don't hardcode an icon design. The user provides a single square source image
  (e.g. a 1024px PNG). Generate the required extension/app icon sizes from it,
  and use that same icon as the logo on the lock overlay (circular mask) and in
  the popup header. If the user hasn't supplied one yet, use a simple lock glyph
  placeholder and make it trivial to swap.

CORE BEHAVIOR
- On first install, prompt the user to set a 4-digit numeric passcode (confirmed
  twice). Store it as a SHA-256 hash in chrome.storage.local — never the raw PIN.
- A popup lets the user maintain a list of locked hostnames (e.g. twitter.com).
  Entries match both the bare domain and any subdomain (www.twitter.com).
- When navigating to a locked host, inject a full-screen overlay at
  document_start that covers and blocks interaction with the underlying page.
  The overlay shows a 4-digit PIN pad. (The page still loads underneath — the
  overlay is a visual/interaction gate, not a network block.)
- The overlay works with keyboard input (digits 0–9, backspace) AND clicks. Trap
  all key events so the page underneath never receives them.
- Correct PIN → dismiss the overlay and unlock that host for the browser session.
- Incorrect PIN → shake the dot indicator, show an error briefly, then reset.
- Session + tab-aware re-locking: a host stays unlocked while at least one tab
  that unlocked it is still open. When the last such tab closes, the host
  re-locks. Everything resets when the browser quits.
- Skip the overlay inside iframes. Use Shadow DOM to isolate it from page styles.
- Guard against mounting the overlay twice on the same page.

RELOCK ALL (manual session reset)
- The popup has a "Relock all" action that clears every session unlock at once
  WITHOUT needing the user to refresh any tab.
- It clears the in-memory unlock state in the background, then notifies every
  open tab; each tab's content script re-checks its locked status and slides the
  overlay back over the live page instantly (no reload — scroll/form state under
  the overlay is preserved).
- Don't pre-filter tabs by URL in the background (Safari only exposes tab.url for
  the active tab without the broad "tabs" permission). Broadcast to all tabs and
  let each content script decide whether to re-mount.
- The button appears only when ≥1 host is currently unlocked, labeled with the
  count (e.g. "Relock all 2 sites").

POPUP UI
- If no passcode is set, show the setup screen. Otherwise show the main view.
- Top action row: the "Relock all" button (left, shown only when relevant) and a
  "Change passcode" link (right) that returns to the setup screen.
- Add-site row: a text input (strip protocol/path, validate it contains a dot),
  Add button, and a per-entry remove button.
- The blocked-site list is COLLAPSED behind a toggle by default and gated by the
  passcode — so opening the popup doesn't expose which sites are locked. Clicking
  the toggle reveals a passcode prompt; entering the correct 4 digits reveals the
  list. This verify step must NOT unlock any host (separate from the lock-screen
  PIN check). The list re-locks every time it collapses, so reopening always
  requires the passcode again. A count chip shows how many sites are in the list.

VISUAL DESIGN
- Dark theme, a single warm accent color (e.g. gold), Inter (or system) font.
- Lock overlay: two-column layout — a description panel (the locked hostname plus
  a short, calm notice that the site is self-marked for intentional access) beside
  the PIN pad (dots + 3×4 keypad with a backspace key). Centered on a soft radial
  dark background.

ARCHITECTURE NOTES
- Background service worker holds unlock state in memory: a Set of unlocked hosts
  and a Map of tabId → Set<host> for tab-aware re-locking. Hosts are stored in
  chrome.storage.local.
- Message types between popup/content and background: check-locked, verify-and-
  unlock (lock screen), verify-only (list gate), set/has passcode, get/add/remove
  hosts, get-unlocked-count, relock-all.
- Make the overlay icon a web-accessible resource so the content script can load
  it via runtime.getURL.`,
        },
        {
          title: 'Wrap in Xcode and run',
          body: 'Open the project folder in Xcode. Run the Safari Web Extension target on your Mac. Once built, enable the extension in Safari Settings → Extensions. Lock a site, test the PIN pad, and make it yours.',
        },
      ],
    },
  },
  {
    slug: 'tsukibase',
    name: 'TsukiBase',
    glyph: '月',
    color: '#c0392b',
    platform: 'Web',
    version: '1',
    tagline: 'Lunar scale. Long horizon.',
    cta: 'Scoping the mission →',
    websiteUrl: 'https://www.tsukibase.com',
    screenshot: '/tsukibase-screenshot.png',
    description: '月 (Tsuki) means Moon in Japanese. 基地 (Kichi) means Base.\nTsukiBase — 月基地 — is a lunar observation post, watching from the Sea of Tranquility.\n\nWhat will become of the Moon? What mission will this become?',
    companion: {
      name: 'LunarArray',
      cardLabel: 'near-side spaceport',
      kicker: 'NEAR-SIDE SPACEPORT & RELAY',
      blurb: 'LunarArray is our entry to the Moon — a crewed spaceport and deep-space relay pinned to the regolith that always faces Earth. Landing pads, antenna farms and ore works span a 180-kilometre octogram, several built straight onto the near side\'s richest mining claims.\n\nIt is the gateway. TsukiBase is what waits beyond it.',
      websiteUrl: 'https://www.lunararray.com',
      screenshot: '/lunararray-preview.png',
    },
    features: [
      {
        title: 'Gate to the Moon',
        body: '鳥居 — Torii Gate established... initiating scans.',
      },
      {
        title: 'Scanning...',
        body: 'Systems active. Surveying the terrain.',
      },
      {
        title: 'Planning...',
        body: 'Mission parameters under review. More to come.',
      },
    ],
  },
  {
    slug: 'conduit',
    name: 'Conduit',
    glyph: '〜',
    color: '#2d6a9f',
    platform: 'Mac',
    version: '—',
    tagline: 'Incoming transmission...',
    noPage: true,
  },
];
