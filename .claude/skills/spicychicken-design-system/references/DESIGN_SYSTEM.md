# SpicyChicken Design System — v2.3.0

**The visual standard for everything Mohammed Tahir Madni ships under SpicyChicken.**

Attach this file (and `sc.css`) to any build — a dashboard, a README, a deck, a one-pager — and
follow it exactly. When something seems to need a new color, a new font, or a new component, it
needs a new *use* of an existing one. Uniformity across projects is the whole point.

Files in this folder:

| File | What it is |
|---|---|
| `sc.css` | The system. Tokens + base + components, dark default, light mode. One file, no build step for consumers. Header says `v2.3.0`. |
| `sc-charts.js` | The chart primitives the sheet's `.sc-chart` / `.sc-spark` / `.sc-tooltip` contracts were always describing. Optional; load it after `sc.css`. |
| `sc-theme.js` | The theme script (source: `build/theme.js`). Reads the saved choice before paint, wires the toggle, and swaps a pinned-dark page to light for printing. Link it or inline it. |
| `tokens.json` | The same tokens in W3C Design Tokens format, resolved per mode — for Figma variables / Tokens Studio. Generated from the CSS; edit the CSS. |
| `starter.html` | The page skeleton every project starts from: head snippet, masthead, theme toggle, title block, footer with watermark. |
| `styleguide.html` | Living reference — every token and component rendered in both modes. Generated from `build/`. |
| `index.html` | Redirects the Pages root to the style guide. |
| `build/` | Maintainer tooling, Node only (`check.mjs` + `contrast.mjs` are the gate behind `npm run check` and CI): `node build/gen-tokens.mjs` rebuilds `tokens.json`, `node build/assemble.mjs` rebuilds `styleguide.html` and `sc-theme.js` (from `theme.js`) from `styleguide-body.html` + `styleguide-page.css` + `styleguide.js` + `theme.js`; `color.mjs` is the OKLCH/contrast math. `npm run build` runs them all; `npm run check` diffs the generated files against the committed ones (§11). |
| `react/` | Optional thin React wrappers that emit the exact `sc-*` markup. Private, unpublished; the CSS stays the source of truth. `npm run build:react`. |
| `DESIGN_SYSTEM.md` | This document. |
| `PLAIN-HTML.md` | Inline-style equivalents of the eyebrow, chip, card and callout for email and exported HTML, both modes. |
| `AUDIT-AND-ROADMAP.md` | Where this came from, what was changed and why, what's next, changelog. |
| `CHECKLIST.md` | The pre-ship check. |
| `assets/` | The brand mark: four SVG forms, avatar tile, lockups (SVG + PNG), favicon set. URL table in §11. |
| `.design-sync/` | Notes and conventions for the Claude Design sync of `react/`. |

---

## 1. Brand hierarchy

- **One mark: the chick.** Every project wears it — masthead, favicon, avatar — with the project's
  name set beside it in the display face. The name is the project's identity; the mark is the maker's.
- **The watermark repeats it.** Mono form + wordmark, footer-right on every page, same size and
  opacity everywhere, linking to the profile.
- **The person authors.** "Mohammed Tahir Madni" appears in READMEs, document covers, and `rel="author"`
  — never in UI chrome.

- **Voice:** plain-spoken and specific. State the outcome and the reason; no hype, no buzzword stacks.
  *"Landed price = what it costs to put it in your driveway."*
- **Casing:** sentence case for headlines and body; eyebrows, chips, tabs, and table headers are lowercase mono (§3).
  Codes and proper nouns that must keep their case (VIN, TX, BMW i5) take `.sc-case` / `.sc-chip--case` / `.sc-tab--case`.
- **One next action.** A page, document, or deck ends with exactly one clear next step — never a menu.

---

## 2. Color

Cobalt-anchored, dark-first, with one hot accent. **Hard rules: no new hues, no decorative gradients,
flat fills only.** Every value below is measured (WCAG 2 contrast; the chart slots pass the
colorblind and normal-vision separation checks in `dataviz` — §8 says exactly what was checked).

### Provenance
The cobalt ramp carries the OKLCH lightness of the template's greens on the steps that carry text
(300, 700), so every contrast pairing the old system relied on still holds. The two darkest steps
(900, 950) were moved a few L points and had their chroma raised — blue needs more saturation than
green to read as a color at low lightness. Neutrals were re-tinted cool so nothing on the page
leans green anymore.

### Primitives (never used directly in a page)

