# Audit and roadmap — from a corporate BI template to SpicyChicken

*August 2026. Mohammed Tahir Madni / SpicyChicken.*

## 1. What the template got right (kept)

The source system is a well-made corporate standard. Six things in it are worth keeping as the spine
of a personal system, and v1.0 keeps all six:

- **A real token layer.** Colors, type, spacing, radii and motion were already named variables
  with stated uses — most "design systems" people attach to AI tools are mood boards.
- **The eyebrow as a signature.** A mono label above every heading is cheap, distinctive, and
  survives every medium (HTML, Markdown, slides, email). Its form changed in 1.2.0 — lowercase with a
  CSS-drawn `//` instead of uppercase and tracked — but the idea is the template's.
- **Restraint rules that are checkable.** Flat fills, hairline borders, modest radii, no new hues,
  no decorative gradients, no icon library. Each is a yes/no test at review time.
- **Voice and casing rules.** Sentence case, plain-spoken, one next action. These shape content, not
  just chrome, which is what makes a portfolio feel coherent.
- **A small component vocabulary** — card, callout, chip, eyebrow, data table — rather than a big one.
- **Plain-HTML equivalents.** The note that every component must be reproducible with inline styles
  (for email, for exports) is what makes a system survive outside its own CSS. `PLAIN-HTML.md` holds them.

## 2. What was template-bound (removed or replaced)

| Template element | Problem for a personal system | v1.0 |
|---|---|---|
| Corporate brand-kit greens and a "system leads / company supports" hierarchy | Someone else's brand and hierarchy | Cobalt + spice; **project leads / SpicyChicken endorses / person authors** |
| Green-tinted neutrals (`#F5F4F0`, `#cdd8d2`, `#5B6770`) | Leaked green into every surface | Re-tinted cool (`#F2F4F8`, `#CFD6DE`, `#5D6671`) |
| Light blue "interactivity only" | Invisible once the palette is blue | Spice (`#FE825C` dark / `#AC3400` light since 2.1) — the one hot accent |
| Provenance chips `[K] [B] [A] [Q] [W]` | Meaningful only inside the source's course material | Generic chip tones (brand, neutral, spice, good, warn, danger, info); the letters can still ride on them in documents |
| `.ana` / `.ws` course callouts, Hinglish digest, SQL readout, ASCII blueprint | Content-specific to one course | Dropped. `core`, `ink`, `warning` kept; `spice` added for the one next action |
| Namespaced React bundle, `_ds/…` paths, Design-Component `<x-import>` | Tooling that doesn't exist outside that workspace | One CSS file, zero build for consumers. Tokens also exported as `tokens.json`. React kept as optional thin wrappers in `react/` (2.1) that emit the same `sc-*` markup — the CSS stays the source of truth |
| Print-bound "Deliverable" paginator template | Valuable, but a separate artifact with its own script | Deferred to the roadmap (§4) |
| Light-only; dark used only for covers | Owner's preference is dark-first | Dark default, light first-class, both validated |
| Embedded corporate logos (Appendix A) | Not yours | Removed. Mark slots reserved with construction constraints (§9 of the spec) |
| No chart palette; "no new hues" applied to data too | Every dashboard would have reinvented colors | A validated 5-slot categorical set, sequential ramp, emphasis pair, per mode |
| Two slightly different values for the same token across the spec and the CSS (`#D9E8E2` vs `#e3ede7`, `#5B6770` vs `#6b7d76`, `#A1CEAD` vs `#4a8f63`) | Drift — the spec and the CSS had already diverged | One source: `sc.css`; `tokens.json` and the style guide are generated from it and `npm run check` proves it |

## 3. How the colors were derived (so it can be repeated)

Every green was converted to OKLCH, its **lightness kept** on the steps that carry text (300, 700),
hue rotated to 255° (cobalt), and converted back with gamut mapping. That preserves every contrast
pair the template had. Two deliberate deviations: the two darkest steps (900 and 950) were moved a
few L points and had their chroma raised (a low-chroma blue reads as gray where a low-chroma green
still reads green), and neutrals were re-tinted to the same hue so no surface leans green. The chart
slots were then chosen inside the `dataviz` lightness band for each mode and verified with its
validator on the adjacent pairlist (colorblind separation ≥ 8 ΔE, normal-vision ≥ 15, contrast
≥ 3:1 against the card surface); the all-pairs run passes for slots 1–3, which is why all-pairs forms
are limited to those. The same procedure produces a new accent or mode in minutes: pick L and C,
rotate hue, validate. In 2.1 the text and accent tokens were re-measured against every surface they
sit on (not just the page) and moved where they fell short; the numbers are in the `sc.css` comments
and `DESIGN_SYSTEM.md` §10.

