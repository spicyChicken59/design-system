// Assemble styleguide.html (repo, full document) and the artifact variant
// (content only). Port of build/assemble.py; output is byte-identical to the
// Python run on POSIX: inputs are normalised to LF (as Path.read_text() does)
// and written with LF regardless of platform.
//
// usage: node build/assemble.mjs [--out <dir>]
//   --out DIR  (or SC_ASSEMBLE_OUT=DIR) writes DIR/styleguide.html and
//              DIR/build/artifact/styleguide.html instead of the repo copies.
//              Inputs are always read from the repo.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, extname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const B = join(ROOT, 'build'), DS = ROOT;
const argv = process.argv.slice(2), flag = argv.indexOf('--out');
const OUT = flag >= 0 ? argv[flag + 1] : process.env.SC_ASSEMBLE_OUT || ROOT;
if (!OUT) { console.error('assemble: --out needs a directory'); process.exit(2); }
const ART = join(OUT, 'build', 'artifact');
mkdirSync(ART, { recursive: true });

const read = p => readFileSync(p, 'utf8').replace(/\r\n?/g, '\n');
const cssSys = read(join(DS, 'sc.css'));
const cssPage = read(join(B, 'styleguide-page.css'));
const theme = read(join(B, 'theme.js'));
const body = read(join(B, 'styleguide-body.html'));
const js = read(join(B, 'styleguide.js'));
const FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;700&family=Instrument+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">';

const repo = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>SpicyChicken Design System</title>
<meta name="description" content="Living style guide for the SpicyChicken design system: tokens, components and chart palettes, rendered in dark and light.">
<meta name="color-scheme" content="dark light">
<meta name="theme-color" content="#111F31">
<link rel="canonical" href="https://spicychicken59.github.io/design-system/styleguide.html">
<link rel="icon" href="assets/favicon.ico" sizes="16x16 32x32 48x48">
<link rel="icon" href="assets/sc-avatar-tile.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="assets/apple-touch-icon.png">
<meta property="og:type" content="website">
<meta property="og:title" content="SpicyChicken Design System">
<meta property="og:description" content="Living style guide for the SpicyChicken design system: tokens, components and chart palettes, rendered in dark and light.">
<meta property="og:image" content="https://spicychicken59.github.io/design-system/assets/favicon-512.png">
<meta property="og:url" content="https://spicychicken59.github.io/design-system/styleguide.html">
<meta name="twitter:card" content="summary">
${FONTS}
<link rel="stylesheet" href="sc.css">
<style>
${cssPage}</style>
<script>
${theme}</script>
</head>
<body>
${body}
<script>
${js}</script>
</body>
</html>
`;
writeFileSync(join(OUT, 'styleguide.html'), repo);

// sc-theme.js: the hosted theme script, next to sc.css. The same bytes as
// build/theme.js, under a version header that tracks the sc.css header.
const version = /sc\.css\s+v(\d+\.\d+\.\d+)/.exec(cssSys)?.[1] ?? '0.0.0';
writeFileSync(join(OUT, 'sc-theme.js'), `/* SpicyChicken Design System — sc-theme.js v${version} · source: build/theme.js · link it from <head> (before paint) or inline it */\n${theme}`);

// sc-charts.js: the chart primitives, same deal — one source, one version
// stream, no build step for consumers. Loads after sc.css; order-independent
// of sc-theme.js (both only merge into window.SC / read the sheet at call time).
const charts = read(join(B, 'charts.js'));
writeFileSync(join(OUT, 'sc-charts.js'), `/* SpicyChicken Design System — sc-charts.js v${version} · source: build/charts.js · needs sc.css; defer it or load at the end of <body> */\n${charts}`);
const map = read(join(B, 'map.js'));
writeFileSync(join(OUT, 'sc-map.js'), `/* SpicyChicken Design System — sc-map.js v${version} · source: build/map.js · projection, topojson and the pan/zoom view engine */\n${map}`);

// The skill bundle. The skill is what reaches every OTHER project, so its copy
// of the sheet is the one most likely to drift and the one that matters most
// when it does. Copy, never hand-maintain; check.mjs rule 13 enforces it.
{
  const SKILL = join(OUT, '.claude', 'skills', 'spicychicken-design-system');
  mkdirSync(join(SKILL, 'assets'), { recursive: true });
  mkdirSync(join(SKILL, 'references'), { recursive: true });
  // sc.css and starter.html are sources; the two scripts were just generated
  writeFileSync(join(SKILL, 'assets', 'sc.css'), cssSys);
  writeFileSync(join(SKILL, 'assets', 'starter.html'), read(join(DS, 'starter.html')));
  for (const f of ['sc-theme.js', 'sc-charts.js', 'sc-map.js']) writeFileSync(join(SKILL, 'assets', f), read(join(OUT, f)));
  for (const f of ['DESIGN_SYSTEM.md', 'PLAIN-HTML.md', 'CHECKLIST.md'])
    writeFileSync(join(SKILL, 'references', f), read(join(DS, f)));
}

// Artifact: no doctype/html/head/body — the publisher adds the skeleton.
const cssInline = cssSys.replaceAll("@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;700&family=Instrument+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');", '');
// The artifact can't reach assets/, so every <img src="assets/…"> becomes a data URI.
const inlineAssets = html => html.replace(/src="(assets\/[^"]+)"/g, (_, rel) => {
  const f = join(DS, rel);
  const mime = extname(f) === '.svg' ? 'image/svg+xml' : 'image/png';
  return `src="data:${mime};base64,${readFileSync(f).toString('base64')}"`;
});

const artBody = inlineAssets(body);
const art = `<title>SpicyChicken Design System</title>
${FONTS}
<style>
${cssInline}
${cssPage}</style>
<script>
${theme}</script>
${artBody}
<script>
${js}</script>
`;
writeFileSync(join(ART, 'styleguide.html'), art);
// Python's len() counts code points (and calls them bytes) — keep the same line.
const len = s => [...s].length;
console.log('repo:', len(repo), 'bytes · artifact:', len(art), 'bytes');
