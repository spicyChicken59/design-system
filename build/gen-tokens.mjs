// Generate tokens.json (W3C Design Tokens draft format) from sc.css.
//
// Primitives come from the first :root block; dark semantics from the :root
// block that declares --sc-bg; light semantics from the [data-theme="light"]
// block. Values are resolved to literals so the file imports cleanly into Figma
// variable plugins and Tokens Studio; the original var() reference is kept in
// $extensions.sc.ref for traceability. The light group is complete: every dark
// token light does not override is copied in and marked
// $extensions.sc.inherits = "dark".
//
// usage: node build/gen-tokens.mjs [sc.css] [tokens.json]
//        (both default to the repo root, relative to this script — not the cwd)
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve as abspath } from 'node:path';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..');
const cssPath = abspath(process.argv[2] ?? join(repo, 'sc.css'));
const out = abspath(process.argv[3] ?? join(repo, 'tokens.json'));

const css = readFileSync(cssPath, 'utf8').replace(/\r\n?/g, '\n');
const fail = msg => { throw new Error(`gen-tokens: ${msg} (${cssPath})`); };

// --- Locate the token blocks by content, not by comment headers ------------
// Ramps are the only names whose trailing digit means "step"; everything else
// with a trailing digit (text-2, on-ink-3, chart-seq-1's stem is a ramp) is a leaf.
const RAMPS = ['cobalt', 'spice', 'night', 'gray', 'wine', 'chart', 'chart-seq'];

// Every `<selector> { ... }` block (innermost braces only — token blocks never nest).
function blocks(selectorRe) {
  const found = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  for (const m of css.matchAll(re)) {
    const sel = m[1].replace(/\/\*[\s\S]*?\*\//g, '').trim().split(/\s*[\n,]\s*/).pop().trim();
    if (selectorRe.test(sel)) found.push({ sel, body: m[2] });
  }
  return found;
}
function parse(body) {
  const toks = new Map();
  for (const m of body.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/--sc-([a-z0-9-]+)\s*:\s*([^;]+);/g)) toks.set(m[1], m[2].trim());
  return toks;
}
const roots = blocks(/^:root$/).map(b => parse(b.body));
const prim = roots.find(t => t.has('cobalt-500')) ?? fail('primitives :root block not found');
const dark = roots.find(t => t.has('bg')) ?? fail('dark :root block not found');
const lightBlocks = blocks(/^:root\[data-theme="light"\]$/);
if (lightBlocks.length !== 1) fail(`expected one :root[data-theme="light"] block, found ${lightBlocks.length}`);
const light = parse(lightBlocks[0].body);

// --- Version from the header ("sc.css  v2.1.0") -----------------------------
const version = (/sc\.css\s+v(\d+\.\d+\.\d+)/.exec(css) ?? fail('version header "sc.css  vX.Y.Z" not found'))[1];

// --- Resolve var() chains (whole-value and embedded) ------------------------
function resolve(v, ...scopes) {
  let prev, cur = v;
  for (let i = 0; i < 20 && cur !== prev; i++) {
    prev = cur;
    cur = cur.replace(/var\(--sc-([a-z0-9-]+)\)/g, (whole, name) => {
      for (const s of scopes) if (s.has(name)) return s.get(name);
      return whole;
    });
  }
  return cur;
}

