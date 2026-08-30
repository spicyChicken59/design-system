# Plain-HTML equivalents

For email, exported HTML and anywhere `sc.css` cannot load. Values are the resolved hex from
`sc.css` v2.4.0 — copy the block for the mode you are rendering in. Fonts fall back to system faces
where the webfonts are not available; keep the stacks anyway.

One thing cannot be inlined and is handled by hand here: the callout's file-fold corner is
omitted. Eyebrows need no special handling — since 2.2.0 the sheet draws no `//` prefix, so an
inlined eyebrow and a `sc.css` one carry exactly the same text.

Stacks used below:

- display `'Bricolage Grotesque','Instrument Sans',system-ui,sans-serif`
- body `'Instrument Sans',system-ui,-apple-system,sans-serif`
- mono `'IBM Plex Mono',ui-monospace,SFMono-Regular,Menlo,Consolas,'Liberation Mono',monospace`

## Eyebrow

The `//` is the brand colour at 65% — given here as a resolved colour for the surface it sits on
(page background), because email clients drop `opacity`.

Dark (on `#09111B`):

```html
<p style="margin:0 0 10px;font:600 12px/1 'IBM Plex Mono',ui-monospace,SFMono-Regular,Menlo,Consolas,'Liberation Mono',monospace;letter-spacing:.4px;text-transform:lowercase;color:#A3C4EE"><span style="color:#6D85A4">// </span>listings · august</p>
```

Light (on `#F2F4F8`):

```html
<p style="margin:0 0 10px;font:600 12px/1 'IBM Plex Mono',ui-monospace,SFMono-Regular,Menlo,Consolas,'Liberation Mono',monospace;letter-spacing:.4px;text-transform:lowercase;color:#165194"><span style="color:#638AB7">// </span>listings · august</p>
```

On a white card the light `//` is `#688EB9`; on the dark card surface `#7089A9`.

## Chip (brand tone)

Dark:

```html
<span style="display:inline-block;font:600 10.5px/1 'IBM Plex Mono',ui-monospace,SFMono-Regular,Menlo,Consolas,'Liberation Mono',monospace;letter-spacing:.2px;text-transform:lowercase;padding:4px 8px;border-radius:6px;background:#19273A;color:#A3C4EE;border:1px solid #495E79;white-space:nowrap">snapshot daily</span>
```

Light:

```html
<span style="display:inline-block;font:600 10.5px/1 'IBM Plex Mono',ui-monospace,SFMono-Regular,Menlo,Consolas,'Liberation Mono',monospace;letter-spacing:.2px;text-transform:lowercase;padding:4px 8px;border-radius:6px;background:#E5EEF9;color:#165194;border:1px solid #9DB7D6;white-space:nowrap">snapshot daily</span>
```

Other tones, same markup — swap background / color / border:

| Tone | Dark | Light |
|---|---|---|
| neutral | `#1B2737` / `#92A0B1` / `#2A394D` | `#F3F7FC` / `#5D6671` / `#CFD6DE` |
| spice | `#371F18` / `#FE825C` / `#7D4230` | `#FFE9E2` / `#AC3400` / `#E2AA93` |
| good | `#1A2C1A` / `#4EA954` / `#2C582E` | `#E3F4E2` / `#1B7E2A` / `#9DCBA2` |
| danger (outline) | `transparent` / `#EE5A66` / `1.5px solid #EE5A66` | `transparent` / `#BE2132` / `1.5px solid #BE2132` |

The chip must say its meaning in words; keep it lowercase unless it is a code (then drop `text-transform`).

## Card

Dark:

```html
<div style="background:#121C2A;border:1px solid #2A394D;border-radius:14px;padding:18px 20px;color:#D8DFE8;font:400 15px/1.6 'Instrument Sans',system-ui,-apple-system,sans-serif;box-shadow:0 1px 3px rgba(0,0,0,.35)">
  <h3 style="margin:0 0 8px;font:700 20px/1.2 'Bricolage Grotesque','Instrument Sans',system-ui,sans-serif;letter-spacing:-.2px;color:#F4F7FB">Listings</h3>
  <p style="margin:0 0 8px;font-size:13px;color:#92A0B1">Rolling 30 days.</p>
  <p style="margin:0">Body text.</p>
</div>
```

Light:

```html
<div style="background:#FFFFFF;border:1px solid #CFD6DE;border-radius:14px;padding:18px 20px;color:#2F3741;font:400 15px/1.6 'Instrument Sans',system-ui,-apple-system,sans-serif;box-shadow:0 1px 3px rgba(24,46,75,.08)">
  <h3 style="margin:0 0 8px;font:700 20px/1.2 'Bricolage Grotesque','Instrument Sans',system-ui,sans-serif;letter-spacing:-.2px;color:#182E4B">Listings</h3>
  <p style="margin:0 0 8px;font-size:13px;color:#5D6671">Rolling 30 days.</p>
  <p style="margin:0">Body text.</p>
</div>
```

## Callout (core)

Dark:

```html
<div style="background:#19273A;border-radius:10px;padding:14px 18px;margin:16px 0;color:#D8DFE8;font:400 15px/1.6 'Instrument Sans',system-ui,-apple-system,sans-serif">
  <p style="margin:0 0 7px;font:600 11px/1 'IBM Plex Mono',ui-monospace,SFMono-Regular,Menlo,Consolas,'Liberation Mono',monospace;letter-spacing:.4px;text-transform:lowercase;color:#A3C4EE"><span style="color:#738DAF">// </span>core takeaway</p>
  <p style="margin:0"><strong style="color:#F4F7FB">Landed price</strong> = what it costs to put it in your driveway.</p>
</div>
```

Light:

```html
<div style="background:#E5EEF9;border-radius:10px;padding:14px 18px;margin:16px 0;color:#2F3741;font:400 15px/1.6 'Instrument Sans',system-ui,-apple-system,sans-serif">
  <p style="margin:0 0 7px;font:600 11px/1 'IBM Plex Mono',ui-monospace,SFMono-Regular,Menlo,Consolas,'Liberation Mono',monospace;letter-spacing:.4px;text-transform:lowercase;color:#165194"><span style="color:#5E88B7">// </span>core takeaway</p>
  <p style="margin:0"><strong style="color:#182E4B">Landed price</strong> = what it costs to put it in your driveway.</p>
</div>
```

Variants: **ink** (both modes) background `#111F31`, text `#F4F7FB`, label and strong `#A3C4EE` / `#F4F7FB`;
**spice** background `#371F18` / `#FFE9E2` with the label in `#FE825C` / `#AC3400`;
**warning** background `#381E1E` / `#FFE8E7` plus `border:2px solid #EE5A66` / `#BE2132`, label in the same red.

Page background, if you control it: `#09111B` dark, `#F2F4F8` light. Links: `#FE825C` dark, `#AC3400` light,
with `text-decoration:underline` (the hairline underline does not survive inlining well).