| Ramp | Steps | Notes |
|---|---|---|
| **Cobalt** | 50 `#F3F7FC` · 100 `#E5EEF9` · 200 `#C6D9F2` · 300 `#A3C4EE` · 400 `#71A1DF` · 500 `#4682CC` · 600 `#2766B1` · **700 `#165194`** · 800 `#1B3E69` · **900 `#182E4B`** · **950 `#111F31`** | 700 = the old medium green's role · 900 = the old dark green · 950 = covers, code, mastheads |
| **Spice** | 300 `#FFAC92` · **400 `#FE825C`** · 500 `#EE5D2B` · 600 `#D24100` · **700 `#AC3400`** · 800 `#852B09` | 400 on dark, 700 on light (600 fails AA on the light page background; it survives as the light chart-2 slot, where marks need 3:1). Links, primary actions, focus. |
| **Night** | 950 `#09111B` · 900 `#121C2A` · 850 `#162232` · 800 `#1B2737` · 700 `#2A394D` · 600 `#3C4E66` | Dark-mode surfaces and hairlines. Cool, never pure black. |
| **Gray** | 50 `#F2F4F8` · 100 `#EDF2FA` · 200 `#E6E8EB` · 300 `#CFD6DE` · 400 `#A6AFBB` · 500 `#737B86` · 600 `#5D6671` · 800 `#2F3741` | Light-mode surfaces, borders, text. |
| **Status** | good `#4EA954` / `#1B7E2A` · warn `#D59800` / `#906400` · danger `#EE5A66` / `#BE2132` · info = cobalt 400 / 600 | dark / light. Reserved: never a chart series. Always paired with a word or icon. Each is ≥ 4.5:1 on its own `-fill` (dark danger 4.6, light good 4.50, light warn 4.53 — do not darken the fills). |
| **Wine** | 900 `#580819` · **700 `#82182B`** · **500 `#A12E3E`** · 300 `#E2AFB0` | The brand mark's family (Zenith-style maroon). 700 on light, 500 on dark. Reserved for the mark and brand moments — never a UI state, never a chart series. |

### Semantic roles — what a color *does*

| Token | Dark (default) | Light | Use |
|---|---|---|---|
| `--sc-bg` | night-950 | gray-50 | page |
| `--sc-surface` | night-900 | white | cards, tables, inputs |
| `--sc-raised` / `--sc-hover` | night-800 / 850 | cobalt-50 / gray-100 | code, chips, read-only inputs, row hover |
| `--sc-border` / `--sc-border-strong` | night-700 / 600 | gray-300 / 400 | hairlines (1.5:1 — decorative by design), kbd, secondary button, quiet-link underline |
| `--sc-border-control` | `#5B6E86` | gray-500 | the edge of `.sc-input` / `.sc-select` — 3.3:1 on the dark surface, 4.3:1 on white (WCAG 1.4.11). Controls need it; cards do not. |
| `--sc-ink` · `--sc-on-ink` · `--sc-on-ink-2` · `--sc-on-ink-3` | cobalt-950 · `#F4F7FB` · cobalt-300 · `rgba(255,255,255,.62)` | same | masthead, footer, covers, tooltips — **dark in both modes**. on-ink-3 is footer text (7.1:1 on ink). |
| `--sc-ink-line` / `--sc-ink-line-strong` / `--sc-ink-fill` | `rgba(255,255,255,.06)` / `.25` / `.14` | same | hairlines, dividers and the pressed toggle fill on ink. Declared once because ink never changes. |
| `--sc-heading` / `--sc-text` / `--sc-text-2` / `--sc-text-3` | `#F4F7FB` / `#D8DFE8` / `#92A0B1` / `#8090A4` | cobalt-900 / gray-800 / gray-600 / `#646C77` | headings / body / muted / faint. Faint is ≥ 4.5:1 everywhere it is used (dark 5.3 on surface, 4.6 on raised; light 5.3 on white, 4.8 on the page, 4.5 on brand-fill). In light mode faint is close to muted — the step is carried by size and weight. |
| `--sc-brand` / `--sc-brand-strong` | cobalt-300 / 400 | cobalt-700 / 600 | eyebrows, labels, data emphasis. brand-strong equals `--sc-chart-emphasis` in both modes — text beside a chart wears `--sc-heading`, not brand-strong (§8). |
| `--sc-brand-fill` / `--sc-brand-line` | `#19273A` / cobalt-700 | cobalt-100 / cobalt-700 | tinted fills, left borders, table-header rule, pressed tab, letter tile |
| `--sc-accent` / `--sc-accent-hover` / `--sc-on-accent` / `--sc-focus` | spice-400 / 300 / night-950 / spice-400 | spice-700 / 800 / white / spice-700 | links, primary button, focus ring. Dark accent 7.7:1 on the page, 7.0 on a card; light 5.9 on the page, 6.5 on white, 5.5 on accent-fill and brand-fill. |
| `--sc-accent-fill` | `#371F18` | `#FFE9E2` | spice chip and spice callout fills |
| `--sc-good` `--sc-warn` `--sc-danger` `--sc-info` (+ `-fill`) | see status | see status | state, never decoration |
| `--sc-code-bg` / `--sc-code-text` | cobalt-950 / `#D8DFE8` | same | `pre` — dark in both modes |
| `--sc-shadow` / `--sc-shadow-pop` | `0 1px 3px rgba(0,0,0,.35)` / `0 4px 14px rgba(0,0,0,.35)` | `0 1px 3px rgba(24,46,75,.08)` / same | cards; floating ink surfaces (tooltip) |
| `--sc-chart-1…5`, `--sc-chart-other`, `--sc-chart-emphasis`, `--sc-chart-context`, `--sc-chart-seq-1…5`, `--sc-chart-grid` | §8 | §8 | data only |

### The on-ink context
`.sc-masthead`, `.sc-foot`, `.sc-tooltip`, `.sc-callout--ink` and any block you give `.sc-on-ink`
re-declare the page tokens for a dark surface: `--sc-heading`/`--sc-text` → on-ink, `--sc-text-2` →
on-ink-2, `--sc-text-3` → on-ink-3, `--sc-brand` → on-ink-2, `--sc-brand-strong` → cobalt-300,
`--sc-accent`/`--sc-focus` → spice-400 (6.8:1 on ink), `--sc-raised` → cobalt-900, `--sc-hover` →
ink-fill, `--sc-border`/`--sc-border-strong` → ink-line-strong, `--sc-on-accent` → night-950, and the filled
components switch to the dark set (`--sc-surface` → cobalt-900; the brand, accent, info and status fills and
the status colours take their dark values) so chips, inputs, tabs and primary buttons stay readable. So base
headings, links, `strong`, eyebrows, chips and
buttons work inside ink without per-component patches — including a cover block in light mode.

