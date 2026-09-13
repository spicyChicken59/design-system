# Pre-ship checklist

Open `styleguide.html` beside the page. If something on the page has no equivalent in the style
guide, it's a new component — fold it into the system or take it out.

- [ ] Printable deliverables use explicit `.sc-sheet` pages, retain sources and folios, and are reviewed as Letter pages with backgrounds enabled.
- [ ] Signal matrices remain native tables, label their scroll region, keep row/column headers, and repeat every colored signal as readable text.
- [ ] Benchmark rails print the exact value and authored scale in words; bands and references come from real definitions, never decorative targets.
- [ ] Every printed figure says how it was arrived at: recorded wears no class, a figure derived from stated assumptions is `.sc-estimate`, one the source never supplied is `.sc-unreported`, and the word is in the markup either way — the mark and the colour are reinforcement.
- [ ] A comparison whose columns are records, not criteria, carries `.sc-signal-matrix--fit` and was opened at 390px: two record columns beside the identity column, not one.

- [ ] Head: pinned `sc.css` + `sc-theme.js`, `color-scheme` meta, font preconnects, favicon = the chick (`assets/favicon.ico`).
- [ ] Masthead: chick + project name left, theme toggle right, `--sc-ink` in both modes; nav has an `aria-label`.
- [ ] Title block (`.sc-title`) opens with an eyebrow; h1 is one plain sentence; dek is one sentence.
- [ ] Exactly one spice action per view (primary button or next-action callout); at most one core callout per section.
- [ ] A view that offers an action ends it in one `.sc-actionbar` — status word, the reason in a sentence, one button — and the phone layout was opened: a row `flex-basis` becomes a height in a column.
- [ ] Every segmented control in a row of two or more carries a visible `.sc-field--group` caption, and the group names it with `aria-labelledby`.
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
- [ ] Bounded report tables release their height and sticky cells in print; the last row is included. Wide column sets still need an appropriate paper size or a dedicated report composition.
- [ ] Loading has a text label and represents real pending work; values are never invented.
- [ ] Copied design assets belong to one immutable snapshot; provenance matches the files.
