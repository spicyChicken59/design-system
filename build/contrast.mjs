// Contrast gate: parses sc.css, resolves every token in dark and light, and
// checks the pairs the system actually renders against WCAG 2 thresholds
// (4.5:1 text, 3:1 UI/graphics). Used by check.mjs; also a CLI:
//
//   node build/contrast.mjs [sc.css]      exit 1 on any failure
//
// Zero dependencies. Alpha tokens (rgba) are composited over their surface.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const block = (css, re) => {
  const m = css.match(re);
  if (!m) throw new Error('contrast: block not found: ' + re);
  const out = {};
  for (const d of m[1].matchAll(/(--sc-[\w-]+)\s*:\s*([^;]+);/g)) out[d[1]] = d[2].trim();
  return out;
};
const hex = (h) => { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map((c) => c + c).join(''); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); };
const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const lum = (rgb) => 0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2]);
export const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); };
const comp = (fg, a, bg) => fg.map((c, i) => c * a + bg[i] * (1 - a));

function resolve(name, vars, depth = 0) {
  const v = vars[name];
  if (v === undefined) throw new Error('contrast: undefined ' + name);
  if (depth > 10) throw new Error('contrast: reference loop at ' + name);
  const m = v.match(/^var\((--sc-[\w-]+)\)$/);
  return m ? resolve(m[1], vars, depth + 1) : v;
}
function toRgb(v, base) {
  if (v.startsWith('#')) return hex(v);
  const m = v.match(/rgba?\(([^)]+)\)/);
  if (m) { const p = m[1].split(',').map((s) => parseFloat(s)); const rgb = p.slice(0, 3); const a = p[3] ?? 1; return base ? comp(rgb, a, base) : rgb; }
  throw new Error('contrast: unparsable colour ' + v);
}

/** Runs every pair; returns { rows: [{mode,label,ratio,need,ok}], fails }. */
export function checkContrast(css) {
  const prim = block(css, /1\. PRIMITIVES[\s\S]*?:root \{([\s\S]*?)\n\}/);
  const dark = block(css, /2\. SEMANTIC — DARK[\s\S]*?:root \{([\s\S]*?)\n\}/);
  const light = block(css, /@media \(prefers-color-scheme: light\)(?:, print)? \{\s*:root:not\(\[data-theme="dark"\]\) \{([\s\S]*?)\n  \}/);
  const onInk = block(css, /ON-INK CONTEXT[\s\S]*?\.sc-on-ink \{([\s\S]*?)\n\}/);
  const op = parseFloat((css.match(/\.sc-eyebrow::before \{[^}]*opacity: (\.\d+|\d(?:\.\d+)?)/) || [0, '1'])[1]);
  const modes = { dark: { ...prim, ...dark }, light: { ...prim, ...dark, ...light } };
  const rows = [];
  let fails = 0;
  const check = (mode, label, fg, bg, need) => { const r = ratio(fg, bg); const ok = r >= need; if (!ok) fails++; rows.push({ mode, label, ratio: +r.toFixed(2), need, ok }); };
  for (const [mode, vars] of Object.entries(modes)) {
    const t = (n) => toRgb(resolve('--sc-' + n, vars));
    for (const s of ['bg', 'surface', 'raised', 'hover', 'brand-fill']) for (const fg of ['text', 'text-2', 'text-3', 'heading']) check(mode, `${fg} on ${s}`, t(fg), t(s), 4.5);
    for (const s of ['bg', 'surface', 'raised', 'brand-fill', 'accent-fill']) check(mode, `accent on ${s}`, t('accent'), t(s), 4.5);
    check(mode, 'on-accent on accent', t('on-accent'), t('accent'), 4.5);
    check(mode, 'on-accent on accent-hover', t('on-accent'), t('accent-hover'), 4.5);
    for (const s of ['bg', 'surface']) check(mode, `accent-hover on ${s}`, t('accent-hover'), t(s), 4.5);
    for (const st of ['danger', 'good', 'warn', 'info']) {
      check(mode, `${st} on ${st}-fill`, t(st), t(st + '-fill'), 4.5);
      check(mode, `${st} on bg`, t(st), t('bg'), 4.5);
      check(mode, `${st} on surface`, t(st), t('surface'), 4.5);
    }
    for (const s of ['surface', 'bg']) check(mode, `border-control vs ${s}`, t('border-control'), t(s), 3);
    for (const s of ['bg', 'surface']) check(mode, `focus vs ${s}`, t('focus'), t(s), 3);
    for (const s of ['bg', 'surface', 'brand-fill']) check(mode, `"//" prefix @${op} on ${s}`, comp(t('brand'), op, t(s)), t(s), 3);
    const ink = t('ink');
    for (const n of ['on-ink', 'on-ink-2', 'on-ink-3']) check(mode, `${n} on ink`, toRgb(resolve('--sc-' + n, vars), ink), ink, 4.5);
    const ctx = { ...vars, ...onInk };
    for (const n of ['heading', 'text', 'text-2', 'text-3', 'brand', 'brand-strong', 'accent', 'accent-hover']) check(mode, `on-ink context ${n} on ink`, toRgb(resolve('--sc-' + n, ctx), ink), ink, 4.5);
    check(mode, 'on-ink context focus vs ink', toRgb(resolve('--sc-focus', ctx), ink), ink, 3);
    const tc = (n) => toRgb(resolve('--sc-' + n, ctx), ink);
    check(mode, 'on-ink context on-accent on accent', tc('on-accent'), tc('accent'), 4.5);
    for (const [fg, bg] of [['brand', 'brand-fill'], ['accent', 'accent-fill'], ['info', 'info-fill'], ['good', 'good-fill'], ['warn', 'warn-fill'], ['danger', 'danger-fill'], ['heading', 'surface'], ['text', 'surface'], ['text-2', 'surface']]) check(mode, 'on-ink context ' + fg + ' on ' + bg, tc(fg), tc(bg), 4.5);
    for (const n of ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5', 'chart-emphasis', 'chart-context']) check(mode, `${n} vs surface`, t(n), t('surface'), 3);
  }
  return { rows, fails };
}

if (process.argv[1] && process.argv[1].endsWith("contrast.mjs")) {
  const here = dirname(fileURLToPath(import.meta.url));
  const file = process.argv[2] || join(here, '..', 'sc.css');
  const { rows, fails } = checkContrast(readFileSync(file, 'utf8').replace(/\r\n?/g, '\n'));
  for (const r of rows) console.log(`${r.mode.padEnd(5)} ${r.label.padEnd(40)} ${String(r.ratio).padStart(6)}  need ${r.need}  ${r.ok ? 'pass' : 'FAIL'}`);
  console.log(fails ? `\n${fails} FAILURES` : '\nALL PASS');
  process.exit(fails ? 1 : 0);
}
