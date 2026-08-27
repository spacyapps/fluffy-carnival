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
  videoFrame?: 'desktop';
  videoCaption?: string;
  videoSecondary?: { src: string; alt: string; caption: string };
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
  problem?: {
    heading: string;
    body: string;
    points: { label: string; body: string }[];
    closing: string;
    resolveLabel: string;
    pull: string;
  };
  descriptionPoints?: string[];
  featuresHeading?: string;
  howItWorks?: {
    heading: string;
    body: string;
    points?: string[];
    pointsAfter?: number;
    counterpoint?: { label: string; heading: string; body: string; quote: string };
  };
  challenges?: { kicker: string; heading: string; body: string; points?: string[]; closing?: string; pull: string };
  themeTool?: {
    kicker: string;
    heading: string;
    lead: string;
    steps?: string[];
    blocks: { heading: string; body: string; media?: { src: string; alt: string; caption: string; heading?: string; attribution?: string } }[];
    demo?: { heading: string; body: string; src: string; alt: string; caption: string };
    closing?: string;
    pull: string;
  };
  themes?: {
    heading: string;
    lead: string;
    blocks: { heading: string; body: string; points?: string[]; footer?: string; image?: { src: string; alt: string; caption: string } }[];
    strip?: { src: string; alt: string; caption: string };
    closing: string;
    closingMedia?: { src: string; alt: string; caption: string };
    note: string;
  };
  heroQuote?: string;
  status?: string;
  availability?: { heading: string; body: string; note: string };
}

