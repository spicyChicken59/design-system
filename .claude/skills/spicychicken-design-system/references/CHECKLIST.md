# Pre-ship checklist

Open `styleguide.html` beside the page. If something on the page has no equivalent in the style
guide, it's a new component — fold it into the system or take it out.

- [ ] Head: pinned `sc.css` + `sc-theme.js`, `color-scheme` meta, font preconnects, favicon = the chick (`assets/favicon.ico`).
- [ ] Masthead: chick + project name left, theme toggle right, `--sc-ink` in both modes; nav has an `aria-label`.
- [ ] Title block (`.sc-title`) opens with an eyebrow; h1 is one plain sentence; dek is one sentence.
- [ ] Exactly one spice action per view (primary button or next-action callout); at most one core callout per section.
- [ ] Page CSS references semantic tokens only — no hex, no primitives.
- [ ] Charts use `--sc-chart-*` inside a `.sc-chart` host; one y-axis; legend for ≥2 series; a table twin under each.
- [ ] Text never wears a chart, status or accent color; deltas carry ▲▼; chips carry words; links in tables are quiet.
- [ ] `hidden` hides things — no `style="display:none"`, no inline sizes on headings or the watermark.
- [ ] Screenshotted at 1280 and 390 in dark and light; nothing outside a `.sc-table-scroll` scrolls sideways.
- [ ] Footer has the source line and the watermark; page ends with one next action, not a list.
- [ ] `npm run check` passes (system repo) — the sheet, tokens, style guide and wrappers agree.