### The two color jobs
- **Cobalt is structure.** Surfaces, headings, eyebrows, rules, table headers, the emphasized series.
- **Spice is heat.** Links, the primary button, focus rings, the one "look here" moment. Used sparingly:
  if everything is spicy, nothing is. Spice never colors body text, headings, or large fills.

---

## 3. Typography

Three families, loaded from Google Fonts by `sc.css` (`@import`) — a consumer page adds the
preconnects and the same `<link>` ahead of the stylesheet so the fonts start earlier (§11). Do not substitute.

```
https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;700&family=Instrument+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap
```

Stacks, as declared:

- `--sc-font-display`: `'Bricolage Grotesque', 'Instrument Sans', system-ui, sans-serif`
- `--sc-font-body`: `'Instrument Sans', system-ui, -apple-system, sans-serif`
- `--sc-font-mono`: `'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace`
  (Consolas and Liberation Mono are the Windows/Linux fallbacks; without them a page that loads
  before the webfont falls to Courier).

- **Bricolage Grotesque 700** — display and headlines (h1–h3, the brand name, the watermark wordmark).
  Modest negative tracking (−.2px at h3 to −1.5px on the 56px hero); its ink-trap personality
  carries the identity, not the tracking.
- **Instrument Sans 400–700** — body and UI at 15px; 13px captions; 18px deks. **Numbers in tiles
  and hero figures are Instrument too** — never the display face, never tabular figures at display sizes.
- **IBM Plex Mono 400–600** — eyebrows, labels, chips, table headers, code, VINs, dates.

**The signature tell:** a **lowercase** mono eyebrow in brand cobalt, modest tracking (≤.5px).
Use it on every title block, section opener, and callout label. The label is the label — since
2.2.0 the sheet injects no `//` prefix; a page that wants slashes types them in its own content.
Never ALL-CAPS with wide tracking — that is the previous system's signature, deliberately retired.

Scale, by token: `--sc-text-xs` 11 (meta, callout labels) · legend 12 · eyebrow 12 · `--sc-text-sm` 13
· `--sc-text-md` 15 (body) · h4 16 · `--sc-text-lg` 18 (dek) · `--sc-h3` 20 · `--sc-h2` 28 ·
`--sc-h1` 40 (30 below 720px) · `--sc-display` 56 (`.sc-hero`) · tile value 32 / 24 (`--sm`) ·
callout figure 22. Small mono runs at 10.5 (chips, field labels, notes) and 9.5 (brand sub-line).
Line height `--sc-lh-tight` 1.1 / `--sc-lh-heading` 1.2 / `--sc-lh-body` 1.6. `tabular-nums` only
in columns that must align.

## 4. Spacing, shape, motion

- **8px rhythm:** `--sc-s0` 4 · `--sc-s1` 8 · `--sc-s2` 16 · `--sc-s3` 24 · `--sc-s4` 32 · `--sc-s5` 40
  · `--sc-s6` 48 · `--sc-s8` 64 · `--sc-s10` 80 · `--sc-s12` 96.
- **Radii:** 6 (inputs, chips, frames) · 10 (callouts, buttons, media cards) · 14 (cards) · 999 (pills). Never bubbly.
- **Borders:** 1px hairlines in `--sc-border`. Separate with color, not heavy shadow. Form controls
  are the one exception: their edge is `--sc-border-control` so the box reads at 3:1.
- **Shadow:** `--sc-shadow` only — soft and rare. `--sc-shadow-pop` for the tooltip.
- **Motion:** fades and short slides, 240ms, ease-out. Base state = finished state. No bounce, no loops,
  no filters, no transforms. Hover signals with color (fill toward `--sc-hover`, border toward
  `--sc-brand-strong`), never scale; pressed secondary/ghost buttons shift to `--sc-hover`.
  `prefers-reduced-motion` zeroes it.
- **Widths:** prose 800 · content 1120 · wide (dashboards, tables) 1280.
- **Targets: 24px minimum.** Every interactive thing — toggle buttons, tabs, `summary`, checkbox
  labels, field labels — is at least 24px tall (WCAG 2.5.8).
- **Responsive.** One breakpoint: 720px. Below it the wrap, masthead and footer tighten to 20px
  gutters, the masthead wraps, h1 drops to 30px, the title block's top padding drops to 24px, cards
  and docs pad 14px, and `.sc-hide-sm` hides. Tables do not reflow: they scroll sideways **inside**
  `.sc-table-scroll`, which bleeds to the card edge (14px) or, directly in a wrap, to the wrap edge
  (20px). The page itself must never scroll sideways. A row that must survive a phone becomes a
  `.sc-media--card` twin (§6), toggled by the page.

---

## 5. Themes

**Dark is the default.** The page follows the OS setting; the masthead toggle (Dark / Light / Auto)
overrides it and is remembered per browser under the `sc-theme` key. Mechanics: `:root` carries the
dark tokens; `@media (prefers-color-scheme: light), print` and `:root[data-theme="light"]` carry the
light set (the two blocks are byte-identical); `data-theme="dark"` pins dark. `sc-theme.js` runs in
`<head>` before paint so there is no flash.