## 4. Roadmap — in order

1. **Mark.** ✅ Done (v1.1.0, simplified to one mark in v1.2.0): the chick is the only mark, in the
   masthead, the favicon, the avatar and the watermark; projects are named in type beside it. No
   per-project marks.
2. **Own repository, tags, pinning.** ✅ Done (v2.1.0 is the first tag): `spicyChicken59/design-system`,
   GitHub Pages from the root (`index.html` opens the style guide) as the *latest* channel; releases
   are tagged `vX.Y.Z` and projects pin one through jsDelivr
   (`https://cdn.jsdelivr.net/gh/spicyChicken59/design-system@v2.1.0/sc.css`, or `@2`). The changelog
   stays in §5 below and is part of every release.
3. **Type decision.** ✅ Done in v1.2: Bricolage Grotesque (display) / Instrument Sans (body) /
   IBM Plex Mono (labels), chosen to break the visual tie to the workplace template along with the
   lowercase `//` eyebrow, folded callouts, squared chips, and open table headers.
4. **Node toolchain.** ✅ Done (v2.1.0): `build/gen-tokens.mjs` and `build/assemble.mjs` replace the
   Python generators, a root `package.json` gives `npm run build` / `check` / `build:react`, and
   `sc-theme.js` ships from `build/theme.js`; `build/check.mjs` (with `contrast.mjs`) is the gate, run by `.github/workflows/check.yml` on every push; `.gitattributes` pins LF. The Python originals are deleted.
5. **Component growth.** ✅ First batch from SpicyCar (v2.1.0): title block, chart host, sparkline,
   frame, media row and its card twin, empty state, figure/note, quiet link, flat doc and TOC — every
   one promoted from page CSS the tracker had to write. Growth stays on demand: a second consumer
   earns the next batch (likely a timeline/strip for built-vs-planned, a dual-audience pair, a meter).
   Add each to the style guide the day it ships.
