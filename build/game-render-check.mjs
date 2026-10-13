// Rendered game-shell checks on the exported templates/game.html, and on the
// compact stage embedded in the style guide and the visual library, from real
// Chromium geometry, computed styles and the accessibility tree. The page's own
// specimen script paints illustrative art; pointer lock is either stubbed (to
// drive the captured path deterministically) or removed/refused (to drive the
// denied path), and one scenario uses the browser's native API and accepts
// whichever answer it gives.
import assert from 'node:assert/strict';
import { join } from 'node:path';

// Phone heights keep the 9:20 proportion of current phones (360 x 800 scaled to 320 wide);
// short screens are the separate 640 x 360 landscape scenario below.
const HEIGHT = { 320: 720, 390: 844, 820: 1180, 1280: 800 };
// Pointer-lock stand-ins, installed before any page script runs.
function lockStub(mode) {
  window.__scLockCalls = 0;
  let locked = null;
  const native = Element.prototype.requestPointerLock;
  if (mode === 'native') {
    Element.prototype.requestPointerLock = function () { window.__scLockCalls++; return native.apply(this, arguments); };
    return;
  }
  if (mode === 'missing') { delete Element.prototype.requestPointerLock; return; }
  Object.defineProperty(Document.prototype, 'pointerLockElement', { configurable: true, get() { return locked; } });
  Document.prototype.exitPointerLock = function () { if (!locked) return; locked = null; setTimeout(() => document.dispatchEvent(new Event('pointerlockchange')), 0); };
  Element.prototype.requestPointerLock = function () {
    window.__scLockCalls++;
    if (mode === 'refuse') { setTimeout(() => document.dispatchEvent(new Event('pointerlockerror')), 0); return Promise.reject(new DOMException('Refused by the test', 'NotAllowedError')); }
    const element = this;
    setTimeout(() => { locked = element; document.dispatchEvent(new Event('pointerlockchange')); }, 0);
    return Promise.resolve();
  };
  window.__scUnlock = () => document.exitPointerLock();
}