Stays dark in both modes: masthead, footer, code blocks, tooltips, ink callouts, covers. That is
what keeps a light page recognisably the same product as its dark sibling. Anything nested in those
surfaces reads the on-ink tokens automatically (§2, "the on-ink context"); give any other ink-filled
block `.sc-on-ink` to get the same treatment.

**Print** uses the light tokens: the media-light block also matches `print`, so an "auto" page
prints light on white with cards flat and unshadowed, the toggle hidden, and the masthead, footer,
`pre`, ink callouts and tooltips keeping their ink fill (`print-color-adjust: exact`). A page pinned
to dark would still print dark, so `sc-theme.js` sets `data-theme="light"` on `beforeprint` and
restores it on `afterprint` — nothing is persisted.

Light mode is not an inversion. Every light value was chosen and measured on its own: body 12.0:1 on
white / 10.9 on the page, muted 5.8 / 5.3, faint 5.3 / 4.8, brand labels 8.0 / 7.2, links 6.5 / 5.9.

---

## 6. Components

All classes are prefixed `sc-`. Blocks, elements and modifiers follow `sc-block__element--modifier`;
states use `is-*` or the ARIA attribute that already means it (`aria-pressed`, `aria-sort`,
`aria-current`, `aria-invalid`, `[disabled]`). Reproduce these; don't invent siblings. The `hidden`
attribute now beats every component's `display`, so hide with `hidden`, never with `style="display:none"`.

