---
name: spicychicken-design-system
description: "The SpicyChicken visual standard (sc.css v2.3.0) — cobalt structure, one spice accent, dark by default. Use this skill for ANY visual or written artifact the user asks for — HTML pages, dashboards, reports, one-pagers, READMEs, decks, docs, email, charts, React components, prototypes, mockups, landing pages, or anything with a UI. Trigger it even when the user says nothing about design, branding, or styling; this is their house style and it applies by default to everything they ship. Also trigger on mentions of SpicyChicken, sc.css, sc- classes, the chick mark, or 'my design system'."
license: "MIT for the code; the SpicyChicken mark and assets/ are all rights reserved."
---

# SpicyChicken Design System

The visual standard for everything Mohammed Tahir Madni ships under **SpicyChicken**.
Cobalt structure, one spice accent, dark by default.

**Apply this to every artifact unless the user explicitly opts out.** Uniformity across
projects is the entire point of the system. When something seems to need a new color, a new
font, or a new component, it needs a new *use* of an existing one.

## The six rules that matter most

1. **No new hues, no gradients, flat fills only.** Cobalt is structure; spice is the one accent.
2. **Page CSS references semantic tokens only** — `var(--sc-surface)`, never a primitive
   (`--sc-cobalt-700`) and never a raw hex.
3. **Reproduce `.sc-*` components; don't invent new ones.** If the page needs something the
   system doesn't have, fold it in or take it out.
4. **Exactly one spice action per view.** One primary button or one next-action callout — not a menu.
5. **The page ends with one next action, not a list of next steps.**
6. **Text never wears a chart, status, or accent color.** Deltas carry ▲▼; chips carry words.

Voice: plain-spoken and specific. State the outcome and the reason. No hype, no buzzword stacks.
Casing: sentence case for headlines and body; eyebrows, chips, tabs, and table headers are
lowercase mono. Codes that must keep their case (VIN, TX, BMW i5) take `.sc-case` /
`.sc-chip--case` / `.sc-tab--case`.

## How to wire it up

**Default for artifacts and anything sandboxed:** inline the stylesheet. `assets/sc.css` and
`assets/sc-theme.js` are bundled with this skill — read them and paste their contents into a
`<style>` and a `<script>` in the page head. Do this whenever external CDN links may be blocked
(Claude artifacts, email, exported HTML). It always works.

**For a real project the user will host:** pin the release via jsDelivr.

```html
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark light">
<meta name="theme-color" content="#111F31">
<link rel="icon" href="https://spicychicken59.github.io/design-system/assets/favicon.ico" sizes="16x16 32x32 48x48">
<link rel="icon" href="https://spicychicken59.github.io/design-system/assets/sc-avatar-tile.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="https://spicychicken59.github.io/design-system/assets/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;700&family=Instrument+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/spicyChicken59/design-system@v2.3.0/sc.css">
<script src="https://cdn.jsdelivr.net/gh/spicyChicken59/design-system@v2.3.0/sc-theme.js"></script>
<!-- optional; only if the page draws charts -->
<script src="https://cdn.jsdelivr.net/gh/spicyChicken59/design-system@v2.3.0/sc-charts.js"></script>
```

Order matters: `color-scheme` first, preconnects and fonts before `sc.css`, theme script in
`<head>` so a saved choice applies before paint. The favicon is the chick, always.
`@2` follows the newest 2.x tag. The GitHub Pages URL is **latest** — prototypes only, never
production.

**Page skeleton:** `assets/starter.html` is the canonical shell — masthead with the chick and
theme toggle, title block, footer with the watermark. Start from it rather than writing a page
from scratch.

## Component vocabulary

Everything below exists in `sc.css`. Use these names exactly.

**Structure** — `.sc-wrap` (`--prose`, `--wide`), `.sc-section`, `.sc-stack`, `.sc-row`,
`.sc-grid` (`--2`, `--3`, `--4`), `.sc-sep`, `.sc-masthead`, `.sc-nav`, `.sc-foot`,
`.sc-watermark`, `.sc-skip`, `.sc-theme-toggle`, `.sc-brand`, `.sc-mark` (`--lg`)

**Page furniture** — `.sc-title`, `.sc-eyebrow` (`--muted`, `--accent`), `.sc-dek`, `.sc-hero`,
`.sc-meta`, `.sc-toc`, `.sc-doc` (`--flat`), `.sc-hint`, `.sc-note`, `.sc-figure`

