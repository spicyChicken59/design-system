// Game shell checks, dependency-free, each family with deliberate negative
// controls: the optional sc-game.js runtime in a fake DOM, the truncating
// formatters at their boundaries, the specimen's markup contract, and the
// opt-in CSS band. Rendered geometry is build/game-render-check.mjs's job.
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { gameStage, gameNotes, gameGuide } from './game-examples.mjs';

const root = new URL('../', import.meta.url);
const source = readFileSync(process.argv[2] || new URL('sc-game.js', root), 'utf8');
let checks = 0;
async function check(name, run) { try { await run(); checks++; } catch (e) { const was = e.message; e.message = `${name}: ${was}`; if (typeof e.stack === 'string') e.stack = e.stack.replace(was, e.message); throw e; } }
// SC_EXPLAIN=1 prints the assertion each negative control trips, to confirm it fails for its own reason.
const rejects = (label, run) => assert.throws(run, e => { if (process.env.SC_EXPLAIN) console.log(`  rejected ${label}: ${e.message.split('\n')[0]}`); return true; }, `negative control was accepted: ${label}`);

// ---------------------------------------------------------------- fake DOM --
class Node {
  constructor(attrs = {}) { this.attrs = new Map(Object.entries(attrs)); this.events = new Map(); this.added = []; this.focused = 0; }
  getAttribute(n) { return this.attrs.has(n) ? this.attrs.get(n) : null; }
  hasAttribute(n) { return this.attrs.has(n); }
  setAttribute(n, v) { this.attrs.set(n, String(v)); }
  removeAttribute(n) { this.attrs.delete(n); }
  addEventListener(type, fn) { this.added.push(type); const set = this.events.get(type) || new Set(); set.add(fn); this.events.set(type, set); }
  removeEventListener(type, fn) { this.events.get(type)?.delete(fn); }
  listenerCount() { return [...this.events.values()].reduce((n, set) => n + set.size, 0); }
  fire(type) { const event = { type, target: this, prevented: false, preventDefault() { this.prevented = true; } }; [...(this.events.get(type) || [])].forEach(fn => fn(event)); return event; }
  focus() { this.focused++; }
}
const flush = () => new Promise(resolve => setTimeout(resolve, 0));
function environment({ mode = 'promise', missing = false, previous, src = source } = {}) {
  const window = new Node(), document = new Node();
  document.defaultView = window; window.document = document;
  document.pointerLockElement = null; document.exits = 0;
  document.exitPointerLock = () => { document.exits++; document.pointerLockElement = null; };
  const canvas = new Node(); canvas.ownerDocument = document; canvas.calls = 0;
  if (!missing) canvas.requestPointerLock = () => {
    canvas.calls++;
    if (mode === 'throw') throw new Error('synchronous refusal');
    if (mode === 'reject') return Promise.reject(Object.assign(new Error('refused'), { name: 'NotAllowedError' }));
    if (mode === 'void') return undefined;
    return Promise.resolve();
  };
  const stage = new Node(previous === undefined ? {} : { 'data-sc-capture': previous });
  stage.ownerDocument = document;
  stage.querySelector = selector => selector === '.sc-game__canvas' ? canvas : null;
  const resume = new Node();
  vm.runInNewContext(src, { window, WeakMap, Promise, Error, TypeError, Object, BigInt, Math, String, isFinite });
  const log = [];
  const options = { resumeControl: resume, onCapture: () => log.push('capture'), onRelease: reason => log.push('release:' + reason), onDenied: error => log.push('denied:' + (error && error.message)) };
  const lock = () => { document.pointerLockElement = canvas; document.fire('pointerlockchange'); };
  const unlock = () => { document.pointerLockElement = null; document.fire('pointerlockchange'); };
  return { window, document, canvas, stage, resume, log, options, lock, unlock, game: window.SC.game };
}
const listeners = e => e.window.listenerCount() + e.document.listenerCount() + e.canvas.listenerCount() + e.stage.listenerCount();
const everAdded = e => [...e.window.added, ...e.document.added, ...e.canvas.added, ...e.stage.added];

