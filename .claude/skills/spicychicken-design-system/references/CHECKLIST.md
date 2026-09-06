# Pre-ship checklist

Open `styleguide.html` beside the page. If something on the page has no equivalent in the style
guide, it's a new component — fold it into the system or take it out.

- [ ] Printable deliverables use explicit `.sc-sheet` pages, retain sources and folios, and are reviewed as Letter pages with backgrounds enabled.
- [ ] Signal matrices remain native tables, label their scroll region, keep row/column headers, and repeat every colored signal as readable text.

- [ ] Head: pinned `sc.css` + `sc-theme.js`, `color-scheme` meta, font preconnects, favicon = the chick (`assets/favicon.ico`).
- [ ] Masthead: chick + project name left, theme toggle right, `--sc-ink` in both modes; nav has an `aria-label`.
- [ ] Title block (`.sc-title`) opens with an eyebrow; h1 is one plain sentence; dek is one sentence.
- [ ] Exactly one spice action per view (primary button or next-action callout); at most one core callout per section.
- [ ] Page CSS references semantic tokens only — no hex, no primitives.
- [ ] Brand compositions preserve the original chick and clear space; no ghost or pattern overlaps evidence or body copy.
- [ ] Cover tone matches its mark form; paper controls remain readable in dark mode; compact covers wrap in narrow containers.
- [ ] New layouts use `VISUAL-RECIPES.md`; example content and specimen links are replaced before product use.
- [ ] Charts use `--sc-chart-*` inside a `.sc-chart` host; one y-axis; legend for ≥2 series; a table twin under each.
- [ ] Text never wears a chart, status or accent color; deltas carry ▲▼; chips carry words; links in tables are quiet.
- [ ] `hidden` hides things — no `style="display:none"`, no inline sizes on headings or the watermark.
- [ ] Screenshotted at 1280 and 390 in dark and light; nothing outside a `.sc-table-scroll` scrolls sideways.
- [ ] Footer has the source line and the watermark; page ends with one next action, not a list.
- [ ] `npm run check` passes (system repo) — the sheet, tokens, style guide and wrappers agree.

## Visual composition and motion

- [ ] The primary finding has clear hierarchy; supporting evidence does not compete with it.
- [ ] The original chick has clear space and the correct colour form for its surface.
- [ ] Reusable compositions come from the visual library and retain their semantics.
- [ ] Motion is opt-in; no essential content depends on animation or JavaScript.
- [ ] Keyboard focus, reduced motion, pause and print leave everything readable.
- [ ] Loading has a text label and represents real pending work; values are never invented.
- [ ] Copied design assets belong to one immutable snapshot; provenance matches the files.
