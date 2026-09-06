# SpicyChicken visual recipes

Start in [the brand studio](brand-studio.html): complete compositions, downloadable
SVG patterns, and the actual templates at 320, 390, 768, and 1120px.

## The visual point of view

The chick is the maker's signature. Project names remain typography beside that
same mark. Preserve the existing SVG paths, proportions, colour forms, and clear
space. Never redraw, rotate, distort, shadow, or crop the chick.

Cobalt structures the information. Spice identifies the next action. Wine belongs
to brand moments. Warm paper is an editorial surface. The original UI palettes,
chart series, controls, and footer watermark remain available.

Give the page rhythm: one strong opener → a quieter information area → evidence →
one next action. A brand surface earns its space at an entry point, chapter break,
or report close. Avoid a cover-sized logo in every card.

## Choose the composition

| Deliverable | Copyable example | Visual decisions |
|---|---|---|
| Website or collection | [Website](templates/landing.html) | Wine opener, full mono chick, open collection, one spice CTA |
| Dashboard or comparison | [Dashboard](templates/dashboard.html) | Compact ink opener, shared metrics, open chapters, chart caption signature |
| Screener or evidence review | [Screener](templates/screener.html) | Four related metrics, deliberate empty state, supporting fact rows |
| Report or one-pager | [Report](templates/report.html) | Warm cover, numbered chapters, restrained evidence, source/signature footer |

All example figures are illustrative. Replace content and labels together. Copy
the HTML from `templates/`, then adjust relative CSS, script, and asset paths for
the destination. Copy the assets too, or use a published pinned release. Replace
specimen links back to the studio with the destination's real actions.

## The reusable pieces

| Purpose | HTML | React |
|---|---|---|
| Branded opening | `.sc-cover` + `.sc-on-ink`; optional `--wine`, `--compact`; use `--paper` without ink scope | `Cover` (`tone`, `compact`, `title`, `description`, `eyebrow`, `meta`, `actions`) |
| Repeating mark | `.sc-brand-panel` + `__pattern` + `__label`; `--wine` / `--paper` | Compose HTML with a local pattern SVG |
| Reserved decorative watermark | `.sc-ghost`, mono image pair; `--ink` / `--paper` for fixed surfaces | `Ghost` |
| Contextual maker credit | `.sc-signature`, optional `--small` | `Signature` |
| Theme-adaptive colour mark | `.sc-adaptive-mark` with `__dark` and `__light` images | `AdaptiveMark` |
| Editorial section break | `.sc-chapter` + `__index` + `__body` + optional `__meta` | `Chapter` |
| Related figures | `.sc-stat-strip` (`--2`, `--4`), `.sc-stat`; one `--lead` | `StatStrip` + `Stat` |
| Supporting facts | `.sc-facts` with `div > dt + dd` | `Facts` |
| Chart attribution | `.sc-chart-caption`, below the plot | `figcaption` + `Signature small` |
| Deliberate empty state | `.sc-empty.sc-empty--brand` | `BrandedEmpty` |
| Editorial report | `.sc-report` + `__body` + `__footer` | Compose HTML with `Cover tone="paper"` |

`Cover` defaults to h1; set `headingLevel={2}` for a section cover. `Chapter`
supports h2/h3. `StatStrip` is a definition list: place `Stat` inside it.

```tsx
<Cover tone="wine" title="A little heat. A lot of clarity."
  eyebrow="the SpicyChicken collection"
  description="Useful tools for a clearer decision." />
<Chapter index="01" title="The view at a glance" />
<StatStrip columns={2}>
  <Stat label="lowest asking" value="$42,600" note="Illustrative · before fees" lead />
  <Stat label="compared" value="74" note="Example listings" />
</StatStrip>
```

## Brand intensity

| Treatment | Placement | Limit |
|---|---|---|
| Full colour chick | Masthead; one cover art column | Complete mark and clear space |
| Cream chick on wine | Collection cover; presentation opener | Brand framing, never a status or chart series |
| Mono repeat | Cover back, section break, dedicated panel | Text on opaque backing or outside the repeat |
| Ghost at 5.5% | Empty margin or dedicated blank panel | Decorative only; no content or plot beneath |
| Small signature | Chart caption or report footer | Legible text; no competing CTA |
| Existing footer watermark | Bottom of a website | Preserve the existing signature and link |

Patterns are standalone 1600×900 SVGs in `assets/sc-pattern-{ink,wine,paper}.svg`.
They contain the original mono paths, uniformly scaled and translated. They need
no fonts, remote images, or runtime. The existing reserved asset licence applies.

## Layout and readability

- Use one metric strip for related facts; avoid cards inside cards just to create
  hierarchy. Values stay in heading ink; direction remains in words or arrows.
- Use body type for explanations. Mono is for short labels and metadata.
- Keep the mark away from evidence. Place a chart signature below the plot and
  retain the accessible data table.
- Covers wrap with available component space. Compact covers shorten title and
  mark; phones stack metric strips rather than shrinking type.
- Example chart axes use HTML labels outside the scalable SVG to keep phone text
  readable. Its table contains the same illustrative values.
- Automatic mark pairs follow the theme. Paper scopes local light colours; ink
  and wine scope on-ink colours. Decorative marks have empty alt text.
- Print removes preview controls and decorative panels, opens the report body,
  and retains cover colour. Enable browser background graphics for faithful covers.
- No ambient animation: the logo stays still and existing reduced motion applies.

## Design-only adoption

SpicyCar and SpicyStock currently pin the existing release. Adopt these visual
pieces independently, then bind existing content. A design-system branch does not
restyle pinned websites. Purchase, screening, scoring, data, and backend behaviour
are outside this visual update.