6. **Figma — on demand.** Figma (free tier) is the right tool for exploring layouts; it is not needed
   to *hold* the system. Import `tokens.json` with a variables plugin (Tokens Studio or "Variables
   Import/Export") so Figma colors match the CSS exactly, and treat the CSS as the source of truth: a
   change goes CSS → `tokens.json` → Figma, never the reverse.
7. **README / GitHub profile treatment.** A profile README and a repo README template in the same
   voice (eyebrow line, one-sentence dek, a "what you get" table, one next action). Uniformity starts
   on the profile page, before anyone clicks through.
8. **Document template.** Bring back the print-bound "Deliverable" template on SpicyChicken tokens —
   US Letter, running header, numbered section rules — as `deliverable.html`, for reports and one-pagers.
9. **Slide template.** Six-slide arc (cover on `--sc-ink`, problem, summary, architecture, roadmap,
   ask) as standalone 1280×720 HTML pages.
10. **License.** ✅ Done (v2.1.0): MIT for the CSS, tooling and wrappers; the chick and everything in `assets/` stay all rights reserved (`LICENSE`).
11. **Keep the pre-ship check honest.** `CHECKLIST.md` ships with every release; re-read it and
    add a line whenever a real mistake slips through (2.1 added three).

## 5. Changelog

One version stream from 2.1.0: the tag, the `sc.css` header, both `package.json` files, the style
guide's version strings and this list say the same number. Repo-only changes bump the patch.

- **2.3.0 (2026-08-29)** — The second fold-back from SpicyCar: the visualisations.
  *New components (section 4c):* `.sc-map` — a pan/zoom point map with its button
  stack, scroll-modifier hint, geography paint, radius ring and anchor; `.sc-dot`
  — one datum as a point, shared by the map and the scatter, with `.is-filled` /
  `.is-hollow` as a second channel beside hue and the `pointer-events` fix that
  makes a hollow circle hit-test on its whole disc; `.sc-dot-ring` for calling one
  out; `.sc-scatter__line` / `__line-hit` / `__series-label`; `.sc-legend__chip`,
  a legend key that is also a control, in two behaviours — the default hides its
  series, `--select` selects it and stays legible when pressed off; `.sc-photo-card`
  and the `.sc-frame--photo` blur-in loader with `.sc-frame__img` / `.sc-frame__mark`;
  `.sc-filter-bar`; `.sc-section--support` / `--chapter` for two levels of heading
  weight; `.sc-show-more`, `.sc-with-mark`, `.sc-lockup`, `.sc-chart__hit`.
  *Added to existing components:* `.sc-eyebrow--case` (joins `.sc-chip--case` and
  `.sc-tab--case`); `.sc-tooltip--tap`, `__img`, `__link`, `__dash` — four names the
  consumer had already squatted in this sheet's namespace; and `.sc-table-scroll`
  gains a sticky first column with a faded clipped edge, so a sideways-scrolling
  table stops hiding the column that names each row.
  *New tokens:* `--sc-scrim`, `--sc-on-scrim`, `--sc-on-scrim-2` — the one context
  where the system paints over an arbitrary photograph. Deliberately identical in
  both modes: a photograph is the same picture either way.
  *Fixes:* the masthead controls were 24-27px against the 44px touch guideline —
  a defect in this sheet that every consumer inherited, now fixed here rather than
  patched downstream. Map buttons take 44px under a coarse pointer. The contrast
  gate stops scoring `.sc-eyebrow::before`, deleted back in 2.2.0, whose absent
  opacity it had been silently reading as 1 — six of the 154 "passing" pairs were
  measuring nothing, so the real count is 148. The gate also gained: two-part
  version strings in the current-state docs are rejected (that is how this file's
  companion drifted a whole minor behind), the release tag must actually exist on
  origin, and the counts the style guide's cover prints are checked against
  tokens.json and section 4 — they read 123 tokens and 20 component blocks against
  a real 183 and 54; and every static sparkline in the guide must be exactly what
  `build/charts.js` draws for the values it carries, which is how the guide came
  to hold a third set of geometry constants disagreeing with both live copies.
  *The system starts shipping behaviour.* `sc-charts.js` — the first file here
  that does something rather than describes something. It carries only the
  primitives that were provably duplicated and provably divergent: `SC.ticks`,
  `SC.spreadLabels`, `SC.spark` (+ the pure `sparkPoints`/`sparkPath` the React
  twin shares), `SC.tooltip`, `SC.tableTwin`, `SC.tone`/`toneRef`, `SC.el`/`svg`.
  Generated from `build/charts.js` under the same version header as
  `sc-theme.js`, and optional: the sheet still styles a chart you draw yourself.
  Comparing the three existing copies found four real bugs, all fixed here.
  `ticks` on a flat domain divided by a zero step and looped forever. The
  sparkline filtered only null/undefined, so one `NaN` or one stringified price
  emptied the path and put the end dot at `cx="NaN"`. The end-label solver
  clamped only the bottom edge, so a crowded chart pushed labels off the top and
  then piled them at the floor. And the end dot was placed from unrounded
  coordinates against a path rounded to 1dp, so it sat up to 0.05px off the line.

  *The tone channel.* `.sc-chart__series` and `.sc-spark` now take their colour
  and weight through two inherited custom properties, `--sc-tone` and
  `--sc-weight`, instead of their own `stroke`/`fill`. This is the mechanism that
  makes "a series carries a tone slot, never a colour" actually work. A
  presentation attribute cannot carry a per-series colour — these very rules
  outrank it, silently — and an inline `stroke:` would take the property away
  from the sheet for good. A channel does neither, and because the value stays a
  `var()` reference it re-resolves on a theme flip with no JavaScript at all.
  Purely additive: an inline `stroke:` still wins, so nothing downstream breaks.

  *Behaviour change:* a `.sc-table-scroll` that previously scrolled its first
  column away now pins it. Consumers wanting the old behaviour override
  `position: static` on the first-child cells.

- **2.2.0 (2026-08-26)** — The readability release, folded back from SpicyCar's dashboard pass.
  *Consumer-visible:* the `// ` prefix that `.sc-eyebrow::before` and `.sc-callout__label::before`
  injected is gone — the label is the label, and a page that wants slashes writes them in its
  content. The smallest mono roles move up to legible sizes: meta rows and tile subtitles
  11 → 12.5px, chips 10.5 → 11px, field and checkbox labels 10.5 → 11.5px, chart legend
  12 → 12.5px, media codes and the empty-frame label 10.5 → 11px, media subtitles 12 → 12.5px.
  `.sc-note` — the workhorse line under prices, media rows and table cells — moves from 10.5px
  mono to 12px body face. The mono stays where it is a signature: eyebrows, masthead, footer,
  tooltips, codes. No tokens added, renamed or removed.
- **2.1.0 (2026-08-24)** — The first production pass: everything the SpicyCar tracker and a
  132-finding audit turned up. First git tag; consumers pin it through jsDelivr.
  *Consumer-visible fixes:* `[hidden]` now works on every component; light-mode links, focus ring
  and primary button move to spice-700 (were failing AA on the page background); `--sc-text-3` is
  ≥ 4.5:1 everywhere; dark danger is readable on its fill; card-head headings are h3-sized without
  inline styles; tabs are a segmented control (`aria-pressed`); sorting is `aria-sort` driven with a
  keyboard-reachable button; the sticky table header is real and opt-in.
  - *Tokens.* Light `--sc-accent` spice-700, `--sc-accent-hover` spice-800, `--sc-focus` spice-700
    (light `--sc-chart-2` stays `#D24100`). `--sc-text-3` raised to `#8090A4` dark / `#646C77` light.
    Dark `--sc-danger` `#EE5A66`. New `--sc-border-control` (`#5B6E86` / gray-500) for input and
    select edges. New on-ink tokens declared once: `--sc-ink-line`, `--sc-ink-line-strong`,
    `--sc-ink-fill`, `--sc-on-ink-3`, `--sc-shadow-pop` — the raw `rgba()` values in masthead,
    footer, toggle and tooltip now reference them. Mono stack gains Consolas and Liberation Mono.
  - *Base.* `[hidden] { display: none !important }`. Links carry a 60% accent underline with a solid
    fallback; `a:where(:hover)` so any single-class component wins; `.sc-brand`, `a.sc-card`,
    `a.sc-tile`, ghost buttons and the footer watermark no longer inherit link colour. The on-ink
    context (2c): `.sc-masthead`, `.sc-foot`, `.sc-tooltip`, `.sc-callout--ink` and `.sc-on-ink`
    re-scope the text, brand, accent, on-accent, focus, raised, hover, border and surface tokens plus the fill/status set, so filled controls stay readable inside ink in light mode. CSS-drawn glyphs
    (`//`, `→`, sort arrows) hidden from assistive tech with the alt-text form. `.sc-sr-only`
    completed; `.sc-skip` added. Print: the light block also matches `print`; `pre`, ink callouts and
    tooltips keep their fill. Forced-colors block for Windows High Contrast. Eyebrow `//` opacity
    .55 → .65 (≥ 3:1 in light). 24px minimum targets on summary, toggle, check and field.
  - *Components changed.* Card heads size their h2/h3 at `--sc-h3`; card, tile, notice and doc lose
    the last child's bottom margin. Table: sticky moves to `.sc-table-scroll--tall`, raised cards get a
    matching header fill, `.sc-num` no longer wraps, `th[aria-sort]` draws ↑/↓, `.sc-table__sort`
    resets a button inside a th (`.is-sorted` deprecated). Tabs: `.sc-tab[aria-pressed="true"]`
    (`aria-selected` still styled). Inputs: `--sc-border-control`, `:disabled`, `[aria-invalid]`,
    `:read-only`; `label.sc-check` carries the field-label typography on its own; pressed
    secondary/ghost buttons shift to `--sc-hover` (no transforms, no filters);
    `a.sc-btn[aria-disabled]` blocks the click. Chips: `--info`, `--case`; `.sc-text-info` utility;
    `.sc-text-accent` deprecated (removed in 3.0). `.sc-brand__mark` becomes the brand-line letter
    tile fallback. Mobile: the 9px/1.5px masthead rule deleted, tables in a wrap bleed to the wrap
    edge, the title block tightens to 24px. Tooltip hides with `visibility` and fades on `.is-on`.
    Callout gains `__figure`.
  - *Components added (4b).* `.sc-title`; `.sc-chart` host with `__label` `__grid` `__crosshair`
    `__series` (`--emphasis` `--context`) `__marker`; `.sc-spark` (`--emphasis`) and
    `.sc-tile__spark`; `.sc-frame` (`--empty` `--lg`, `--sc-frame-w/h`); `.sc-media` with `__body`
    `__title` `__sub` `__code` `__links` and the `--card` twin (`__aside` `__foot`); `.sc-empty` and
    `tr.sc-empty`; `.sc-figure` and `.sc-note`; `.sc-link--quiet`; `.sc-doc--flat`, doc h3/measure
    rhythm and `.sc-toc`; utilities `.sc-nowrap` `.sc-truncate` `.sc-case`.
  - *Tooling.* Node-only: `build/gen-tokens.mjs`, `build/assemble.mjs`, `build/color.mjs` replace
    the Python scripts (deleted); root `package.json` with `setup` / `build` / `check` / `build:react`; `build/check.mjs` + `contrast.mjs` gate (one version stream, fresh generated files, LF, page hygiene, class vocabulary, 134 contrast pairs) and a GitHub Actions workflow; `.gitattributes` (LF); `sc-theme.js`
    published from `build/theme.js` with the `beforeprint`/`afterprint` swap for pinned-dark pages;
    `starter.html` head gains the `color-scheme` meta, font preconnects and the favicon trio.
    `react/` wrappers updated to the 2.1 vocabulary and the new components (Title, Chart, Spark,
    Frame, Media, Empty, Figure/Note, QuietLink, SkipLink, Sep, Toc).
  - *Docs.* `DESIGN_SYSTEM.md` v2.1: measured contrast numbers, responsive contract, targets, print,
    on-ink context, the full §6 vocabulary, the consumption guide in §11 (pinned link, assets, head
    snippet, theme script, fonts, caching, versioning), the masthead contradiction fixed. New
    `PLAIN-HTML.md`. README, checklist, conventions and sync notes rewritten to match.
  - *Note on 2.0.1.* The 2.0.1 line below was a repo-only release (this document, `index.html`, the
    README) that left `sc.css` at 2.0.0 — the two version streams this entry retires. Its changes are
    on `main` and are included in the 2.1.0 tag.
- **2.0.1 (2026-08-23)** — Public-release pass for the standalone repository: workplace references
  in this document genericized; `index.html` added so GitHub Pages opens the style guide; README
  rewritten around linking the hosted stylesheet. No stylesheet changes — `sc.css` stayed v2.0.0.
- **2.0.0 (2026-08-23)** — Rebrand: the brand is simply **SpicyChicken**; the number survives only
  in the GitHub handle (`github.com/spicyChicken59`). Breaking renames everywhere the old prefix
  appeared: `sc.css` (was the numbered file), `assets/sc-mark-*` / `sc-avatar-tile`, the theme
  storage key `sc-theme`, the tokens `$extensions.sc` key. Lockups regenerated as vector SVG + PNG
  with the wordmark reset in Bricolage Grotesque (the old PNGs carried the number in type).
  Consumers must update their `<link>` and asset paths; saved theme preferences reset once.
- **1.2.0 (2026-08-23)** — De-templated from the corporate source and simplified to one mark. New type
  stack: Bricolage Grotesque / Instrument Sans / IBM Plex Mono (retiring the template's trio). The
  signature changes from ALL-CAPS tracked eyebrows to lowercase mono with a `//` prefix; callouts
  trade the left border for the mark's file-fold corner; chips and tabs square off; table headers
  open up (lowercase mono over a cobalt rule, no filled bar). The chick becomes the mark for every
  project — the car mark is retired, its generator archived in the tracker's `docs/brand/`.
- **1.1.1 (2026-08-23)** — First project mark: the Auto Market Tracker car, generated on the family
  grid (cobalt body, ping comb, file-fold), four forms + tile in the tracker's `docs/brand/`; swapped
  into that dashboard's masthead and favicon; family figure added to the style guide.
- **1.1.0 (2026-08-23)** — The SpicyChicken mark locked and shipped: `assets/` with four SVG forms
  (traced from the finalized Claude Design renders), avatar tile, lockup PNGs, favicon set; wine
  primitives (`--sc-wine-300/500/700/900`); `img.sc-mark` classes; the mark wired into the style
  guide masthead and every watermark; spec §9 rewritten from "reserved" to shipped.
- **1.0.0 (2026-08-23)** — First SpicyChicken release. Cobalt remap of the source template's greens at identical
  lightness; spice accent; dark default + light mode; cool neutrals; status set; validated chart
  palette; 18 components; `tokens.json`; `starter.html`; `styleguide.html`; `CHECKLIST.md`. Logos and marks reserved.
