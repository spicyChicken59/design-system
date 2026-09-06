# SpicyChicken Design System

The visual standard for everything Mohammed Tahir Madni ships under **SpicyChicken** —
dashboards, documents, READMEs, decks. Cobalt structure, one spice accent, dark by default.

**Start with [the visual library](visual-library.html):** preview, filter, and copy
complete visual recipes. Explore [the brand studio](brand-studio.html) for page
compositions and logo treatments, then use [the style guide](styleguide.html) for
the complete component reference. [Visual recipes](VISUAL-RECIPES.md) explains
composition; [motion](MOTION.md) explains safe, purposeful animation.

| File | Purpose |
|---|---|
| `visual-library.html` | Searchable, copyable live recipes across identity, layout, data, motion, and states. |
| `sc-motion.js` | Optional, dependency-free reveals, sequencing and pause controls. Content stays visible without it. |
| `build/vendor.mjs` | Copy a committed design snapshot, original assets and provenance into any static website. |
| `sc.css` | The system — tokens, base styles, components. One file; consumers need no build step. Header carries the version (`v2.6.0`). |
| `sc-map.js` | The map layer: an Albers projection for the lower 48, a quantized-topojson reader, a geodesic ring, box fitting, and a pan/zoom view engine. The geo half is pure — it runs in Node. |
| `sc-charts.js` | Chart primitives: nice ticks, the end-label solver, the sparkline, one tooltip controller, the accessible table twin. Generated from `build/charts.js`, same version stream. Optional — `sc.css` styles charts you draw yourself just as well. |
| `sc-theme.js` | The theme script: saved choice before paint, toggle wiring, print swap. Link it or inline it. Source: `build/theme.js`. |
| `starter.html` | Page skeleton: head snippet, masthead with theme toggle, title block, footer with watermark. |
| `styleguide.html` | Living reference. Open it next to any page you're building. Generated — edit `build/`. |
| `index.html` | Opens the brand studio from the Pages root. |
| `tokens.json` | Tokens in W3C format for Figma / Tokens Studio. Generated from the CSS. |
| `DESIGN_SYSTEM.md` | The standard. Attach it to Claude or any AI tool before generating material. |
| `PLAIN-HTML.md` | Inline-style equivalents (eyebrow, chip, card, callout) for email and exported HTML. |
| `AUDIT-AND-ROADMAP.md` | Where it came from, what changed and why, what's next, changelog. |
| `CHECKLIST.md` | The pre-ship check: the lines to tick before any page ships. |
| `LICENSE` | MIT for the code; the SpicyChicken mark and `assets/` are excluded — all rights reserved. |
| `assets/` | The SpicyChicken mark: SVG forms, avatar tile, lockups, favicons. Hosted URLs in `DESIGN_SYSTEM.md` §11. |
| `build/` | Maintainer tooling, Node only: `node build/gen-tokens.mjs` (tokens.json), `node build/assemble.mjs` (styleguide.html), `check.mjs` (the pre-ship gate behind `npm run check` and CI), `contrast.mjs` (the contrast gate), `color.mjs` (OKLCH/contrast math), `theme.js` (source of `sc-theme.js`). |
| `react/` | Optional thin React wrappers that emit the exact `sc-*` markup. Private, unpublished; the CSS is the source of truth. |

## Use it in a project

**Current source snapshot: v2.6.0.** SpicyCar and SpicyStock use checked-in design
assets with their source commit and SHA-256 hashes in `provenance.json`.
The standalone release tag is not yet published. Use the snapshot workflow now;
the CDN examples below apply only after the matching release tag exists.

From a clean, committed checkout, copy the complete visual runtime and original
brand assets into a consumer:

```sh
node build/vendor.mjs ../my-website/design-system
```

```html
<link rel="stylesheet" href="design-system/sc.css">
<script src="design-system/sc-theme.js"></script>
<script src="design-system/sc-motion.js" defer></script>
```

Put the theme script in the head, before paint. Motion is optional. Copy a recipe
from the visual library and keep the `assets/` subtree beside these files. Refresh
the entire snapshot together; no consumer build step is required.

Pin a release — tags are served by jsDelivr:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/spicyChicken59/design-system@v2.6.0/sc.css">
<script src="https://cdn.jsdelivr.net/gh/spicyChicken59/design-system@v2.6.0/sc-theme.js"></script>
```

`@2` follows the newest 2.x tag. The Pages URL is **latest** and may change on a major — fine for
prototypes, not for production:

```html
<link rel="stylesheet" href="https://spicychicken59.github.io/design-system/sc.css">
```

Or vendor a copy of `sc.css` and note the version from its header when refreshing it.

The full head snippet — `color-scheme` meta, font preconnects, the favicon trio, the stylesheet and
the theme script in the right order — is in `DESIGN_SYSTEM.md` §11; `starter.html` carries it with a vendored `sc.css` and the script inlined — swap in the pinned links for production.
Assets are at `https://spicychicken59.github.io/design-system/assets/<file>` (table in §11).

## Maintain

- `npm run setup` — once after cloning: installs the wrappers' dev dependencies (`npm --prefix react ci`).
- `npm run build` — regenerates `tokens.json`, `styleguide.html` and `sc-theme.js` (edit `build/theme.js`, never `sc-theme.js`) from `sc.css` + `build/`, then builds `react/`.
- `npm run check` — regenerates into a temp dir and diffs against the committed files; verifies every
  `sc-*` class used by the style guide, starter and wrappers exists in the sheet; checks the version strings agree.
- `.github/workflows/check.yml` runs the same gate plus the wrapper build on every push; `.gitattributes` keeps every checkout LF.
- `npm run build:react` — the wrappers alone.
- Releases: bump the `sc.css` header (and both `package.json` versions), add the changelog entry in
  `AUDIT-AND-ROADMAP.md` §5, rebuild, tag `vX.Y.Z`. One number everywhere; repo-only changes bump the patch.
- Node ≥ 20. No Python.
- License: MIT for the CSS, tooling and wrappers; the chick and everything in `assets/` stay all rights reserved (`LICENSE`).
  (the mark in `assets/` would need its own terms either way).