await check('loading registers SC.game and adds no listener, attribute or request', () => {
  const e = environment();
  assert.equal(typeof e.game.capture, 'function'); assert.equal(typeof e.game.formatElapsed, 'function'); assert.equal(typeof e.game.formatMeasure, 'function');
  assert.equal(listeners(e), 0); assert.equal(e.stage.getAttribute('data-sc-capture'), null); assert.equal(e.canvas.calls, 0);
});
await check('capture() listens on the target document and window, sets idle and requests nothing', () => {
  const e = environment(); const c = e.game.capture(e.stage, e.options);
  assert.equal(c.state, 'idle'); assert.equal(e.stage.getAttribute('data-sc-capture'), 'idle'); assert.equal(e.canvas.calls, 0);
  assert.deepEqual([...e.document.events.keys()].sort(), ['pointerlockchange', 'pointerlockerror']); assert.deepEqual([...e.window.events.keys()], ['blur']);
});
await check('the default target is the stage canvas, and one controller serves one stage', () => {
  const e = environment(); const c = e.game.capture(e.stage, e.options);
  assert.equal(e.game.capture(e.stage, {}), c); assert.equal(listeners(e), 3);
  c.request(); assert.equal(e.canvas.calls, 1);
});
// options.target: the element asked to lock, and the only lock that counts.
function customTarget(src) {
  const e = environment({ src }), other = new Node(); other.ownerDocument = e.document; other.calls = 0;
  other.requestPointerLock = () => { other.calls++; return Promise.resolve(); };
  const c = e.game.capture(e.stage, { ...e.options, target: other }); c.request();
  assert.equal(other.calls, 1, 'options.target is the element asked to lock'); assert.equal(e.canvas.calls, 0, 'the default canvas is not asked');
  e.lock(); assert.equal(c.state, 'requesting', 'a lock on the default canvas is not this capture');
  e.document.pointerLockElement = other; e.document.fire('pointerlockchange'); assert.equal(c.state, 'captured', 'a lock on options.target is');
}
await check('options.target replaces the default canvas', () => {
  customTarget(source);
  const ignoring = source.replace("var target = options.target || (stage.querySelector", "var target = (stage.querySelector");
  assert.notEqual(ignoring, source, 'planted: a runtime that ignores options.target');
  rejects('a runtime that ignores options.target', () => customTarget(ignoring));
});
await check('request() locks through pointerlockchange: requesting -> captured, onCapture once', async () => {
  const e = environment(); const c = e.game.capture(e.stage, e.options);
  c.request(); assert.equal(c.state, 'requesting'); assert.equal(e.stage.getAttribute('data-sc-capture'), 'requesting');
  c.request(); assert.equal(e.canvas.calls, 1, 'a second request while requesting is ignored');
  e.lock(); await flush();
  assert.equal(c.state, 'captured'); assert.deepEqual(e.log, ['capture']); assert.equal(e.resume.focused, 0);
});
await check('a browser exit while captured releases with escape and restores focus', async () => {
  const e = environment(); const c = e.game.capture(e.stage, e.options); c.request(); e.lock(); e.unlock();
  assert.equal(c.state, 'released'); assert.equal(e.stage.getAttribute('data-sc-capture'), 'released');
  assert.deepEqual(e.log, ['capture', 'release:escape']); assert.equal(e.resume.focused, 1);
});
await check('a rejected promise is denied, reported and hands focus back', async () => {
  const e = environment({ mode: 'reject' }); const c = e.game.capture(e.stage, e.options); c.request(); await flush();
  assert.equal(c.state, 'denied'); assert.deepEqual(e.log, ['denied:refused']); assert.equal(e.resume.focused, 1);
});
await check('pointerlockerror is denied once even when the promise also rejects', async () => {
  const e = environment({ mode: 'reject' }); const c = e.game.capture(e.stage, e.options); c.request(); e.document.fire('pointerlockerror'); await flush();
  assert.equal(c.state, 'denied'); assert.equal(e.log.length, 1); assert(e.log[0].startsWith('denied:')); assert.equal(e.resume.focused, 1);
});
await check('the legacy void form succeeds through pointerlockchange', () => {
  const e = environment({ mode: 'void' }); const c = e.game.capture(e.stage, e.options); c.request(); assert.equal(c.state, 'requesting'); e.lock();
  assert.equal(c.state, 'captured'); assert.deepEqual(e.log, ['capture']);
});
await check('the legacy void form fails through pointerlockerror', () => {
  const e = environment({ mode: 'void' }); const c = e.game.capture(e.stage, e.options); c.request(); e.document.fire('pointerlockerror');
  assert.equal(c.state, 'denied'); assert.equal(e.resume.focused, 1);
});
await check('a synchronous throw and a missing API are both denied, never thrown', () => {
  for (const variant of [{ mode: 'throw' }, { missing: true }]) {
    const e = environment(variant); const c = e.game.capture(e.stage, e.options);
    assert.doesNotThrow(() => c.request()); assert.equal(c.state, 'denied'); assert.equal(e.log.length, 1); assert.equal(e.resume.focused, 1);
  }
});
await check('a late rejection after capture does not deny', async () => {
  const e = environment(); const c = e.game.capture(e.stage, e.options);
  e.canvas.requestPointerLock = () => { e.canvas.calls++; e.lock(); return Promise.reject(new Error('late')); };
  c.request(); await flush(); assert.equal(c.state, 'captured'); assert.deepEqual(e.log, ['capture']);
});
await check('window blur while captured releases with blur and exits the lock', () => {
  const e = environment(); const c = e.game.capture(e.stage, e.options); c.request(); e.lock(); e.window.fire('blur');
  assert.equal(c.state, 'released'); assert.deepEqual(e.log, ['capture', 'release:blur']); assert.equal(e.document.exits, 1); assert.equal(e.resume.focused, 1);
  e.document.fire('pointerlockchange'); assert.equal(e.log.length, 2, 'the follow-up unlock event does not release twice');
});
await check('blur while not captured does nothing', () => {
  const e = environment(); const c = e.game.capture(e.stage, e.options); e.window.fire('blur'); c.request(); e.window.fire('blur');
  assert.equal(c.state, 'requesting'); assert.deepEqual(e.log, []); assert.equal(e.document.exits, 0);
});
await check('release() exits programmatically with api, once', () => {
  const e = environment(); const c = e.game.capture(e.stage, e.options); c.release(); assert.equal(e.document.exits, 0, 'release before capture is a no-op');
  c.request(); e.lock(); c.release(); assert.equal(c.state, 'released'); assert.equal(e.document.exits, 1);
  e.document.fire('pointerlockchange'); assert.deepEqual(e.log, ['capture', 'release:api']); assert.equal(e.resume.focused, 1);
});
await check('a lock on another element is not a capture', () => {
  const e = environment(); const c = e.game.capture(e.stage, e.options); c.request(); e.document.pointerLockElement = new Node(); e.document.fire('pointerlockchange');
  assert.equal(c.state, 'requesting'); assert.deepEqual(e.log, []);
});
await check('dispose() removes every listener and the attribute, exits a held lock and stays silent', () => {
  const e = environment(); const c = e.game.capture(e.stage, e.options); c.request(); e.lock();
  c.dispose(); c.dispose();
  assert.equal(listeners(e), 0); assert.equal(e.stage.getAttribute('data-sc-capture'), null); assert.equal(e.document.exits, 1);
  e.unlock(); e.window.fire('blur'); c.request(); assert.equal(e.canvas.calls, 1); assert.deepEqual(e.log, ['capture']);
  assert.notEqual(e.game.capture(e.stage, e.options), c, 'a disposed stage can mount a fresh controller');
});
await check('dispose() restores a previous data-sc-capture value', () => {
  const e = environment({ previous: 'consumer-value' }); const c = e.game.capture(e.stage, e.options);
  assert.equal(e.stage.getAttribute('data-sc-capture'), 'idle'); c.dispose(); assert.equal(e.stage.getAttribute('data-sc-capture'), 'consumer-value');
});
// dispose() while a request is in flight: a lock the browser grants afterwards
// must not leave the pointer hidden with nothing to release it.
async function lateLock(src, mode) {
  const e = environment({ mode, src }); const c = e.game.capture(e.stage, e.options);
  c.request(); assert.equal(c.state, 'requesting'); c.dispose(); await flush();
  e.lock(); await flush();
  assert.equal(e.document.pointerLockElement, null, `a lock granted after dispose() is exited (${mode})`);
  assert.equal(e.document.exits, 1); assert.equal(listeners(e), 0, 'the late-lock guard removes itself');
  assert.deepEqual(e.log, [], 'a disposed controller reports nothing'); assert.equal(e.stage.getAttribute('data-sc-capture'), null);
}
await check('dispose() mid-request exits a lock granted afterwards, and the guard cleans up after itself', async () => {
  for (const mode of ['promise', 'void']) await lateLock(source, mode);
  const refused = environment({ mode: 'void' }); const r = refused.game.capture(refused.stage, refused.options); r.request(); r.dispose();
  refused.document.fire('pointerlockerror'); assert.equal(listeners(refused), 0, 'a refusal after dispose() removes the guard too'); assert.equal(refused.document.exits, 0);
  const rejected = environment({ mode: 'reject' }); const j = rejected.game.capture(rejected.stage, rejected.options); j.request(); j.dispose(); await flush();
  assert.equal(listeners(rejected), 0, 'a rejected promise after dispose() removes the guard');
  const n = environment({ mode: 'void' }); const old = n.game.capture(n.stage, n.options); old.request(); old.dispose();
  const fresh = n.game.capture(n.stage, n.options); n.lock();
  assert.equal(fresh.state, 'captured', 'a controller mounted afterwards adopts the late lock'); assert.equal(n.document.exits, 0); assert.equal(listeners(n), 3);
  const leaky = source.replace("else if (state === 'requesting') guard(pending);", '');
  assert.notEqual(leaky, source, 'planted: a dispose() that forgets a pending request');
  for (const mode of ['promise', 'void']) await assert.rejects(lateLock(leaky, mode), undefined, `negative control was accepted: a dispose() that forgets a pending request (${mode})`);
});
// One scan, used by the assertion and by its negative control.
const code = src => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const keyFreeSource = src => !/preventDefault|keydown|keyup|keypress/.test(code(src));
async function assertKeyFree(src, { scan = true } = {}) {
  const e = environment({ mode: 'reject', src }); const c = e.game.capture(e.stage, e.options); c.request(); await flush();
  const prevented = [e.document.fire('pointerlockchange'), e.document.fire('pointerlockerror'), e.window.fire('blur')].some(event => event.prevented);
  assert(!prevented, 'no preventDefault'); assert(!everAdded(e).some(type => /^key/.test(type)), 'no keydown/keyup/keypress listener');
  if (scan) assert(keyFreeSource(src), 'the source names no key event and no preventDefault');
}
await check('the runtime never adds a key listener and never calls preventDefault', async () => {
  await assertKeyFree(source);
  const planted = source.replace("listen(view, 'blur', onBlur);", "listen(view, 'blur', onBlur); listen(doc, 'keydown', function (event) { event.preventDefault(); });");
  assert.notEqual(planted, source, 'planted: a runtime that listens for keydown');
  await assert.rejects(assertKeyFree(planted, { scan: false }), undefined, 'negative control was accepted: the running runtime adds a keydown listener');
  rejects('a source that names keydown', () => assert(keyFreeSource(planted)));
});
await check('capture() needs a stage and a target', () => {
  const e = environment(); assert.throws(() => e.game.capture(null)); const bare = new Node(); bare.querySelector = () => null; assert.throws(() => e.game.capture(bare, {}));
});

