// Existing mark artwork, composed as a repeat. No redrawing or recolouring.
// Standalone SVGs work in websites, document covers and design tools.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const flag = process.argv.indexOf('--out');
const out = flag < 0 ? root : process.argv[flag + 1];
mkdirSync(join(out, 'assets'), { recursive: true });
const css = readFileSync(join(root, 'sc.css'), 'utf8');
const colour = token => {
  const value = new RegExp(`--sc-${token}:\\s*([^;]+);`).exec(css)?.[1].trim();
  if (!value) throw new Error(`Missing brand token: ${token}`);
  const ref = /^var\(--sc-([\w-]+)\)$/.exec(value);
  return ref ? colour(ref[1]) : value;
};
const variants = [
  ['ink', 'sc-mark-mono-cream.svg', colour('ink'), '.10'],
  ['wine', 'sc-mark-mono-cream.svg', colour('brand-wine'), '.12'],
  ['paper', 'sc-mark-mono-ink.svg', colour('brand-paper'), '.07'],
];
for (const [name, file, fill, opacity] of variants) {
  const svg = readFileSync(join(root, 'assets', file), 'utf8');
  const inner = svg.replace(/^[\s\S]*?<svg\b[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  const result = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" width="1600" height="900">
<title>SpicyChicken ${name} brand pattern</title>
<defs><pattern id="chicks" width="200" height="225" patternUnits="userSpaceOnUse">
<g transform="translate(74,77) scale(.15)" opacity="${opacity}">${inner}</g>
</pattern></defs>
<path fill="${fill}" d="M0 0h1600v900H0z"/>
<path fill="url(#chicks)" d="M0 0h1600v900H0z"/>
</svg>\n`;
  writeFileSync(join(out, 'assets', `sc-pattern-${name}.svg`), result);
}
console.log('brand-assets: three patterns composed from the original mono marks');