| Component | Class | Rules |
|---|---|---|
| Layout | `.sc-wrap` (`--wide` `--prose`) · `.sc-section` · `.sc-grid` (`--2` `--3` `--4`) · `.sc-stack` · `.sc-row` · `.sc-right` · `.sc-sep` | Wrap = measure + gutters; section = 48px rhythm; grid = auto-fit columns at 280/220/180px minimums; stack = 16px between children (no inline `margin-top`); row = inline run, `.sc-right` pushes to the end; `.sc-sep` = the `·` in a meta row, a 1px rule in the masthead. |
| Skip link | `.sc-skip` | `<a class="sc-skip" href="#main">` as the first thing in `<body>`; off-screen until focused. |
| On-ink block | `.sc-on-ink` | Gives any ink-filled block (a cover, a dark strip) the masthead's token re-scope (§2): headings, text, links and code read correctly on ink in both modes. |
| Masthead | `.sc-masthead` · `.sc-brand` (`__name` `__sub`) · `.sc-masthead__right` · `.sc-nav` | Project left, endorsement/toggle/status right. Dark in both modes. `.sc-nav` needs an `aria-label`; the current page carries `aria-current="page"`, underlined in spice. Bare text in `__right` is the status slot (11px mono) and wraps on phones. |
| Brand mark | `img.sc-mark` (`--lg`) · `.sc-brand__mark` | `img.sc-mark` is the standard: `sc-mark-color-dark.svg` on ink, `-light` on light surfaces, mono forms in the watermark. `.sc-brand__mark` is the letter-tile fallback when no SVG mark is available (brand-line fill, white letter). |
| Theme toggle | `.sc-theme-toggle` | Three buttons with `data-theme="dark|light|auto"`, `aria-pressed` on the active one, 24px tall. Lives in the masthead. |
| Title block | `.sc-title` | Eyebrow, h1, dek, meta and an optional segmented control (`.sc-title .sc-tabs` gets its own 16px). 40px above, 8px below; 24px above on phones. |
| Eyebrow | `.sc-eyebrow` (`--accent`, `--muted`) | Always above a heading. Lowercase mono, brand cobalt by default. The sheet adds no prefix — type any `//` in your own content. |
| Dek / meta | `.sc-dek` · `.sc-meta` | One sentence; mono meta row with `.sc-sep` dots. |
| Card | `.sc-card` (`--raised`) · `.sc-card__head` · `.sc-hint` | One discrete idea per card. Heading + hint, optional action right. An h2 or h3 in `__head` renders at the h3 scale (20px) — no inline sizes. The last child loses its bottom margin. `a.sc-card` is the supported linked-card form (text-coloured, no underline). |
| Stat tile | `.sc-tile` · `__label` `__value` (`--sm`) `__sub` `__spark` · `.sc-delta` (`--good` `--bad` `--flat`) | Label · value · context · signed delta vs a named period. `--bad` is amber (`--sc-warn`); red is danger only. Sparkline goes in the `__spark` slot as an `svg.sc-spark`. |
| Hero figure | `.sc-hero` | The one number a page leads with. Exactly one per view. |
| Callout | `.sc-callout` (`--core` `--ink` `--spice` `--warning`) · `__label` · `__figure` | Tinted fill + the file-fold corner (`--sc-fold`). Core = the single takeaway, max one per section. Ink = must-remember (on-ink context applies). Spice = the one next action. Warning adds the 2px danger border. `__figure` is the 22px lead figure or sentence. |
| Chip | `.sc-chip` (`--brand` `--neutral` `--spice` `--good` `--warn` `--danger` `--info` `--solid` `--case`) | Squared lowercase mono chip (6px radius). Meaning carried by the word, tone reinforces. Danger is the outline form. `--case` keeps the text's casing (VIN, TX). "new" is a `--spice` chip, never accent-coloured text. |
| Button | `.sc-btn` (`--primary` `--secondary` `--ghost` `--sm`) · `[disabled]` / `[aria-disabled="true"]` | Primary = spice, one per view. Secondary = outline. Pressed = fill shift, no transform. `a.sc-btn[aria-disabled]` blocks the click only — also drop the `href`, or use `<button disabled>`. |
| Inputs | `.sc-input` · `.sc-select` · `.sc-check` · `.sc-field` · `.sc-filters` | Edge in `--sc-border-control`; hover = brand-strong. States: `:disabled` (50%, not-allowed), `[aria-invalid="true"]` (danger edge), `:read-only` (raised fill). `label.sc-field` wraps a control with its mono label; `label.sc-check` carries the same label typography on its own, so use one or the other, not `.sc-field.sc-check`. Filters: one row, above everything they scope. |
| Table | `.sc-table` (`--compact`) · `.sc-table-scroll` (`--tall`) · `th.is-sortable` · `th[aria-sort]` · `button.sc-table__sort` · `.sc-num` · `tr.sc-empty` | Open header: lowercase mono over a 2px cobalt rule, no filled bar. Hairline rows, row hover. Numbers right-aligned, tabular, non-wrapping. **Sort contract:** the `th` carries `aria-sort="ascending|descending"` (the glyph follows it; `.is-sorted` is a deprecated alias for descending) and its label is a `<button class="sc-table__sort">` so sorting is keyboard-reachable. The header sticks only inside `.sc-table-scroll--tall` (bounded at 70vh, scrolls vertically); a plain `.sc-table-scroll` only scrolls sideways. **Since 2.3.0** the first column pins while it does, and `.is-clipped` (set by the consumer when `scrollWidth > clientWidth`) fades the clipped edge — a sideways-scrolling table must never hide the column that names each row. Links in cells are `.sc-link--quiet`. |
| Chart | `.sc-chart` · `svg` · `text` · `.sc-chart__label` `__grid` `__crosshair` `__series` (`--emphasis` `--context`) `__marker` | **Host contract:** `<div class="sc-chart" role="group" tabindex="0" aria-label="…">` around an `aria-hidden="true"` SVG, with a `.sc-details` table twin directly below. The host takes the focus ring; arrow keys step the crosshair; the SVG's `text` is 10.5px mono in `--sc-text-2`, `__label` is 12px body in `--sc-heading`. Series are 2px round-joined strokes; markers ring in `--sc-surface`. Colour from §8 tokens only. |
| Sparkline | `svg.sc-spark` (`--emphasis`) · `.sc-tile__spark` | An inline SVG: path in `--sc-chart-context` (1.5px), end dot ringed in the surface; `--emphasis` switches both to `--sc-chart-emphasis`. Marks wear chart tokens, never text or brand tokens. |
| Map | `.sc-map` (`--labels`) · `__btns` `__btn` `__scrollhint` `__state` `__state-label` `__radius` `__anchor` | A projected SVG that pans and zooms. Plain scroll keeps scrolling the page (the embedded-map convention), so `__scrollhint` teaches the modifier when a scroll passes through; `touch-action: pan-y` does the same for one finger. Buttons are 32px, 44px under a coarse pointer. `--labels` reveals the region labels past a zoom threshold. Geography is `--sc-bg` on `--sc-border`; `__radius` is the dashed "within N of here" ring, `__anchor` the "you are here" point. |
| Data dot | `.sc-dot` (`.is-filled` `.is-hollow` `--link`) · `.sc-dot-ring` | One datum as a point, shared by the map and the scatter. Filled and hollow are a **second channel beside hue**, which is what lets an all-pairs form carry more than the three slots §8 validates. `pointer-events: all` is load-bearing: `fill="none"` makes an SVG circle's interior untouchable, so a hollow dot would otherwise only hit-test on its stroke. `.sc-dot-ring` calls one out in the accent without blocking it. |
| Scatter | `.sc-scatter__line` `__line-hit` `__series-label` · `.sc-chart__hit` | The furniture around the dots: a dashed reference line in `--sc-border-strong`, a transparent 14px `__line-hit` twin so a 1.2px line has a real target, and a clickable direct label. `.sc-chart__hit` is the invisible full-height rect that gives a hover chart one clean hit area. |
| Photo card | `.sc-photo-card` · `__media` `__price` `__price-sub` `__chip` `__body` | A `.sc-card` is text-first; this one leads with the picture, so it sheds the padding and puts one headline figure on a scrim over the image. 16:10, capped at 300px. The scrim tokens (`--sc-scrim`, `--sc-on-scrim`, `--sc-on-scrim-2`) are the one place the system paints over an arbitrary photograph, so they are identical in both modes — and the only surface whose contrast cannot be pre-verified. Keep it to a short figure, never body copy. |
| Filter bar | `.sc-filter-bar` · `__head` `__toggle` · `.is-open` | The controls that scope a page, pinned to the top so they stay under the cursor while everything below re-renders. Wraps a `.sc-filters`. On a phone it folds to one 44px row that expands on tap, so the state stays visible without the controls eating the fold. |
| Frame | `img.sc-frame` · `.sc-frame--empty` · `--lg` · `--sc-frame-w` / `--sc-frame-h` | The photo slot (§7): 56×40, hairline border, 6px radius, raised fill, `object-fit: cover`. `--lg` = 120×80; other sizes set the two custom properties. `--empty` is a `div` that says "no photo" in lowercase mono, or holds a `.sc-frame__mark` (the mono chick at .28). `--photo` turns the frame into a loader: `.sc-frame__img` starts blurred and transparent and resolves on `.is-loaded`, so a slow photo never pops. In dark mode photos are damped to 82% brightness — they are lit for white — and shown as shot on hover. A mono mark must flip with the surface under it; there is no CSS-only switch, so ship both files and choose with a media query or in script. |
| Media row | `.sc-media` · `__body` `__title` `__sub` `__code` `__links` · `--card` · `__aside` `__foot` | Frame + title / sub / code (VIN, in faint mono) + quiet links, in a table cell or a list. `--card` is the phone twin: a bordered grid (frame · body · right-aligned aside) with a `__foot` row for flags and links. |
| Empty | `.sc-empty` · `tr.sc-empty` | Nothing to show yet: one sentence in muted text, no graphic, no apology. The `tr` form centres it across a table. |
| Figure / note | `.sc-figure` · `.sc-note` | The lead value in a cell (bold heading colour, non-wrapping) and its mono footnote on the next line. Emphasis beside a chart is `.sc-figure`, not brand-strong. |
| Quiet link | `.sc-link--quiet` | Muted link with a hairline underline; spice only on hover. For tables and media rows, where a spice link per row is noise. |
| Tooltip / legend | `.sc-tooltip` (`__date` `__row` `__meta`) · `.is-on` · `.sc-legend` · `i.is-swatch` | Ink surface, `--sc-shadow-pop`. Values lead, labels follow; line keys for lines, `is-swatch` boxes for bars. Hidden = `visibility: hidden` (out of the accessibility tree); `.is-on` fades it in. Needs a `position: relative` parent. `--tap` gives the pointer back to a tooltip opened by tap, so the links inside it work; `__img` is a 150×94 thumbnail, `__link` an underlined on-ink action, `__dash` the SVG twin of `__row i` when a series is dashed. `.sc-legend__chip` is a legend key that is also a control — pressed-off strikes out because the series is hidden, while `--select` stays fully legible because nothing is. |
| Tabs | `.sc-tabs` · `.sc-tab[aria-pressed]` (`--case`) | **A segmented control, not tabs:** `<div class="sc-tabs" role="group" aria-label="…">` with `<button class="sc-tab" aria-pressed="true|false">`. Switches the subject (which model, which range), not navigation. `aria-selected` is still styled for old markup. `--case` keeps proper-noun casing (BMW i5). |
| Details | `.sc-details` | The table-view twin under every chart; `summary` is a 24px mono link with a CSS arrow. |
| Notice | `.sc-notice` | The stop-and-read block: what failed, what to do. |
| Footer + watermark | `.sc-foot` · `.sc-watermark` (`__name`) | Source line left, brand watermark right (on-ink, 70%). Every page. |
| Document | `.sc-doc` (`--flat`) · `.sc-toc` | On-screen prose surface, 800px, section rules in brand-line, 68ch measure, h3 rhythm. `--flat` drops the card (prose straight on the page); `.sc-toc` is a wrapping mono row of anchors under the title. |
| Utilities | `.sc-mono` `.sc-muted` `.sc-faint` `.sc-num` `.sc-nowrap` `.sc-truncate` `.sc-case` `.sc-stack` `.sc-row` `.sc-right` `.sc-sr-only` `.sc-hide-sm` `.sc-text-good` `.sc-text-warn` `.sc-text-danger` `.sc-text-info` `.sc-text-brand` | Small helpers, no spacing scale. `.sc-text-*` status colours are for one-word labels next to a word or glyph, never sentences. `.sc-text-accent` is deprecated (2.1) — use a `.sc-chip--spice`; removed in 3.0. `.sc-case` is last in the sheet so it wins inside any lowercased component. |

