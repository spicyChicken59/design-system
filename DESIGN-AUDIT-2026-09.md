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