// ------------------------------------------------------------- formatters --
const { formatElapsed, formatMeasure } = environment().game;
const ELAPSED = [[0, '0:00.00'], [999, '0:00.99'], [59999, '0:59.99'], [60000, '1:00.00'], [179999, '2:59.99'], [180000, '3:00.00'], [180000.4, '3:00.00'], [180000.9, '3:00.00'], [3723456, '62:03.45'], [3665120, '61:05.12'], [NaN, '0:00.00'], [-1, '0:00.00'], [-0.5, '0:00.00'], [-180000, '0:00.00'], [Infinity, '0:00.00'], ['180000', '0:00.00']];
const MEASURE = [[37.99, '37.9'], [38.0, '38.0'], [38.04, '38.0'], [100.0, '100.0'], [100.04, '100.0'], [99.99, '99.9'], [0, '0.0'], [-1.25, '-1.2'], [-0.04, '0.0'], [NaN, '0.0']];
const table = (fn, rows, label) => { for (const [input, want] of rows) assert.equal(fn(input), want, `${label}(${input})`); };
await check('formatElapsed truncates at every boundary and never rounds up', () => table(formatElapsed, ELAPSED, 'formatElapsed'));
await check('formatElapsed places 0-3, with invalid places falling back to 2', () => {
  assert.equal(formatElapsed(179999, { places: 0 }), '2:59'); assert.equal(formatElapsed(179999, { places: 1 }), '2:59.9'); assert.equal(formatElapsed(179999, { places: 3 }), '2:59.999');
  assert.equal(formatElapsed(179999.9, { places: 3 }), '2:59.999'); assert.equal(formatElapsed(179999, { places: 7 }), '2:59.99'); assert.equal(formatElapsed(179999, { places: 1.5 }), '2:59.99');
});
await check('formatMeasure truncates toward zero, including binary-fraction traps', () => {
  table(formatMeasure, MEASURE, 'formatMeasure');
  assert.equal(formatMeasure(4.35, { places: 2 }), '4.35'); assert.equal(formatMeasure(0.29, { places: 2 }), '0.29'); assert.equal(formatMeasure(37.99, { places: 0 }), '37'); assert.equal(formatMeasure(1e-7, { places: 3 }), '0.000');
});
await check('negative controls: rounding and naive-multiplication formatters fail the same tables', () => {
  const rounding = ms => { const t = Math.round(ms / 10); return `${Math.floor(t / 6000)}:${String(Math.floor(t / 100) % 60).padStart(2, '0')}.${String(t % 100).padStart(2, '0')}`; };
  rejects('a rounding stopwatch', () => table(rounding, ELAPSED.slice(0, 9), 'rounding'));
  rejects('toFixed rounding', () => table(v => v.toFixed(1), MEASURE.slice(0, 5), 'toFixed'));
  rejects('naive multiply-and-floor', () => assert.equal((Math.floor(4.35 * 100) / 100).toFixed(2), '4.35'));
});

