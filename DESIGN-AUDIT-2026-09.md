# SpicyChicken design audit · 6 September 2026

Scope: visual design only. Reviewed the design-system source and rendered style
guide, [SpicyCar](https://spicychicken59.github.io/SpicyCar/), and
[SpicyStock](https://spicychicken59.github.io/SpicyStock/). Findings concern layout
and identity, not business logic or the validity of product data.

The shared cobalt/spice palette, three type families, unchanged chick, consistent
masthead, restrained chart styling, and footer signature already form a strong
family. The baseline repository gate passed, including 148 contrast pairs.

| Priority | Observed gap | Design response |
|---|---|---|
| High | Brand expression is concentrated in small header and footer marks. | Full covers with reserved art columns, contextual signatures, ink/wine/paper treatments. |
| High | The guide opens primarily as a technical palette reference. | Brand-led opener, visual studio, and complete page specimens. |
| High | SpicyCar nests bordered cards and long compact supporting text. | Shared metric strip, fact rows, open chapter headings, clearer dashboard hierarchy. |
| Medium | SpicyStock's empty areas are explanatory but visually generic. | Branded empty state and reserved-space watermark, demonstrated in a screener specimen. |
| Medium | Wine is documented but lacks a reusable brand surface. | Wine cover and panel; it remains excluded from statuses and chart series. |
| Medium | No ready-to-use mark textures for reports or section breaks. | Three self-contained SVG patterns made from original mono paths. |
| Medium | Document primitives do not show a complete editorial report. | Warm paper cover, numbered chapters, open body, source/signature footer. |
| Medium | A watermark over evidence can obscure the chart. | Caption/source signature outside the plot; ghosts only in blank space. |
| Medium | A portable fact-row design remains local to SpicyStock. | `.sc-facts` and `Facts`, carrying only the visual pattern. |
| Medium | New CSS needs discoverable examples to be reusable. | Studio, guide samples, recipes, React wrappers/previews, bundled skill guidance. |

An independent source review identified paper-cover colour inheritance, ghost
visibility in dark mode, narrow-container cover layout, signature touch sizing,
and automatic mark selection. These were corrected before the final visual pass.

Design restraint: no new product features, data logic, hue families, animated logos,
glass effects, or decorative chart overlays. Original logo asset files and existing
consumer layout rules remain unchanged. Additions are opt-in.

Verification results are recorded in the pull request. `npm run build` regenerates
assets, examples, tokens, guide, skill bundle, and React output. `npm run check`
checks consistency and visual invariants. The studio previews the actual template
files at phone, tablet, and desktop widths.

## Production integration pass

The second pass expands composition into a searchable library of 24 live recipes,
with exact markup, category/search controls, motion replay/pause and copy fallback.
Nine more React wrappers reproduce the shared semantic markup.

SpicyCar now uses a compact wine cover, the original cream mark, connected metrics,
readable decision evidence and a paper methodology page. SpicyStock uses an ink
cover with a dedicated wine brand panel, recorded metrics and quieter research
sections. Business logic and source datasets remain unchanged.

Review fixes include container-safe shared grid minimums at 320px, cream marks on
wine, comparison-note alignment, and mobile caption spacing. Motion adds short
entrances and interaction feedback, preserves visible base content, respects
reduced motion/focus/print, and limits loading animations to three cycles.

The build and local design gate pass 206 token / 87 component counts, 277 discoverable
classes, 196 contrast pairs, 14 motion behavior scenarios, and original mark
geometry. Browser review covers actual product pages and representative phone,
tablet and desktop layouts; catalog search, replay, pause and copy fallback are
exercised. SpicyCar's 342 existing Python tests pass. Consumer CI remains the gate
for the complete existing dashboard regression suites.

Consumers use an immutable design asset snapshot with source commit and hashes.
A standalone release tag is a separate publication; it remains pending.

## Composition and reading pass · v2.7.0

The next loop adds a working composition studio: four complete page structures,
three cover surfaces, two original-mark art treatments, optional brand arrival,
phone/tablet/desktop preview widths, and complete HTML copy/download. Exported
pages use only shared components and a verified asset folder. Template-only CSS
has moved into the system. The library now contains 32 live recipes.

New reusable patterns cover evidence frames and source bars, insight callouts,
research tables, native disclosures, object dossiers, inline empty states, and
chapter navigation. React wrappers and preview examples accompany the reading
and evidence patterns. The optional reading runtime preserves native anchors.

Independent review caught paper-panel caption contrast, report clipping that
prevented sticky reading rails, lost mobile page gutters, active-nav border
movement, and mobile chart insets. These are corrected. The motion runtime now
resamples reduced-motion preference when reinitialized.

Local verification: 206 tokens, 100 component blocks, 312 discoverable classes,
198 contrast pairs, 16 motion scenarios and 13 reading scenarios pass. The four
composition presets, literal headline escaping, motion exclusion, copy fallback,
native disclosure, chapter links and narrow light/dark layouts were reviewed in
the browser. Existing consumer regression suites remain required before merge.

## Printable deliverable pass · v2.8.0

The roadmap's remaining report gap is now a first-class composition: three explicit US Letter
sheets for a cover, executive summary, and supporting evidence. Each page owns its document header,
folio, source line, and page break, while collapsing to a normal responsive surface on phones.
The composition studio exports it, the visual library demonstrates it, and React exposes the same
sheet structure. SpicyCar and SpicyStock use compact print-only SpicyChicken furniture around their
existing pages; screen layout and application behavior are unchanged.

## Signal matrix pass · v2.9.0

The missing candidate × criteria view is now a native table with sticky row identity and compact
semantic cells that never depend on color alone. A values-only mode lets existing comparisons gain
the same spatial rhythm without inventing a qualitative judgment. Typed React primitives, a Design
Sync preview, and a complete copyable recipe ship with it. SpicyCar applies the values mode to the
comparison it already calculates; SpicyStock applies signal tiles to recorded 2LYNCH pass/fail
detail. No ranking, score, price, screen, trading, or data behavior changes.

## Benchmark rail pass · v2.10.0

The map answers where, charts answer when, and the signal matrix answers which criteria. The
remaining visual gap was the smallest decision question: where does this exact number sit against
its own scale or reference? The Benchmark Rail adds that spatial reading without making the track
the only answer. Exact value, endpoints, expected band, reference, and interpretation remain
visible text; the geometry is decorative and fluid.

SpicyCar applies the centered form only to its existing value-versus-typical percentage, on a
clearly labeled ±20% context scale. SpicyStock applies the zero-to-ten form only to the score it
already prints. Values outside a displayed context clamp visually while their exact written values
remain unchanged. No ranking, threshold, screening, purchase, price, data, or trading behavior is
introduced or changed.

## First-screen decision composition · 6 September 2026

Observed integration gap: adding a component to an optional, lower-page shortlist did
not improve the default view. A system recipe is only useful when its information is
placed where a reader actually makes a decision. The response is a complete, copyable
**Decision brief**: compact original-mark opening, immediately visible semantic signal
matrix, two photo/object dossiers, existing map/evidence destinations and a source footer.

The matrix is in the initial content, not a conditional drawer. Existing record order,
values and product verdicts remain authoritative; unavailable evidence is neutral and
explicit. Photographs can be missing without inventing a replacement vehicle. The
specimen contains labeled illustrative facts, not live listings or recommendations.
Its map note demonstrates why absent coordinates must not produce made-up map pins.

This is composition of existing v2.10 components, not another style layer. The palette,
mark paths, geometry, stylesheet and version remain unchanged. One authored composition
generates both recipe 36 and the standalone template; the pre-ship gate checks freshness,
shared class vocabulary, local references and original assets. The template is bundled
with the reusable design guidance. It is static by default; optional motion must retain
visible base content and honor reduced-motion/pause. Phone comparison scrolling remains
inside a named, keyboard-focusable native-table region, with sticky candidate identity.

Rendered verification: the actual standalone template passed six Chromium scenarios
(390, 820 and 1280px, light and dark), including no page overflow, visible native matrix
before dossiers, proportional/unclipped original marks, phone stacking, keyboard focus
and horizontal scrolling, candidate/source/map anchor navigation, and reduced-motion
visibility. These deterministic offline screenshots use fallback fonts and the original
local SVGs. The browser gate is opt-in and reports missing Chromium as SKIP/nonzero;
the static offline gate does not claim browser coverage.

## Phone matrix discoverability

The opening matrix made comparison visible, but phone users still had to discover its
later columns by panning. An optional criterion navigator now exposes their real names
as native command buttons. It keeps the sticky identity, complete table, supplied values,
and native scroll behavior. It appears only when the table overflows; wide layouts and
printed pages need no extra controls. Short labels can come from authored header metadata.

`sc-matrix-nav.js` is a small, dependency-free addition with scoped token-based styling.
The Decision Brief template, recipe 36, setup snippet, snapshot vendor and guidance bundle
include it. No logo path, palette token, core stylesheet, version or product decision
changes. Reduced motion makes criterion jumps immediate. Refresh/destroy methods support
rerendered tables and clean up observers/listeners; closed disclosures update on opening.

The rendered gate exercises every named criterion, sticky-column alignment with borders
and padding, native focus and activation, reduced-motion landing, resize focus handoff,
header replacement/removal, disclosure opening, idempotent attachment and cleanup.
The full table and candidate links also work with JavaScript disabled.

## Shared chart and native-table presentation bundle

Existing consumers already load `sc-charts.js` for chart primitives and accessible table
twins. The generated asset now composes those original chart functions unchanged with
the shared criterion helper and a generic native-table lifecycle adapter. This provides
snapshot-only adoption without modifying application pages or copying their logic.

Only native signal matrices with a single unmerged header row are automatically enhanced.
Values matrices are excluded because their columns can be records rather than criteria;
explicit opt-in and opt-out remain available. Labels come directly from authored headers.
The adapter observes insertion, header changes and removal, keeps controls with moved
regions, and rebinds disclosure ancestors. Body values and unrelated chart changes do not
rebuild controls. Original chart source, palette, logos, core stylesheet and version stay
unchanged. The standalone helper remains an independent, explicitly optional asset.