export const APPS: App[] = [
  {
    slug: 'secret-stuff',
    name: 'Secret Stuff',
    glyph: 'S',
    color: '#7d4ad9',
    platform: 'iOS',
    version: '10.4',
    tagline: 'Live again at v10.4',
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
    slug: 'ground-control',
    name: 'Ground Control',
    glyph: '🛰',
    color: '#5bc0bd',
    platform: 'Mac',
    version: '—',
    tagline: 'Mission control for every agent you\'re running. AND jump directly to it!',
    icon: '/icon-ground-control.png',
    videoUrl: '/ground-control-preview.mp4',
    videoFrame: 'desktop',
    videoCaption: 'The space-station theme, running live',
    videoSecondary: {
      src: '/gc-jump-clean.mp4',
      alt: 'Hovering a row shows Jump; clicking brings the terminal to the front',
      caption: 'Tap a row, land on its terminal',
    },
    heroQuote: 'I waste time checking if my Session or Agent is done or waiting for me',
    status: 'In private alpha · coming soon to macOS',
    descriptionPoints: [
      'A menu-bar app for anyone running more than one AI agent at once.',
      'Every session gets a row — its name, what it\'s doing right now, and a dot that turns **red** the moment it is blocked and needs you.',
      'Click the row and the terminal tab that owns it comes to the front. No hunting through windows.',
      'Built for the AI coding CLIs you already run on your Mac — Claude Code and Grok CLI today.',
      '**And it is skinnable, WinAmp-style.** Swap the entire look in seconds. A status panel you stare at all day should be a thing you actually want on screen.',
    ],
    featuresHeading: 'Key original features',
    features: [
      {
        title: 'Every agent, one panel',
        body: 'A live row per session — Claude Code and Grok CLI — with what it\'s doing right now and a red dot the moment it needs you.',
      },
      {
        title: 'One click to the terminal',
        body: 'Jumps straight to the exact tab or pane that owns the session — whichever terminal or editor you happen to be running it in.',
      },
      {
        title: 'Skinnable',
        body: 'Drop-in theme folders, WinAmp-style — swap the whole panel\'s look without touching a line of Swift.',
      },
    ],
    problem: {
      heading: 'The cost was never the waiting. It was the checking.',
      body: 'You start an agent and go somewhere else — email, Slack, a review, a question from the desk behind you. That is the whole point of starting it. The work is supposed to happen while you are not watching.\n\nThen it goes wrong in one of two directions, and they point away from each other.',
      points: [
        {
          label: 'If you forget',
          body: 'An agent sits blocked for twenty minutes, waiting on a one-word answer you would have given instantly.',
        },
        {
          label: 'If you check instead',
          body: 'You shred the focus you switched away to protect — over and over, mostly to find nothing.',
        },
      ],
      closing: 'Neither is a discipline problem. You cannot remember what you were never shown, and the only way to find out is to stop what you are doing and go look.',
      resolveLabel: 'With the panel open',
      pull: 'So the fix is not a faster check. It is a free one — a glance instead of a context switch.',
    },
    howItWorks: {
      heading: 'How it works',
      body: 'Your agent already announces itself as it works — starting, thinking, finishing, stuck. Nobody is usually listening.\n\nGround Control listens.\n\nEach session says which tty it is speaking from — the name the system gives that one terminal — and which application owns it. The tty says which session. The application says what can be done about it.\n\nBecause a tty is a system-level fact, every session that runs in a terminal **identifies itself the same way**, editor pane or terminal window alike. What differs is **how precisely a click can land**: straight to the tab in some terminals, to the application in the rest. And working out which application owns a session was not free — editors bury their terminals inside nested helper bundles, so **the obvious answer is a helper rather than the app you can see**.\n\nSome agents never run in a terminal at all. An editor\'s own agent still reports in, and its rows still appear — but today it does not report the one moment you were waiting for, the pause where it needs your answer. That is not silence. It is an agent that **tells you everything except the thing you were watching for**.',
      points: [
        'It does not read your screen',
        'It does not poll your terminals to guess at a state',
      ],
      pointsAfter: 1,
      counterpoint: {
        label: '',
        heading: 'Research note: We proved we could type into your terminal. Then decided never to.',
        body: 'The question was whether Ground Control could answer an agent for you, from your phone. Approve or deny is the easy half — clean, no tricks needed.\n\nBut approve and deny are not what you need to send. You need words: use Postgres, not SQLite. The only route to words was scripting the terminal directly. That was tested, deliberately, to **find out whether it could be done. It can.**\n\nWhich is exactly where it stops. A yes tapped on a lock screen is not the same yes — you cannot see the working directory, or the diff, or what the last three approvals already unlocked. And approvals chain: each one clears the way for the next.\n\n**✦ No relay was ever built.** Anything that can type into your terminal is a remote execution capability, and putting a relay in that path would have turned one compromised server into every Mac connected to it. Some of that could be mitigated. **None of it belongs in an app whose whole job is to tell you something needs you.**\n\nIt would have been the easiest thing here to sell.',
        quote: 'Finding out you can do something is not the same as finding a reason to.',
      },
    },
    challenges: {
      kicker: 'What changed',
      heading: 'Why the notifications were never going to be enough',
      body: 'At work there were eight terminal sessions open on a good day, often more, and not all of them running the same agent.\n\nSystem notifications helped a little, and then stopped helping.',
      points: [
        'They tell you something happened, not which of eight sessions it was',
        'They do not tell you what it wants',
        'Arrive together and they stop being information — they become a stack you clear',
      ],
      closing: 'Underneath that is what AI actually changed about the work. Not that it produces more. Good output comes from a loop: input, review, input, review.',
      pull: 'The bottleneck moved to the reviewer.\nThe reviewer is you, and you are in a meeting.',
    },
    themes: {
      heading: 'Fun is a feature',
      lead: 'Ground Control is a serious monitor for production coding agents. It can be YOUR jewelled unicorn, if you want.',
      blocks: [
        {
          heading: 'It has a face',
          body: 'Every session gets an avatar, and the avatar has moods.',
          points: [
            'Nothing happening — asleep, with little z\'s',
            'Working — working',
            'Finished — a thumbs up',
            'Needs you! — attention seeking, on purpose',
          ],
          footer: 'The design brief for that last one: you should notice it from across the room without reading anything. And it stays lit until your click actually lands somewhere — silencing an alarm nobody attended to is the one thing a monitor must not do.',
          image: {
            src: '/gc-avatar-needs-input.gif',
            alt: 'The needs-you avatar state, animated',
            caption: 'That requests your presence',
          },
        },
        {
          heading: 'It has your billboard',
          body: 'Across the title strip, a little dot-matrix display — the kind that lived on the front of a 90s hi-fi. When nothing needs you, it scrolls.',
          points: [
            'Bad developer jokes',
            'The house name',
            'Words pinched from your own agents — file names, tool names, whatever today is full of',
          ],
          footer: 'A theme brings its own vocabulary, so a theme has a voice. The font knows capitals, digits and little else, so everything it says is short and shouty. That is most of the charm.',
        },
      ],
      strip: {
        src: '/gc-matrix.mp4',
        alt: 'The panel\'s dot-matrix sign, scrolling',
        caption: 'The sign, recorded running. Analyser either side, the house name going past in the middle.',
      },
      closing: 'WinAmp skins were the last time a mainstream utility assumed you would want to make it yours. Everything since has assumed you want it to look like everything else.\n\nThe retro pull is not nostalgia for its own sake. It is nostalgia for a period when software let you fiddle.\n\nSo this is not a bonus bolted onto a serious tool. A monitor only works if you keep it open, and **you keep open what you like looking at**. The skins are load-bearing.',
      closingMedia: {
        src: '/gc-unicorn-theme.mp4',
        alt: 'The unicorn theme running, with the alarm state showing red',
        caption: 'The unicorn theme, running.',
      },
      note: 'Additional themes will be available separately.',
    },
    themeTool: {
      kicker: 'The theme tool',
      heading: 'A guided brief for your image model',
      lead: 'Themes are plain folders — some images and a JSON file. Save the file and the panel re-skins instantly. Let the app walk you through building one.',
      steps: [
        'Answer a handful of questions — whether you have a reference picture, the character, what each state is doing, the drawing style. Not the colours: those follow a fixed rule, so the panel always reads at a glance.',
        'It turns that into a brief and comes back with the four avatar states drawn as stills. Expect a couple of rounds of notes — that back-and-forth is the tool working, not failing.',
        'Only once you sign off does it price and animate. An optional pass adds decorations pinned to the panel\'s corners.',
        'It builds the folder alongside all of this — wired up and waiting for the finished art.',
      ],
      blocks: [
        {
          heading: 'A nine-grid frame, and an easier way in',
          body: 'A theme starts from a nine-grid frame — the picture cut into a three-by-three. The four corners hold their size, the four edges stretch one way, the middle fills the rest. It is the trick behind every resizable window chrome, and the brief walks the model through drawing to it. Most people, or the model working for them, handle the default fine — background transparency and all, like this.\n\nThe easier way, if you want it: hand over one picture and let the whole thing scale to fit. Any proportions — the panel takes your picture\'s shape and the rows scroll inside it. Nothing to measure. A whole theme in an afternoon with no idea how any of it works.',
          media: {
            src: '/gc-resize.mp4',
            alt: 'The panel being resized, its corner ornaments holding their shape while the edges stretch',
            caption: 'Corners hold. Edges stretch.',
          },
        },
        {
          heading: 'It does not know how to draw. It knows what breaks.',
          body: 'The brief it writes is long. Every file, every size, each state and what it has to communicate, and the drawing rules for whichever route you picked.\n\nAnimation has two routes, and it tells you the trade. Frame-by-frame is cheap and jitters a little — right for a small detail, a blink or a glint. Full video holds the subject steady and costs tokens — right for a whole character or object. Either way, nothing animates until you have signed off on it as a still, so a wrong idea costs a picture and not a movie.\n\nThose rules are not style advice. One animation came back with frames varying seventeen pixels in height, which on screen read as the panel resizing while it played — so the brief now says lock the silhouette, and never draw a frame from the previous one, because that drifts. Another grew heavier as it went and then snapped back at the wrap — so it says close the loop. At avatar size an expression is invisible, so a state has to be carried by colour and shape.',
          media: {
            heading: 'Try this in...',
            src: '/gc-theme-brief.png',
            alt: 'The generated theme manifest beside dozens of avatar and frame variations returned by an image model',
            caption: 'The brief on the left. What came back on the right.',
            attribution: 'This one was made with Grok Imagine, a product of xAI — one of many models the brief works with. No affiliation.',
          },
        },
      ],
      demo: {
        heading: 'Corner decorations',
        body: 'Small pieces of art pinned to the panel\'s four corners, independent of the frame — a still, an APNG, a video. You do not have to animate anything yourself; the same brief that drew your avatars will generate these too. The one rule that makes them feel alive: a decoration only moves while one of your sessions is actually working. The rest of the time it holds on its first frame, so a busy panel looks busy from across the room before you have read a word of it.',
        src: '/gc-corner-decoration.mp4',
        alt: 'The space-station theme with animated art in each corner; the decorations run while a session works and hold still when the panel is quiet',
        caption: 'Corner art, running because a session is.',
      },
      closing: 'Bring your own animation — APNG turned out to beat GIF for this, real colour and real transparency, and plain video works too. The whole panel can move, not just the faces, and a model can generate every frame of it. Shapes that are not rectangles. Themes translucent enough to blend into the desktop rather than sit on top of it. A handful exist today — imagine a thousand.',
      pull: 'Not a wizard and not a preset library. The app hands the model a detailed list of what to generate, and why.',
    },
    availability: {
      heading: 'Still in the hangar',
      body: 'Ground Control is in private alpha — built, working, and flown daily on the machine it was written on. It isn\'t public yet, so there\'s nothing to download today.\n\nWhen it ships the app will be free and open source under AGPL-3.0. The artwork is a separate thing: themes are not derivative works of the program, so they carry their own licence. That split is what lets the app be free forever while a theme is something you can buy — and it means nothing is held back from the free version. The app is whole.\n\nCharge for the artwork. Never for the software.',
      note: 'Coming soon to macOS',
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
    icon: '/icon-conduit.png',
    screenshot: '/conduit-preview.png',
    description: 'A Mac app, early on the workbench.\n\nThe camera watches; Conduit reads the hand — landmarks, fingers, zones — and turns motion into signal. Still decoding what it becomes.',
    features: [
      {
        title: 'A hand in frame',
        body: 'Landmarks tracked, fingers counted, zones mapped — read live from the camera.',
      },
      {
        title: 'Signal forming',
        body: 'Motion becomes data becomes intent. Tuning the channel.',
      },
      {
        title: 'Transmission open',
        body: 'Early and evolving. More to come.',
      },
    ],
  },
];
