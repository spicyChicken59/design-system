## Building with SpicyChicken

**No provider, no wrapper.** Every token lives on `:root` in the stylesheet, so components
are styled the moment `styles.css` is loaded. Just render them.

**Dark is the default.** `:root` carries the dark tokens; light arrives from the OS
(`prefers-color-scheme`) or by setting `data-theme="light"` on `<html>`. `data-theme="dark"`
pins dark. `ThemeToggle` writes that attribute itself and remembers the choice — drop it in a
`Masthead` and theming works. **Masthead, Footer, Tooltip, ink Callouts and code blocks stay dark
in both modes** — that is deliberate, not a bug to fix; anything nested in them re-reads the text,
brand and accent tokens as on-ink values automatically.

### Styling your own layout glue

A handful of utilities exist and can go in `className`; there is no spacing scale beyond them, so
anything else is styled with the CSS custom properties, never with hex:

- Utilities: `sc-mono` `sc-muted` `sc-faint` `sc-num` `sc-nowrap` `sc-truncate` `sc-case` (keep casing
  inside a lowercased component) · `sc-stack` (16px between children) `sc-row` `sc-right` · `sc-sr-only`
  `sc-hide-sm` (hidden below 720px) · `sc-text-good` `sc-text-warn` `sc-text-danger` `sc-text-info`
  `sc-text-brand` (one-word labels only). `sc-text-accent` is deprecated — use `Chip tone="spice"`.
- Surfaces `var(--sc-bg)` `--sc-surface` `--sc-raised` `--sc-hover` · borders `--sc-border` `--sc-border-strong` `--sc-border-control` (form edges)
- Text `--sc-heading` `--sc-text` `--sc-text-2` (muted) `--sc-text-3` (faint) · on ink `--sc-on-ink` `--sc-on-ink-2` `--sc-on-ink-3`, hairlines `--sc-ink-line` `--sc-ink-line-strong`, fill `--sc-ink-fill`
- Brand cobalt `--sc-brand` `--sc-brand-strong` `--sc-brand-fill` `--sc-brand-line` · accent spice `--sc-accent` `--sc-accent-hover` `--sc-accent-fill` `--sc-on-accent` `--sc-focus`
- Status `--sc-good` `--sc-warn` `--sc-danger` `--sc-info` (+ `-fill` variants) · charts `--sc-chart-1…5`, `--sc-chart-emphasis`, `--sc-chart-context`, `--sc-chart-seq-1…5`, `--sc-chart-grid`
- Type `--sc-font-display` (Bricolage, headings) `--sc-font-body` (Instrument, body **and figures**) `--sc-font-mono` (IBM Plex, labels/chips/table headers)
- Space `--sc-s0…--sc-s12` (4→96, 8px rhythm) · radii `--sc-r-sm|md|lg|pill` · widths `--sc-w-prose|content|wide` · `--sc-shadow` `--sc-shadow-pop` `--sc-motion`

For layout reach for the components first: `Wrap` (measure) → `Section` (48px rhythm) →
`Grid cols={2|3|4}` → `Stack` (16px between children) → `Row` (inline run). `Sep` is the `·`
between meta items and the 1px rule in a masthead's right slot.

### Components that exist (2.1) — do not rebuild them in page CSS

`Title` (eyebrow + h1 + dek + meta + optional `Tabs`), `Chart` (the host: `role="group"`,
`tabIndex=0`, `aria-label`, an `aria-hidden` SVG, a `Details` table twin), `Spark` (sparkline;
`emphasis` for the one that matters, `inTile` inside a `Tile`), `Frame` (photo slot; `empty` text
when there is no photo, `size="lg"`), `Media` (`frame` + title / `sub` / `code` + `links`; `card`
for the phone twin with `aside` and `foot`), `Empty` (one sentence, or `as="row"` in a table),
`Figure` / `Note` (lead value + mono footnote in a cell), `QuietLink`, `SkipLink`, `Sep`,
`Doc flat` and `Toc`.

### Rules the design must obey