Plain-HTML equivalents (email, exported HTML) are in `PLAIN-HTML.md` — the eyebrow, chip, card and
callout, both modes, with resolved hex.

---

## 7. Iconography & imagery

No decorative icon library. The visual language is type, color, chips, and layout; glyphs stay
textual (`→ ↓ ↗ ▲ ▼`), and the ones the CSS draws are hidden from assistive tech. If an app UI truly
needs icons, use a restrained stroke set (Lucide, 1.5px) and note the substitution. Photos are
content (a car, a screenshot), never decoration; they sit in `.sc-frame` — hairline border, 6px
radius, raised fill, cropped to cover — with `.sc-frame--empty` saying "no photo" when there is
none. No emoji in UI or documents.

---

## 8. Data visualization

Validated with the `dataviz` method; re-run the checks if a slot ever changes. Charts sit on
`--sc-surface` (inside a card), never on `--sc-bg`.

- **Categorical (fixed order, never cycled):** 1 cobalt · 2 spice · 3 teal · 4 violet · 5 pink ·
  Other = gray. Adjacent pairs are CVD-separated, which is what bars and legended lines need; the
  **all-pairs** check passes for slots 1–3 only, so scatter, bubble and map forms use 1–3, and a
  line chart that reaches slots 4–5 end-labels or marks its series (1 and 4 merge under deuteranopia).
  Dark: `#4682CC #E75623 #009D82 #8B5DCE #CD4290` · Light: `#2766B1 #D24100 #00856E #7541B8 #BC3181`.