**Surfaces** — `.sc-card` (`--raised`), `.sc-tile`, `.sc-frame` (`--lg`, `--empty`),
`.sc-media` (`--card`), `.sc-empty`, `.sc-details`, `.sc-notice`

**Callouts** — `.sc-callout` with `--core`, `--spice`, `--warning`, `--ink`.
At most one core callout per section.

**Actions & controls** — `.sc-btn` (`--primary`, `--secondary`, `--ghost`, `--sm`),
`.sc-field`, `.sc-input`, `.sc-select`, `.sc-check`, `.sc-filters`, `.sc-tabs` / `.sc-tab`,
`.sc-tooltip`, `.sc-link--quiet`

**Status & data** — `.sc-chip` (`--brand`, `--spice`, `--good`, `--warn`, `--danger`, `--info`,
`--neutral`, `--solid`, `--case`), `.sc-delta` (`--good`, `--bad`, `--flat`),
`.sc-table` (`--compact`) inside `.sc-table-scroll` (`--tall`, pins its first column and
fades the clipped edge with `.is-clipped`), `.sc-legend` + `.sc-legend__chip` (`--select`),
`.sc-chart` (`__grid` `__crosshair` `__series` `__marker` `__label` `__hit`),
`.sc-spark` (`--emphasis`)

**Points, maps, photo cards** (2.3) — `.sc-map` (`--labels`, `__btns` `__btn` `__scrollhint`
`__state` `__state-label` `__radius` `__anchor`), `.sc-dot` (`.is-filled` `.is-hollow`
`--link`) + `.sc-dot-ring`, `.sc-scatter__line` `__line-hit` `__series-label`,
`.sc-photo-card` (`__media` `__price` `__price-sub` `__chip` `__body`),
`.sc-filter-bar` (`__head` `__toggle`, `.is-open`), `.sc-frame--photo` + `.sc-frame__img`
+ `.sc-frame__mark`, `.sc-tooltip` (`--tap`, `__img` `__link` `__dash`),
`.sc-section--support` / `--chapter`, `.sc-show-more`, `.sc-with-mark`, `.sc-lockup`,
`.sc-eyebrow--case`

**Utilities** — `.sc-mono`, `.sc-num`, `.sc-case`, `.sc-muted`, `.sc-faint`, `.sc-nowrap`,
`.sc-truncate`, `.sc-right`, `.sc-on-ink`, `.sc-sr-only`, `.sc-hide-sm`

## Token vocabulary

Reference **semantic** tokens only. Primitives (`--sc-cobalt-*`, `--sc-gray-*`, `--sc-night-*`,
`--sc-spice-*`, `--sc-wine-*`) exist to define the semantics and are never used in a page.

- Surfaces: `--sc-bg`, `--sc-surface`, `--sc-raised`, `--sc-ink`, `--sc-ink-fill`,
  `--sc-ink-line`, `--sc-ink-line-strong`, `--sc-fold`, `--sc-hover`
- Text: `--sc-text`, `--sc-text-2`, `--sc-text-3`, `--sc-heading`, `--sc-on-ink`,
  `--sc-on-ink-2`, `--sc-on-ink-3`, `--sc-on-accent`
- Brand & accent: `--sc-brand`, `--sc-brand-strong`, `--sc-brand-fill`, `--sc-brand-line`,
  `--sc-accent`, `--sc-accent-hover`, `--sc-accent-fill`
- Status: `--sc-good`, `--sc-warn`, `--sc-danger`, `--sc-info` (each with a `-fill` pair)
- Borders & focus: `--sc-border`, `--sc-border-strong`, `--sc-border-control`, `--sc-focus`,
  `--sc-shadow`, `--sc-shadow-pop`, `--sc-selection`
- Type: `--sc-font-display`, `--sc-font-body`, `--sc-font-mono`, `--sc-h1`…`--sc-h3`,
  `--sc-text-xs`…`--sc-text-lg`, `--sc-lh-tight`, `--sc-lh-body`, `--sc-lh-heading`
- Space & shape: `--sc-s0`…`--sc-s12`, `--sc-r-sm`, `--sc-r-md`, `--sc-r-lg`, `--sc-r-pill`,
  `--sc-w-prose`, `--sc-w-content`, `--sc-w-wide`, `--sc-motion`, `--sc-ease`
- Charts: `--sc-chart-1`…`--sc-chart-5` (categorical), `--sc-chart-seq-1`…`-5` (sequential),
  `--sc-chart-emphasis`, `--sc-chart-context`, `--sc-chart-other`, `--sc-chart-grid`
