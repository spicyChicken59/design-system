# SpicyChicken visual recipes

## Decision brief: make the opening useful

Open [the complete decision brief](templates/decision-brief.html), or copy recipe 36 in
[the visual library](visual-library.html#recipe-decision-brief). It combines existing
`.sc-cover`, `.sc-signal-matrix`, `.sc-photo-card.sc-dossier`, and `.sc-evidence__source`
patterns. Its static layout needs only the v2.10 stylesheet and original assets.
The optional `sc-matrix-nav.js` adds phone criterion buttons without a dependency or
product decision. The catalog snippet and full page share the authored
source in `build/decision-brief.mjs`; `npm run build` refreshes both.

The first screen should establish the product identity and begin answering the user's
decision. Put the signal matrix directly after a compact opening, visible on initial
load when there are records. Do not require a shortlist, hover, expanded disclosure,
or a scroll through a tall decorative hero to discover the comparison. On phones,
preserve readable content and natural page flow rather than forcing every row above
the fold. Photo dossiers and map/evidence links follow as the next level of detail.

Bind the product's existing, ordered records. This layout must not change selection,
ranking, filtering, scoring, or verdicts. Price, mileage, evidence and locations need
their real labels and units. A blue supplied-fact tile is not a green verdict; absence
is neutral **Not supplied** or the product's existing unknown wording, never a zero,
pass, fail or invented recommendation. If the product has no records, show its real
empty state instead of specimen candidates. Replace every illustrative value, date,
link and document title before publishing.

Use the existing photo frame for real sourced imagery, with useful alt text and the
original aspect-ratio reservation. Retain an honest missing-photo state if unavailable;
the original chick is a decorative placeholder, not a generated vehicle or substitute
product image. Map actions go to the existing map. No coordinates means no pin; no
known distance means no distance label. Keep maker signatures outside measured evidence.

The matrix remains a native table with a caption and row/column headers. The labeled
`.sc-table-scroll` region takes `tabindex="0"`, a visible horizontal-scroll hint and
`aria-describedby` pointing to that hint. Phone users can pan across criteria while
row identity stays sticky; keyboard users can focus the scroller and use arrow keys.
The example also opts into the criterion navigator described below. When the matrix
overflows, native buttons reveal the selected column without hiding any other data.
Keep the page itself within the viewport. Copying more than one brief requires unique
IDs and corresponding anchor/ARIA references. The full page uses an h1; the catalog
snippet starts at h3, so adjust heading levels to fit its destination.

The composition is static by default. Optional motion is restricted to one short
brand arrival or nonessential reveal using the shared motion runtime. Do not animate
prices, scores, row order or unknown states. Keep visible base content, respect pause,
reduced-motion and print modes, and never delay interaction. Review 320/390px phones,
768px tablets and a desktop width in both themes, then keyboard navigation and print.

The rendered regression gate is `node build/visual-check.mjs --browser --shots /tmp/sc-brief`.
It needs Playwright 1.56.1 and its Chromium installed separately. It renders the real
template at 390, 820 and 1280px in both themes, checks table/mark bounds, phone stacking,
keyboard scrolling, criterion commands, native anchors, reduced motion and a no-JavaScript
fallback, and saves screenshots.
External requests are stubbed for reproducibility, so these captures exercise the font
fallbacks; original local SVG assets are real. A missing browser is an explicit **SKIP**
with a nonzero exit, never a rendered pass. The ordinary offline gate remains static.

## Benchmark rail

Use `.sc-benchmark` when one exact number needs immediate context against an authored scale. The
visible `.sc-benchmark__label`, `__value`, three-part `__scale`, and `__note` carry the meaning.
The `aria-hidden` track adds spatial recognition without becoming a second, inaccessible answer.

Set `--sc-benchmark-position` as a percentage. Add `.sc-benchmark__reference` only when a real
reference exists, and set `--sc-benchmark-reference`. Add `.sc-benchmark__band` only for a sourced
or explicitly defined interval, with `--sc-benchmark-band-start` and `--sc-benchmark-band-end`.
Use `--sc-benchmark-tone` only when the product already knows the tone's meaning. Do not infer a
verdict from position, manufacture a target, or replace the written value with the rail.

```html
<figure class="sc-benchmark"
  style="--sc-benchmark-position:68%;--sc-benchmark-reference:55%;--sc-benchmark-band-start:45%;--sc-benchmark-band-end:65%">
  <figcaption class="sc-benchmark__head">
    <span class="sc-benchmark__label">evidence strength</span>
    <strong class="sc-benchmark__value">6.8 / 10</strong>
  </figcaption>
  <div class="sc-benchmark__track" aria-hidden="true">
    <span class="sc-benchmark__band"></span>
    <span class="sc-benchmark__reference"></span>
    <span class="sc-benchmark__point"></span>
  </div>
  <div class="sc-benchmark__scale" aria-hidden="true"><span>0</span><span>reference 5.5</span><span>10</span></div>
  <p class="sc-benchmark__note">Expected band 4.5–6.5 · above the 5.5 reference</p>
</figure>
```

## Signal matrix

Use `.sc-signal-matrix` on a native `.sc-table` when several candidates must be scanned against
the same criteria. Wrap it in a keyboard-focusable `.sc-table-scroll` region with a useful label.
The first column remains sticky on narrow screens. Use `.sc-signal-matrix--values` when the cells
contain ordinary figures rather than signal tiles.

Inside a matrix cell, `.sc-signal` pairs `.sc-signal__glyph` with `.sc-signal__label`. The written
label carries the meaning; the glyph is `aria-hidden`, and the tone only reinforces it. Available
tones are `--good`, `--caution`, `--blocked`, and `--info`; omit a tone for neutral. Never derive a
tone in CSS—apply it only from a decision or status the product already knows.

### Optional criterion navigator

On a phone, a sticky identity column can hide the existence of later criteria. Load
the optional helper and opt in on the existing scroller. Buttons take their names from
the native column headers, excluding the first identity column. `data-sc-label` on a
header supplies a shorter visible name; the full header remains available as its title.

```html
<script src="sc-matrix-nav.js" defer></script>
<p class="sc-hint" id="matrix-help">Jump to a criterion or swipe across. Keyboard: focus the table and use arrow keys.</p>
<div class="sc-table-scroll" data-sc-matrix-nav tabindex="0" role="region"
     aria-label="Candidate comparison" aria-describedby="matrix-help">
  <table class="sc-table sc-signal-matrix">
    <caption class="sc-sr-only">Candidates compared using supplied evidence.</caption>
    <thead><tr><th scope="col">Candidate</th><th scope="col">Value</th>
      <th scope="col" data-sc-label="History">Accident record</th></tr></thead>
    <tbody><!-- Your existing records and row headers --></tbody>
  </table>
</div>
```

The helper enhances single-row, unmerged column headers and the system's left-sticky
identity column. It inserts ordinary 44px command buttons immediately before the region,
visible only when the table overflows. A command brings a column beside the identity,
or as far as the table's natural scroll limit allows. Buttons are not tabs or toggles:
there is no selected state to become misleading after swiping. Native table semantics,
links, arrow-key scrolling, touch panning and printed content remain intact. The buttons
use existing theme/focus tokens, disappear in print and scroll instantly with reduced
motion. Without JavaScript the complete, labeled scrollable table remains available.

For a dynamically rendered table, attach after inserting its scroller. The returned
controller is idempotent; refresh after replacing headers in that same scroller, and
destroy before removing it. A `ResizeObserver` updates controls when the width changes,
fonts load or a closed disclosure opens. Set `data-sc-matrix-nav-label` on the scroller
only when the default “Jump to criterion in [region label]” needs different wording.

```js
const navigator = SCMatrixNav.attach(scroller);
// After replacing this scroller's table or column headers:
navigator.refresh();
// Before removing the scroller (for example, replacing a card list):
navigator.destroy();
```

Copy `sc-matrix-nav.js` from the same immutable source commit recorded in your design
provenance. `build/vendor.mjs` includes it in new checked-in snapshots; no release tag
is required. Its injected stylesheet is scoped to `[data-sc-matrix-controls]` and does
not modify `sc.css`, tokens, brand geometry or product values.

#### When the page already uses charts

`sc-charts.js` is a chart and native-table presentation bundle. It composes the original
chart primitives unchanged, the same `sc-matrix-nav.js` helper, and the generic lifecycle
adapter in `build/matrix-auto.js`. An existing page that loads this bundle can adopt
criterion navigation by updating its verified design snapshot alone.

The bundle discovers `.sc-table-scroll > table.sc-signal-matrix` and tables explicitly
marked on their region with `data-sc-matrix-nav`. It requires one unmerged row of native
column headers and excludes `.sc-signal-matrix--values` by default: those tables can be
transposed comparisons whose column names are records, not criteria. An authored
`data-sc-matrix-nav` attribute explicitly opts a values table in when its columns really
are criteria. Set `data-sc-matrix-nav="off"` on the table or its immediate region to
leave any particular matrix entirely native. The standalone helper remains opt-in.

Automatic controls use the full existing column headers unless `data-sc-label` is supplied;
there is no product-specific label mapping. A coalesced observer handles tables inserted
after data arrives, header replacement, disclosure moves and removed cards. It does not
inspect body values, reorder records, compute signals or register application handlers.
Changes to body cells or unrelated charts do not rebuild the buttons or move focus.
Loading both the bundle and the standalone helper does not create duplicate instances.

For a page-level lifecycle, `SC.matrixTables.destroy()` releases every managed controller
and disconnects the observer; `SC.matrixTables.init()` restarts it. `refresh()` reconciles
the document on demand, which is also the fallback when MutationObserver is unavailable.
Keep the native region label, `tabindex="0"` and written scroll instructions in the page.
Review the actual labels on phones: full authored names may wrap to a second button row.

Snapshot provenance records the complete composed `sc-charts.js`, so the original chart
source and optional table behavior are reviewed together. The bundle regression gate
checks chart exports in minimal-DOM environments and exercises asynchronous native-table
lifecycle behavior in Chromium, alongside the existing matrix accessibility checks.

## Printable decision brief

Choose **Printable deliverable** in `composition-studio.html` for a complete three-sheet US Letter
document. `.sc-sheet-stack` holds explicit `.sc-sheet` pages; each sheet has a `.sc-sheet__head`,
`.sc-sheet__body`, and `.sc-sheet__foot`, with `.sc-sheet__folio` for the page label. Use
`.sc-sheet--cover` once, `.sc-sheet--dense` for evidence-heavy pages,
`.sc-print-keep` for a unit that must stay together, and
`.sc-print-section` only where a deliberate new printed page is required. On phones the sheets
become ordinary responsive reading surfaces. In print they resolve to exact 8.5 × 11 inch pages.

For an existing web report, add `.sc-print-report` to its main region and include compact
`.sc-print-head` and `.sc-print-foot` elements. They are invisible on screen and repeat in print.
Use the original mark asset; never rebuild or recolor it for a document.

Start in [the brand studio](brand-studio.html): complete compositions, downloadable
SVG patterns, and the actual templates at 320, 390, 768, and 1120px.

## The visual point of view

The chick is the maker's signature. Project names remain typography beside that
same mark. Preserve the existing SVG paths, proportions, colour forms, and clear
space. Never redraw, rotate, distort, shadow, or crop the chick.

Cobalt structures the information. Spice identifies the next action. Wine belongs
to brand moments. Warm paper is an editorial surface. The original UI palettes,
chart series, controls, and footer watermark remain available.

Give the page rhythm: one strong opener → a quieter information area → evidence →
one next action. A brand surface earns its space at an entry point, chapter break,
or report close. Avoid a cover-sized logo in every card.

## Choose the composition

| Deliverable | Copyable example | Visual decisions |
|---|---|---|
| Website or collection | [Website](templates/landing.html) | Wine opener, full mono chick, open collection, one spice CTA |
| Dashboard or comparison | [Dashboard](templates/dashboard.html) | Compact ink opener, shared metrics, open chapters, chart caption signature |
| Candidate decision | [Decision brief](templates/decision-brief.html) | Compact brand cover, immediately visible signal matrix, photo dossiers, evidence/map links and source footer |
| Screener or evidence review | [Screener](templates/screener.html) | Four related metrics, deliberate empty state, supporting fact rows |
| Report or one-pager | [Report](templates/report.html) | Warm cover, numbered chapters, restrained evidence, source/signature footer |

All example figures are illustrative. Replace content and labels together. Copy
the HTML from `templates/`, then adjust relative CSS, script, and asset paths for
the destination. Copy the assets too, or use a published pinned release. Replace
specimen links back to the studio with the destination's real actions.

## The reusable pieces

| Purpose | HTML | React |
|---|---|---|
| Branded opening | `.sc-cover` + `.sc-on-ink`; optional `--wine`, `--compact`; use `--paper` without ink scope | `Cover` (`tone`, `compact`, `title`, `description`, `eyebrow`, `meta`, `actions`) |
| Repeating mark | `.sc-brand-panel` + `__pattern` + `__label`; `--wine` / `--paper` | Compose HTML with a local pattern SVG |
| Reserved decorative watermark | `.sc-ghost`, mono image pair; `--ink` / `--paper` for fixed surfaces | `Ghost` |
| Contextual maker credit | `.sc-signature`, optional `--small` | `Signature` |
| Theme-adaptive colour mark | `.sc-adaptive-mark` with `__dark` and `__light` images | `AdaptiveMark` |
| Editorial section break | `.sc-chapter` + `__index` + `__body` + optional `__meta` | `Chapter` |
| Related figures | `.sc-stat-strip` (`--2`, `--4`), `.sc-stat`; one `--lead` | `StatStrip` + `Stat` |
| Supporting facts | `.sc-facts` with `div > dt + dd` | `Facts` |
| Chart attribution | `.sc-chart-caption`, below the plot | `figcaption` + `Signature small` |
| Deliberate empty state | `.sc-empty.sc-empty--brand` | `BrandedEmpty` |
| Editorial report | `.sc-report` + `__body` + `__footer` | Compose HTML with `Cover tone="paper"` |

`Cover` defaults to h1; set `headingLevel={2}` for a section cover. `Chapter`
supports h2/h3. `StatStrip` is a definition list: place `Stat` inside it.

```tsx
<Cover tone="wine" title="A little heat. A lot of clarity."
  eyebrow="the SpicyChicken collection"
  description="Useful tools for a clearer decision." />
<Chapter index="01" title="The view at a glance" />
<StatStrip columns={2}>
  <Stat label="lowest asking" value="$42,600" note="Illustrative · before fees" lead />
  <Stat label="compared" value="74" note="Example listings" />
</StatStrip>
```

## Brand intensity

| Treatment | Placement | Limit |
|---|---|---|
| Full colour chick | Masthead; one cover art column | Complete mark and clear space |
| Cream chick on wine | Collection cover; presentation opener | Brand framing, never a status or chart series |
| Mono repeat | Cover back, section break, dedicated panel | Text on opaque backing or outside the repeat |
| Ghost at 5.5% | Empty margin or dedicated blank panel | Decorative only; no content or plot beneath |
| Small signature | Chart caption or report footer | Legible text; no competing CTA |
| Existing footer watermark | Bottom of a website | Preserve the existing signature and link |

Patterns are standalone 1600×900 SVGs in `assets/sc-pattern-{ink,wine,paper}.svg`.
They contain the original mono paths, uniformly scaled and translated. They need
no fonts, remote images, or runtime. The existing reserved asset licence applies.

## Layout and readability

- Use one metric strip for related facts; avoid cards inside cards just to create
  hierarchy. Values stay in heading ink; direction remains in words or arrows.
- Use body type for explanations. Mono is for short labels and metadata.
- Keep the mark away from evidence. Place a chart signature below the plot and
  retain the accessible data table.
- Covers wrap with available component space. Compact covers shorten title and
  mark; phones stack metric strips rather than shrinking type.
- Example chart axes use HTML labels outside the scalable SVG to keep phone text
  readable. Its table contains the same illustrative values.
- Automatic mark pairs follow the theme. Paper scopes local light colours; ink
  and wine scope on-ink colours. Decorative marks have empty alt text.
- Print removes preview controls and decorative panels, opens the report body,
  and retains cover colour. Enable browser background graphics for faithful covers.
- Motion is opt-in: use a short mark arrival, section reveal, or card feedback. Keep the logo still during reading. Follow `MOTION.md`; reduced motion always wins.

## Design-only adoption

SpicyCar and SpicyStock currently pin the existing release. Adopt these visual
pieces independently, then bind existing content. A design-system branch does not
restyle pinned websites. Purchase, screening, scoring, data, and backend behaviour
are outside this visual update.

## A visual library you can build from

Open `visual-library.html` to filter real compositions by identity, layout, data,
motion, and states. Every recipe shows its live markup and has a copy action.
Choose the content structure first, then apply a surface and one motion treatment.
The snippet is the rendered example; it does not depend on the catalog stylesheet.

Use a bento for unequal content importance, an editorial split for a narrative
with a reserved visual, a timeline for dated events, and a ranking for an ordered
comparison. Use a quote with an actual attribution. Use a progress bar only when
its value is known, and a loading indicator only while work is pending.

Avoid stacking effects. One arrival for the opening mark and quiet section
reveals are enough for a full page. Tables, prices, scores and chart labels stay
readable throughout. The motion library never invents or counts up a value.


## Compose a complete page

`composition-studio.html` configures the four actual templates. Choose a composition,
cover surface, original-mark treatment, optional brand arrival and canvas width.
An optional headline is inserted as text. Copy or download returns a complete HTML
document with dependencies in a sibling `design-system/` folder; preview-only files
and private example styles are excluded. The content stays explicitly illustrative.

Use one committed snapshot from `build/vendor.mjs`. Copy all assets together, then
replace the sample content, project links, metadata and document title for the real
page. Preview width affects only the studio canvas, never the exported page.

| Pattern | Use | Contract |
|---|---|---|
| Brand stage | A mark beside an opener or within a collection tile | `.sc-brand-stage--orbit` or `--ledger`; original SVG and reserved clear space. |
| Evidence | A finding, chart/table and source | `.sc-evidence` with `__plot` and `__source`; frame outside the chart's measured host. |
| Insight | One analytical sentence | `.sc-insight`; authored content determines certainty, never styling. |
| Dossier | A car, project, collection object or research record | Distinct `__title`, `__meta`, `__evidence`, `__actions` inside `__body`. |
| Research table | Measures with real explanations | `.sc-table--research`; preserve column order, numeric alignment and a labeled scroller. |
| Disclosure | Optional supporting detail | Native `.sc-details.sc-disclosure`; optional `__body` opening fade respects reduced motion and pause. |
| Inline empty state | A missing image/chart beside useful evidence | `.sc-empty--inline`; retain the complete reason, never a fabricated zero. |
| Reading rail | A long report or methodology | `.sc-reading` with `__body` and `.sc-chapter-nav--rail`; native anchors always work. |

## Chapter location

Load `sc-reading.js` with `defer` and use existing same-page links:

```html
<nav class="sc-chapter-nav" data-sc-reading aria-label="On this page">
  <a href="#finding">The finding</a>
  <a href="#evidence">The evidence</a>
</nav>
```

The optional script sets `aria-current="location"` on the nearest available
chapter. It never intercepts a click, changes the URL, scrolls, or moves focus.
Hidden sections are excluded. Call `SC.reading.refresh()` after an asynchronous
render or a visibility change. `init(root?)`, `refresh(root?)`, and `destroy(root?)`
are idempotent; teardown restores authored `aria-current` values and removes the
shared scroll/resize listeners when no navigators remain. React applications that
mount a new navigator after initial loading should refresh it in their effect and
destroy that root in cleanup.

The rail wraps on phones and is removed from print. It operates independently of
motion, so pausing decorative animation never disables navigation.