- **Emphasis** (the usual right answer): the series that matters in `--sc-chart-emphasis`, the rest
  in `--sc-chart-context` gray. Emphasis equals `--sc-brand-strong` in both modes, so text next to a
  chart wears `--sc-heading` (`.sc-figure`, tile values), never brand-strong — otherwise a figure
  reads as a series.
- **Sequential:** the cobalt ramp, light→dark (`--sc-chart-seq-1…5`) — for filled cells (heatmaps,
  choropleths) with a 2px surface gap between cells, never for lines or single marks; the ramp ends
  are 2.2–3:1 against the surface and rely on the gap. **Diverging:** cobalt ↔ spice around a neutral
  gray midpoint.
- **Status** colors never appear as a series.
- **Marks:** 2px lines, ≥8px markers with a 2px surface ring, bars ≤24px with 4px rounded data-ends,
  gridlines solid hairlines in `--sc-chart-grid`. One y-axis, always. Legend for ≥2 series; direct-label
  selectively (the end, the extreme). Text wears text tokens, never the series color. Sparklines are
  `.sc-spark`: context gray by default, `--emphasis` for the one that matters.
- **Interaction:** the host contract from §6 — `.sc-chart` with `role="group"`, `tabindex="0"` and an
  `aria-label`, the SVG `aria-hidden`, crosshair + one tooltip listing every series on line charts,
  per-mark tooltip on bars, keyboard arrows step through, a `.sc-details` table twin under every chart.

---

## 9. Marks & watermark

**The SpicyChicken mark — the chick — locked 2026-08-23.** Wine head with a file-fold corner,
teardrop flame comb in spice, cream eyes and diamond beak, on a 24-unit grid. The head is 9 units
tall; the date it carries is private.

Files in `assets/` (hosted URLs in §11):

| File | Use |
|---|---|
| `sc-mark-color-light.svg` | wine-700 body — white and cream surfaces |
| `sc-mark-color-dark.svg` | wine-500 body — ink and dark surfaces (mastheads) |
| `sc-mark-mono-cream.svg` / `sc-mark-mono-ink.svg` | watermarks and one-color uses |
| `sc-avatar-tile.svg` · `favicon.ico` · `apple-touch-icon.png` · `favicon-512.png` | avatar and favicon set (mark on the cream tile) |
| `sc-lockup-cream` / `sc-lockup-ink` (`.svg` + `.png`) | horizontal lockups — the wordmark set in the display face (Bricolage Grotesque 700) |

Rules: never recolor, outline, rotate, stretch, or add effects; clear space ≥ the flame's height on
all sides; the mark never merges with a project mark or sits inside another shape (the tile is the
one exception). **Watermark:** mono form, 20px (sized by `.sc-watermark img.sc-mark` — no inline
height) + wordmark in the display face at 700 12px, footer-right, 70% opacity, links to the
profile — identical on every page.

**There are no separate project marks.** The chick is the mark for every project — masthead,
favicon, avatar — with the project named in type beside it. (An experimental car mark for the
tracker was built and retired the same day; its generator survives in that repo's `docs/brand/` as
an archive.)

## 10. Accessibility

Measured, not assumed — the numbers are WCAG 2 contrast ratios from the current tokens.

- **Text:** body 14.1:1 dark / 10.9 light on the page (12.0 on white); muted 7.1 / 5.3 (5.8 on white); faint (`--sc-text-3`) 5.3
  on the surface in both modes, 4.6 on raised, 4.5 on the light brand fill — every text token is
  ≥ 4.5:1 wherever the system places it, including 14px placeholders, so there is no "labels-only"
  carve-out any more. Status labels are ≥ 4.5:1 on their own fills (dark danger 4.6, light good 4.50).
- **Links:** colour plus a visible cue. The underline is a 1px hairline at 60% of the accent
  (3.4:1 on the dark page, 2.8 on the light page, 2.9 on white) with a solid-accent fallback for browsers without
  `color-mix()`; hover goes solid. Link-vs-body colour contrast alone is 1.8:1, which is why the
  underline is mandatory — quiet links keep it in `--sc-border-strong`.
- **Focus** is always visible: 2px `--sc-focus` ring, 2px offset (4px on a chart host), spice in
  both modes and on ink.
- **Controls:** input and select edges are ≥ 3:1 against their surface (`--sc-border-control`);
  every target is ≥ 24px tall; disabled, invalid and read-only states are visible without colour alone.
- **Colour never carries meaning alone** — chips have words, deltas have ▲▼, status has a label,
  the pressed tab is filled and `aria-pressed`, the sort direction is `aria-sort`.
- **Generated glyphs are decoration:** the `//`, the details arrow and the sort arrows use the
  `content: "…" / ""` form, so screen readers get the label, not "slash slash".
- **Charts:** every chart has a keyboard-focusable host with a name, an `aria-hidden` SVG and a
  table twin; every tooltip value is reachable without hovering.
- **Modes:** `prefers-reduced-motion`, `prefers-color-scheme` and print are honoured; the toggle
  can override either direction. **Forced colours** (Windows High Contrast) keep the pressed toggle
  and tab as `Highlight`/`HighlightText`, underline the current nav item, keep legend keys, tooltip
  keys, chart series and sparkline marks coloured, and hand the select back its native arrow.
- `hidden` works on every component; `.sc-sr-only` and `.sc-skip` are complete.

---

## 11. Using it in a project