- Scrim (text over a photograph, identical in both modes): `--sc-scrim`, `--sc-on-scrim`,
  `--sc-on-scrim-2`
- Mark channels (see Charts below): `--sc-tone`, `--sc-weight`

## Charts

Charts live inside a `.sc-chart` host and use `--sc-chart-*` only. One y-axis. A legend once
there are two or more series. **Every chart gets a table twin underneath it** — the same numbers
in a `.sc-table`, so the data is readable without color. Read `references/DESIGN_SYSTEM.md` §8
for the slot order and what was tested for colorblind separation.

**A mark carries a tone SLOT, never a colour.** Pass it through the `--sc-tone` channel:

```html
<path class="sc-chart__series" style="--sc-tone: var(--sc-chart-3); --sc-weight: 2.5">
```

The sheet keeps the `stroke:` declaration; you only supply the value, and because it stays a
`var()` reference it re-resolves on a theme flip with **no JavaScript**. The two wrong ways look
right and fail quietly: `stroke="#4682CC"` as a presentation attribute is *outranked* by the
sheet's own rule and paints nothing you asked for, and an inline `stroke:` takes the property
away from the sheet for good. Marks the sheet leaves uncoloured — `.sc-dot`'s fill — do take a
plain attribute, because nothing competes there.

**Filled and hollow are a second channel beside hue.** `.sc-dot.is-filled` / `.is-hollow` are
what let a map or scatter carry more than the three slots §8 validates for all-pairs
separation. Never let a category ride on colour alone.

`sc-charts.js` (optional, load after `sc.css`) ships the primitives every chart re-invents:
`SC.ticks` (nice axis steps — its flat-domain guard stops an infinite loop), `SC.spreadLabels`
(end labels pushed apart, clamped to both edges), `SC.spark`, `SC.tooltip` (one controller:
placement, edge flip, clamping, touch), `SC.tableTwin`, `SC.tone`/`SC.toneRef`, `SC.el`/`SC.svg`.

## Non-HTML output

- **Email or exported HTML** (no external stylesheet): use `references/PLAIN-HTML.md`, which has
  inline-style equivalents of the eyebrow, chip, card, and callout for both modes.
- **React**: the repo has thin wrappers in `react/` that emit the exact `sc-*` markup. The CSS is
  the source of truth — if you write React by hand, emit `sc-*` classes rather than inventing
  styling. Note that Claude artifacts only ship Tailwind core utilities, so for a React artifact
  inline `assets/sc.css` in a `<style>` tag and use `sc-*` classes.
- **Markdown, READMEs, decks**: the system still governs voice, casing, and the one-next-action
  rule. Use the ink lockup (`sc-lockup-ink.svg`) on light surfaces, cream on dark.

## Before you hand anything over

Run `references/CHECKLIST.md`. The lines that get missed most: page CSS with a stray hex in it,
a chart without its table twin, more than one spice action, and a page that ends with a list of
next steps instead of one.

## Reference files

Read these when the summary above isn't enough:

- `references/DESIGN_SYSTEM.md` — the full standard, 12 sections. §2 color and the on-ink
  context, §3 typography, §5 themes, §6 the component rules, §8 data viz, §10 accessibility,
  §11 project setup and asset URLs, §12 do/don't.
- `references/PLAIN-HTML.md` — inline-style equivalents for email and exported HTML.
- `references/CHECKLIST.md` — the pre-ship gate.
- `assets/sc.css` — the sheet itself (v2.3.0). Read it to confirm a class or token exists before
  using it. Never invent an `sc-*` name.
- `assets/sc-charts.js` — the chart primitives, if the page draws charts.
- `assets/sc-map.js` — the map layer, if the page draws a map. `SC.geo.albersUsa48`,
  `SC.geo.decodeTopology`, `SC.geo.ring`, `SC.geo.fitBoxes`, `SC.geo.STATE_ABBR` are pure;
  `SC.mapView(svg, opts)` owns pan, zoom, and the `data-br` / `data-bf` / `data-di` marks that
  must keep a constant size on screen as the view tightens.
- `assets/sc-theme.js` — theme script: saved choice before paint, toggle wiring, print swap.
- `assets/starter.html` — the page skeleton to start from.

Upstream: `github.com/spicyChicken59/design-system`, where this skill lives at
`.claude/skills/spicychicken-design-system/`. Its `assets/` and `references/` are **copied from
the repo by `build/assemble.mjs`**, and `build/check.mjs` rule 13 fails if they drift, so the
bundled sheet and the released sheet cannot disagree. Do not hand-edit `assets/` — edit the
repo's file and rebuild.
