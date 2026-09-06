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
