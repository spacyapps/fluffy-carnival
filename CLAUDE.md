@AGENTS.md

# SpacyApps site (fluffy-carnival)

Next.js 16 App Router, React 19, TypeScript. Hosted on Vercel (project linked in `.vercel/`).
Bundled Next docs: `node_modules/next/dist/docs/` (read before using any Next API).

## Commands

- `npm run dev` / `npm run build`
- `npx tsc --noEmit -p .` — typecheck
- `npx eslint app --quiet` — has a known baseline of `react-hooks/set-state-in-effect`
  errors in existing components; don't count those against a change, don't add new ones

## Where things live

Pages are thin; content is data.

- `app/data/apps.ts` → every app page (`app/apps/[slug]/page.tsx` renders it). `noPage` entries get no page and no sitemap row.
- `app/data/journal.ts` → journal posts, bodies as `Block[]`. Feeds `/journal`, `/journal/[slug]`, `feed.xml`, sitemap.
- `app/data/posts.ts` → the home page's journal cards only. **Separate list from `journal.ts`** — a new journal post doesn't appear on the home page unless it's added here too.
- `app/apps/ground-control/themes/page.tsx` → the one hand-built sub-page. Theme list, price and Polar checkout links are at the top of the file; its comments explain the per-placement link rule.
- `app/components/boutique/` → site components; `app/components/journal/` → journal shells and diagrams.
- `app/components/starsystem/` → the home hero, a three.js star system (`scene.ts`), one planet per `APPS` entry, styled by its `phase`.
- `app/components/journal/Lounge.tsx` + `loungeScene.ts` → the journal index, a three.js lounge seen through her eyes: legs on a chaise, a galaxy window (`loungeSky.ts`), files left and magazines right (`loungeTextures.ts`). Which pile a post goes on, its icon and cover image are the tables at the top of `Lounge.tsx`. Undated posts are left out.
- `scripts/journal-figure.py` → rebuilds her rigged figure (`public/journal/lounge-figure.glb`, whole body minus the head, exported at rest with its skeleton) in Blender + MPFB. `app/components/journal/loungeFigure.ts` poses her live: leg poses are bone turns (the `POSES` table), arms are solved from where each hand should be (resting, reaching for a tapped entry, holding it in her lap). The page draws only her legs and forearms unless the URL has `?body=1` (`?view=side` / `?view=front` look at her from outside; `?pose=cross|side|lift` holds a pose). The suit, its gold trim and the boots' gold are painted in the shader there, not the mesh.
- `app/sitemap.ts` → built from `APPS` + `journal.ts`, plus a hand-listed `appSubPages` array. A new non-`APPS` page must be added there.
- `app/dev/` → local scratch pages, untracked. Not part of the site.

## Rules that are easy to break

- **Fixed 1080px layout.** `layout.tsx` sets `width: 1080`; `ScaleWrapper` scales it down on narrow screens. Don't add responsive CSS.
- **Inline styles in JSX**, using the tokens in `app/globals.css` (`--bg`, `--ink*`, `--accent*`, `--font-*`). No Tailwind.
- **Undated journal entries are placeholders** ("Coming soon"). They're noindexed and kept out of the sitemap and feed by checking `date` — keep `date: ''` until a post is real.
- **The home scene and the journal lounge share no code.** Walter wants the journal to be its own world; don't import `starsystem/` from `journal/` or vice versa.
- **The site carries the story, the app repos carry the facts.** Link to a repo's docs rather than copying specs onto a page.
- **This repo is public.** No private notes, keys or unreleased details in code or comments.
