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
  // Only plates that are drawn: a hidden skip control or an empty title card is not on screen.
  const plates = [...stage.querySelectorAll('.sc-game__plate')].filter(plate => plate.getClientRects().length > 0).map(plate => {
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
  const hit = document.elementFromPoint(s.x + s.width / 2, s.y + s.height / 2);   // the stage centre (where the crosshair is asserted to be; a cinematic hides it)
  return { stage: s, viewport: { width: innerWidth, height: innerHeight }, pageWidth: document.documentElement.scrollWidth, safe, plates,
    cross: cb, crossShown: cs.visibility === 'visible' && cs.opacity === '1' && cs.display !== 'none', crossAbove: Number(cs.zIndex) > Number(getComputedStyle(hud).zIndex),
    centreHit: hit === canvas, hudEvents: getComputedStyle(hud).pointerEvents, touch: getComputedStyle(canvas).touchAction,
    scroll: [stage.scrollTop, stage.scrollLeft], columns: getComputedStyle(hud).gridTemplateColumns.split(' ').length,
    slots: [...hud.querySelectorAll(':scope > .sc-game__slot')].map(slot => ({ name: slot.className, box: box(slot) })),
    capture: stage.getAttribute('data-sc-capture'), scene: stage.getAttribute('data-sc-game-scene'), theme: document.documentElement.dataset.theme,
    // What moves: every game element and the stage's letterbox ::before. The
    // documented opt-ins (an --animate milestones, the cinematic bars) are
    // reported apart, so a scenario can allow them with motion and forbid them without.
    moving: [...document.querySelectorAll('[class*="sc-game"]')].flatMap(el => [[el, null], [el, '::before']]).filter(([el, pseudo]) => { const c = getComputedStyle(el, pseudo); return (pseudo === null || c.content !== 'none') && (c.animationName !== 'none' || c.transitionDuration.split(',').some(t => parseFloat(t) > 0)); }).map(([el, pseudo]) => ({ name: el.className + (pseudo || ''), optIn: !!el.closest('.sc-game__milestones--animate') || pseudo === '::before' })) };
}
const overlaps = (a, b) => Math.min(a.right, b.right) - Math.max(a.x, b.x) > .5 && Math.min(a.bottom, b.bottom) - Math.max(a.y, b.y) > .5;
// short: a screen too short for every plate. The shell then guarantees no
// overlap, a still stage and a centred crosshair painted above the HUD, but it
// does not choose which plates to drop, so containment is not asserted.
// covered: a layer is open over the stage, so the centre belongs to it.
// embedded: the stage sits in a longer page, whose own overflow is not the
// stage's to answer for — the stage itself must still fit the viewport.
// cinematic: a cinematic moment hides the crosshair and centres a title card
// across the play area in its upper three quarters (clear of the captions
// below), letting the pointer through to the canvas.
function assertGeometry(m, label, { short = false, slots = 8, covered = false, embedded = false, cinematic = false } = {}) {
  if (embedded) assert(m.stage.x >= -1 && m.stage.right <= m.viewport.width + 1, `${label}: the stage fits the viewport width`);
  else assert(m.pageWidth <= m.viewport.width + 1, `${label}: no page-level horizontal overflow`);
  assert.deepEqual(m.scroll, [0, 0], `${label}: the stage itself never scrolls`);
  if (cinematic) assert(!m.crossShown, `${label}: a cinematic moment hides the crosshair`);
  else {
    assert(Math.abs(m.cross.x + m.cross.width / 2 - (m.stage.x + m.stage.width / 2)) <= 1 && Math.abs(m.cross.y + m.cross.height / 2 - (m.stage.y + m.stage.height / 2)) <= 1, `${label}: crosshair centre equals stage centre`);
    assert(m.crossShown && m.crossAbove, `${label}: the crosshair is drawn, above the HUD`);
  }
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
    if (!cinematic) assert(!overlaps(p.box, m.cross), `${label}: plate "${p.label}" leaves the crosshair clear`);
  }
  if (!short) {
    if (!cinematic) for (const slot of m.slots) assert(!overlaps(slot.box, m.cross), `${label}: ${slot.name} leaves the crosshair clear`);
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

// 8 widths x themes, 2 refusals, native lock, results, 2 short screens, 15
// embedded stages, 2 meter, 3 cinematic, reduced motion + forced colours.
const TOTAL = 35;
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
      assert.deepEqual(m.moving.filter(x => !x.optIn).map(x => x.name), [], `${label}: nothing in the band animates or transitions but its documented opt-ins`);
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
        const printed = await page.evaluate(() => ({ canvas: getComputedStyle(document.querySelector('.sc-game__canvas')).display, layer: getComputedStyle(document.querySelector('[data-sc-game-capture-layer]')).display, hud: getComputedStyle(document.querySelector('.sc-game__hud')).position, plates: [...document.querySelectorAll('.sc-game__plate:not([hidden])')].every(p => getComputedStyle(p).display !== 'none' && p.getBoundingClientRect().height > 0) }));
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
      assert.equal(dialog.stars, 4, 'results: the two coin stars under the milestones and the two other star slots, on an ordinary card');
      // The count-up: it starts from zero, steps (never jumps past a marker
      // unlit), lights each marker and its written star as it passes, draws the
      // fill with the count and announces the total once, at the end.
      const counting = await page.evaluate(() => { const b = document.querySelector('#game-results .sc-game__milestones'); return { state: b.getAttribute('data-sc-game-count'), value: Number(b.querySelector('.sc-game__milestones-value').textContent), status: document.querySelector('[data-sc-game-count-status]').textContent, still: getComputedStyle(b.querySelector('.sc-game__milestones-fill')).transitionDuration }; });
      assert(counting.state === 'counting' && counting.value < 12 && counting.status === '' && parseFloat(counting.still) === 0, `results: the coin count counts up from zero, its fill never transitioned, and says nothing yet (${JSON.stringify(counting)})`);
      const seen = await page.evaluate(() => new Promise(resolve => {
        const b = document.querySelector('#game-results .sc-game__milestones'), out = [], at = Math.round(1 / 3 * 24);
        const look = () => {
          const n = Number(b.querySelector('.sc-game__milestones-value').textContent), lit = b.querySelector('[data-sc-game-milestone="explorer"].sc-game__milestones-marker').classList.contains('is-earned'), star = b.querySelector('li[data-sc-game-milestone="explorer"]');
          const fill = b.querySelector('.sc-game__milestones-fill').getBoundingClientRect(), track = b.querySelector('.sc-game__milestones-track').getBoundingClientRect();
          out.push({ n, drawn: fill.width / (track.width - 2), agree: lit === (n >= at) && star.classList.contains('is-earned') === lit && /earned/.test(star.textContent) === lit, status: document.querySelector('[data-sc-game-count-status]').textContent });
          if (b.getAttribute('data-sc-game-count') === 'done') resolve(out); else requestAnimationFrame(look);
        };
        look();
      }));
      assert(seen.every(s => s.agree), 'results: each marker and its written star light exactly as the count passes the threshold');
      assert(seen.every((s, i) => i === 0 || s.n >= seen[i - 1].n), 'results: the count only goes up');
      // The drawn fill is the count, frame by frame: nothing transitions it, so it can neither rewind from
      // the end nor trail behind (a transition retargeted every step starves on a slow frame rate).
      const off = seen.filter(s => Math.abs(s.drawn - s.n / 24) > 0.01);
      assert(!off.length, `results: the drawn fill is exactly the count (${JSON.stringify(off.slice(0, 3))})`);
      assert(seen.slice(0, -1).every(s => s.status === ''), 'results: nothing is announced while counting');
      const done = await page.evaluate(() => { const b = document.querySelector('#game-results .sc-game__milestones'); return { value: b.querySelector('.sc-game__milestones-value').textContent, fill: getComputedStyle(b).getPropertyValue('--sc-game-milestones-value').trim(), lit: [...b.querySelectorAll('.sc-game__milestones-marker')].map(m => m.classList.contains('is-earned')), status: document.querySelector('[data-sc-game-count-status]').textContent }; });
      assert(done.value === '12' && Number(done.fill) === 0.5 && done.lit.join() === 'true,false', `results: the count ends at 12 of 24, half the track, explorer lit and collector not (${JSON.stringify(done)})`);
      assert(/^12 of 24 coins\. explorer star earned; collector star not yet\.$/.test(done.status), `results: the total is announced once, at the end ("${done.status}")`);
      await shot(page, 'results-1280');
      await page.keyboard.press('Escape');
      assert.deepEqual(await page.evaluate(() => [document.getElementById('game-results').open, document.activeElement.hasAttribute('data-sc-game-results-open')]), [false, true], 'results: Escape closes and returns focus to the opener');
      assert.deepEqual(await closedDialog(page), { open: false, display: 'none', size: 0 }, 'results: closed by Escape, the dialog is not drawn');
      await opener.click(); await page.locator('[data-sc-game-results-next]').click();
      assert.deepEqual(await page.evaluate(() => [document.getElementById('game-results').open, document.activeElement.hasAttribute('data-sc-game-results-open')]), [false, true], 'results: the primary action closes and returns focus');
      assert.deepEqual(await closedDialog(page), { open: false, display: 'none', size: 0 }, 'results: closed by its primary action, the dialog is not drawn');
      // Rendered negative control: a planted transition on the fill is caught trailing the count.
      const trailing = await page.evaluate(() => new Promise(resolve => {
        const style = document.createElement('style'); style.textContent = '.sc-game__milestones-fill { transition: inline-size .5s linear !important; }'; document.head.append(style);
        document.querySelector('[data-sc-game-results-open]').click();
        const b = document.querySelector('#game-results .sc-game__milestones'); let off = 0;
        const look = () => { const f = b.querySelector('.sc-game__milestones-fill').getBoundingClientRect(), t = b.querySelector('.sc-game__milestones-track').getBoundingClientRect(); if (Math.abs(f.width / (t.width - 2) - Number(b.querySelector('.sc-game__milestones-value').textContent) / 24) > 0.01) off++; if (b.getAttribute('data-sc-game-count') === 'done') { style.remove(); document.getElementById('game-results').close(); resolve(off); } else requestAnimationFrame(look); };
        look();
      }));
      assert(trailing > 0, 'results: negative control — a transitioned fill is caught out of step with the count');
      assert.deepEqual(errors, [], 'results: no page errors');
      scenarios++;
      console.log(`  ok game results dialog: undrawn while closed, modal, one primary, focus on open, focus restored on Escape and on close; the coin count stepped through ${seen.length} frames from ${seen[0].n} to 12, markers and stars lit with it, one announcement at the end`);
    } finally { await context.close(); }
  }

  // Meter states over the art, on the template's compact in-play stage: each
  // state changes the word, the glyph's shape and the fill's thickness (colour
  // only repeats them); the text reads at 4.5:1, the fill against its track and
  // the glyph against the plate at 3:1; the accessibility tree has one named
  // meter per state whose value carries the word; the coin track sits above.
  for (const [width, theme] of [[390, 'dark'], [1280, 'light']]) {
    const label = `game meter ${width}px ${theme}`;
    const { context, page, errors } = await open(browser, base, { width, height: HEIGHT[width], theme });
    try {
      await page.evaluate(() => document.getElementById('game-meters-stage').scrollIntoView({ block: 'center' }));
      await page.waitForFunction(() => { const c = document.querySelector('#game-meters-stage .sc-game__canvas'); return c.width === Math.round(c.clientWidth * Math.min(devicePixelRatio, 2)); });
      const looks = {};
      for (const state of ['calm', 'alert', 'danger']) {
        const look = await page.evaluate(id => {
          const parse = v => (v.match(/-?[\d.]+/g) || []).slice(0, 3).map(Number);
          const lum = rgb => { const l = rgb.map(c => { c /= 255; return c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4; }); return .2126 * l[0] + .7152 * l[1] + .0722 * l[2]; };
          const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
          const m = document.getElementById(id), q = s => m.querySelector(s), cs = s => getComputedStyle(q(s));
          const plate = parse(getComputedStyle(m).backgroundColor), track = parse(cs('.sc-game__meter-track').backgroundColor), fill = q('.sc-game__meter-fill').getBoundingClientRect(), inner = q('.sc-game__meter-track').getBoundingClientRect();
          return { state: m.dataset.state, word: q('.sc-game__meter-state').textContent, valuetext: m.getAttribute('aria-valuetext'), shape: cs('.sc-game__meter-glyph').clipPath, height: Math.round(fill.height * 10) / 10, width: fill.width / (inner.width - 2), now: Number(m.getAttribute('aria-valuenow')),
            fillVsTrack: ratio(parse(cs('.sc-game__meter-fill').backgroundColor), track), glyphVsPlate: ratio(parse(cs('.sc-game__meter-glyph').backgroundColor), plate), wordVsPlate: ratio(parse(cs('.sc-game__meter-state').color), plate) };
        }, `game-meters-${state}-meter`);
        assert(look.state === state && look.word && look.valuetext.includes(look.word), `${label}: ${state} is written ("${look.word}") and carried by aria-valuetext`);
        assert(Math.abs(look.width - look.now / 100) <= 0.02, `${label}: the ${state} fill is drawn at the reported value (${look.width.toFixed(3)} vs ${look.now}%)`);
        assert(look.fillVsTrack >= 3 && look.glyphVsPlate >= 3 && look.wordVsPlate >= 4.5, `${label}: ${state} contrast — fill ${look.fillVsTrack.toFixed(2)}:1, glyph ${look.glyphVsPlate.toFixed(2)}:1, word ${look.wordVsPlate.toFixed(2)}:1`);
        looks[state] = look;
      }
      assert(new Set(Object.values(looks).map(l => l.shape)).size === 3, `${label}: the glyph takes three different shapes`);
      assert(looks.calm.height < looks.alert.height && looks.alert.height < looks.danger.height, `${label}: the fill thickens with the state (${looks.calm.height} < ${looks.alert.height} < ${looks.danger.height}px)`);
      const cdp = await page.context().newCDPSession(page);
      try {
        const { nodes } = await cdp.send('Accessibility.getFullAXTree');
        const meters = nodes.filter(n => !n.ignored && n.role?.value === 'meter').map(n => [n.name?.value, String((n.properties || []).find(p => p.name === 'valuetext')?.value?.value ?? '')]);
        assert(meters.length === 3 && meters.every(([name]) => name === 'awareness') && ['calm', 'alert', 'danger'].every(st => meters.some(([, v]) => v.includes(looks[st].word))), `${label}: three named meters in the accessibility tree, each value carrying its word (${JSON.stringify(meters)})`);
      } finally { await cdp.detach(); }
      const m = await page.evaluate(measure, '#game-meters-stage');
      assertGeometry(m, label, { slots: 4, embedded: true });
      assertContrast(m, label, 'bright', { art: false });
      await shot(page, `meters-${width}-${theme}`, { clip: await page.evaluate(() => { const r = document.getElementById('game-meters-stage').getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; }) });
      assert.deepEqual(errors, [], `${label}: no page errors`);
      scenarios++;
      console.log(`  ok ${label}: calm, alert and danger differ in word, glyph shape and fill thickness (${looks.calm.height} < ${looks.alert.height} < ${looks.danger.height}px); fill, glyph and word contrast; three named meters in the AX tree; the coin track above them clear of the crosshair`);
    } finally { await context.close(); }
  }

  // A cinematic moment over the full specimen: letterbox bars under the HUD
  // that take no input, only the caption, skip control and title card on
  // screen, a caption at most 60ch wide at the bottom centre, a centred title
  // card, the skip control in the bottom-right taking focus, Escape that does
  // not skip, Space that does, and focus back on the opener.
  for (const [width, theme, reducedMotion] of [[390, 'dark', 'no-preference'], [1280, 'light', 'no-preference'], [1280, 'dark', 'reduce']]) {
    const label = `game cinematic ${width}px ${theme}${reducedMotion === 'reduce' ? ' reduced motion' : ''}`;
    const { context, page, errors } = await open(browser, base, { width, height: HEIGHT[width], theme, reducedMotion });
    try {
      await tabTo(page, 2); await page.keyboard.press('Enter'); await untilCapture(page, 'captured');
      // The first frame of the moment: with motion the bars start from nothing (they grow in); without, they are already there.
      const firstBars = await page.evaluate(() => { document.querySelector('[data-sc-game-cinematic-open]').click(); return parseFloat(getComputedStyle(document.querySelector('.sc-game'), '::before').borderTopWidth); });
      await page.waitForFunction(() => parseFloat(getComputedStyle(document.querySelector('.sc-game'), '::before').borderTopWidth) >= 16 && !document.querySelector('.sc-game').getAnimations({ subtree: true }).length, null, { timeout: 4000 });
      assert(reducedMotion === 'reduce' ? firstBars >= 16 : firstBars < 16, `${label}: the bars ${reducedMotion === 'reduce' ? 'are drawn at once' : 'grow in from the edges'} (first frame ${firstBars}px)`);
      const moment = await page.evaluate(() => {
        const stage = document.querySelector('.sc-game'), bars = getComputedStyle(stage, '::before'), s = stage.getBoundingClientRect(), hud = document.querySelector('.sc-game__hud');
        const box = el => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, right: r.right, bottom: r.bottom, width: r.width, height: r.height }; };
        const caption = document.querySelector('.sc-game__caption'), title = document.querySelector('.sc-game__title-card > .sc-game__plate'), skip = document.querySelector('.sc-game__skip');
        const probe = document.createElement('span'); probe.style.cssText = 'display:inline-block;inline-size:60ch;block-size:0'; caption.append(probe); const ch60 = probe.getBoundingClientRect().width; probe.remove();
        const pad = getComputedStyle(hud), safe = { right: s.right - parseFloat(pad.paddingRight), bottom: s.bottom - parseFloat(pad.paddingBottom) };
        const visible = [...stage.querySelectorAll('.sc-game__plate')].filter(p => p.getClientRects().length).map(p => p.className);
        const a = document.activeElement, ring = getComputedStyle(a);
        return { cinematic: stage.classList.contains('sc-game--cinematic'), bars: { top: parseFloat(bars.borderTopWidth), bottom: parseFloat(bars.borderBottomWidth), events: bars.pointerEvents, z: bars.zIndex, transition: bars.transitionDuration, colour: bars.borderTopColor },
          hudZ: getComputedStyle(hud).zIndex, stage: box(stage), safe, caption: box(caption), ch60, title: box(title), skip: box(skip), visible,
          focus: { text: a.textContent.trim(), inSkip: !!a.closest('.sc-game__skip'), outline: ring.outlineStyle, width: parseFloat(ring.outlineWidth) }, centreHit: document.elementFromPoint(s.x + s.width / 2, s.y + s.height / 2) === stage.querySelector('.sc-game__canvas') };
      });
      assert(moment.cinematic && moment.bars.top >= 16 && moment.bars.top === moment.bars.bottom && moment.bars.events === 'none' && Number(moment.bars.z) <= Number(moment.hudZ), `${label}: letterbox bars, equal top and bottom, under the HUD and never taking input (${JSON.stringify(moment.bars)})`);
      assert(reducedMotion === 'reduce' ? parseFloat(moment.bars.transition) === 0 : parseFloat(moment.bars.transition) > 0, `${label}: the bars ${reducedMotion === 'reduce' ? 'appear at once under reduced motion' : 'grow in when motion is allowed'}`);
      assert.deepEqual(moment.visible.sort(), ['sc-game__plate', 'sc-game__plate sc-game__caption', 'sc-game__plate sc-game__skip'], `${label}: only the caption, the skip control and the title card are on screen`);
      assert(moment.caption.width <= moment.ch60 + 1 && Math.abs(moment.caption.x + moment.caption.width / 2 - (moment.stage.x + moment.stage.width / 2)) <= 1, `${label}: the caption is centred and at most 60ch wide (${moment.caption.width.toFixed(0)} of ${moment.ch60.toFixed(0)}px)`);
      assert(moment.caption.y > moment.stage.y + moment.stage.height / 2 && moment.caption.bottom <= moment.safe.bottom + 1, `${label}: the caption sits low, inside the safe area`);
      assert(Math.abs(moment.title.x + moment.title.width / 2 - (moment.stage.x + moment.stage.width / 2)) <= 1 && Math.abs(moment.title.y + moment.title.height / 2 - (moment.stage.y + moment.stage.height * 0.375)) <= 1, `${label}: the title card is centred across the stage, in its upper three quarters (centre at 37.5% of its height)`);
      assert(moment.title.bottom < moment.caption.y, `${label}: the title card ends above the caption`);
      assert(Math.abs(moment.skip.right - moment.safe.right) <= 1 && moment.skip.bottom <= moment.safe.bottom + 1 && moment.skip.x > moment.stage.x + moment.stage.width / 2 && moment.skip.y > moment.stage.y + moment.stage.height / 2, `${label}: the skip control sits in the bottom-right, inside the safe area`);
      assert(moment.focus.inSkip && moment.focus.text === 'Skip' && moment.focus.outline !== 'none' && moment.focus.width >= 2, `${label}: the skip button takes focus with a visible ring`);
      assert(moment.centreHit, `${label}: the title card lets a pointer at the centre through to the canvas`);
      const m = await page.evaluate(measure);
      assertGeometry(m, label, { cinematic: true });
      assertContrast(m, label, 'bright', { art: false });
      await shot(page, `cinematic-${width}-${theme}${reducedMotion === 'reduce' ? '-reduced' : ''}`);
      // Rendered negative controls: bars or a title card that take pointer input, and a caption let out past
      // 60ch, are caught by the same measurements (each planted rule is removed again).
      const planted = await page.evaluate(() => {
        const stage = document.querySelector('.sc-game'), s = stage.getBoundingClientRect(), canvas = stage.querySelector('.sc-game__canvas'), caption = document.querySelector('.sc-game__caption');
        const centre = () => document.elementFromPoint(s.x + s.width / 2, s.y + s.height / 2) === canvas;
        const plant = (css, read) => { const style = document.createElement('style'); style.textContent = css; document.head.append(style); const out = read(); style.remove(); return out; };
        const probe = document.createElement('span'); probe.style.cssText = 'display:inline-block;inline-size:60ch;block-size:0'; caption.append(probe); const ch60 = probe.getBoundingClientRect().width; probe.remove();
        return { bars: plant('.sc-game--cinematic::before { pointer-events: auto !important; }', centre), card: plant('.sc-game__title-card { pointer-events: auto !important; }', centre), midStage: plant('.sc-game__title-card { inset: 0 !important; }', () => { const t = document.querySelector('.sc-game__title-card > .sc-game__plate').getBoundingClientRect(); return Math.abs(t.y + t.height / 2 - (s.y + s.height * 0.375)) <= 1; }), wide: caption.parentElement.getBoundingClientRect().width <= ch60 + 1 ? 'n/a: the slot is narrower than 60ch' : plant('.sc-game__caption { max-inline-size: none !important; } .sc-game__caption-line::after { content: " and it has been rolling round this kitchen since breakfast, so keep an eye on it"; }', () => caption.getBoundingClientRect().width > ch60 + 1), clean: centre() };
      });
      assert(!planted.bars && !planted.card && !planted.midStage && planted.wide && planted.clean, `${label}: rendered negative controls are caught — bars or a title card taking input block the centre, a title card centred on the whole stage leaves the upper three quarters, an unbounded caption passes 60ch (${JSON.stringify(planted)})`);
      // The skip plate hugs its button and keys in any corner: one row where it fits, the keys under the
      // button where it does not. Rendered negative control: a wrapping flex row stretches the plate to the
      // slot once it wraps (only a narrow corner wraps, so only there can it be caught).
      const hug = await page.evaluate(() => {
        const skip = document.querySelector('.sc-game__skip');
        const read = () => {
          const r = skip.getBoundingClientRect(), cs = getComputedStyle(skip), kids = [...skip.children].map(k => k.getBoundingClientRect());
          const inner = r.width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - parseFloat(cs.borderLeftWidth) - parseFloat(cs.borderRightWidth);
          // Items on one row overlap vertically (centred, so their tops differ); a new row starts below the last.
          let rows = 0, floor = -Infinity;
          for (const k of [...kids].sort((x, y) => x.top - y.top)) if (k.top >= floor - 1) { rows++; floor = k.bottom; } else floor = Math.max(floor, k.bottom);
          const content = rows > 1 ? Math.max(...kids.map(k => k.width)) : kids.reduce((a, k) => a + k.width, 0) + (parseFloat(cs.columnGap) || 0) * (kids.length - 1);
          return { rows, slack: Math.round(inner - content) };
        };
        const clean = read();
        const style = document.createElement('style'); style.textContent = '.sc-game__skip { display: flex !important; flex-wrap: wrap !important; justify-content: flex-end !important; }'; document.head.append(style);
        const wrapped = read(); style.remove();
        return { clean, wrapped };
      });
      assert(hug.clean.slack <= 1 && (hug.wrapped.rows === 1 || hug.wrapped.slack > 1), `${label}: the skip plate hugs its button and keys (${hug.clean.rows} row(s)); a wrapping row is caught stretching it (${JSON.stringify(hug)})`);
      // The page's motion pause (sc-motion.js) stills the band as reduced motion does.
      const paused = await page.evaluate(() => {
        const root = document.documentElement, marker = document.querySelector('.sc-game__milestones--animate .sc-game__milestones-marker');
        const read = () => ({ bars: parseFloat(getComputedStyle(document.querySelector('.sc-game'), '::before').transitionDuration), marker: parseFloat(getComputedStyle(marker).transitionDuration) });
        const before = read(); root.setAttribute('data-sc-motion-paused', 'true'); const during = read(); root.removeAttribute('data-sc-motion-paused');
        return { before, during };
      });
      assert(paused.during.bars === 0 && paused.during.marker === 0 && (reducedMotion === 'reduce' || (paused.before.bars > 0 && paused.before.marker > 0)), `${label}: the page's motion pause stills the bars and the milestone markers (${JSON.stringify(paused)})`);
      if (reducedMotion === 'reduce') {
        // Forced colours: the bars become Canvas (a frame, not content) and the plates keep their edge.
        await page.emulateMedia({ forcedColors: 'active' });
        const forced = await page.evaluate(() => { const bars = getComputedStyle(document.querySelector('.sc-game'), '::before'), plates = [...document.querySelectorAll('.sc-game__caption, .sc-game__skip, .sc-game__title-card > .sc-game__plate')].map(p => getComputedStyle(p)); return { adjust: bars.forcedColorAdjust, width: parseFloat(bars.borderTopWidth), plates: plates.every(p => p.borderTopStyle === 'solid' && parseFloat(p.borderTopWidth) > 0) }; });
        assert(forced.adjust === 'none' && forced.width >= 16 && forced.plates, `${label}: in forced colours the bars stay drawn as Canvas and every plate keeps a border (${JSON.stringify(forced)})`);
        await shot(page, 'cinematic-forced-colors-1280');
        await page.emulateMedia({ forcedColors: 'none' });
      }
      await page.keyboard.press('Escape');
      assert(await page.evaluate(() => document.querySelector('.sc-game').classList.contains('sc-game--cinematic')), `${label}: Escape does not skip (it pauses in a game)`);
      await page.evaluate(() => document.querySelector('.sc-game__skip button').focus());
      await page.keyboard.press('Space');
      const after = await page.evaluate(() => ({ cinematic: document.querySelector('.sc-game').classList.contains('sc-game--cinematic'), captions: document.querySelector('.sc-game__captions').childElementCount, title: document.querySelector('.sc-game__title-card').childElementCount, skipHidden: document.querySelector('.sc-game__skip').hidden, focus: document.activeElement.hasAttribute('data-sc-game-cinematic-open'), crosshair: getComputedStyle(document.querySelector('.sc-game__crosshair')).display }));
      assert(!after.cinematic && after.captions === 0 && after.title === 0 && after.skipHidden && after.focus && after.crosshair !== 'none', `${label}: Space on Skip ends the moment, clears it, restores the HUD and returns focus to the opener (${JSON.stringify(after)})`);
      assert.deepEqual(errors, [], `${label}: no page errors`);
      scenarios++;
      console.log(`  ok ${label}: bars ${moment.bars.top}px under the HUD, only caption/skip/title on screen, 60ch caption at the bottom centre, title card centred across and above it, skip bottom-right with focus and hugging its keys in ${hug.clean.rows} row(s), motion pause honoured, Escape keeps the moment, Space skips and focus returns`);
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
      const controls = await page.evaluate(() => [...document.querySelector('.sc-game__hud').querySelectorAll(':is(a[href], button, input, select, summary, textarea, [tabindex])')].filter(c => c.getClientRects().length > 0).length);
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
  // The cinematic and meter stages follow the same rules: the cinematic one
  // hides its crosshair and centres its title card across the play area, clear of its captions.
  const SLOTS = { 'game-stage': { slots: 5 }, 'game-cinema-stage': { slots: 2, cinematic: true }, 'game-meters-stage': { slots: 4 } };
  const embedded = [];
  for (const [file, prefix] of [['styleguide.html', 'guide'], ['visual-library.html', 'library']]) for (const kind of Object.keys(SLOTS)) for (const width of [320, 390]) embedded.push([file, `#${prefix}-${kind}`, width, undefined, SLOTS[kind]]);
  for (const kind of Object.keys(SLOTS)) embedded.push(['styleguide.html', `#guide-${kind}`, 1280, 320, SLOTS[kind]]);
  for (const [file, selector, width, stageWidth, options] of embedded) {
    const label = `game embedded in ${file} at ${width}px${stageWidth ? `, stage ${stageWidth}px wide` : ''}`;
    const { context, page, errors } = await open(browser, base, { width, height: width === 1280 ? 800 : 844, theme: 'light', path: file });
    try {
      await page.evaluate(([sel, w]) => { const stage = document.querySelector(sel); if (w) stage.style.inlineSize = `${w}px`; stage.scrollIntoView({ block: 'center' }); }, [selector, stageWidth]);
      await page.waitForFunction(sel => { const c = document.querySelector(sel + ' .sc-game__canvas'); return c.width === Math.round(c.clientWidth * Math.min(devicePixelRatio, 2)); }, selector);
      const m = await page.evaluate(measure, selector);
      if (stageWidth) assert(Math.abs(m.stage.width - stageWidth) <= 1 && m.columns === 2, `${label}: a narrow stage in a wide page takes the two-column layout`);
      assertGeometry(m, label, { ...options, embedded: true });
      assertContrast(m, label, 'bright', { art: false });
      if (shots && (width === 320 || stageWidth)) await page.locator(selector).screenshot({ path: join(shots, `game-embedded-${file.replace('.html', '')}-${selector.slice(1)}-${stageWidth ? `${stageWidth}-in-${width}` : width}.png`) });
      assert.deepEqual(errors, [], `${label}: no page errors`);
      scenarios++;
      console.log(`  ok ${label} (${selector}): ${m.columns} columns, ${options.cinematic ? 'crosshair hidden for the moment, title card centred across and clear of the captions' : 'centred and unobstructed crosshair'}, no overlap, no clipping, opaque plates`);
    } finally { await context.close(); }
  }

  // Reduced motion and forced colours.
  {
    const label = 'game reduced motion + forced colours';
    const { context, page, errors } = await open(browser, base, { width: 390, height: 844, theme: 'dark', reducedMotion: 'reduce' });
    try {
      await tabTo(page, 2); await page.keyboard.press('Enter'); await untilCapture(page, 'captured');
      const m = await page.evaluate(measure);
      assert.deepEqual(m.moving.map(x => x.name), [], `${label}: nothing moves under reduced motion, not even the opt-ins`);
      assertGeometry(m, label);
      await page.emulateMedia({ forcedColors: 'active' });
      const forced = await page.evaluate(() => { const plate = document.querySelector('.sc-game__plate'), cross = document.querySelector('.sc-game__crosshair'), glyphs = [...document.querySelectorAll('.sc-game__star-glyph, .sc-game__meter-glyph, .sc-game__meter-fill, .sc-game__milestones-marker, .sc-game__milestones-fill')]; const p = getComputedStyle(plate), c = getComputedStyle(cross), dot = getComputedStyle(cross, '::after'); return { plateBorder: p.borderTopStyle !== 'none' && parseFloat(p.borderTopWidth) > 0, cross: c.forcedColorAdjust === 'none' && c.boxShadow !== 'none' && c.borderTopStyle === 'solid', dot: dot.backgroundColor !== 'rgba(0, 0, 0, 0)', glyphs: glyphs.length >= 8 && glyphs.every(g => getComputedStyle(g).forcedColorAdjust === 'none' && getComputedStyle(g).backgroundColor !== 'rgba(0, 0, 0, 0)'), tracks: [...document.querySelectorAll('.sc-game__meter-track, .sc-game__milestones-track')].every(t => getComputedStyle(t).borderTopStyle === 'solid') }; });
      assert(forced.plateBorder && forced.cross && forced.dot && forced.glyphs && forced.tracks, `${label}: plates, crosshair, star and meter glyphs, fills and milestone markers stay visible in forced colours (${JSON.stringify(forced)})`);
      await shot(page, 'forced-colors-390');
      // The results count-up under reduced motion: the end at once, announced once.
      await page.emulateMedia({ forcedColors: 'none' });
      await page.evaluate(() => { document.querySelector('[data-sc-game-results-open]').click(); });
      const instant = await page.evaluate(() => { const b = document.querySelector('#game-results .sc-game__milestones'); return { state: b.getAttribute('data-sc-game-count'), value: b.querySelector('.sc-game__milestones-value').textContent, status: document.querySelector('[data-sc-game-count-status]').textContent, glide: getComputedStyle(b.querySelector('.sc-game__milestones-marker')).transitionDuration }; });
      assert(instant.state === 'done' && instant.value === '12' && /^12 of 24 coins/.test(instant.status) && parseFloat(instant.glide) === 0, `${label}: under reduced motion the results show the final count at once, static, announced once (${JSON.stringify(instant)})`);
      await page.keyboard.press('Escape');
      assert.deepEqual(errors, [], `${label}: no page errors`);
      scenarios++;
      console.log(`  ok ${label}: no animation, plates keep a border, crosshair and glyphs draw in system colours`);
    } finally { await context.close(); }
  }
  assert.equal(scenarios, TOTAL, `game-render-check: ${scenarios} of ${TOTAL} scenarios ran`);
  console.log(`game-render-check: ${scenarios}/${TOTAL} rendered game-shell scenarios passed`);
}