// ------------------------------------------------------- markup contract --
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
function parse(html) {
  const top = { tag: '#root', attrs: new Map(), children: [], parent: null };
  let current = top;
  for (const m of html.replace(/<!--[\s\S]*?-->/g, '').matchAll(/<(\/?)([a-zA-Z][\w-]*)([^>]*)>|([^<]+)/g)) {
    if (m[4] !== undefined) { current.children.push({ text: m[4] }); continue; }
    const tag = m[2].toLowerCase();
    if (m[1]) { let n = current; while (n && n.tag !== tag) n = n.parent; if (n) current = n.parent; continue; }
    const attrs = new Map([...m[3].matchAll(/([\w:-]+)(?:="([^"]*)")?/g)].map(a => [a[1], a[2] ?? '']));
    const node = { tag, attrs, children: [], parent: current };
    current.children.push(node);
    if (!VOID.has(tag) && !m[3].trim().endsWith('/')) current = node;
  }
  return top;
}
const all = (n, out = []) => { for (const c of n.children || []) if (c.tag) { out.push(c); all(c, out); } return out; };
const has = (n, c) => (n.attrs.get('class') || '').split(/\s+/).includes(c);
const text = n => (n.text ?? (n.children || []).map(text).join('')).replace(/\s+/g, ' ').trim();
const within = (n, pred) => { for (let p = n.parent; p; p = p.parent) if (p.tag && pred(p)) return true; return false; };
export function assertGameMarkup(html, { page = false } = {}) {
  assert(!/<style\b/i.test(html), 'no private stylesheet');
  assert(!/style="[^"]*#[0-9a-fA-F]{3,8}\b/.test(html) && !/\b(?:fill|stroke|color|bgcolor)="#/.test(html), 'no inline hex colour');
  const nodes = all(parse(html)), by = c => nodes.filter(n => has(n, c));
  const ids = nodes.map(n => n.attrs.get('id')).filter(Boolean);
  assert.equal(new Set(ids).size, ids.length, 'unique IDs');
  assert(by('sc-game').length >= 1, 'a stage');
  for (const n of by('sc-game__canvas')) assert(has(n.parent, 'sc-game'), 'the canvas is a direct child of the stage');
  for (const n of by('sc-game__crosshair')) assert.equal(n.attrs.get('aria-hidden'), 'true', 'crosshair is decorative');
  for (const n of by('sc-game__slot')) assert(has(n.parent, 'sc-game__hud'), 'HUD slots are direct children of the HUD');
  for (const n of by('sc-game__hud')) assert(has(n.parent, 'sc-game'), 'the HUD belongs to a stage');
  for (const n of by('sc-game__timer')) {
    assert.equal(n.attrs.get('role'), 'timer', 'the timer has role=timer');
    const value = all(n).find(c => has(c, 'sc-game__timer-value')), state = all(n).find(c => has(c, 'sc-game__timer-state'));
    assert(value && value.tag === 'time' && text(value), 'the timer value is a written <time>');
    assert(state && text(state), 'the timer state is written');
  }
  const stars = by('sc-game__star');
  assert(stars.length >= 3, 'three star slots');
  for (const n of by('sc-game__stars')) assert.equal(n.tag, 'ol', 'stars are an ordered list');
  for (const s of stars) {
    assert.equal(s.tag, 'li', 'a star slot is a list item');
    for (const part of ['sc-game__star-label', 'sc-game__star-rule', 'sc-game__star-state']) assert(text(all(s).find(c => has(c, part)) || {}), `each star has a written ${part.slice(14)}`);
    const glyph = all(s).find(c => has(c, 'sc-game__star-glyph'));
    assert(glyph && glyph.attrs.get('aria-hidden') === 'true', 'the star glyph is decorative');
    const state = text(all(s).find(c => has(c, 'sc-game__star-state')));
    assert.equal(has(s, 'is-earned'), state.startsWith('earned'), 'the written state agrees with .is-earned');
  }
  for (const n of by('sc-game__hint')) { assert.equal(n.attrs.get('aria-live'), 'polite', 'the hint is a polite live region'); assert(all(n).some(c => c.tag === 'kbd'), 'the hint shows its key'); }
  for (const n of by('sc-game__keys')) {
    assert.equal(n.tag, 'dl', 'the controls legend is a dl');
    const dts = all(n).filter(c => c.tag === 'dt'), dds = all(n).filter(c => c.tag === 'dd');
    assert(dts.length && dts.length === dds.length && dts.every(dt => all(dt).some(c => c.tag === 'kbd') || /mouse/.test(text(dt))), 'each action names its keys');
  }
  for (const n of by('sc-game__count')) assert(/[a-z]{3,}/.test(text(n).replace(text(all(n).find(c => has(c, 'sc-game__count-value')) || {}), '')), 'a count says what it counts in words');
  for (const n of by('sc-game__layer')) {
    const primaries = all(n).filter(c => has(c, 'sc-btn--primary'));
    assert.equal(primaries.length, 1, 'each layer has exactly one primary action');
    if (n.tag === 'dialog') assert(ids.includes(n.attrs.get('aria-labelledby')), 'the dialog is named by its heading');
  }
  for (const n of by('sc-game__plate')) assert(within(n, p => has(p, 'sc-game__hud')), 'plates sit in the HUD');
  assertMomentsMarkup(nodes, ids);
  if (page) {
    assert.equal(nodes.filter(n => n.tag === 'h1').length, 1, 'exactly one h1');
    assert(nodes.some(n => n.tag === 'a' && has(n, 'sc-skip')), 'a skip link');
    const full = by('sc-game--viewport')[0];
    assert(full, 'a full-viewport stage');
    for (const slot of ['tl', 'top', 'tr', 'left', 'right', 'bl', 'bottom', 'br']) assert.equal(all(full).filter(n => has(n, `sc-game__slot--${slot}`)).length, 1, `the ${slot} slot of the full stage is populated once`);
    const layer = nodes.find(n => n.attrs.has('data-sc-game-capture-layer'));
    assert(layer && has(layer, 'sc-game__layer') && layer.tag === 'div', 'a plain-div capture layer');
    assert.equal(text(all(layer).find(c => has(c, 'sc-btn--primary'))), 'Click to play', 'the one primary action says what it does');
    assert(/Escape releases the mouse and pauses/.test(text(layer)), 'the layer explains release and pause');
    const denied = all(layer).find(c => c.attrs.has('data-sc-game-denied'));
    assert(denied && denied.attrs.has('hidden') && /keyboard/.test(text(denied)) && /try again/.test(text(denied)), 'a hidden refusal message names the keyboard path and retry');
    const dialog = nodes.find(n => n.tag === 'dialog' && has(n, 'sc-game__layer'));
    assert(dialog, 'a native dialog layer');
    assert(nodes.some(n => n.attrs.has('data-sc-game-results-open') && n.attrs.get('aria-controls') === dialog.attrs.get('id')), 'the dialog has a named opener');
    // The page shows every 2.16 moment: a meter and a milestones track in play,
    // a counting milestones on the results with its one closing status, and a
    // cinematic preview with its caption region, skip control and title card.
    assert(by('sc-game__meter').some(n => within(n, p => has(p, 'sc-game__hud'))), 'a meter in the HUD');
    assert(by('sc-game__milestones').some(n => within(n, p => has(p, 'sc-game__hud'))), 'a milestones track in the HUD');
    const counting = all(dialog).find(c => has(c, 'sc-game__milestones--animate'));
    assert(counting, 'the results count coins along an animated milestones track');
    assert(all(dialog).some(c => c.attrs.get('role') === 'status' && c.attrs.has('data-sc-game-count-status')), 'the results announce the final count once, through a status');
    for (const part of ['sc-game__captions', 'sc-game__skip', 'sc-game__title-card']) assert.equal(all(full).filter(n => has(n, part)).length, 1, `the full stage carries one ${part.slice(9)} for its cinematic moment`);
    assert(nodes.some(n => n.attrs.has('data-sc-game-cinematic-open') && n.attrs.get('aria-controls') === full.attrs.get('id')), 'the cinematic preview has a named opener');
  }
}

// --------------------------------------------------- 2.16 moments markup --
// Meter, milestones, captions, skip and title card: meaning in words and
// shapes, values that agree with what is drawn, and live regions that
// persist and speak once.
const styleProp = (n, name) => { const m = new RegExp(`${name}\\s*:\\s*(-?[\\d.]+)`).exec(n.attrs.get('style') || ''); return m ? Number(m[1]) : NaN; };
const order = (root, n) => all(root).indexOf(n);
export function assertMomentsMarkup(nodes, ids) {
  const by = c => nodes.filter(n => has(n, c));
  for (const n of by('sc-game__meter')) {
    assert(has(n, 'sc-game__plate'), 'a meter sits on a plate');
    assert.equal(n.attrs.get('role'), 'meter', 'a meter has role=meter');
    const [min, max, now] = ['aria-valuemin', 'aria-valuemax', 'aria-valuenow'].map(a => Number(n.attrs.get(a) ?? NaN));
    assert([min, max, now].every(Number.isFinite) && min < max && now >= min && now <= max, 'a meter reports a number inside its range');
    assert(ids.includes(n.attrs.get('aria-labelledby')) || n.attrs.get('aria-label'), 'a meter is named');
    const state = all(n).find(c => has(c, 'sc-game__meter-state')), label = all(n).find(c => has(c, 'sc-game__meter-label'));
    assert(label && text(label), 'a meter has a written label');
    assert(state && text(state), 'a meter writes its state');
    assert((n.attrs.get('aria-valuetext') || '').includes(text(state)), 'aria-valuetext carries the written state');
    assert(['calm', 'alert', 'danger'].includes(n.attrs.get('data-state')), 'a meter state is calm, alert or danger');
    for (const part of ['sc-game__meter-glyph', 'sc-game__meter-track']) assert.equal(all(n).find(c => has(c, part))?.attrs.get('aria-hidden'), 'true', `the ${part.slice(14)} is decorative`);
    assert(Math.abs(styleProp(n, '--sc-game-meter-value') - (now - min) / (max - min)) <= 0.011, 'the drawn fill agrees with aria-valuenow');
  }
  for (const n of by('sc-game__milestones')) {
    const count = all(n).find(c => has(c, 'sc-game__milestones-count'));
    assert(count && /\d/.test(text(count)) && /[a-z]{3,}/.test(text(count)), 'a milestones writes its count, in words');
    assert(!count.attrs.has('aria-live') && !within(count, p => p.attrs.has('aria-live')) && !['status', 'log'].includes(count.attrs.get('role')), 'the count readout is not a live region: a count-up would announce every step');
    const track = all(n).find(c => has(c, 'sc-game__milestones-track'));
    assert(track && track.attrs.get('aria-hidden') === 'true', 'the milestones track is decorative');
    const list = all(n).find(c => has(c, 'sc-game__stars')), note = all(n).find(c => has(c, 'sc-game__milestones-note'));
    assert(list || (note && text(note)), 'the thresholds are written: a note, a star list, or both');
    const value = styleProp(n, '--sc-game-milestones-value');
    assert(value >= 0 && value <= 1, 'the fill is a fraction between 0 and 1');
    const markers = all(track).filter(c => has(c, 'sc-game__milestones-marker'));
    assert(markers.length >= 1, 'a milestones has at least one threshold marker');
    for (const m of markers) {
      const at = styleProp(m, '--sc-game-milestone-at');
      assert(at > 0 && at <= 1, 'a marker sits at a fraction of the track');
      assert.equal(has(m, 'is-earned'), value >= at - 0.001, 'a marker is lit exactly when the count has reached it');
    }
    if (list) assert.equal(all(list).filter(c => has(c, 'sc-game__star') && has(c, 'is-earned')).length, markers.filter(m => has(m, 'is-earned')).length, 'the written stars agree with the lit markers');
  }
  for (const n of by('sc-game__captions')) {
    assert.equal(n.attrs.get('aria-live'), 'polite', 'the caption region is polite and persistent');
    assert(has(n.parent, 'sc-game__slot'), 'the caption region sits in a HUD slot');
  }
  for (const n of by('sc-game__caption')) {
    assert(has(n, 'sc-game__plate'), 'a caption sits on a plate');
    assert(has(n.parent, 'sc-game__captions'), 'a caption sits inside the persistent caption region');
    assert(!n.attrs.has('aria-live'), 'the caption plate comes and goes, so it is not the live region');
    const line = all(n).find(c => has(c, 'sc-game__caption-line')), speaker = all(n).find(c => has(c, 'sc-game__caption-speaker'));
    assert(line && text(line), 'a caption has its line');
    assert(text(line).length <= 120, 'a caption is at most two lines of about 60 characters');
    if (speaker) assert(text(speaker) && order(n, speaker) < order(n, line), 'the speaker is written, before the line');
  }
  for (const n of by('sc-game__skip')) {
    assert(has(n, 'sc-game__plate'), 'the skip control sits on a plate');
    assert(within(n, p => has(p, 'sc-game__slot--br')), 'the skip control sits in the bottom-right slot');
    const buttons = all(n).filter(c => c.tag === 'button');
    assert(buttons.length === 1 && buttons[0].attrs.get('type') === 'button' && /\bskip\b/i.test(text(buttons[0])), 'one real button that says Skip');
    const keys = all(n).filter(c => c.tag === 'kbd').map(text);
    assert(keys.length >= 1, 'the skip keys are written');
    assert(!keys.some(k => /^esc/i.test(k)) && !/escape/i.test(buttons[0].attrs.get('aria-keyshortcuts') || ''), 'Escape never skips: it pauses');
  }
  for (const n of by('sc-game__title-card')) {
    assert(has(n.parent, 'sc-game__hud'), 'a title card is a direct child of a HUD, outside the slots');
    assert.equal(n.attrs.get('aria-live'), 'polite', 'the title-card region is polite and persistent');
    for (const plate of n.children.filter(c => c.tag)) {
      assert(has(plate, 'sc-game__plate'), 'a title card is plate-backed');
      const title = all(plate).find(c => has(c, 'sc-game__title-card-title'));
      assert(title && /^h[1-6]$/.test(title.tag) && text(title), 'a title card has a written heading');
      assert(all(plate).some(c => has(c, 'sc-eyebrow') && text(c)) , 'a title card has its eyebrow');
    }
  }
  for (const n of by('sc-game--cinematic')) assert(has(n, 'sc-game'), 'the cinematic modifier sits on a stage');
}
const template = readFileSync(new URL('templates/game.html', root), 'utf8');
await check('the template specimen satisfies the markup contract', () => assertGameMarkup(template, { page: true }));
await check('the guide and library specimens satisfy the markup contract', () => { assertGameMarkup(gameGuide('a', 3)); assertGameMarkup(readFileSync(new URL('visual-library.html', root), 'utf8').split('<!-- game-shell:preview:start -->')[1].split('<!-- game-shell:preview:end -->')[0]); });
await check('markup negative controls are rejected', () => {
  const stage = gameStage(), page = h => `<a class="sc-skip" href="#main">Skip</a><main id="main">${h}${gameNotes()}</main>`;
  assertGameMarkup(page(stage), { page: true });
  const planted = {
    'a crosshair exposed to assistive tech': stage.replace('<span class="sc-game__crosshair" aria-hidden="true">', '<span class="sc-game__crosshair">'),
    'a timer without role=timer': stage.replace('role="timer"', 'role="status"'),
    'a timer whose state is colour only': stage.replace('<span class="sc-game__timer-state">running</span>', '<span class="sc-game__timer-state"></span>'),
    'a star without a written state': stage.replace('<span class="sc-game__star-state">not yet</span>', '<span class="sc-game__star-state"></span>'),
    'a star without its rule': stage.replace(/<span class="sc-game__star-rule">[^<]*<\/span>/, ''),
    'an earned glyph whose words say otherwise': stage.replace('<span class="sc-game__star-state">earned</span>', '<span class="sc-game__star-state">not yet</span>'),
    'a silent hint': stage.replace(' aria-live="polite"', ''),
    'a second primary in the capture layer': stage.replace('<p data-sc-game-keyboard hidden><button class="sc-btn sc-btn--secondary"', '<p data-sc-game-keyboard hidden><button class="sc-btn sc-btn--primary"'),
    'an inline hex colour': stage.replace('<p class="sc-game__plate sc-game__count">', '<p class="sc-game__plate sc-game__count" style="color:#FFFFFF">'),
    'a slot outside the HUD': stage.replace('</div><div class="sc-game__layer"', '</div><div class="sc-game__slot sc-game__slot--tl"></div><div class="sc-game__layer"'),
    'a refusal message without a way forward': stage.replace('Continue with the keyboard —', 'Sorry —')
  };
  for (const [label, html] of Object.entries(planted)) { assert.notEqual(html, stage, `planted: ${label}`); rejects(label, () => assertGameMarkup(page(html), { page: true })); }
});
await check('moments markup negative controls are rejected (meter, milestones, captions, skip, title card)', () => {
  const stage = `<a class="sc-skip" href="#main">Skip</a><main id="main">${gameStage()}${gameNotes()}</main>`, guide = gameGuide('n', 3), page = h => h;
  assertGameMarkup(page(stage), { page: true }); assertGameMarkup(guide);
  const inStage = {
    'a meter without role=meter': stage.replace('role="meter"', 'role="img"'),
    'a meter whose valuetext drops the written state': stage.replace(/aria-valuetext="A guard noticed something \(58%\)"/, 'aria-valuetext="58%"'),
    'a meter state that is colour only': stage.replace('<p class="sc-game__meter-state">A guard noticed something</p>', '<p class="sc-game__meter-state"></p>'),
    'a meter drawn at another value than it reports': stage.replace('--sc-game-meter-value:0.58', '--sc-game-meter-value:0.9'),
    'a meter in an unknown state': stage.replace('data-state="alert"', 'data-state="orange"'),
    'a milestones track exposed to assistive tech': stage.replace('<div class="sc-game__milestones-track" aria-hidden="true">', '<div class="sc-game__milestones-track">'),
    'a marker lit before the count reaches it': stage.replace('<span class="sc-game__milestones-marker" data-sc-game-milestone="collector"', '<span class="sc-game__milestones-marker is-earned" data-sc-game-milestone="collector"'),
    'a marker left dark after the count passed it': stage.replace('<span class="sc-game__milestones-marker is-earned" data-sc-game-milestone="explorer"', '<span class="sc-game__milestones-marker" data-sc-game-milestone="explorer"'),
    'a count without words': stage.replace('<span class="sc-game__milestones-value">12</span> of 24 coins</span>', '<span class="sc-game__milestones-value">12</span> / 24</span>'),
    'a counting readout in a live region': stage.replace('<span class="sc-game__milestones-count">', '<span class="sc-game__milestones-count" aria-live="polite">'),
    'thresholds that are never written': stage.replace(/<p class="sc-game__milestones-note">[^<]*<\/p>/, ''),
    'written stars that disagree with the lit markers': stage.replace(`<li data-sc-game-milestone="collector" class="sc-game__star"><span class="sc-game__star-glyph" aria-hidden="true"></span><span class="sc-game__star-label">collector</span><span class="sc-game__star-state">not yet</span>`, `<li data-sc-game-milestone="collector" class="sc-game__star is-earned"><span class="sc-game__star-glyph" aria-hidden="true"></span><span class="sc-game__star-label">collector</span><span class="sc-game__star-state">earned this run</span>`),
    'an assertive caption region': stage.replace('<div class="sc-game__captions" id="game-captions" aria-live="polite"', '<div class="sc-game__captions" id="game-captions" aria-live="assertive"'),
    'a skip control that names Escape': stage.replace('<kbd>Space</kbd> or <kbd>Enter</kbd>', '<kbd>Esc</kbd>'),
    'a skip control that is not a button': stage.replace('<button class="sc-btn sc-btn--secondary sc-btn--sm" type="button" aria-keyshortcuts="Space Enter">Skip</button>', '<span class="sc-btn sc-btn--secondary sc-btn--sm">Skip</span>'),
    'a skip control outside the bottom-right slot': stage.replace(/(<div class="sc-game__plate sc-game__skip"[^]*?<\/div>)(<\/div>)(<div class="sc-game__title-card")/, '$2<div class="sc-game__slot sc-game__slot--tl">$1</div>$3'),
    'a title-card region that is not live': stage.replace('<div class="sc-game__title-card" id="game-title-card" aria-live="polite">', '<div class="sc-game__title-card" id="game-title-card">')
  };
  for (const [label, html] of Object.entries(inStage)) { assert.notEqual(html, stage, `planted: ${label}`); rejects(label, () => assertGameMarkup(page(html), { page: true })); }
  const inGuide = {
    'a speaker written after the line': guide.replace(/(<span class="sc-game__caption-speaker">Grandma<\/span>)(<span class="sc-game__caption-line">[^<]*<\/span>)/, '$2$1'),
    'a caption plate that is its own live region': guide.replace('<p class="sc-game__plate sc-game__caption">', '<p class="sc-game__plate sc-game__caption" aria-live="polite">'),
    'a caption outside the persistent region': guide.replace(/<div class="sc-game__captions"[^>]*>(<p class="sc-game__plate sc-game__caption">[^]*?<\/p>)<\/div>/, '$1'),
    'a caption longer than two subtitle lines': guide.replace('Mind the window, love — that snowball has a mind of its own.', 'Mind the window, love — that snowball has a mind of its own, and it has been rolling around this kitchen since breakfast, so keep an eye on it.'),
    'a title card without a plate': guide.replace(/(<div class="sc-game__title-card"[^>]*>)<div class="sc-game__plate">/, '$1<div>'),
    'a title card inside a slot': guide.replace(/<\/div>(<div class="sc-game__title-card"[^>]*>[^]*?<\/h3><\/div><\/div>)/, '$1</div>'),
    'a title card without a heading': guide.replace(/<h3 class="sc-game__title-card-title"([^>]*)>([^<]*)<\/h3>/, '<p class="sc-game__title-card-title"$1>$2</p>')
  };
  for (const [label, html] of Object.entries(inGuide)) { assert.notEqual(html, guide, `planted: ${label}`); rejects(label, () => assertGameMarkup(html)); }
});

// ------------------------------------------------------------ CSS opt-in --
const css = readFileSync(new URL('sc.css', root), 'utf8');
const stripComments = c => c.replace(/\/\*[\s\S]*?\*\//g, '');
const splitSelectors = s => { const out = []; let depth = 0, start = 0; for (let i = 0; i < s.length; i++) { if (s[i] === '(') depth++; else if (s[i] === ')') depth--; else if (s[i] === ',' && !depth) { out.push(s.slice(start, i)); start = i + 1; } } out.push(s.slice(start)); return out.map(x => x.trim()).filter(Boolean); };
const rulesOf = sheet => [...stripComments(sheet).matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(m => ({ sel: m[1].trim().replace(/\s+/g, ' '), body: m[2] })).filter(r => r.sel && !r.sel.startsWith('@'));
const declarations = body => [...body.matchAll(/(?:^|;)\s*([\w-]+)\s*:\s*([^;]+)/g)].map(m => ({ prop: m[1], value: m[2].trim() }));
// A selector as compounds and the combinators between them, ignoring anything
// inside :is()/:not()/:has()/[attr]; and a compound with its parentheses gone.
function compounds(selector) {
  const parts = [], joins = []; let depth = 0, current = '';
  for (let i = 0; i < selector.length; i++) {
    const ch = selector[i];
    if (ch === '(' || ch === '[') depth++; else if (ch === ')' || ch === ']') depth--;
    if (!depth && /[\s>+~]/.test(ch)) {
      let join = ' ';
      while (i < selector.length && /[\s>+~]/.test(selector[i])) { if (selector[i] !== ' ') join = selector[i]; i++; }
      i--; if (current) { parts.push(current); joins.push(join); current = ''; }
      continue;
    }
    current += ch;
  }
  if (current) parts.push(current);
  return { parts, joins: joins.slice(0, parts.length - 1) };
}
const bare = compound => { let out = compound, was; do { was = out; out = out.replace(/\([^()]*\)/g, ''); } while (out !== was); return out; };
const GAME_CLASS = /\.sc-game(?:__|--|(?![\w-]))/;
const subjectOf = selector => { const { parts } = compounds(selector); return bare(parts[parts.length - 1] || ''); };
// In scope: the first compound is a .sc-game class, and a sibling combinator
// (~ or +) only ever leads to another .sc-game compound — so the subject is a
// game element or a descendant of one, never a sibling of the stage.
export function scoped(selector) {
  const { parts, joins } = compounds(selector);
  if (!/^[a-z]*\.sc-game(?:__|--|(?![\w-]))/.test(bare(parts[0] || ''))) return false;
  return joins.every((join, i) => !/[~+]/.test(join) || GAME_CLASS.test(bare(parts[i + 1])));
}
const INPUT = /^(touch-action|user-select|-webkit-user-select|cursor|pointer-events)$/;
export function assertOptInBand(band) {
  const rules = rulesOf(band);
  assert(rules.length > 20, 'the band has rules');
  for (const { sel, body } of rules) {
    for (const s of splitSelectors(sel)) assert(scoped(s), `every selector is scoped to a .sc-game element: "${s}"`);
    for (const { prop } of declarations(body)) {
      assert(!prop.startsWith('--sc-'), `no new token: ${prop} in "${sel}"`);
      if (prop === 'touch-action') assert(splitSelectors(sel).every(s => s.startsWith('.sc-game__canvas')), 'touch-action only on the canvas');
      if (INPUT.test(prop)) assert(splitSelectors(sel).every(scoped), `input property ${prop} only on game elements`);
    }
  }
}
// The contract's declarations, positively: what the brief requires must be there.
const valuesFor = (rules, selector, prop) => rules.filter(r => splitSelectors(r.sel).includes(selector)).flatMap(r => declarations(r.body).filter(d => d.prop === prop).map(d => d.value));
const first = (rules, selector, prop) => valuesFor(rules, selector, prop)[0] || '';
export function assertBandContract(band) {
  const rules = rulesOf(band);
  const hudEvents = valuesFor(rules, '.sc-game__hud', 'pointer-events'), touch = valuesFor(rules, '.sc-game__canvas', 'touch-action');
  assert(hudEvents.length && hudEvents.every(v => v === 'none'), 'the HUD is pointer-events: none, and nothing in the band turns it back on');
  assert(touch.length && touch.every(v => v === 'none'), 'the canvas is touch-action: none');
  const safe = side => new RegExp(`max\\(var\\(--sc-s3\\), env\\(safe-area-inset-${side}\\b`);
  for (const selector of ['.sc-game__hud', '.sc-game__layer']) {
    const padding = first(rules, selector, 'padding');
    for (const side of ['top', 'right', 'bottom', 'left']) assert(safe(side).test(padding), `${selector} pads ${side} by max(var(--sc-s3), env(safe-area-inset-${side}))`);
  }
  const timer = rules.filter(r => splitSelectors(r.sel).includes('.sc-game__timer-value')).map(r => r.body).join(';');
  assert(/white-space:\s*nowrap/.test(timer) && /font-variant-numeric:\s*tabular-nums/.test(timer), 'the timer value never wraps and uses tabular figures');
  const outlined = first(rules, '.sc-game__star-glyph', 'clip-path'), filled = first(rules, '.sc-game__star.is-earned .sc-game__star-glyph', 'clip-path');
  assert(outlined && filled && outlined !== filled && /evenodd/.test(outlined) && !/evenodd/.test(filled), 'earned and not-yet star glyphs differ in shape: filled vs outlined');
  const ring = first(rules, '.sc-game__crosshair', 'box-shadow'), dot = first(rules, '.sc-game__crosshair::after', 'box-shadow');
  assert(/var\(--sc-on-ink\)/.test(first(rules, '.sc-game__crosshair', 'border')) && /var\(--sc-on-ink\)/.test(first(rules, '.sc-game__crosshair::after', 'background')), 'the crosshair ring and dot are on-ink');
  assert(ring.split(',').some(l => !/inset/.test(l) && /var\(--sc-ink\)/.test(l)) && ring.split(',').some(l => /inset/.test(l) && /var\(--sc-ink\)/.test(l)) && /var\(--sc-ink\)/.test(dot), 'the crosshair is two-tone: ink outlines outside and inside the ring, and around the dot');
  assert(Number(first(rules, '.sc-game__crosshair', 'z-index')) > Number(first(rules, '.sc-game__hud', 'z-index')), 'the crosshair paints above the HUD');
  // .sc-game__layer sets display, which beats the UA's dialog:not([open]) rule.
  const drawsLayer = rules.some(r => splitSelectors(r.sel).some(s => /\.sc-game__layer(?![\w-])/.test(subjectOf(s)) && !/:not\(\[open\]\)/.test(s)) && declarations(r.body).some(d => d.prop === 'display' && d.value !== 'none'));
  if (drawsLayer) assert(valuesFor(rules, 'dialog.sc-game__layer:not([open])', 'display').includes('none'), 'a closed dialog.sc-game__layer is not drawn');
}
// The 2.16 moments in CSS: meter states coded by shape and thickness, filled
// versus outlined markers, a 60ch caption, a cinematic that keeps only its
// captions, skip control and title card, letterbox bars that never take input
// or cover the HUD, motion only behind the reduced-motion query and never on
// a still stage, and marks that keep their shape in forced colours.
export function cssBlock(sheet, head) {
  const i = sheet.indexOf(head);
  if (i < 0) return '';
  const open = sheet.indexOf('{', i) + 1;
  let depth = 1, k = open;
  for (; k < sheet.length && depth; k++) { if (sheet[k] === '{') depth++; else if (sheet[k] === '}') depth--; }
  return sheet.slice(open, k - 1);
}
// What a selector moves: its last .sc-game__* class (or the stage) plus any pseudo-element.
const movedPart = selector => { const last = compounds(selector).parts.at(-1) || ''; return (/\.sc-game__[\w-]+/.exec(bare(last))?.[0] || 'stage') + (/::[\w-]+$/.exec(last)?.[0] || ''); };
export function assertMomentsCss(band) {
  const rules = rulesOf(band);
  const states = s => [`.sc-game__meter-${s}`, `.sc-game__meter[data-state="alert"] .sc-game__meter-${s}`, `.sc-game__meter[data-state="danger"] .sc-game__meter-${s}`];
  const glyphs = states('glyph').map(s => first(rules, s, 'clip-path')), thickness = states('fill').map(s => first(rules, s, 'block-size'));
  assert(glyphs.every(Boolean) && new Set(glyphs).size === 3, 'the meter glyph takes a different shape in each state');
  assert(thickness.every(Boolean) && new Set(thickness).size === 3, 'the meter fill takes a different thickness in each state');
  const outlined = first(rules, '.sc-game__milestones-marker', 'clip-path'), filled = first(rules, '.sc-game__milestones-marker.is-earned', 'clip-path');
  assert(outlined && filled && /evenodd/.test(outlined) && !/evenodd/.test(filled), 'a lit milestone marker is a filled star and an unlit one an outline');
  assert(/\b60ch\b/.test(first(rules, '.sc-game__caption', 'max-inline-size')), 'a caption is at most about 60 characters wide');
  const bars = '.sc-game--cinematic::before';
  assert.equal(first(rules, bars, 'pointer-events'), 'none', 'the letterbox bars never take pointer input');
  assert(Number(first(rules, bars, 'z-index')) <= Number(first(rules, '.sc-game__hud', 'z-index')), 'the letterbox bars paint under the HUD');
  assert(/var\(--sc-ink\)/.test(first(rules, bars, 'border-block')), 'the letterbox bars are flat ink');
  assert.equal(first(rules, '.sc-game--cinematic > .sc-game__crosshair', 'display'), 'none', 'a cinematic hides the crosshair');
  const hide = rules.find(r => splitSelectors(r.sel).some(s => s.startsWith('.sc-game--cinematic .sc-game__slot > :not(')) && declarations(r.body).some(d => d.prop === 'display' && d.value === 'none'));
  assert(hide, 'a cinematic hides the content of every slot but its own');
  const kept = /:not\(([^)]*)\)/.exec(hide.sel)[1].split(',').map(s => s.trim());
  for (const keep of ['.sc-game__captions', '.sc-game__caption', '.sc-game__skip']) assert(kept.includes(keep), `a cinematic keeps ${keep} on screen`);
  assert(!rules.some(r => r.sel.includes('sc-game--cinematic') && r.sel.includes('sc-game__title-card') && declarations(r.body).some(d => d.prop === 'display' && d.value === 'none')), 'a cinematic keeps its title card');
  const motion = cssBlock(band, '@media (prefers-reduced-motion: no-preference)');
  const allowed = new Set(rulesOf(motion).map(r => `${r.sel}{${r.body}`));
  const moving = rules.filter(r => declarations(r.body).some(d => /^(?:transition|animation)(?:-|$)/.test(d.prop) && !/^none\b/.test(d.value)));
  assert(moving.length >= 3, 'the bars, the milestones fill and its markers carry their motion');
  for (const r of moving) assert(allowed.has(`${r.sel}{${r.body}`), `motion only behind prefers-reduced-motion: no-preference: "${r.sel}"`);
  const stilled = new Set(rules.filter(r => declarations(r.body).some(d => d.prop === 'transition' && d.value === 'none')).flatMap(r => splitSelectors(r.sel)).filter(s => s.startsWith('.sc-game--still')).map(movedPart));
  for (const r of moving) for (const s of splitSelectors(r.sel)) assert(stilled.has(movedPart(s)), `a .sc-game--still stage holds ${movedPart(s)} still`);
  const forced = rulesOf(cssBlock(band, '@media (forced-colors: active)'));
  for (const s of ['.sc-game__meter-glyph', '.sc-game__meter-fill', '.sc-game__milestones-fill', '.sc-game__milestones-marker']) assert(valuesFor(forced, s, 'forced-color-adjust').includes('none') && valuesFor(forced, s, 'background').includes('CanvasText'), `${s} keeps its shape in forced colours`);
}
// Plates are the contrast guarantee: nothing anywhere in the sheet may make a
// plate (or the stage, HUD or slot that holds it) translucent, blurred or
// blended, or give a plate a see-through or gradient fill or a shadow.
export function assertOpaquePlates(sheet) {
  for (const { sel, body } of rulesOf(sheet)) {
    const subjects = splitSelectors(sel).map(subjectOf);
    const plate = subjects.some(s => /\.sc-game__plate(?![\w-])/.test(s));
    const holder = plate || subjects.some(s => /\.sc-game(?:__hud|__slot|--viewport)?(?![\w-])/.test(s));
    if (!holder) continue;
    for (const { prop, value } of declarations(body)) {
      if (prop.startsWith('--')) continue;
      assert(!(prop === 'opacity' && Number(value) !== 1), `no opacity on "${sel}"`);
      assert(!/^(?:-webkit-)?(?:backdrop-)?filter$|^mix-blend-mode$/.test(prop) || /^(?:none|normal)$/.test(value), `no ${prop} on "${sel}"`);
      if (plate) {
        assert(prop !== 'box-shadow', `no shadow on a plate: "${sel}"`);
        if (/^background(?:-color|-image)?$/.test(prop)) assert(!/gradient|rgba|hsla|transparent|color-mix|url\(|\//.test(value), `a plate background is flat and opaque: "${sel}" { ${prop}: ${value} }`);
      }
    }
  }
}
const start = css.indexOf('4i. GAME SHELL'), end = css.indexOf('5. UTILITIES');
const band = css.slice(css.lastIndexOf('/*', start), css.lastIndexOf('/*', end));
await check('the game band is opt-in: scoped selectors, no tokens, no global input properties', () => {
  assert(start > css.indexOf('4. COMPONENTS') && start < end, 'band 4i sits inside section 4');
  assertOptInBand(band);
});
await check('the band carries the contract: input, safe area, timer, star shapes, two-tone crosshair, closed dialog', () => assertBandContract(band));
await check('the moments carry their contract: shaped meter states, filled markers, 60ch captions, cinematic keeps, guarded motion, forced colours', () => assertMomentsCss(band));
await check('moments CSS negative controls are rejected', () => {
  const baseGlyph = /\.sc-game__meter-glyph \{[^}]*clip-path: ([^;]*);/.exec(band)[1];
  const outline = /\.sc-game__milestones-marker \{[^}]*clip-path: ([^;]*);/.exec(band)[1];
  const planted = {
    'meter glyphs that keep one shape': band.replace(/(\.sc-game__meter\[data-state="(?:alert|danger)"\] \.sc-game__meter-glyph \{[^}]*clip-path:)[^;]*;/g, `$1 ${baseGlyph};`),
    'a meter fill that keeps one thickness': band.replace(/(\.sc-game__meter\[data-state="(?:alert|danger)"\] \.sc-game__meter-fill \{[^}]*block-size:)[^;]*;/g, '$1 33.333%;'),
    'milestone markers that differ only in colour': band.replace(/(\.sc-game__milestones-marker\.is-earned \{[^}]*clip-path:)[^;]*;/, `$1 ${outline};`),
    'a caption as wide as the stage': band.replace('max-inline-size: min(100%, 60ch);', 'max-inline-size: 100%;'),
    'letterbox bars that take pointer input': band.replace(/(\.sc-game--cinematic::before \{[^}]*)pointer-events: none;/, '$1'),
    'letterbox bars over the HUD': band.replace(/(\.sc-game--cinematic::before \{[^}]*z-index:) 1;/, '$1 5;'),
    'a cinematic that keeps the crosshair': band.replace('.sc-game--cinematic > .sc-game__crosshair { display: none; }', ''),
    'a cinematic that hides the skip control': band.replace(':not(.sc-game__captions, .sc-game__caption, .sc-game__skip)', ':not(.sc-game__captions, .sc-game__caption)'),
    'a cinematic that hides its title card': `${band}\n.sc-game--cinematic .sc-game__title-card { display: none; }\n`,
    'a transition that ignores reduced motion': `${band}\n.sc-game__meter-fill { transition: inline-size .2s linear; }\n`,
    'an animation outside the motion query': `${band}\n.sc-game__caption { animation: sc-game-rise .3s; }\n`,
    'a still stage that still moves': band.replace(/\.sc-game--still::before, [^{]*\{ transition: none; \}/, ''),
    'a meter fill that vanishes in forced colours': band.replace('.sc-game__meter-glyph, .sc-game__meter-fill, .sc-game__milestones-fill', '.sc-game__meter-glyph, .sc-game__milestones-fill')
  };
  for (const [label, sheet] of Object.entries(planted)) { assert.notEqual(sheet, band, `planted: ${label}`); rejects(label, () => assertMomentsCss(sheet)); }
});
await check('plates take the 2c on-ink re-scope and stay opaque everywhere in the sheet', () => {
  const onInk = /(\.sc-masthead[^{]*)\{([^}]*)\}/.exec(css.slice(css.indexOf('2c. ON-INK CONTEXT')));
  assert(splitSelectors(onInk[1]).includes('.sc-game__plate'), 'the on-ink selector list includes .sc-game__plate');
  for (const token of ['--sc-surface', '--sc-raised', '--sc-border', '--sc-border-strong', '--sc-chart-emphasis', '--sc-border-control']) assert(new RegExp(`${token}\\s*:`).test(onInk[2]), `the on-ink re-scope sets ${token}, so a composed primitive reads the same in both page modes`);
  assert(valuesFor(rulesOf(band), '.sc-game__plate', 'background')[0] === 'var(--sc-ink)', 'plates are opaque ink');
  assertOpaquePlates(css);
});
await check('CSS negative controls are rejected', () => {
  const opted = {
    'a body rule': 'body { touch-action: none; }',
    'a bare element rule': 'canvas { cursor: none; }',
    'a :root token': ':root { --sc-game-gap: 4px; }',
    'a new token on a game class': '.sc-game__plate { --sc-plate-fill: red; }',
    'an unanchored selector in a list': '.sc-game__hud, button { pointer-events: auto; }',
    'a universal user-select': '* { user-select: none; }',
    'touch-action off the canvas': '.sc-game { touch-action: none; }',
    'an :is() escape hatch': ':is(.sc-game__hint, nav) kbd { cursor: help; }',
    'a sibling of the stage': '.sc-game ~ * { user-select: none; pointer-events: none; cursor: none; }',
    'the next element after the stage': '.sc-game + main { pointer-events: none; }',
    'a sibling escape through :is()': '.sc-game__hud ~ :is(.sc-game__x, div) { cursor: none; }'
  };
  for (const [label, rule] of Object.entries(opted)) rejects(label, () => assertOptInBand(`${band}\n${rule}\n`));
  const contract = {
    'a HUD that takes pointer input': band.replace(/(\.sc-game__hud \{[^}]*pointer-events:) none/, '$1 auto'),
    'a later rule that turns the HUD back on': `${band}\n.sc-game__hud { pointer-events: auto; }\n`,
    'a canvas without touch-action': band.replace('touch-action: none;', ''),
    'a HUD padding that ignores the safe area': band.replace(/(\.sc-game__hud \{[^}]*padding:)[^;]*;/, '$1 var(--sc-s3);'),
    'a layer padding that ignores the safe area': band.replace(/(\.sc-game__layer \{[^}]*padding:)[^;]*;/, '$1 var(--sc-s3);'),
    'a timer value that wraps': band.replace(/(\.sc-game__timer-value \{[^}]*)white-space: nowrap;/, '$1'),
    'a timer value in proportional figures': band.replace(/(\.sc-game__timer-value \{[^}]*)font-variant-numeric: tabular-nums;/, '$1'),
    'star glyphs that differ only in colour': band.replace(/(\.sc-game__star\.is-earned \.sc-game__star-glyph \{[^}]*clip-path:)[^;]*;/, (m, head) => head + ' ' + /\.sc-game__star-glyph \{[^}]*clip-path: ([^;]*);/.exec(band)[1] + ';'),
    'a one-tone crosshair': band.replace(/(\.sc-game__crosshair \{[^}]*)box-shadow:[^;]*;/, '$1'),
    'a crosshair under the HUD': band.replace(/(\.sc-game__crosshair \{[^}]*z-index:) 2;/, '$1 0;'),
    'a closed dialog that is still drawn': band.replace(/dialog\.sc-game__layer:not\(\[open\]\) \{ display: none; \}/, '')
  };
  for (const [label, planted] of Object.entries(contract)) { assert.notEqual(planted, band, `planted: ${label}`); rejects(label, () => assertBandContract(planted)); }
  const translucent = {
    'a translucent plate state': '.sc-game__plate:not(:empty) { opacity: .55; }',
    'a blurred plate': '.sc-game__plate:where(*) { filter: blur(1px); }',
    'a see-through plate fill': '.sc-game .sc-game__plate { background: rgba(17, 31, 49, .8); }',
    'a frosted plate': '.sc-game__plate { backdrop-filter: blur(4px); }',
    'a gradient plate': '.sc-game__plate { background-image: linear-gradient(red, blue); }',
    'a faded slot': '.sc-game__hud > .sc-game__slot { opacity: .9; }',
    'a blended HUD': '.sc-game__hud { mix-blend-mode: difference; }'
  };
  for (const [label, rule] of Object.entries(translucent)) rejects(label, () => assertOpaquePlates(`${css}\n${rule}\n`));
});

console.log(`game-check: ${checks} runtime, formatter, markup and CSS opt-in scenarios pass (with negative controls); rendered QA is build/game-render-check.mjs`);