**Link a pinned version.** Tags are served by jsDelivr; pin the exact release and upgrade on purpose:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/spicyChicken59/design-system@v2.3.0/sc.css">
```

`@2` in place of `@v2.3.0` follows the newest 2.x tag (non-breaking upgrades, re-resolved by the CDN
within hours). The GitHub Pages URL `https://spicychicken59.github.io/design-system/sc.css` is
**latest** — it is what the style guide runs on and it may change on a major, so it is for
prototypes, not production. Vendoring (copy `sc.css` next to the page) is the third option; note the
version from its header when you refresh it.

**The head snippet** (`starter.html` carries the same head with a vendored `sc.css` link and the script inlined — swap in the pinned `<link>` and `<script>` below for production):

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
```

Order matters: `color-scheme` first so the browser paints the right default before CSS arrives, the
preconnects and font `<link>` before `sc.css` (the browser dedupes the sheet's own `@import`), and
the theme script in `<head>` so a saved choice applies before paint. The favicon is the chick, always.

**The theme script.** `sc-theme.js` sits next to `sc.css` (same pinned path, or the Pages path, or
inline its contents in a `<script>` — `starter.html` inlines it). It reads and writes the `sc-theme`
key, sets `data-theme` on `<html>`, keeps the toggle's `aria-pressed` in sync (including when other
code changes the attribute), and swaps a pinned-dark page to light for printing. One copy per page,
nothing else.

**Assets** — every file in `assets/`, at `https://spicychicken59.github.io/design-system/assets/<file>`
or `https://cdn.jsdelivr.net/gh/spicyChicken59/design-system@v2.3.0/assets/<file>`:

| File | Where it goes |
|---|---|
| `sc-mark-color-dark.svg` | `img.sc-mark` in the masthead (ink) and any dark surface |
| `sc-mark-color-light.svg` | `img.sc-mark` on white or cream surfaces (documents, README banners) |
| `sc-mark-mono-cream.svg` | the watermark in `.sc-foot`; one-colour uses on ink |
| `sc-mark-mono-ink.svg` | one-colour uses on light surfaces; print |
| `sc-avatar-tile.svg` | SVG favicon, profile avatars, social tiles |
| `favicon.ico` | `<link rel="icon">` (16/32/48) |
| `apple-touch-icon.png` | `<link rel="apple-touch-icon">` (180px) |
| `favicon-512.png` | PWA / manifest icon, large avatars |
| `sc-lockup-cream.svg` / `.png` | horizontal lockup on ink — README headers, covers |
| `sc-lockup-ink.svg` / `.png` | horizontal lockup on light — documents, decks |

**Fonts.** Google Fonts by default (the `@import` in `sc.css` plus the head `<link>`). To self-host:
vendor `sc.css`, delete its `@import` line, and add `@font-face` rules for the three families
(all OFL) pointing at your own woff2s — the `--sc-font-*` stacks already name them, so nothing else
changes.

**Caching.** Pages serves with `max-age=600`, so an unpinned link picks up any push to `main` within
ten minutes — including a breaking one. jsDelivr caches an exact tag immutably (a year in the browser),
which is the point of pinning; `@2` re-resolves on the CDN's own TTL.

**Building on it.**
1. Start from `starter.html`: rename the project in the masthead and `<title>`, keep the head snippet,
   the theme script and the footer watermark.
2. Build with `.sc-*` components. Page-specific CSS goes in the page and **only references semantic
   tokens** (`var(--sc-surface)`), never a primitive or a hex.
3. Charts use `--sc-chart-*` and the `.sc-chart` host contract. Run the validator if you add a slot.
4. Before shipping, open `styleguide.html` beside the page in both modes and run `CHECKLIST.md`: if
   something on the page has no equivalent in the style guide, it's probably a new component — fold it
   back into the system or remove it.

**Maintainers.** `npm run build` regenerates `tokens.json`, `styleguide.html` and `sc-theme.js` (edit `build/theme.js`, never `sc-theme.js`) from `sc.css` and
`build/`, then builds `react/` (run `npm run setup` once after cloning to install the wrappers' dev dependencies); `npm run check` regenerates into a temp dir and diffs against the
committed files, and verifies every `sc-*` class used by the style guide, starter and wrappers exists
in the sheet. Node ≥ 20, no Python.

**Versioning — one stream.** The release version is the `sc.css` header. A git tag `vX.Y.Z` names
the repo state that shipped that header, and `package.json`, `react/package.json`, the style guide's
version strings and the changelog entry in `AUDIT-AND-ROADMAP.md` all say the same number. Bump the
minor for new tokens/components, the major for renamed or removed ones (deprecations are announced
one minor ahead, with "removed in X.0" in the sheet), and the patch for repo-only changes (docs,
tooling, `react/`) — the header line still moves so tag, header, packages and changelog never
disagree. `v2.1.0` is the first tag.

---

## 12. Do / don't

**Do:** lead with an eyebrow in a `.sc-title`; one core takeaway per section; one spice action per
view; dark masthead and footer in both modes; the chick in the masthead and the watermark, on every
page; table twin under every chart; quiet links in tables; pin the stylesheet version.

**Don't:** add a hue or a gradient; color text with a chart, status or accent color (`.sc-text-accent`
is gone in 3.0 — "new" is a spice chip); use spice for large fills; give a project its own mark —
the chick is the one mark, in the masthead and the watermark, and the project is named in type; use
a display face for numbers; hide things with `style="display:none"` when `hidden` works; end with a
list of next steps instead of one; use an icon set without noting the substitution.
