# nurbijoy.github.io

Personal website of **Nur Mohammad Bijoy**: projects, research, advanced skills, interests and live open-source activity.

**Stack:** React 19 · TypeScript 7 · Vite 8 · Tailwind CSS v4 (+ hand-written CSS) · Recharts · d3-force · Motion · Vitest

```bash
npm install
npm run dev        # http://localhost:5173
npm run check      # typecheck + tests + production build (what CI runs)
```

## Editing content

All content is typed data in [`src/data`](src/data). No component needs touching to change what the site says.

| To change… | Edit | Notes |
| --- | --- | --- |
| Name, tagline, roles, links, education | `site.ts` | The graduate programme lives **only** in `education`; a test fails if it appears anywhere else. |
| Projects | `projects.ts` | Optional: `image`, `status`, `role`, `case` (opens a case-study dialog), `featured`, `repo` (live GitHub stars). |
| Publications / talks | `publications.ts` | Cards, timeline, abstracts, links and a generated BibTeX **Cite** button. Leave `[]` for an empty state. |
| Research directions + concept map | `research.ts` | The constellation chart is drawn from `graphNodes` / `graphLinks`. |
| Skills | `skills.ts` | Only skills at `MIN_LEVEL` (Advanced) or above are ever shown. |
| Interests | `interests.ts` | |

**Placeholder content.** Anything marked `sample: true` renders with a visible *Sample* tag so invented content can never pass as real. Replace the entry and drop the flag. Projects, skills, interests, research directions and the three publications are currently samples. The GitHub section is real data.

**Project screenshots.** Drop images in `public/projects/` and set `image: '/projects/name.png'` (16:9 works best). Without one, a generative cover is painted from the project id.

## Architecture

- **Content / presentation split.** `src/data` (typed content) → `src/components` (sections, charts, ui) → `src/lib` (pure logic: GitHub binning, BibTeX, formatting) → `src/hooks`.
- **Design tokens** live in `src/index.css` (`:root` for light, `[data-theme='dark']` for dark) and are exposed to Tailwind through `@theme inline`, so every utility re-themes live. Light and dark are separately selected, not an automatic flip.
- **Charts** use one fixed categorical order (orange → blue → aqua) that was validated for colour-blind separation in both themes, a single-hue sequential ramp for magnitude, and a chart/table twin on every card.

## Fast, reliable, scalable

- **Code-split** heavy sections (Recharts, d3) into lazy chunks, warmed after first interaction. Charts mount only when scrolled into view and animate then.
- **Failure isolation.** Every lazy section and every chart sits in its own error boundary; a failed chunk offers a reload instead of a blank page.
- **GitHub data** has an 8 s timeout, a 30 min cache, and falls back to the last saved copy, so the rate limit (60 req/h per IP) can't break the page.
- **Cheap hero.** The dot grid is painted once into a cached bitmap; each frame draws only the pointer glow, the scan band and the data packets. The block-hash strip is a CSS transform, so it costs no JavaScript. (A live in-browser blockchain widget was tried and removed: too tall and too heavy.)
- **No layout shift from fonts.** The two critical fonts are preloaded, and the fallbacks are Arial rescaled to the real fonts' measured metrics, so the web-font swap moves nothing (headline box 317 px vs 317 px).
- **Measured on the production build** (localhost, unthrottled): FCP/LCP well under a second, no long tasks in steady state, ~59 fps under pointer interaction, worst frame 40 ms.
- **Accessible.** Skip link, visible focus, keyboard-operable palette and dialogs with focus trapping, `prefers-reduced-motion` respected, WCAG AA contrast verified for every text pair in both themes.
- **Tested.** `npm test` covers the data layer's integrity (unique ids, valid graph edges, advanced-only skills), heatmap binning, BibTeX and formatting, plus the "programme mentioned only in Education" rule.

## Deploying

Pushing to `main` runs `.github/workflows/deploy.yml` (typecheck → tests → build → GitHub Pages). In the repo's **Settings → Pages**, set **Source** to **GitHub Actions** once. `ci.yml` runs the same checks on branches and pull requests.

Press <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>K</kbd> on the site for the command palette.
