---
name: spicychicken-design-system
description: "The SpicyChicken visual standard (sc.css v2.16.0) — cobalt structure, one spice accent, dark by default. Use this skill for ANY visual or written artifact the user asks for — HTML pages, dashboards, reports, one-pagers, READMEs, decks, docs, email, charts, React components, prototypes, mockups, landing pages, or anything with a UI. Trigger it even when the user says nothing about design, branding, or styling; this is their house style and it applies by default to everything they ship. Also trigger on mentions of SpicyChicken, sc.css, sc- classes, the chick mark, or 'my design system'."
license: "MIT for the code; the SpicyChicken mark and assets/ are all rights reserved."
---

# SpicyChicken Design System

The visual standard for everything shipped under **SpicyChicken**.
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

**For a real project the user will host:** copy a verified design snapshot with
`node build/vendor.mjs <consumer>/design-system`. This copies the stylesheet,
optional scripts and original assets, with source commit and checksums. Use local
`design-system/sc.css`, `design-system/sc-theme.js` and (optionally, deferred)
`design-system/sc-motion.js`. A published release may instead use jsDelivr; confirm
that the matching tag exists before using the CDN example below.

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
<link rel="stylesheet" href="design-system/sc.css">
<script src="design-system/sc-theme.js"></script>
<!-- optional; only if the page draws charts -->
<script src="design-system/sc-charts.js"></script>
```

Order matters: `color-scheme` first, preconnects and fonts before `sc.css`, theme script in
`<head>` so a saved choice applies before paint. The favicon is the chick, always.
For production, vendor an immutable checked-in snapshot of these files and keep its
provenance manifest. A GitHub Pages URL is **latest** — prototypes only, never production.

**Page skeleton:** `assets/starter.html` is the canonical shell — masthead with the chick and
theme toggle, title block, footer with the watermark. Start from it rather than writing a page
from scratch.

## Component vocabulary

### Find, compose, animate

Use `composition-studio.html` for a complete configurable page, or start at `visual-library.html` in the repository for searchable, copyable visual
recipes. Select a structure before applying decoration. The library covers brand
identity, editorial layouts, data compositions, motion, and loading/empty states.
Its snippets use only the shared stylesheet, original assets and optional motion
script; the catalog styling is never a consumer dependency.

Read `references/MOTION.md` for the opt-in motion API. Use `.sc-reveal` with
`data-sc-motion="rise|fade|scale|slide|wipe"`, `.sc-stagger` for a small group,
`.sc-hover-lift` on a linked card, and `.sc-press` on a button. Base content stays
visible. Never animate numeric values, obscure focus, or run decorative motion
forever. Reduced motion and the user's pause choice take precedence.

Use `.sc-evidence` with `.sc-insight` for a finding and its records, `.sc-table--research` for explanatory tables, `.sc-dossier` for object cards, and `.sc-disclosure` for generous native details. `.sc-brand-stage` adds orbit or ledger linework in a reserved art region. `.sc-reading` and `.sc-chapter-nav` provide a report rail; optional `assets/sc-reading.js` sets the active location without replacing native anchors. Call `SC.reading.refresh()` after asynchronous content changes.

For multi-selection and reversible selected-field restores, compose existing
task labels, disclosures, paired comparison values and one actionbar. Read
`references/STUDIO-PATTERNS.md`: filters retain stable selected IDs, bulk review
matches the basket, partial restores preserve omitted fields, and Undo checks the
current revision. `assets/templates/studio.html` shows illustrative states;
drafts, persistence and authorization remain consumer-owned. No new CSS or
selection runtime is required.

The same studio reference documents reviewed dated batches and prepared task
continuations. State actual kept records, preserve omissions across refresh,
name the removable/protected Undo scope, and keep a continuation's saved identity,
targets and confirmed work pinned. Preview and Start share an authoritative
source witness; per-visit choices stay separate. See the illustrative batch and
prepared sections in `assets/templates/studio.html`. Existing primitives suffice;
source resolution, timers, scheduling, saves and focus handoff belong to the app.

Use `.sc-signal-matrix` when readers must scan candidates against shared criteria. Every
`.sc-signal` needs a written `.sc-signal__label`; its glyph is decorative and color only
reinforces meaning the product already knows. Keep the native table and a labeled,
keyboard-focusable `.sc-table-scroll` wrapper.

### Complete visual compositions

Read `references/VISUAL-RECIPES.md` when designing an entire website, dashboard,
screener, report, printable deliverable, or brand cover. The visual studio and five templates demonstrate
how to vary hierarchy while preserving the SpicyChicken identity.

New vocabulary: `.sc-cover` (ink + `.sc-on-ink`, `--wine`, `--paper`, `--compact`),
`.sc-brand-panel`, `.sc-ghost`, `.sc-signature`, `.sc-adaptive-mark`, `.sc-chapter`,
`.sc-stat-strip`, `.sc-stat`, `.sc-facts`, `.sc-chart-caption`, `.sc-empty--brand`,
and `.sc-report`. These are opt-in compositions. Use the existing primitives for
ordinary controls and data.

For documents meant to leave the browser, compose explicit pages with
`.sc-sheet-stack`, `.sc-sheet`, `.sc-sheet__head`, `.sc-sheet__body`, and
`.sc-sheet__foot`; use `.sc-sheet--cover` for one opening page and
`.sc-sheet--dense` for evidence-heavy pages. Existing web
reports can add `.sc-print-report`, `.sc-print-head`, and `.sc-print-foot` without
changing their screen layout. Keep screen-only navigation in `.sc-screen-only`.

Use the original logo at a generous size in one cover art column, mono repeats
in dedicated brand panels, and subtle ghosts in reserved blank space. Never
overlap body text, controls, chart plots, or tables with a watermark. The original
paths and proportions stay intact. Wine is for brand moments; warm paper is an
editorial cover surface. Neither becomes a status colour or chart series.

The bundle includes `assets/templates/{landing,dashboard,screener,report,deliverable}.html`.
Their relative image paths resolve to `assets/assets/`; CSS and theme scripts
remain in `assets/`. Copy the subtree together or inline its local dependencies.
Replace all illustrative content and specimen navigation before shipping a product.

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

### Working studio patterns

Read `references/STUDIO-PATTERNS.md`. Use `.sc-activity` with a native date grid, written selected value and table twin; optional `assets/sc-activity.js` adds one roving tab stop and arrow/Home/End inspection. Values and sequential bins are authored by the application; zero and missing stay distinct. Call `SC.activity.init(root)` for dynamic content, then `refresh()` or `dispose()` on returned controllers.

Use `.sc-session` and `.sc-task-list` for a timer/status header and checklist rows with native inputs or accessible checkbox primitives. Checked rows recognise native checked state and aria-checked=true; the application owns primitive behaviour and labelling. `.sc-task__target` wraps long targets, and `.sc-task__save` repeats the actual save state in words. `.sc-actionbar--sticky` is bounded by its section and becomes static in print. `.sc-workspace-nav` keeps named navigation and 44px controls readable on phones. Add `.sc-workspace-nav--compact` for short labels with optional decorative `.sc-workspace-nav__icon` elements; controls stack and wrap rather than creating a clipped rail. These patterns do not implement timers, saves or product decisions.

Use `.sc-media-stage` with `.sc-media-stage__frame` for intrinsic instructional media. Supply real width/height metadata; matching frames retain one geometry, and the application owns their aria-hidden/playback state. Use `.sc-dock-layout` with `.sc-dock-layout__head`, `.sc-dock-layout__body` and `.sc-bottom-dock` for an opt-in phone header/body/dock row layout. Reuse existing named navigation and action-bar primitives; no viewport-fixed overlay or copied bottom offset. See `references/STUDIO-PATTERNS.md`.

### Game shell (a HUD over a canvas the game owns)

Read `references/GAME-PATTERNS.md`. The canvas is the game's ART: snow, timber, coins and coloured
keys are world materials, never `--sc-*` tokens, status colours, chart slots or HUD text. Name a
world colour in words ("purple key") and give it a silhouette on the canvas.

`.sc-game` is the stage (add `.sc-game--viewport` for full screen; give an embedded stage a block
size). Inside it: `.sc-game__canvas` (focusable, `touch-action: none` on itself only), a decorative
`.sc-game__crosshair` with `aria-hidden="true"`, and `.sc-game__hud` holding `.sc-game__slot`
children placed with `.sc-game__slot--tl`, `.sc-game__slot--top`, `.sc-game__slot--tr`,
`.sc-game__slot--left`, `.sc-game__slot--right`, `.sc-game__slot--bl`, `.sc-game__slot--bottom` and
`.sc-game__slot--br`. The stage is a size container, so on a stage 600px wide or narrower the HUD
takes two columns with `tl`, `tr`, `top` and `left` above the play area and `right`, `bottom`, `bl`
and `br` below it: keep each half shorter than half the stage, and put the taller side plate in the
lighter half, so the crosshair stays clear. On a short screen show fewer plates. Put every readout on
a `.sc-game__plate` — opaque ink with the on-ink re-scope, the only contrast guarantee over art. Readouts: `.sc-game__timer` (`role="timer"`, a
`.sc-game__timer-value` `<time>` and a written `.sc-game__timer-state`); `.sc-game__measure` with
`.sc-game__measure-label`, `.sc-game__measure-value` (unit in `<small>`) and
`.sc-game__measure-note`, composing `.sc-benchmark` or `progress.sc-progress` for a threshold;
`.sc-game__count` with `.sc-game__count-value` and the words in the markup; `ol.sc-game__stars` of
`.sc-game__star` (`.is-earned`) with `.sc-game__star-glyph` (aria-hidden), `.sc-game__star-label`,
`.sc-game__star-rule` and `.sc-game__star-state`; `.sc-game__hint` (`aria-live="polite"`, `kbd`
inside); `dl.sc-game__keys` for the controls legend. `.sc-game__layer` is the start/pause layer —
a plain div (make the canvas and the HUD's controls `inert` while open — never the whole HUD, which
holds the level heading and readouts) or a `dialog` opened with `showModal()` —
centring a `.sc-card` with `.sc-game__panel`, one `.sc-actionbar` primary ("Click to play"), how to
release ("Escape releases the mouse and pauses") and, after a refusal, a `.sc-notice` with a
keyboard path.

**Counts, levels and cinematic moments:** `.sc-game__milestones` is a written count
(`.sc-game__milestones-count`) moving along an aria-hidden `.sc-game__milestones-track` whose
`.sc-game__milestones-marker` stars light (`.is-earned`: outlined to filled) as the count passes each
threshold; write the thresholds in a `.sc-game__milestones-note` or an `ol.sc-game__stars`, set
`--sc-game-milestones-value` and `--sc-game-milestone-at` inline, and announce a count-up's total once.
`.sc-game__meter` is a `role="meter"` plate (`data-state` calm, alert or danger: word, glyph shape
and fill thickness all change) with its state in `aria-valuetext`. `.sc-game--cinematic` on the
stage draws letterbox bars and keeps only `.sc-game__captions` (a persistent polite region holding
`.sc-game__caption` plates with `.sc-game__caption-speaker` and `.sc-game__caption-line`, at most
`60ch`), `.sc-game__skip` (a real button, keys written beside it; Escape pauses, never skips) and a
centred `.sc-game__title-card`. Add `.sc-game--still` when the game's own reduced-motion setting is on.

**How to wire capture:** load `assets/sc-game.js` (it adds nothing until called), then
`const c = SC.game.capture(stage, { target: canvas, resumeControl: playButton, onCapture, onRelease,
onDenied })` and call `c.request()` only from the Play/Resume click. `onRelease(reason)` receives
`'escape'`, `'blur'` or `'api'`; focus returns to `resumeControl`; `c.release()` and `c.dispose()`
clean up (a lock granted after a mid-request `dispose()` is exited too). It never listens for keys — the engine owns input and must clear held keys on blur.
Display times and sizes with `SC.game.formatElapsed(ms)` / `SC.game.formatMeasure(v)`, which
truncate; compare RAW values for every rule. `assets/templates/game.html` is the complete specimen.
Physics, levels, rules and saves stay in the game; anything a game needs that the system lacks
follows the reciprocal rule in the repository's `AGENTS.md`.

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
- `references/MOTION.md` — motion recipes, loading rules, reduced-motion behavior.
- `references/GAME-PATTERNS.md` — the game shell contract, the world/canvas colour rule and the capture lifecycle.
- `assets/sc-game.js` — optional pointer-capture lifecycle and truncating formatters for a game over a canvas.
- `assets/sc-reading.js` — optional chapter location highlighting; native links remain usable without it.
- `assets/sc-motion.js` — optional motion runtime; use with the matching stylesheet.
- `assets/sc.css` — the sheet itself (v2.16.0). Read it to confirm a class or token exists before
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
