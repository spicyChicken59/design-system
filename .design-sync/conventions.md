## Building with SpicyChicken

**No provider, no wrapper.** Every token lives on `:root` in the stylesheet, so components
are styled the moment `styles.css` is loaded. Just render them.

**Dark is the default.** `:root` carries the dark tokens; light arrives from the OS
(`prefers-color-scheme`) or by setting `data-theme="light"` on `<html>`. `data-theme="dark"`
pins dark. `ThemeToggle` writes that attribute itself and remembers the choice — drop it in a
`Masthead` and theming works. **Masthead, Footer, Tooltip and code blocks stay dark in both
modes** — that is deliberate, not a bug to fix.

### Styling your own layout glue

There are **no utility classes to compose with** — style anything the library doesn't cover
with the CSS custom properties, never with hex:

- Surfaces `var(--sc-bg)` `--sc-surface` `--sc-raised` `--sc-hover` · borders `--sc-border` `--sc-border-strong`
- Text `--sc-heading` `--sc-text` `--sc-text-2` (muted) `--sc-text-3` (faint) · on ink `--sc-on-ink`
- Brand cobalt `--sc-brand` `--sc-brand-strong` `--sc-brand-fill` `--sc-brand-line` · accent spice `--sc-accent` `--sc-accent-hover` `--sc-accent-fill` `--sc-on-accent`
- Status `--sc-good` `--sc-warn` `--sc-danger` (+ `-fill` variants) · charts `--sc-chart-1…5`, `--sc-chart-emphasis`, `--sc-chart-context`, `--sc-chart-seq-1…5`
- Type `--sc-font-display` (Bricolage, headings) `--sc-font-body` (Instrument, body **and figures**) `--sc-font-mono` (IBM Plex, labels/chips/table headers)
- Space `--sc-s0…--sc-s12` (4→96, 8px rhythm) · radii `--sc-r-sm|md|lg|pill` · widths `--sc-w-prose|content|wide` · `--sc-shadow` `--sc-motion`

For layout reach for the components first: `Wrap` (measure) → `Section` (48px rhythm) →
`Grid cols={2|3|4}` → `Stack` (16px between children) → `Row` (inline run).

### Rules the design must obey

- **One `Button variant="primary"` per view.** Everything else is `secondary` or `ghost`.
- **One `Callout variant="core"` per section**, and one `Hero` figure per page.
- `Eyebrow` text is lowercase and **the `//` is drawn by CSS — never type it**.
- `Delta` needs all three: `tone` (what it means — a falling cost is `good`), `arrow`, and the
  period in words. `tone="bad"` is amber; red is reserved for danger.
- Numeric table columns take `numeric` so they right-align with tabular figures.
- Charts: fixed slot order, one y-axis, a `Legend` for ≥2 series, and a `Details` table twin
  underneath. **Text never wears a chart or status colour** — it wears a text token.
- `Chip` must say its meaning in words; tone only reinforces it.

### Gotchas that cost a render

- **`Brand` belongs inside `Masthead`.** It is an `<a>`, and only `.sc-masthead a` clears the
  base link underline.
- `Checkbox` is `inline-flex`; a vertical list needs an explicit flex column, not `Stack`.
- `Tooltip` is absolutely positioned and invisible until `open` — give it a `position: relative` parent.
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
    right={<><Nav items={[{ href: '#overview', label: 'Overview', current: true }]} /><ThemeToggle /></>}
  />
  <Wrap as="main">
    <Section>
      <Eyebrow>fleet · q3 review</Eyebrow>
      <h1>Utilisation held at 78% while the fleet grew.</h1>
      <Dek>The gain is real rather than a smaller denominator.</Dek>
      <Meta items={['Updated 24 Aug 2026', 'Source: telematics export']} />
      <Callout variant="core" label="core takeaway">
        <p>The fleet is working harder, not shrinking.</p>
      </Callout>
      <Grid cols={3}>
        <Tile label="On the road" value="1,284" sub="of 1,638 active"
              delta={<Delta tone="good" arrow="up">3% vs last week</Delta>} />
      </Grid>
      <Card title="By depot" hint="Rolling 30 days."
            action={<Button variant="primary" size="sm">Open the dashboard →</Button>}>
        <Table columns={[{ key: 'depot', header: 'depot' },
                         { key: 'util', header: 'utilisation', numeric: true }]}
               rows={[{ depot: 'Manchester', util: '82%' }]} />
      </Card>
    </Section>
  </Wrap>
  <Footer source="Source · method · last updated" />
</>
```