// Everything measured in the page: stage, crosshair, slots, plates, safe box,
// and every text run's contrast against the plate surface beneath it.
function measure(selector = '.sc-game') {
  const box = el => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, right: r.right, bottom: r.bottom, width: r.width, height: r.height }; };
  const parse = value => { const n = (value.match(/-?[\d.]+/g) || []).map(Number); const scale = value.startsWith('color(') ? 255 : 1; return { rgb: n.slice(0, 3).map(v => v * scale), a: n.length > 3 ? n[3] : 1 }; };
  const over = (top, under) => ({ rgb: top.rgb.map((c, i) => c * top.a + under.rgb[i] * (1 - top.a)), a: 1 });
  const lum = rgb => { const l = rgb.map(c => { c /= 255; return c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4; }); return .2126 * l[0] + .7152 * l[1] + .0722 * l[2]; };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
  const stage = document.querySelector(selector), hud = stage.querySelector('.sc-game__hud'), canvas = stage.querySelector('.sc-game__canvas');
  const pad = getComputedStyle(hud), s = box(stage);
  const safe = { x: s.x + parseFloat(pad.paddingLeft), y: s.y + parseFloat(pad.paddingTop), right: s.right - parseFloat(pad.paddingRight), bottom: s.bottom - parseFloat(pad.paddingBottom) };
  const ctx = canvas.getContext('2d'), sx = canvas.width / canvas.clientWidth, sy = canvas.height / canvas.clientHeight;
  const plates = [...stage.querySelectorAll('.sc-game__plate')].map(plate => {
    const style = getComputedStyle(plate), surface = parse(style.backgroundColor), b = box(plate);
    // Opaque all the way up: nothing between the plate and the stage fades, blurs or blends it.
    const see = []; for (let n = plate; n && n !== stage.parentElement; n = n.parentElement) { const c = getComputedStyle(n); if (c.opacity !== '1' || c.filter !== 'none' || c.backdropFilter !== 'none' || c.mixBlendMode !== 'normal') see.push(n.className || n.tagName); }
    // Median luminance of the art under the plate, sampled on a 5 x 3 grid.
    const samples = [];
    for (let i = 1; i <= 5; i++) for (let j = 1; j <= 3; j++) {
      const px = ctx.getImageData(Math.floor((b.x + b.width * i / 6 - s.x) * sx), Math.floor((b.y + b.height * j / 4 - s.y) * sy), 1, 1).data;
      samples.push(lum([px[0], px[1], px[2]]));
    }
    const runs = [];
    for (const el of [plate, ...plate.querySelectorAll('*')]) {
      if (![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) || !el.getClientRects().length) continue;
      let under = surface;
      const chain = []; for (let n = el; n && n !== plate; n = n.parentElement) chain.unshift(n);
      for (const n of chain) { const bg = parse(getComputedStyle(n).backgroundColor); if (bg.a > 0) under = over(bg, under); }
      const fg = over(parse(getComputedStyle(el).color), under);
      runs.push({ text: el.textContent.trim().slice(0, 24), ratio: ratio(fg.rgb, under.rgb) });
    }
    // Every computed colour inside the plate, to compare the two page modes.
    const spills = [...plate.querySelectorAll('*')].filter(el => { const r = el.getBoundingClientRect(); return r.width > 0 && (r.right > b.right + .5 || r.x < b.x - .5); }).map(el => el.className || el.tagName);
    const signature = [plate, ...plate.querySelectorAll('*')].map(el => { const c = getComputedStyle(el); return `${el.tagName}.${el.className}: ${c.color} / ${c.backgroundColor} / ${c.borderTopColor} / ${c.borderBottomColor}`; });
    return { box: b, opaque: surface.a === 1, seeThrough: see, spills, border: style.borderTopStyle, art: samples.sort((a, b) => a - b)[7], runs, signature, label: plate.textContent.trim().slice(0, 30) };
  });
  const cross = stage.querySelector('.sc-game__crosshair'), cs = getComputedStyle(cross), cb = box(cross);
  const hit = document.elementFromPoint(cb.x + cb.width / 2, cb.y + cb.height / 2);
  return { stage: s, viewport: { width: innerWidth, height: innerHeight }, pageWidth: document.documentElement.scrollWidth, safe, plates,
    cross: cb, crossShown: cs.visibility === 'visible' && cs.opacity === '1' && cs.display !== 'none', crossAbove: Number(cs.zIndex) > Number(getComputedStyle(hud).zIndex),
    centreHit: hit === canvas, hudEvents: getComputedStyle(hud).pointerEvents, touch: getComputedStyle(canvas).touchAction,
    scroll: [stage.scrollTop, stage.scrollLeft], columns: getComputedStyle(hud).gridTemplateColumns.split(' ').length,
    slots: [...hud.querySelectorAll(':scope > .sc-game__slot')].map(slot => ({ name: slot.className, box: box(slot) })),
    capture: stage.getAttribute('data-sc-capture'), scene: stage.getAttribute('data-sc-game-scene'), theme: document.documentElement.dataset.theme,
    moving: [...document.querySelectorAll('[class*="sc-game"]')].filter(el => { const c = getComputedStyle(el); return c.animationName !== 'none' || c.transitionDuration.split(',').some(t => parseFloat(t) > 0); }).map(el => el.className) };
}
const overlaps = (a, b) => Math.min(a.right, b.right) - Math.max(a.x, b.x) > .5 && Math.min(a.bottom, b.bottom) - Math.max(a.y, b.y) > .5;
// short: a screen too short for every plate. The shell then guarantees no
// overlap, a still stage and a centred crosshair painted above the HUD, but it
// does not choose which plates to drop, so containment is not asserted.
// covered: a layer is open over the stage, so the centre belongs to it.
// embedded: the stage sits in a longer page, whose own overflow is not the
// stage's to answer for — the stage itself must still fit the viewport.
function assertGeometry(m, label, { short = false, slots = 8, covered = false, embedded = false } = {}) {
  if (embedded) assert(m.stage.x >= -1 && m.stage.right <= m.viewport.width + 1, `${label}: the stage fits the viewport width`);
  else assert(m.pageWidth <= m.viewport.width + 1, `${label}: no page-level horizontal overflow`);
  assert.deepEqual(m.scroll, [0, 0], `${label}: the stage itself never scrolls`);
  assert(Math.abs(m.cross.x + m.cross.width / 2 - (m.stage.x + m.stage.width / 2)) <= 1 && Math.abs(m.cross.y + m.cross.height / 2 - (m.stage.y + m.stage.height / 2)) <= 1, `${label}: crosshair centre equals stage centre`);
  assert(m.crossShown && m.crossAbove, `${label}: the crosshair is drawn, above the HUD`);
  assert(m.hudEvents === 'none' && m.touch === 'none', `${label}: the HUD lets pointer input through and the canvas owns touch`);
  assert.equal(m.slots.length, slots, `${label}: ${slots} populated slots`);
  for (let i = 0; i < m.slots.length; i++) for (let j = i + 1; j < m.slots.length; j++) assert(!overlaps(m.slots[i].box, m.slots[j].box), `${label}: ${m.slots[i].name} overlaps ${m.slots[j].name}`);
  for (let i = 0; i < m.plates.length; i++) for (let j = i + 1; j < m.plates.length; j++) assert(!overlaps(m.plates[i].box, m.plates[j].box), `${label}: plates "${m.plates[i].label}" and "${m.plates[j].label}" overlap`);
  for (const p of m.plates) {
    assert.deepEqual(p.seeThrough, [], `${label}: nothing fades, blurs or blends plate "${p.label}"`);
    assert.deepEqual(p.spills, [], `${label}: nothing spills out of plate "${p.label}"`);
    assert(p.box.x >= m.safe.x - 1 && p.box.right <= m.safe.right + 1, `${label}: plate "${p.label}" inside the horizontal safe padding`);
    assert(p.box.x >= -1 && p.box.right <= m.viewport.width + 1, `${label}: plate "${p.label}" inside the viewport width`);
    if (short) continue;
    assert(p.box.y >= m.safe.y - 1 && p.box.bottom <= m.safe.bottom + 1 && p.box.bottom <= m.viewport.height + 1, `${label}: plate "${p.label}" inside the safe padding and the viewport`);
    assert(!overlaps(p.box, m.cross), `${label}: plate "${p.label}" leaves the crosshair clear`);
  }
  if (!short) {
    for (const slot of m.slots) assert(!overlaps(slot.box, m.cross), `${label}: ${slot.name} leaves the crosshair clear`);
    if (!covered) assert(m.centreHit, `${label}: a pointer at the stage centre reaches the canvas`);
  }
}
function assertContrast(m, label, scene, { art = true } = {}) {
  assert.equal(m.scene, scene, `${label}: ${scene} art is painted`);
  for (const p of m.plates) {
    assert(p.opaque, `${label}: plate "${p.label}" is opaque, so the art cannot change its contrast`);
    if (art) assert(scene === 'bright' ? p.art > .75 : p.art < .12, `${label}: the art beneath "${p.label}" is really ${scene} (luminance ${p.art.toFixed(3)})`);
    assert(p.runs.length, `${label}: plate "${p.label}" carries text`);
    for (const run of p.runs) assert(run.ratio >= 4.5, `${label}: "${run.text}" is ${run.ratio.toFixed(2)}:1 on its plate`);
  }
}

