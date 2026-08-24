# design-sync notes — SpicyChicken

## Shape of this repo

- The design system itself is **CSS-only** (`sc.css`; consumers need no build). Claude Design
  needs compiled React components, so `react/` holds thin wrappers that emit the exact `sc-*`
  markup `styleguide.html` documents. **`sc.css` stays the source of truth** — the wrappers add no
  styling of their own and must never diverge from it.
- `react/scripts/gen-assets.mjs` inlines `assets/*.svg` into `src/marks.generated.ts` as data
  URIs (the upload format ships no `assets/` dir). That file is generated on every build and
  gitignored — never hand-edit it.
- `react/scripts/build.mjs` copies `sc.css` and `tokens.json` verbatim into `react/dist/`.
  `cfg.cssEntry` points at `dist/sc.css`, so the synced stylesheet is byte-identical to the repo's.
- Build the package before the converter: `npm --prefix react run build` (recorded as `cfg.buildCmd`),
  or `npm run build:react` from the root.

## Environment

- **Node-only toolchain.** Node.js 24.19.0 LTS (installed via `winget install OpenJS.NodeJS.LTS`);
  Git Bash needs `export PATH="$PATH:/c/Program Files/nodejs"`. **Python is not installed and is not
  needed**: the generators are `build/gen-tokens.mjs` and `build/assemble.mjs` (the `.py` files are
  the retired originals). From the root: `npm run build` regenerates `tokens.json` and
  `styleguide.html` and builds `react/`; `npm run check` diffs the generated files against the
  committed ones and checks the `sc-*` vocabulary and version strings. Run `npm run check` before
- CI: `.github/workflows/check.yml` runs `npm run check` and the wrapper build on every push; `build/contrast.mjs` is the contrast gate inside it.
  any re-sync — it is the drift gate for the wrappers (every class the wrappers emit must exist in
  `sc.css`); if the root scripts are ever renamed, this is the one to keep.
- Playwright's chromium download was **skipped** (`PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`); validate
  and capture run against the machine's installed Chrome via
  `DS_CHROMIUM_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe"`. Set that env var for
  every `package-validate.mjs` / `package-capture.mjs` run or the render check fails.
- The working tree is CRLF (`core.autocrlf=true`) while the index is LF. Generators write LF; do
  not trust a byte comparison against a working-tree file without normalising line endings.

## Rendering facts

- **Preview cards resolve to LIGHT mode.** The converter's card harness paints `body{background:#fff}`
  and headless Chrome reports `prefers-color-scheme: light`, so `:root:not([data-theme="dark"])`
  wins. Light is a first-class mode of this system, so the cards are honest — but remember the
  system's page default is dark. Most previews wrap their story in `background: var(--sc-bg)` so
  surfaces read against the page colour rather than the harness's white.
- `[FONT_REMOTE]` fires every run and is expected: `sc.css` pulls Bricolage Grotesque, Instrument
  Sans and IBM Plex Mono from Google Fonts via `@import`. Nothing to bundle; **no action needed**.
- `tokens/` in the output is empty by design — the tokens live inside `sc.css`, which ships as
  `_ds_bundle.css` and is reachable from `styles.css`'s import closure.
- Ink surfaces (Masthead, Footer, Tooltip, ink Callout) re-scope the text/brand/accent tokens
  through the on-ink context in `sc.css` §2c, so nested headings, links and eyebrows render
  correctly in the light harness without per-preview overrides.

## Findings worth keeping

- **`Brand` is text-coloured everywhere** (`.sc-brand { color: inherit; border: 0 }` since 2.1);
  its on-ink colours still come from `Masthead`, so its preview is composed inside a real one.
- **`Checkbox` must not be nested in `Field`.** `.sc-check` now carries the same mono label
  typography as `.sc-field`; nesting doubles the label styling and the 24px min-height.
- **`.sc-check` is `inline-flex`**, so `Stack` (which uses `margin-top`) does not separate a
  column of checkboxes. Use an explicit flex column.
- `Tooltip` is `position: absolute` and `visibility: hidden` until `open` — previews place it in a
  relative container in the open state.
- `Tabs` is a segmented control (`role="group"` + `aria-pressed`), not ARIA tabs — there are no
  panels to wire.
- `cardMode: "column"` is set for the full-bleed / wide components: Table, Masthead, Footer, Doc,
  Wrap, Brand, Filters, Title, Chart, Media.
- `CardProps` must `Omit<…, 'title'>` — React's intrinsic `title` is `string`, and this system's
  `title` takes a `ReactNode`.

## Known render warns

None. The final validate run was clean: 34/34 previews render, no `[RENDER_*]` warnings.
`[FONT_REMOTE]` is informational and expected (see above).

## Re-sync risks

- **The wrappers can drift from `sc.css`.** If a class is renamed, removed or gains a modifier in
  `sc.css`, the matching wrapper in `react/src/` will not know. `npm run check` / `npm run check`
  is the gate — run it on any re-sync after a `sc.css` change before trusting the build.
- Deprecated in 2.1, removed in 3.0: `.sc-text-accent` and `th.is-sorted`. The wrappers must not
  emit either.
- The brand marks are **inlined at build time**. Re-run the build after editing anything in
  `assets/` or the bundle keeps the old artwork.
- Preview content is invented fleet/depot data written for this import. It is illustrative only —
  if the brand's real example domain changes, the previews will read as stale rather than wrong.
- `guidelinesGlob` reaches outside the package (`../DESIGN_SYSTEM.md`, `../CHECKLIST.md`). If the
  package is ever moved or published standalone, those paths break.
- Fonts depend on Google Fonts being reachable at render time. If designs ever render with
  fallback type, that is the cause — the fix is `cfg.extraFonts` with self-hosted woff2s.