- **One `Button variant="primary"` per view.** Everything else is `secondary` or `ghost`.
- **One `Callout variant="core"` per section**, and one `Hero` figure per page. `figure` on a
  Callout is the 22px lead figure.
- `Eyebrow` text is lowercase and **the `//` is drawn by CSS — never type it**.
- `Delta` needs all three: `tone` (what it means — a falling cost is `good`), **`arrow` (required —
  colour never carries the direction alone)**, and the period in words. `tone="bad"` is amber; red is
  reserved for danger.
- Numeric table columns take `numeric` so they right-align with tabular figures and never wrap.
  `sortable` columns render `aria-sort` (from `sort`) on the `th` and a `button.sc-table__sort`
  inside it, wired to `onSort`; the header sticks only with `scroll="tall"`.
- `Tabs` is a **segmented control**: `role="group"` + `aria-label` on the row, `aria-pressed` on each
  button. It switches the subject, never navigation; there are no tab panels.
- Charts: fixed slot order, one y-axis, a `Legend` for ≥2 series, and a `Details` table twin
  underneath. **Text never wears a chart, status or accent colour** — it wears a text token; a
  figure beside a chart is `Figure` (heading colour), not brand-strong.
- `Chip` must say its meaning in words; tone only reinforces it. "new" is `tone="spice"`, never
  accent-coloured text. `keepCase` keeps a code's casing (VIN, TX); `Tabs` items take it too.
- Links inside tables and media rows are `QuietLink`; spice links are for prose and the one action.

### Gotchas that cost a render

- `Brand` is text-coloured with no underline wherever it renders, but its on-ink colours come from
  `Masthead` — preview it inside one.
- **`Checkbox` is not a `Field`**: `label.sc-check` carries its own mono label typography, so never
  nest a `Checkbox` inside a `Field` (you get two labels and 24px of double padding). Put it straight
  in `Filters`.
- `Checkbox` is `inline-flex`; a vertical list needs an explicit flex column, not `Stack`.
- `Tooltip` is absolutely positioned and `visibility:hidden` until `open` — give it a `position: relative` parent.
- `hidden` works on every component (the stylesheet has a `[hidden]` reset) — use it rather than a display toggle.
- Fonts load from Google Fonts through an `@import` in the stylesheet; nothing to bundle.

### Where the truth lives

`_ds/<folder>/styles.css` and the `_ds_bundle.css` it imports are the complete system — read them
before inventing anything. `guidelines/DESIGN_SYSTEM.md` is the standard in full and
`guidelines/CHECKLIST.md` is the pre-ship list. Per-component API sits in each `.d.ts` / `.prompt.md`.

### A page, end to end

```jsx
<>
  <Masthead
    brand={<Brand name="Fleet Review" sub="depot performance, monthly" />}
    right={<><Nav aria-label="Sections" items={[{ href: '#overview', label: 'Overview', current: true }]} /><ThemeToggle /></>}
  />
  <Wrap as="main" className="sc-stack">
    <Title>
      <Eyebrow>fleet · q3 review</Eyebrow>
      <h1>Utilisation held at 78% while the fleet grew.</h1>
      <Dek>The gain is real rather than a smaller denominator.</Dek>
      <Meta items={['Updated 24 Aug 2026', 'Source: telematics export']} />
    </Title>
    <Callout variant="core" label="core takeaway" figure="78% utilised">
      <p>The fleet is working harder, not shrinking.</p>
    </Callout>
    <Grid cols={3}>
      <Tile label="On the road" value="1,284" sub="of 1,638 active"
            delta={<Delta tone="good" arrow="up">3% vs last week</Delta>}
            spark={<Spark values={[60, 64, 70, 78]} emphasis inTile />} />
    </Grid>
    <Card title="By depot" hint="Rolling 30 days."
          action={<Button variant="primary" size="sm">Open the dashboard →</Button>}>
      <Table columns={[{ key: 'depot', header: 'depot', sortable: true },
                       { key: 'util', header: 'utilisation', numeric: true }]}
             rows={[{ depot: 'Manchester', util: '82%' }]} />
    </Card>
  </Wrap>
  <Footer source="Source · method · last updated" />
</>
```