async function open(browser, base, { width, height, theme = 'dark', lock = 'stub', reducedMotion = 'no-preference', path = 'templates/game.html' }) {
  const context = await browser.newContext({ viewport: { width, height }, colorScheme: theme, reducedMotion });
  await context.route(/^https?:\/\/(?!127\.0\.0\.1)/, route => route.fulfill({ status: 200, contentType: 'text/plain', body: '' }));
  await context.addInitScript(value => localStorage.setItem('sc-theme', value), theme);
  await context.addInitScript(lockStub, lock);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${base}/${path}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  return { context, page, errors };
}
const active = page => page.evaluate(() => { const a = document.activeElement; return { text: a.textContent.trim(), tag: a.tagName, cls: a.className, outline: getComputedStyle(a).outlineStyle, describedby: a.getAttribute('aria-describedby') }; });
const layerState = page => page.evaluate(() => { const l = document.querySelector('[data-sc-game-capture-layer]'), r = l.getBoundingClientRect(), hud = document.querySelector('.sc-game__hud'), controls = [...hud.querySelectorAll('a[href], button, input, select, summary, textarea, [tabindex]')]; return { hidden: l.hidden, heading: l.querySelector('h2').textContent, status: l.querySelector('[data-sc-game-status]').textContent, play: l.querySelector('[data-sc-game-play]').textContent, notice: !l.querySelector('[data-sc-game-denied]').hidden, noticeText: l.querySelector('[data-sc-game-denied]').textContent, keyboard: !l.querySelector('[data-sc-game-keyboard]').hidden, hudInert: hud.inert, controlsInert: controls.length > 0 && controls.every(c => c.inert), controlsLive: controls.every(c => !c.inert), canvasInert: document.querySelector('.sc-game__canvas').inert, covers: r.width > 0 && r.height > 0 }; });
// The accessibility tree, not the DOM: inert content is dropped from it.
async function levelOneHeadings(page) {
  const cdp = await page.context().newCDPSession(page);
  try {
    const { nodes } = await cdp.send('Accessibility.getFullAXTree');
    return nodes.filter(n => !n.ignored && n.role?.value === 'heading' && (n.properties || []).some(p => p.name === 'level' && p.value?.value === 1)).map(n => n.name?.value);
  } finally { await cdp.detach(); }
}
// The canvas focus ring over the art actually under it: the two tones must
// part from each other, and one of them from the art (bright or dark).
const focusRing = page => page.evaluate(() => {
  const parse = v => (v.match(/-?[\d.]+/g) || []).slice(0, 3).map(Number);
  const lum = rgb => { const l = rgb.map(c => { c /= 255; return c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4; }); return .2126 * l[0] + .7152 * l[1] + .0722 * l[2]; };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
  const canvas = document.activeElement, stage = canvas.parentElement, ring = getComputedStyle(stage, '::after');
  const outline = parse(getComputedStyle(canvas).outlineColor), inner = parse(ring.borderTopColor);
  const px = canvas.getContext('2d').getImageData(Math.floor(10 * canvas.width / canvas.clientWidth), Math.floor(canvas.height / 2), 1, 1).data, art = [px[0], px[1], px[2]];
  return { tag: canvas.tagName, scene: stage.getAttribute('data-sc-game-scene'), tones: ratio(outline, inner), art: Math.max(ratio(outline, art), ratio(inner, art)) };
});
const closedDialog = page => page.evaluate(() => { const d = document.getElementById('game-results'), r = d.getBoundingClientRect(); return { open: d.open, display: getComputedStyle(d).display, size: r.width + r.height }; });
async function untilCapture(page, state) { await page.waitForFunction(value => document.querySelector('.sc-game').getAttribute('data-sc-capture') === value, state, { timeout: 4000 }); }
async function tabTo(page, count) { for (let i = 0; i < count; i++) await page.keyboard.press('Tab'); return active(page); }

