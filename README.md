# SpicyChicken Design System

The visual standard for everything Mohammed Tahir Madni ships under **SpicyChicken** —
dashboards, documents, READMEs, decks. Cobalt structure, one spice accent, dark by default.

**Start here:** open `styleguide.html` (every token and component, both modes), then read
`DESIGN_SYSTEM.md` (the rules). New project: copy `sc.css` + `starter.html` and build.

| File | Purpose |
|---|---|
| `sc.css` | The system — tokens, base styles, components. One file, no build step. |
| `starter.html` | Page skeleton: masthead with theme toggle, footer with watermark. |
| `styleguide.html` | Living reference. Open it next to any page you're building. |
| `tokens.json` | Tokens in W3C format for Figma / Tokens Studio. Generated from the CSS. |
| `DESIGN_SYSTEM.md` | The standard. Attach it to Claude or any AI tool before generating material. |
| `AUDIT-AND-ROADMAP.md` | Where it came from, what changed and why, what's next, changelog. |
| `CHECKLIST.md` | Ten lines to tick before any page ships. |
| `assets/` | The SpicyChicken mark: SVG forms, avatar tile, lockups, favicons. |
| `build/` | Optional tooling: `assemble.py` rebuilds `styleguide.html`, `gen_tokens.py` rebuilds `tokens.json`, `color.py` is the OKLCH/contrast math. The system itself needs no build step. |

Projects can link the stylesheet straight from GitHub Pages:

```html
<link rel="stylesheet" href="https://spicychicken59.github.io/design-system/sc.css">
```

or vendor a copy of `sc.css` and note the version from its header when refreshing it. The style
guide is served at the repo's Pages root.
