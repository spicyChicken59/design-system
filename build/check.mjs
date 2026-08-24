// The pre-ship gate. Zero dependencies; Node >= 20.
//
//   node build/check.mjs
//
// Asserts, and exits 1 with a list if any fails:
//   1. one version stream — sc.css header == package.json == react/package.json
//      == react/package-lock.json == every vX.Y.Z in the style guide body,
//      index.html and sc-theme.js, and every jsDelivr @vX.Y.Z pin in the docs;
//      the newest changelog entry in AUDIT-AND-ROADMAP.md §5 is that version;
//   2. generated files are fresh — tokens.json, styleguide.html and sc-theme.js
//      equal a regeneration into a temp dir (line endings ignored);
//   3. the theme script has one source — starter.html inlines build/theme.js
//      verbatim and sc-theme.js carries it;
//   4. the two light-mode token blocks in sc.css are identical;
//   5. vocabulary — every sc-* / is-* class used by build/styleguide-body.html,
//      build/styleguide.js, starter.html and react/src/*.tsx exists as a
//      selector in sc.css (template prefixes such as `sc-btn--${kind}` match
//      by prefix);
//   6. no CRLF in the source and generated files (.gitattributes);
//   7. page hygiene — the guide's page CSS/body use semantic tokens only (no hex,
//      rgba(), primitives) and starter.html has no inline styles;
//   8. the contrast pairs the system renders pass (text >= 4.5:1, UI >= 3:1),
//      via build/contrast.mjs.
import { readFileSync, readdirSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { checkContrast } from './contrast.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const norm = s => s.replace(/\r\n?/g, '\n');
const read = p => norm(readFileSync(join(ROOT, p), 'utf8'));
const problems = [];
const fail = (m) => problems.push(m);
const ok = (m) => console.log('  ok  ' + m);

// --- 1. version -------------------------------------------------------------
const css = read('sc.css');
const V = /sc\.css\s+v(\d+\.\d+\.\d+)/.exec(css)?.[1];
if (!V) fail('sc.css: no "sc.css  vX.Y.Z" header');
const pkgV = (p) => { try { return JSON.parse(read(p)).version; } catch { return undefined; } };
for (const p of ['package.json', 'react/package.json', 'react/package-lock.json']) {
  const v = pkgV(p);
  if (v !== V) fail(`${p}: version ${v} != sc.css ${V}`);
}
const versionsIn = (text) => [...text.matchAll(/\bv(\d+\.\d+\.\d+)\b/g)].map(m => m[1]);
for (const p of ['build/styleguide-body.html', 'index.html', 'sc-theme.js']) {
  if (!existsSync(join(ROOT, p))) { fail(`${p}: missing`); continue; }
  const stale = versionsIn(read(p)).filter(v => v !== V);
  if (stale.length) fail(`${p}: mentions v${[...new Set(stale)].join(', v')} (current is v${V})`);
}
for (const p of ['README.md', 'DESIGN_SYSTEM.md', 'CHECKLIST.md', 'PLAIN-HTML.md']) {
  if (!existsSync(join(ROOT, p))) continue;
  const pins = [...read(p).matchAll(/design-system@v(\d+\.\d+\.\d+)/g)].map(m => m[1]).filter(v => v !== V);
  if (pins.length) fail(`${p}: jsDelivr pin @v${[...new Set(pins)].join(', @v')} (current is v${V})`);
}
{
  const log = read('AUDIT-AND-ROADMAP.md');
  const top = /^- \*\*(\d+\.\d+\.\d+) \(/m.exec(log)?.[1];
  if (top !== V) fail(`AUDIT-AND-ROADMAP.md §5: newest changelog entry is ${top}, sc.css is ${V}`);
}
if (!problems.length) ok(`version v${V} everywhere`);

// --- 2. generated files are fresh ------------------------------------------
{
  const before = problems.length;
  const tmp = mkdtempSync(join(tmpdir(), 'sc-check-'));
  try {
    execFileSync(process.execPath, [join(HERE, 'gen-tokens.mjs'), join(ROOT, 'sc.css'), join(tmp, 'tokens.json')], { stdio: 'pipe' });
    execFileSync(process.execPath, [join(HERE, 'assemble.mjs'), '--out', tmp], { stdio: 'pipe' });
    for (const f of ['tokens.json', 'styleguide.html', 'sc-theme.js']) {
      const fresh = norm(readFileSync(join(tmp, f), 'utf8'));
      if (!existsSync(join(ROOT, f))) fail(`${f}: missing — run npm run build`);
      else if (read(f) !== fresh) fail(`${f}: stale — differs from a fresh generation; run npm run build`);
    }
  } catch (e) {
    fail(`regeneration failed: ${e.stderr?.toString().trim() || e.message}`);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
  if (problems.length === before) ok('tokens.json, styleguide.html, sc-theme.js are fresh');
}

// --- 3. one theme script -----------------------------------------------------
{
  const before = problems.length;
  const theme = read('build/theme.js').trim();
  if (!read('starter.html').includes(theme)) fail('starter.html: inline theme script differs from build/theme.js');
  if (existsSync(join(ROOT, 'sc-theme.js')) && !read('sc-theme.js').includes(theme)) fail('sc-theme.js: body differs from build/theme.js');
  if (problems.length === before) ok('starter.html and sc-theme.js carry build/theme.js verbatim');
}

// --- 4. the two light blocks agree ------------------------------------------
{
  const block = (re) => { const m = re.exec(css); return m ? m[1].split('\n').map(l => l.trim()).filter(Boolean).join('\n') : null; };
  const media = block(/@media \(prefers-color-scheme: light\)(?:, print)? \{\s*:root:not\(\[data-theme="dark"\]\) \{([^}]*)\}/);
  const pinned = block(/:root\[data-theme="light"\] \{([^}]*)\}/);
  if (!media || !pinned) fail('sc.css: could not locate both light-mode token blocks');
  else if (media !== pinned) fail('sc.css: the @media light block and the [data-theme="light"] block differ');
  else ok('light-mode token blocks are identical');
}

// --- 5. vocabulary -----------------------------------------------------------
{
  const selectors = (text) => new Set([...text.matchAll(/\.((?:sc|is)-[A-Za-z0-9_-]+)/g)].map(m => m[1]));
  const defined = selectors(css);
  // The guide's own page CSS may add guide-only state classes (.is-active nav,
  // .is-focus held ring); they count for the guide's files, not for the starter
  // or the wrappers.
  const guideOnly = selectors(read('build/styleguide-page.css'));
  const GUIDE_FILES = new Set(['build/styleguide-body.html', 'build/styleguide.js']);
  // Identifiers that look like classes but are not: the storage key and asset
  // file stems.
  const NOT_CLASSES = /^(sc-theme$|sc-(mark|lockup|avatar)-)/;
  const used = new Map(); // token -> Set(files)
  const note = (tok, file) => {
    tok = tok.replace(/\$\{.*$/, '').trim();
    if (!tok || NOT_CLASSES.test(tok)) return;
    if (!/^(sc|is)-[a-z0-9]/.test(tok)) return;
    if (GUIDE_FILES.has(file) && guideOnly.has(tok)) return;
    if (!used.has(tok)) used.set(tok, new Set());
    used.get(tok).add(file);
  };
  const scanHtml = (file) => {
    const src = read(file);
    for (const m of src.matchAll(/class=(?:"([^"]*)"|'([^']*)')/g)) for (const t of (m[1] ?? m[2]).split(/\s+/)) if (/^(sc|is)-/.test(t)) note(t, file);
  };
  const scanScript = (file) => {
    const src = read(file);
    scanHtml(file); // template-literal markup
    for (const m of src.matchAll(/['"`]((?:sc|is)-[A-Za-z0-9_-]+(?:\$\{)?)/g)) note(m[1], file);
    for (const m of src.matchAll(/classList\.(?:add|remove|toggle|contains)\(\s*['"]((?:sc|is)-[A-Za-z0-9_-]+)['"]/g)) note(m[1], file);
  };
  scanHtml('build/styleguide-body.html');
  scanHtml('starter.html');
  scanScript('build/styleguide.js');
  for (const f of readdirSync(join(ROOT, 'react', 'src'))) if (/\.tsx?$/.test(f) && !/generated/.test(f)) scanScript(join('react', 'src', f));
  const missing = [];
  for (const [tok, files] of used) {
    const hit = tok.endsWith('-') ? [...defined].some(d => d.startsWith(tok)) : defined.has(tok);
    if (!hit) missing.push(`${tok} (${[...files].join(', ')})`);
  }
  if (missing.length) fail(`classes used but not defined in sc.css:\n      ${missing.sort().join('\n      ')}`);
  else ok(`${used.size} sc-*/is-* classes used by the guide, starter and wrappers all exist in sc.css`);
}

// --- 6. line endings ----------------------------------------------------------
{
  const CR = String.fromCharCode(13);
  const bad = ['sc.css', 'starter.html', 'index.html', 'tokens.json', 'sc-theme.js', 'styleguide.html', 'build/theme.js']
    .filter(f => existsSync(join(ROOT, f)) && readFileSync(join(ROOT, f), 'utf8').includes(CR));
  if (bad.length) fail('CRLF line endings in: ' + bad.join(', ') + ' (see .gitattributes)');
  else ok('source and generated files are LF');
}

// --- 7. page hygiene -----------------------------------------------------------
{
  const before = problems.length;
  const rules = [[/#[0-9a-fA-F]{3,8}(?![0-9a-zA-Z])/g, 'hex colour'], [/rgba?[(]/g, 'raw rgba()'], [/--sc-(cobalt|spice|night|gray|wine)-/g, 'primitive token']];
  for (const f of ['build/styleguide-page.css', 'build/styleguide-body.html']) {
    const t = read(f), hits = [];
    for (const [re, what] of rules) { const m = t.match(re); if (m) hits.push(m.length + ' ' + what + (m.length > 1 ? 's' : '') + ' (' + [...new Set(m)].slice(0, 4).join(', ') + ')'); }
    if (hits.length) fail(f + ': ' + hits.join('; ') + ' — page CSS references semantic tokens only');
  }
  const styles = read('starter.html').match(/ style=/g);
  if (styles) fail('starter.html: ' + styles.length + ' inline style attribute(s) — use the system classes');
  if (problems.length === before) ok('page CSS and the starter use semantic tokens only, no inline styles');
}

// --- 8. contrast ---------------------------------------------------------------
{
  try {
    const { rows, fails } = checkContrast(css);
    if (fails) fail('contrast: ' + fails + ' pair(s) below threshold:' + rows.filter(r => !r.ok).map(r => String.fromCharCode(10) + '      ' + r.mode + ' ' + r.label + ' ' + r.ratio + ' (need ' + r.need + ')').join(''));
    else ok(rows.length + ' contrast pairs pass (text >= 4.5:1, ui >= 3:1)');
  } catch (e) { fail('contrast: ' + e.message); }
}

if (problems.length) {
  console.error(`\ncheck: ${problems.length} problem${problems.length > 1 ? 's' : ''}`);
  for (const p of problems) console.error('  -  ' + p);
  process.exit(1);
}
console.log('check: all good');