export async function checkGameShell(browser, base, shots) {
  const shot = (page, name, options = {}) => shots ? page.screenshot({ path: join(shots, `game-${name}.png`), ...options }) : null;
  let scenarios = 0;
  const signatures = {};
  for (const width of [320, 390, 820, 1280]) for (const theme of ['light', 'dark']) {
    const label = `game ${width}px ${theme}`;
    const { context, page, errors } = await open(browser, base, { width, height: HEIGHT[width], theme });
    try {
      let m = await page.evaluate(measure);
      assert.equal(m.theme, theme, `${label}: explicit theme applied`);
      assert(Math.abs(m.stage.width - width) <= 1 && Math.abs(m.stage.height - HEIGHT[width]) <= 1 && Math.abs(m.stage.y) <= 1, `${label}: the viewport stage fills the first screen`);
      assert.equal(m.capture, null, `${label}: no capture attribute before Play`);
      assert.equal(await page.evaluate(() => window.__scLockCalls), 0, `${label}: nothing is requested on load`);
      const idle = await layerState(page);
      assert(!idle.hidden && idle.covers && idle.controlsInert && idle.canvasInert && !idle.hudInert && !idle.notice, `${label}: the capture layer is open over an inert canvas and inert HUD controls`);
      assert.deepEqual(await levelOneHeadings(page), ['First snow'], `${label}: the level heading is the one h1 in the accessibility tree while the layer is open`);
      assert.deepEqual(await closedDialog(page), { open: false, display: 'none', size: 0 }, `${label}: the closed results dialog is not drawn`);
      assertGeometry(m, label, { covered: true });
      await shot(page, `${width}-${theme}-capture`);
      // Keyboard only: Tab, Tab reaches the one primary action; Enter plays.
      assert.equal((await tabTo(page, 1)).cls, 'sc-skip', `${label}: the skip link is the first stop`);
      const play = await tabTo(page, 1);
      assert(play.text === 'Click to play' && play.cls.includes('sc-btn--primary') && play.outline !== 'none', `${label}: Tab reaches "Click to play" with a visible focus ring`);
      assert.equal(await page.evaluate(() => window.__scLockCalls), 0, `${label}: focus alone requests nothing`);
      await page.keyboard.press('Enter');
      await untilCapture(page, 'captured');
      const playing = await layerState(page);
      assert(playing.hidden && playing.controlsLive && !playing.canvasInert, `${label}: capture hides the layer and wakes the HUD`);
      assert.equal((await active(page)).tag, 'CANVAS', `${label}: the canvas takes focus on capture`);
      assert.equal(await page.evaluate(() => window.__scLockCalls), 1, `${label}: exactly one request, from the activation`);
      m = await page.evaluate(measure);
      assertGeometry(m, label);
      assertContrast(m, label, 'bright');
      assert.deepEqual(m.moving, [], `${label}: nothing in the band animates or transitions`);
      (signatures[width] ||= {})[theme] = m.plates.map(p => p.signature);
      await shot(page, `${width}-${theme}-bright`);
      await page.evaluate(() => document.querySelector('[data-sc-game-scene-choice="dark"]').click());
      m = await page.evaluate(measure);
      assertGeometry(m, label);
      assertContrast(m, label, 'dark');
      await shot(page, `${width}-${theme}-dark`);
      // The browser's own Escape exit: released, paused, focus on Resume.
      await page.evaluate(() => window.__scUnlock());
      await untilCapture(page, 'released');
      const paused = await layerState(page), resume = await active(page);
      assert(!paused.hidden && paused.heading === 'Paused' && /Escape released the mouse/.test(await page.locator('[data-sc-game-message]').textContent()), `${label}: release pauses and says why`);
      assert(resume.text === 'Resume' && resume.cls.includes('sc-btn--primary'), `${label}: focus returns to Resume`);
      assert.deepEqual(await levelOneHeadings(page), ['First snow'], `${label}: the level heading stays in the accessibility tree while paused`);
      if (width === 1280) {
        await page.emulateMedia({ media: 'print' });
        const printed = await page.evaluate(() => ({ canvas: getComputedStyle(document.querySelector('.sc-game__canvas')).display, layer: getComputedStyle(document.querySelector('[data-sc-game-capture-layer]')).display, hud: getComputedStyle(document.querySelector('.sc-game__hud')).position, plates: [...document.querySelectorAll('.sc-game__plate')].every(p => getComputedStyle(p).display !== 'none' && p.getBoundingClientRect().height > 0) }));
        assert(printed.canvas === 'none' && printed.layer === 'none' && printed.hud === 'static' && printed.plates, `${label}: print drops art and layers and keeps plates in flow`);
        await page.emulateMedia({ media: 'screen' });
      }
      assert.deepEqual(errors, [], `${label}: no page errors`);
      if (theme === 'dark') assert.deepEqual(signatures[width].dark, signatures[width].light, `${label}: every plate renders identically in light and dark page modes`);
      scenarios++;
      console.log(`  ok ${label}: centred, unobstructed crosshair, no overlap, plates inside the safe area, opaque plate contrast over bright and dark art${theme === 'dark' ? ', plates identical in both page modes' : ''}, h1 in the AX tree, keyboard play and Escape release`);
    } finally { await context.close(); }
  }

  // Refusal: no API at all, and a browser that refuses. Keyboard path onward.
  for (const [lock, theme] of [['missing', 'dark'], ['refuse', 'light']]) {
    const label = `game denied (${lock}, ${theme})`;
    const { context, page, errors } = await open(browser, base, { width: 390, height: 844, theme, lock });
    try {
      await tabTo(page, 2); await page.keyboard.press('Enter');
      await untilCapture(page, 'denied');
      const view = await layerState(page), focus = await active(page);
      assert(!view.hidden && view.notice && view.keyboard && view.status === 'not captured', `${label}: the refusal is written and the keyboard path is offered`);
      assert(/keyboard/.test(view.noticeText) && /try again/.test(view.noticeText), `${label}: the message explains how to continue`);
      assert(focus.text === 'Try again' && focus.cls.includes('sc-btn--primary') && /denied/.test(focus.describedby), `${label}: focus lands on Try again, described by the refusal`);
      if (lock === 'missing') await shot(page, 'denied-390');
      await page.keyboard.press('Shift+Tab');
      assert.equal((await active(page)).text, 'Continue with the keyboard', `${label}: the keyboard path is one Shift+Tab away`);
      await page.keyboard.press('Enter');
      const keyboard = await layerState(page), canvas = await page.evaluate(() => { const c = document.activeElement, s = getComputedStyle(c), ring = getComputedStyle(c.parentElement, '::after'); return { tag: c.tagName, outline: s.outlineStyle, outlineWidth: parseFloat(s.outlineWidth), ring: ring.content !== 'none' && ring.borderTopStyle === 'solid' }; });
      assert(keyboard.hidden && keyboard.controlsLive, `${label}: continuing with the keyboard closes the layer`);
      assert(canvas.tag === 'CANVAS' && canvas.outline === 'solid' && canvas.outlineWidth >= 2 && canvas.ring, `${label}: the focused canvas shows its two-tone ring`);
      for (const scene of ['bright', 'dark']) {
        await page.evaluate(value => document.querySelector(`[data-sc-game-scene-choice="${value}"]`).click(), scene);
        const ring = await focusRing(page);
        assert(ring.tag === 'CANVAS' && ring.scene === scene, `${label}: the canvas keeps focus over the ${scene} art`);
        assert(ring.tones >= 3 && ring.art >= 3, `${label}: the focus ring reads over ${scene} art in ${theme} mode (tones ${ring.tones.toFixed(2)}:1, against the art ${ring.art.toFixed(2)}:1)`);
      }
      await page.evaluate(() => document.querySelector('[data-sc-game-scene-choice="bright"]').click());
      if (lock === 'missing') await shot(page, 'keyboard-focus-390');
      assert.equal((await tabTo(page, 1)).text, 'Pause', `${label}: the HUD's Pause control follows the canvas in the keyboard order`);
      assert.deepEqual(errors, [], `${label}: no page errors`);
      scenarios++;
      console.log(`  ok ${label}: written refusal, focus on Try again, keyboard continuation, canvas focus ring at 3:1 over bright and dark art`);
    } finally { await context.close(); }
  }

  // The native API, unstubbed: whichever answer Chromium gives, the specimen follows it.
  {
    const { context, page, errors } = await open(browser, base, { width: 1280, height: 800, theme: 'dark', lock: 'native' });
    try {
      await tabTo(page, 2); await page.keyboard.press('Enter');
      await page.waitForFunction(() => ['captured', 'denied'].includes(document.querySelector('.sc-game').getAttribute('data-sc-capture')), null, { timeout: 4000 });
      const state = await page.evaluate(() => document.querySelector('.sc-game').getAttribute('data-sc-capture')), view = await layerState(page);
      assert.equal(await page.evaluate(() => window.__scLockCalls), 1, 'native: one real request');
      assert(state === 'captured' ? view.hidden : (!view.hidden && view.notice), `native: the layer agrees with the browser's answer (${state})`);
      assert.deepEqual(errors, [], 'native: no page errors');
      scenarios++;
      console.log(`  ok game native pointer lock: Chromium answered "${state}" and the specimen followed it`);
    } finally { await context.close(); }
  }

  // Results dialog: native showModal, primary focus, Escape and close restore focus.
  {
    const { context, page, errors } = await open(browser, base, { width: 1280, height: 800, theme: 'light' });
    try {
      const opener = page.locator('[data-sc-game-results-open]');
      assert.deepEqual(await closedDialog(page), { open: false, display: 'none', size: 0 }, 'results: closed, the dialog is not drawn');
      await opener.focus(); await page.keyboard.press('Enter');
      const dialog = await page.evaluate(() => { const d = document.getElementById('game-results'), r = d.getBoundingClientRect(), panel = d.querySelector('.sc-game__panel').getBoundingClientRect(), s = getComputedStyle(d); return { open: d.open, modal: d.matches(':modal'), box: [r.x, r.y, r.width, r.height], panel: panel.top >= 0 && panel.bottom <= innerHeight && panel.width > 0, primaries: d.querySelectorAll('.sc-btn--primary').length, border: s.borderTopStyle, background: s.backgroundColor, backdrop: getComputedStyle(d, '::backdrop').backgroundColor, focus: document.activeElement.textContent.trim(), stars: d.querySelectorAll('.sc-game__star').length }; });
      assert(dialog.open && dialog.modal && dialog.primaries === 1, 'results: a modal dialog with one primary action');
      assert(Math.abs(dialog.box[0]) <= 1 && Math.abs(dialog.box[1]) <= 1 && Math.abs(dialog.box[2] - 1280) <= 1 && Math.abs(dialog.box[3] - 800) <= 1 && dialog.panel, 'results: the layer covers the viewport and the panel is visible');
      assert(dialog.border === 'none' && dialog.background === 'rgba(0, 0, 0, 0)' && dialog.backdrop !== 'rgba(0, 0, 0, 0)', 'results: no UA chrome; the backdrop carries the wash');
      assert.equal(dialog.focus, 'Next level', 'results: the primary action takes focus on open');
      assert.equal(dialog.stars, 3, 'results: three star slots on an ordinary card');
      await shot(page, 'results-1280');
      await page.keyboard.press('Escape');
      assert.deepEqual(await page.evaluate(() => [document.getElementById('game-results').open, document.activeElement.hasAttribute('data-sc-game-results-open')]), [false, true], 'results: Escape closes and returns focus to the opener');
      assert.deepEqual(await closedDialog(page), { open: false, display: 'none', size: 0 }, 'results: closed by Escape, the dialog is not drawn');
      await opener.click(); await page.locator('[data-sc-game-results-next]').click();
      assert.deepEqual(await page.evaluate(() => [document.getElementById('game-results').open, document.activeElement.hasAttribute('data-sc-game-results-open')]), [false, true], 'results: the primary action closes and returns focus');
      assert.deepEqual(await closedDialog(page), { open: false, display: 'none', size: 0 }, 'results: closed by its primary action, the dialog is not drawn');
      assert.deepEqual(errors, [], 'results: no page errors');
      scenarios++;
      console.log('  ok game results dialog: undrawn while closed, modal, one primary, focus on open, focus restored on Escape and on close');
    } finally { await context.close(); }
  }

  // Short screens: a 360px-tall landscape phone and a 568px-tall small phone.
  // The panel scrolls and Play stays reachable; once playing, Tab through
  // every HUD control: the HUD scrolls itself to show it, and the stage, the
  // canvas and the crosshair never move.
  for (const [width, height, name] of [[640, 360, 'landscape-360'], [320, 568, 'short-568']]) {
    const label = `game ${width}x${height} short screen`;
    const { context, page, errors } = await open(browser, base, { width, height, theme: 'dark' });
    try {
      const before = await page.evaluate(() => { const l = document.querySelector('[data-sc-game-capture-layer]'), p = l.querySelector('.sc-game__panel').getBoundingClientRect(); return { scrolls: l.scrollHeight > l.clientHeight, top: p.top, overflow: getComputedStyle(l).overflowY }; });
      assert(before.overflow === 'auto' && before.top >= 0 && (before.scrolls || height > 360), `${label}: the taller panel scrolls inside the layer and its top is never cut off`);
      await shot(page, `${name}-top`);
      const play = await tabTo(page, 2);
      assert.equal(play.text, 'Click to play', `${label}: Tab reaches the primary action`);
      const after = await page.evaluate(() => { const l = document.querySelector('[data-sc-game-capture-layer]'), b = document.activeElement.getBoundingClientRect(); return { scrolled: l.scrollTop > 0, visible: b.top >= 0 && b.bottom <= innerHeight && b.left >= 0 && b.right <= innerWidth }; });
      assert(after.visible && (after.scrolled || !before.scrolls), `${label}: focusing Play scrolls it fully into view`);
      await shot(page, `${name}-play`);
      await page.keyboard.press('Enter');
      await untilCapture(page, 'captured');
      let m = await page.evaluate(measure);
      assertGeometry(m, label, { short: true });
      const inside = m.plates.filter(p => p.box.y >= m.safe.y - 1 && p.box.bottom <= m.safe.bottom + 1).length;
      await shot(page, `${name}-hud`);
      const controls = await page.evaluate(() => document.querySelectorAll('.sc-game__hud :is(a[href], button, input, select, summary, textarea, [tabindex])').length);
      assert(controls > 0, `${label}: the HUD has a control to reach`);
      for (let i = 0; i < controls; i++) {
        await page.keyboard.press('Tab');
        const focus = await page.evaluate(() => { const a = document.activeElement, stage = document.querySelector('.sc-game'), b = a.getBoundingClientRect(), s = stage.getBoundingClientRect(); return { inHud: !!a.closest('.sc-game__hud'), text: a.textContent.trim(), inside: b.top >= s.top - 1 && b.bottom <= s.bottom + 1 && b.left >= s.left - 1 && b.right <= s.right + 1 && b.bottom <= innerHeight + 1 }; });
        assert(focus.inHud && focus.inside, `${label}: Tab reaches HUD control "${focus.text}" and it is fully visible inside the stage`);
        m = await page.evaluate(measure);
        assertGeometry(m, `${label} with "${focus.text}" focused`, { short: true });
      }
      await shot(page, `${name}-control-focus`);
      assert.deepEqual(errors, [], `${label}: no page errors`);
      scenarios++;
      console.log(`  ok ${label}: panel scrolls, Play focusable and visible; while playing, ${controls} HUD control(s) reached by Tab and shown by the HUD's own scroll while the stage stays still and the crosshair centred above the HUD; ${inside}/${m.plates.length} specimen plates fit the height (containment is the game's call on a short screen — GAME-PATTERNS.md)`);
    } finally { await context.close(); }
  }

  // The compact stage embedded in the style guide and the visual library, at
  // phone widths, and a 320px stage inside a wide page: the layout follows the
  // STAGE's width (a container query), not the viewport's.
  const embedded = [['styleguide.html', '#guide-game-stage', 320], ['styleguide.html', '#guide-game-stage', 390], ['visual-library.html', '#library-game-stage', 320], ['visual-library.html', '#library-game-stage', 390], ['styleguide.html', '#guide-game-stage', 1280, 320]];
  for (const [file, selector, width, stageWidth] of embedded) {
    const label = `game embedded in ${file} at ${width}px${stageWidth ? `, stage ${stageWidth}px wide` : ''}`;
    const { context, page, errors } = await open(browser, base, { width, height: width === 1280 ? 800 : 844, theme: 'light', path: file });
    try {
      await page.evaluate(([sel, w]) => { const stage = document.querySelector(sel); if (w) stage.style.inlineSize = `${w}px`; stage.scrollIntoView({ block: 'center' }); }, [selector, stageWidth]);
      await page.waitForFunction(sel => { const c = document.querySelector(sel + ' .sc-game__canvas'); return c.width === Math.round(c.clientWidth * Math.min(devicePixelRatio, 2)); }, selector);
      const m = await page.evaluate(measure, selector);
      if (stageWidth) assert(Math.abs(m.stage.width - stageWidth) <= 1 && m.columns === 2, `${label}: a narrow stage in a wide page takes the two-column layout`);
      assertGeometry(m, label, { slots: 5, embedded: true });
      assertContrast(m, label, 'bright', { art: false });
      if (shots && (width === 320 || stageWidth)) await page.locator(selector).screenshot({ path: join(shots, `game-embedded-${file.replace('.html', '')}-${stageWidth ? `${stageWidth}-in-${width}` : width}.png`) });
      assert.deepEqual(errors, [], `${label}: no page errors`);
      scenarios++;
      console.log(`  ok ${label}: ${m.columns} columns, centred and unobstructed crosshair, no overlap, no clipping, opaque plates`);
    } finally { await context.close(); }
  }

  // Reduced motion and forced colours.
  {
    const label = 'game reduced motion + forced colours';
    const { context, page, errors } = await open(browser, base, { width: 390, height: 844, theme: 'dark', reducedMotion: 'reduce' });
    try {
      await tabTo(page, 2); await page.keyboard.press('Enter'); await untilCapture(page, 'captured');
      const m = await page.evaluate(measure);
      assert.deepEqual(m.moving, [], `${label}: nothing moves under reduced motion`);
      assertGeometry(m, label);
      await page.emulateMedia({ forcedColors: 'active' });
      const forced = await page.evaluate(() => { const plate = document.querySelector('.sc-game__plate'), cross = document.querySelector('.sc-game__crosshair'), glyphs = [...document.querySelectorAll('.sc-game__star-glyph')]; const p = getComputedStyle(plate), c = getComputedStyle(cross), dot = getComputedStyle(cross, '::after'); return { plateBorder: p.borderTopStyle !== 'none' && parseFloat(p.borderTopWidth) > 0, cross: c.forcedColorAdjust === 'none' && c.boxShadow !== 'none' && c.borderTopStyle === 'solid', dot: dot.backgroundColor !== 'rgba(0, 0, 0, 0)', glyphs: glyphs.every(g => getComputedStyle(g).forcedColorAdjust === 'none' && getComputedStyle(g).backgroundColor !== 'rgba(0, 0, 0, 0)') }; });
      assert(forced.plateBorder && forced.cross && forced.dot && forced.glyphs, `${label}: plates, crosshair and star glyphs stay visible in forced colours`);
      await shot(page, 'forced-colors-390');
      assert.deepEqual(errors, [], `${label}: no page errors`);
      scenarios++;
      console.log(`  ok ${label}: no animation, plates keep a border, crosshair and glyphs draw in system colours`);
    } finally { await context.close(); }
  }
  console.log(`game-render-check: ${scenarios}/20 rendered game-shell scenarios passed`);
}
