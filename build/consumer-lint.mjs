// Lint a consumer page against sc.css. Zero dependencies; Node >= 20.
//
//   node build/consumer-lint.mjs ../SpicyCar/docs/index.html [more.html ...]
//
// Reports, in the order that matters:
//   1. SQUAT   — the page defines an .sc-* rule the sheet does not own. A name
//                in the system's namespace that the system does not know about
//                will collide the day the system claims it, and the page wins
//                the tie by source order, so the sheet's version arrives dead.
//   2. UNKNOWN — the markup uses an sc-* class the sheet does not define. A typo,
//                or a class that was renamed upstream and never followed here.
//   3. OVERRIDE— the page redefines a rule the sheet owns. Sometimes right, but
//                each one is a decision the system did not get to make.
//   4. HYGIENE — a raw colour where a token belongs.
//   5. PROMOTE — a page-local rule that uses only semantic tokens and no page
//                identity (no #id, no app words). A promotion candidate.
//
// Exits 0 unless --strict: this is a conversation with the consumer, not a gate.
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, basename } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const read = (p) => readFileSync(p, 'utf8').replace(/\r\n?/g, '\n');

// importable as a module (the gate checks this linter against its own fixture),
// so the CLI only runs when this file is the entry point
const isCLI = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
const argv = process.argv.slice(2);
const strict = argv.includes('--strict');
const files = argv.filter((a) => !a.startsWith('--'));
if (isCLI && !files.length) { console.error('usage: node build/consumer-lint.mjs <page.html> [...] [--strict]'); process.exit(2); }

const strip = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');
// every `selector { body }` in a stylesheet. The inner-most braces match first,
// so an @media wrapper falls out as a selector with no class in it and is
// skipped naturally — no at-rule bookkeeping needed.
const rules = (css) => [...strip(css).matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  .map((m) => ({ sel: m[1].trim().replace(/\s+/g, ' '), body: m[2] }))
  .filter((r) => r.sel && !r.sel.startsWith('@'));
const classesIn = (sel) => [...sel.matchAll(/\.([A-Za-z0-9_-]+)/g)].map((m) => m[1]);
// only the LAST compound of a selector receives the declarations: in
// `.sc-media__foot .flags { … }` it is .flags that is being styled, and
// .sc-media__foot is only context.
const targetsOf = (sel) => sel.split(',').flatMap((one) =>
  classesIn(one.trim().split(/\s+(?![^(]*\))/).pop() || ''));
const propsIn = (body) => [...body.matchAll(/(?:^|;)\s*([a-z-]+)\s*:/g)].map((m) => m[1]);

const sheet = read(join(ROOT, 'sc.css'));
const sheetClasses = new Set();
const sheetProps = new Map();       // class -> Set(property it is given by the sheet)
for (const { sel, body } of rules(sheet)) {
  for (const c of classesIn(sel)) sheetClasses.add(c);
  const props = propsIn(body);
  for (const c of targetsOf(sel)) {
    if (!sheetProps.has(c)) sheetProps.set(c, new Set());
    for (const p of props) sheetProps.get(c).add(p);
  }
}

const APP_WORD = /#[A-Za-z]/;                       // an id anchors a rule to one page
const RAW_COLOUR = /#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/;
const PRIMITIVE = /var\(--sc-(cobalt|spice|night|slate|white|black)-/;

export function analyse(html) {
  const styles = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('\n');
  const squat = [], unknown = [], override = [], hygiene = [], promote = [];

  // --- page rules -----------------------------------------------------------
  for (const { sel, body } of rules(styles)) {
    const props = propsIn(body);
    const targets = targetsOf(sel);
    for (const c of targets) {
      if (!c.startsWith('sc-')) continue;
      if (!sheetClasses.has(c)) { squat.push(`.${c}   in  ${sel}`); continue; }
      const owned = sheetProps.get(c) || new Set();
      const clash = props.filter((p) => owned.has(p));
      if (clash.length) override.push(`${sel}   redefines ${clash.join(', ')}`);
    }
    if (RAW_COLOUR.test(body)) hygiene.push(`${sel}   ${(body.match(RAW_COLOUR) || [])[0]}  — use a semantic token`);
    if (PRIMITIVE.test(body)) hygiene.push(`${sel}   reaches a primitive directly`);
    // a rule that already fails hygiene is not a candidate for anything
    if (!APP_WORD.test(sel) && !targets.some((c) => c.startsWith('sc-')) && targets.length
        && !RAW_COLOUR.test(body) && !PRIMITIVE.test(body) && body.includes('var(--sc-')) promote.push(sel);
  }

  // --- classes the markup uses --------------------------------------------
  const used = new Set();
  for (const m of html.matchAll(/class(?:Name)?\s*[:=]\s*["'`]([^"'`]*)["'`]/g))
    for (const c of m[1].split(/\s+/)) if (c.startsWith('sc-')) used.add(c);
  for (const m of html.matchAll(/['"`](sc-[A-Za-z0-9_-]+)\s*['"`+]/g)) used.add(m[1]);
  // `'sc-chart__series--' + kind` is a prefix, not a class; the sheet is checked
  // for the concrete names it builds, not for the stem
  for (const c of [...used].sort()) if (!c.endsWith('-') && !sheetClasses.has(c)) unknown.push(c);

  return { squat, unknown, override, hygiene, promote };
}

let findings = 0;
for (const file of isCLI ? files : []) {
  if (!existsSync(file)) { console.error(`  ??  ${file}: not found`); continue; }
  const { squat, unknown, override, hygiene, promote } = analyse(read(file));
  const name = basename(file);
  const block = (label, list, hint) => {
    if (!list.length) return;
    findings += list.length;
    console.log(`\n  ${label}  ${name} — ${list.length}`);
    if (hint) console.log(`      ${hint}`);
    for (const l of [...new Set(list)].slice(0, 20)) console.log('      - ' + l);
    if (new Set(list).size > 20) console.log(`      … and ${new Set(list).size - 20} more`);
  };
  block('SQUAT   ', squat,    'the page owns a name in the system namespace — promote it or rename it');
  block('UNKNOWN ', unknown,  'used in markup, not defined in sc.css — a typo or a rename that was not followed');
  block('OVERRIDE', override, 'the page is deciding something the system already decided');
  block('HYGIENE ', hygiene,  'semantic tokens only');
  block('CANDIDATE', promote, 'no page identity, tokens only — worth ASKING whether it is generic, not proof that it is');
  if (!squat.length && !unknown.length && !override.length && !hygiene.length)
    console.log(`  ok  ${name} — no squats, no unknown classes, no overrides, no raw colour`
      + (promote.length ? ` (${promote.length} promotion candidate${promote.length > 1 ? 's' : ''})` : ''));
}
if (isCLI) {
  console.log(`\nconsumer-lint: ${findings} finding${findings === 1 ? '' : 's'}`);
  process.exit(strict && findings ? 1 : 0);
}