function typ(name, value) {
  if (name.startsWith('shadow')) return 'string';
  if (/^#[0-9a-f]{3,8}$/i.test(value) || /^rgba?\(/.test(value)) return 'color';
  if (name.startsWith('font-') && value.includes("'")) return 'fontFamily';
  if (/^-?[\d.]+px$/.test(value)) return 'dimension';
  if (/^-?[\d.]+ms$/.test(value)) return 'duration';
  if (value.startsWith('cubic-bezier')) return 'cubicBezier';
  if (name.startsWith('lh-')) return 'number';
  return 'string';
}

const setdefault = (m, k) => { if (!m.has(k)) m.set(k, new Map()); return m.get(k); };

// Build a group tree from a Map of name -> { raw, inherits? }.
function group(tokens, scopes) {
  const g = new Map();
  for (const [name, { raw, inherits }] of tokens) {
    const val = resolve(raw, ...scopes);
    const type = typ(name, val);
    // DTCG colours are hex: rgba() alpha tokens become #RRGGBBAA, the CSS form is kept in $extensions.sc.css.
    let out = type === 'number' ? Number(val) : val;
    const rgba = type === 'color' ? val.match(new RegExp('^rgba?[(]([^)]+)[)]' + '$')) : null;
    if (rgba) { const c = rgba[1].split(',').map(Number); const h = (n) => Math.round(n).toString(16).padStart(2, '0').toUpperCase(); out = '#' + h(c[0]) + h(c[1]) + h(c[2]) + (c.length > 3 ? h(c[3] * 255) : ''); }
    const entry = new Map([['$type', type], ['$value', out]]);
    const ext = {};
    if (raw !== val) ext.ref = raw;
    if (rgba) ext.css = val;
    if (inherits) ext.inherits = inherits;
    if (Object.keys(ext).length) entry.set('$extensions', { sc: ext });
    const parts = name.split('-'), last = parts[parts.length - 1], stem = parts.slice(0, -1).join('-');
    if (type === 'color') {
      if (/^[0-9]+$/.test(last) && RAMPS.includes(stem)) setdefault(setdefault(g, 'color'), stem).set(last, entry);
      else setdefault(g, 'color').set(name, entry);
    } else if (type === 'fontFamily') setdefault(g, 'font').set(name.replace(/^font-/, ''), entry);
    else if (['text-', 'h1', 'h2', 'h3', 'display', 'lh-'].some(p => name.startsWith(p))) setdefault(g, 'type').set(name, entry);
    else if (/^s\d+$/.test(name)) setdefault(g, 'space').set(name, entry);
    else if (name.startsWith('r-')) setdefault(g, 'radius').set(name.slice(2), entry);
    else if (name === 'motion' || name === 'ease') setdefault(g, 'motion').set(name, entry);
    else if (name.startsWith('w-')) setdefault(g, 'layout').set(name.slice(2), entry);
    else if (name.startsWith('shadow')) setdefault(g, 'shadow').set(name, entry);
    else setdefault(g, 'misc').set(name, entry);
  }
  return g;
}

const own = m => new Map([...m].map(([k, v]) => [k, { raw: v }]));
// Light = dark's order, light's value where it overrides, dark's (inherited) otherwise;
// light-only tokens (if any) follow.
const lightFull = new Map();
for (const [k, v] of dark) lightFull.set(k, light.has(k) ? { raw: light.get(k) } : { raw: v, inherits: 'dark' });
for (const [k, v] of light) if (!lightFull.has(k)) lightFull.set(k, { raw: v });

const doc = new Map([
  ['$schema', 'https://tr.designtokens.org/format/'],
  ['$description', 'SpicyChicken Design System tokens — generated from sc.css; edit the CSS, not this file.'],
  ['$extensions', { sc: { version, generated: 'sc.css' } }],
  ['primitive', group(own(prim), [prim])],
  ['semantic', new Map([
    ['dark', group(own(dark), [dark, prim])],
    ['light', group(lightFull, [light, dark, prim])],
  ])],
]);

// --- Validate -----------------------------------------------------------------
function validate(node, path = '$') {
  if (!(node instanceof Map)) return;
  const keys = [...node.keys()];
  if (node.has('$value')) {
    const bad = keys.filter(k => !k.startsWith('$'));
    if (bad.length) fail(`${path} has both $value and children [${bad.join(', ')}]`);
    const v = node.get('$value');
    if (node.get('$type') === 'number' && typeof v !== 'number') fail(`${path} is number-typed but $value is ${JSON.stringify(v)}`);
    if (typeof v === 'number' && !Number.isFinite(v)) fail(`${path} $value is not a finite number`);
    if (typeof v === 'string' && v.includes('var(')) fail(`${path} has an unresolved reference: ${v}`);
  }
  for (const [k, v] of node) validate(v, `${path}.${k}`);
}
validate(doc);

// --- Serialise (Maps in insertion order — integer-like keys must not hoist) ---
function dumps(v, ind = '') {
  const inner = ind + '  ';
  if (Array.isArray(v)) return v.length ? `[\n${v.map(x => inner + dumps(x, inner)).join(',\n')}\n${ind}]` : '[]';
  if (v instanceof Map || (v && typeof v === 'object')) {
    const entries = v instanceof Map ? [...v] : Object.entries(v);
    return entries.length ? `{\n${entries.map(([k, x]) => `${inner}${JSON.stringify(k)}: ${dumps(x, inner)}`).join(',\n')}\n${ind}}` : '{}';
  }
  return JSON.stringify(v);
}

const text = dumps(doc) + '\n';
writeFileSync(out, text, 'utf8'); // LF, UTF-8
const n = (text.match(/"\$value"/g) ?? []).length;
console.log(`wrote ${out} — v${version}, ${n} tokens (${prim.size} primitive, ${dark.size} dark, ${lightFull.size} light of which ${lightFull.size - light.size} inherited)`);
