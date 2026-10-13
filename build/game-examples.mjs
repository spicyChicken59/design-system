// Engine-independent game-shell specimens. Illustrative values only: no
// engine, no rules, no persistence. The canvas is painted by the specimen-only
// build/game-specimen.js; the optional runtime is sc-game.js (build/game.js).
const star = (label, state, rule, earned) => `<li class="sc-game__star${earned ? ' is-earned' : ''}"><span class="sc-game__star-glyph" aria-hidden="true"></span><span class="sc-game__star-label">${label}</span><span class="sc-game__star-state">${state}</span><span class="sc-game__star-rule">${rule}</span></li>`;
export const starSlots = (label, sprinter = ['not yet', false]) => `<ol class="sc-game__stars" aria-label="${label}">${star('explorer', 'earned', '8 of 24 coins in one run', true)}${star('builder', 'earned this run', 'a snowball under the 38 ft arch', true)}${star('sprinter', sprinter[0], 'finish within 3:00.00', sprinter[1])}</ol>`;

const canvas = (p, focusable) => `<canvas class="sc-game__canvas" id="${p}-canvas" role="img" aria-label="Illustrative art, not a game: a bright snow field with a timber arch and two gold coins"${focusable ? ' tabindex="0"' : ''} width="960" height="540"></canvas>`;
const crosshair = '<span class="sc-game__crosshair" aria-hidden="true"></span>';
const level = (p, h) => `<div class="sc-game__slot sc-game__slot--tl"><section class="sc-game__plate" aria-labelledby="${p}-level"><p class="sc-eyebrow">level 1 of 5</p><h${h} id="${p}-level">First snow</h${h}><p>Fit a snowball under the arch.</p></section></div>`;
const coins = '<div class="sc-game__slot sc-game__slot--top"><p class="sc-game__plate sc-game__count"><span class="sc-game__count-value">12 / 24</span> coins</p></div>';

// Milestones: a count along a track whose star markers light as it passes
// them. The consumer computes the fractions (count / total, threshold / total)
// and the earned state; the system only draws them. data-sc-game-milestone
// pairs a marker with its written star for the specimen's count-up; the band
// styles nothing from it.
const marker = ([name, at, earned]) => `<span class="sc-game__milestones-marker${earned ? ' is-earned' : ''}" data-sc-game-milestone="${name}" style="--sc-game-milestone-at:${at}"></span>`;
export function milestones({ id = '', label, count, total, unit, value, markers, note = '', list = '', animate = false }) {
  return `<div class="sc-game__milestones${animate ? ' sc-game__milestones--animate' : ''}"${id ? ` id="${id}"` : ''} style="--sc-game-milestones-value:${value}" data-sc-game-count-to="${count}" data-sc-game-count-total="${total}"><p class="sc-game__milestones-head">${label ? `<span class="sc-game__milestones-label">${label}</span> ` : ''}<span class="sc-game__milestones-count"><span class="sc-game__milestones-value">${count}</span> of ${total} ${unit}</span></p><div class="sc-game__milestones-track" aria-hidden="true"><span class="sc-game__milestones-fill"></span>${markers.map(marker).join('')}</div>${note ? `<p class="sc-game__milestones-note">${note}</p>` : ''}${list}</div>`;
}
const coinMarkers = [['explorer', 0.3333, true], ['collector', 1, false]];
// In play: the coin plate shows how far the next coin star is.
const coinTrack = '<div class="sc-game__slot sc-game__slot--top"><div class="sc-game__plate">' + milestones({ count: 12, total: 24, unit: 'coins', value: 0.5, markers: coinMarkers, note: 'collector star at 24' }) + '</div></div>';
// On the results: the same track counts up, and each marker lights the star written under it.
const coinStars = (explorer, collector) => `<ol class="sc-game__stars" aria-label="Coin stars this run">${star('explorer', explorer ? 'earned this run' : 'not yet', '8 of 24 coins', explorer).replace('<li class', '<li data-sc-game-milestone="explorer" class')}${star('collector', collector ? 'earned this run' : 'not yet', 'all 24 coins · 12 to go', collector).replace('<li class', '<li data-sc-game-milestone="collector" class')}</ol>`;

// Meter: one level with a written state. The words, the glyph's shape and the
// fill's thickness change with data-state; colour only repeats them.
export const METER_STATES = { calm: ['Unseen', 18], alert: ['A guard noticed something', 58], danger: ['Spotted!', 100] };
export const meter = (p, state = 'alert') => {
  const [word, now] = METER_STATES[state];
  return `<div class="sc-game__plate sc-game__meter" id="${p}-meter" role="meter" aria-labelledby="${p}-meter-label" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${now}" aria-valuetext="${word} (${now}%)" data-state="${state}" style="--sc-game-meter-value:${now / 100}"><p class="sc-game__meter-label" id="${p}-meter-label">awareness</p><span class="sc-game__meter-glyph" aria-hidden="true"></span><p class="sc-game__meter-state">${word}</p><span class="sc-game__meter-track" aria-hidden="true"><span class="sc-game__meter-fill"></span></span></div>`;
};

// Cinematic moments: a persistent polite caption region, a skip plate (a real
// button, keys written beside it — never Escape) and a title-card region.
export const caption = (speaker, line) => `<p class="sc-game__plate sc-game__caption">${speaker ? `<span class="sc-game__caption-speaker">${speaker}</span>` : ''}<span class="sc-game__caption-line">${line}</span></p>`;
const captions = (p, content = '') => `<div class="sc-game__captions" id="${p}-captions" aria-live="polite" aria-atomic="true">${content}</div>`;
const skip = (hidden) => `<div class="sc-game__plate sc-game__skip" data-sc-game-skip${hidden ? ' hidden' : ''}><button class="sc-btn sc-btn--secondary sc-btn--sm" type="button" aria-keyshortcuts="Space Enter">Skip</button> <span class="sc-game__skip-hint"><kbd>Space</kbd> or <kbd>Enter</kbd></span></div>`;
export const titlePlate = (p, h, eyebrow, title) => `<div class="sc-game__plate"><p class="sc-eyebrow">${eyebrow}</p><h${h} class="sc-game__title-card-title" id="${p}-title-card-title">${title}</h${h}></div>`;
const titleCard = (p, content = '') => `<div class="sc-game__title-card" id="${p}-title-card" aria-live="polite">${content}</div>`;
const timer = '<div class="sc-game__slot sc-game__slot--tr"><div class="sc-game__plate sc-game__timer" role="timer" aria-label="Level time"><time class="sc-game__timer-value" datetime="PT47.32S">0:47.32</time><span class="sc-game__timer-state">running</span></div></div>';
// The stars are the tallest side plate, so they take the left slot: on a
// narrow stage left sits above the play area, where the lighter top half has
// room, and the bottom half already carries the measure.
const stars = '<div class="sc-game__slot sc-game__slot--left"><div class="sc-game__plate">' + starSlots('Stars for this level') + '</div></div>';
const keyCount = '<div class="sc-game__slot sc-game__slot--right"><p class="sc-game__plate sc-game__count"><span class="sc-game__count-value">1</span> purple key held</p></div>';
const measure = (slot = 'bl') => '<div class="sc-game__slot sc-game__slot--' + slot + '"><div class="sc-game__plate sc-game__measure"><p class="sc-game__measure-label">diameter</p><p class="sc-game__measure-value">37.9 <small>ft</small></p><figure class="sc-benchmark" style="--sc-benchmark-position:75.8%;--sc-benchmark-reference:76%"><figcaption class="sc-benchmark__head"><span class="sc-benchmark__label">arch, ft</span><strong class="sc-benchmark__value">37.9 ft</strong></figcaption><div class="sc-benchmark__track" aria-hidden="true"><span class="sc-benchmark__reference"></span><span class="sc-benchmark__point"></span></div><div class="sc-benchmark__scale" aria-hidden="true"><span>0</span><span>38</span><span>50</span></div></figure><p class="sc-game__measure-note">fits under 38 ft</p></div></div>';
const hint = (p, withCaptions = false) => `<div class="sc-game__slot sc-game__slot--bottom"><p class="sc-game__plate sc-game__hint" id="${p}-hint" aria-live="polite">hold <kbd>E</kbd> to melt the ice wall</p>${withCaptions ? captions(p) : ''}</div>`;
const keys = `<dl class="sc-game__keys"><div><dt><kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd></dt><dd>roll the snowball</dd></div><div><dt>mouse, or <kbd>↑</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd></dt><dd>look around</dd></div><div><dt>hold <kbd>E</kbd></dt><dd>melt the ice in front of you</dd></div><div><dt><kbd>Space</kbd></dt><dd>jump</dd></div><div><dt><kbd>Esc</kbd></dt><dd>release the mouse and pause</dd></div></dl>`;
const sceneToggle = p => `<div class="sc-field sc-field--group"><span class="sc-field__label" id="${p}-scene-label">art</span><div class="sc-tabs" role="group" aria-labelledby="${p}-scene-label"><button type="button" class="sc-tab" aria-pressed="true" aria-controls="${p}-stage" data-sc-game-scene-choice="bright">Bright snow</button><button type="button" class="sc-tab" aria-pressed="false" aria-controls="${p}-stage" data-sc-game-scene-choice="dark">Dark cave</button></div></div>`;

// The capture layer is what a real game's start/pause screen should contain:
// the controls, how to get the mouse back, one primary action, and a written
// way forward when the browser refuses the capture.
const captureLayer = p => `<div class="sc-game__layer" data-sc-game-capture-layer><section class="sc-card sc-game__panel" aria-labelledby="${p}-capture-title"><p class="sc-eyebrow">illustrative specimen · no game logic</p><h2 id="${p}-capture-title" data-sc-game-heading>Ready to play</h2><p>Play captures the mouse, so moving it turns the camera. <strong>Escape releases the mouse and pauses.</strong></p><div class="sc-notice" id="${p}-denied" data-sc-game-denied hidden><p class="sc-eyebrow">mouse not captured</p><p>This browser did not capture the mouse, so moving it will not turn the camera. Continue with the keyboard — the arrow keys look around and <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> roll — or try again. A browser that has just released the mouse can refuse a capture for a second or so.</p></div>${keys}<p data-sc-game-keyboard hidden><button class="sc-btn sc-btn--secondary" type="button">Continue with the keyboard</button></p><div class="sc-actionbar"><span class="sc-chip sc-chip--neutral" data-sc-game-status>ready</span><p id="${p}-capture-message" data-sc-game-message>Nothing is captured until you choose to play.</p><button class="sc-btn sc-btn--primary" type="button" data-sc-game-play aria-describedby="${p}-capture-message">Click to play</button></div></section></div>`;
const results = p => `<dialog class="sc-game__layer" id="${p}-results" aria-labelledby="${p}-results-title"><section class="sc-card sc-game__panel sc-stack"><p class="sc-eyebrow">level complete · illustrative</p><h2 id="${p}-results-title">First snow, finished</h2><dl class="sc-facts"><div><dt>time</dt><dd>2:47.32</dd></div><div><dt>coins</dt><dd>12 of 24</dd></div><div><dt>widest snowball</dt><dd>37.9 ft of 38 ft</dd></div></dl><h3 id="${p}-results-coins-title">How the coins earned stars</h3>${milestones({ id: `${p}-results-coins`, label: 'coins this run', count: 12, total: 24, unit: 'coins', value: 0.5, markers: coinMarkers, list: coinStars(true, false), animate: true })}<p class="sc-sr-only" role="status" data-sc-game-count-status></p><ol class="sc-game__stars" aria-label="The other stars this run">${star('builder', 'earned this run', 'a snowball under the 38 ft arch', true)}${star('sprinter', 'earned this run', 'finish within 3:00.00', true)}</ol><p class="sc-hint">Times and sizes are shown truncated, never rounded up. The rules compare the raw values the game measured.</p><p><button class="sc-btn sc-btn--ghost" type="button" data-sc-game-results-close>Back to the specimen</button></p><div class="sc-actionbar"><span class="sc-chip sc-chip--neutral">3 of 3 stars</span><p>Every star for this level is earned. The next level keeps the same controls.</p><button class="sc-btn sc-btn--primary" type="button" data-sc-game-results-next>Next level</button></div></section></dialog>`;

// The complete full-screen stage: every HUD slot, the capture layer and the
// results dialog. Used by templates/game.html.
export function gameStage(p = 'game') {
  return `<div class="sc-game sc-game--viewport" id="${p}-stage" data-sc-game-specimen data-sc-game-scene="bright">${canvas(p, true)}${crosshair}<div class="sc-game__hud">${level(p, 1)}${coins}${timer}${stars}${keyCount}${measure()}${hint(p, true)}<div class="sc-game__slot sc-game__slot--br"><div class="sc-game__plate"><span class="sc-chip sc-chip--neutral">illustrative</span> <button class="sc-btn sc-btn--secondary sc-btn--sm" type="button" data-sc-game-pause>Pause</button></div>${skip(true)}</div>${titleCard(p)}</div>${captureLayer(p)}${results(p)}</div>`;
}

// Specimen controls sit outside the stage: they are not part of a game.
export function gameNotes(p = 'game') {
  return `<div class="sc-wrap sc-page"><header class="sc-title"><p class="sc-eyebrow">specimen controls · illustrative art</p><h2 id="${p}-notes-title">Plates read the same over snow and over a cave.</h2><p class="sc-dek">The canvas is art the game owns. Switch it, then check every plate, the crosshair and the focus ring above it.</p></header><section class="sc-card sc-stack" aria-labelledby="${p}-controls-title"><h3 id="${p}-controls-title">Switch the art, open the results</h3>${sceneToggle(p)}<p class="sc-hint">The results example is a native dialog opened with <code>showModal()</code>. Its primary action takes focus; closing it returns focus here.</p><p><button class="sc-btn sc-btn--secondary" type="button" data-sc-game-results-open aria-haspopup="dialog" aria-controls="${p}-results">Preview the results panel</button></p></section><section class="sc-card sc-stack" aria-labelledby="${p}-moments-title"><h3 id="${p}-moments-title">Meter states and a cinematic moment</h3>${meterStage(p)}<p class="sc-hint">In play, the coin plate shows how far the next coin star is, and the meter's states differ in words, in the glyph's shape and in the fill's thickness; colour only repeats them. The cinematic preview draws letterbox bars, hides every HUD plate except the caption and the skip control, and centres a title card. Skip is a real button; Escape still pauses.</p><p><button class="sc-btn sc-btn--secondary" type="button" data-sc-game-cinematic-open aria-controls="${p}-stage">Preview a cinematic moment</button></p></section><section class="sc-card" aria-labelledby="${p}-owned-title"><h3 id="${p}-owned-title">What is shared, and what the game owns</h3><p>Shared: the stage, HUD slots, plates, crosshair, timer, measure, count, stars, milestones, meter, hint, controls legend, the capture layer and cinematic moments (letterbox, captions, skip, title card), plus the optional capture lifecycle and truncating formatters in <code>sc-game.js</code>.</p><p>Owned by the game: physics, snow, levels, coin rules, saves, held-input clearing, and every colour on the canvas. Snow whites, timber, gold coins and a purple key are world materials, never tokens.</p><p><a href="../GAME-PATTERNS.md">Read the game shell contract</a> · <a href="../styleguide.html#game-shell">See it in the style guide</a></p></section></div>`;
}

// A compact, embeddable stage for the style guide and the visual library: an
// in-play HUD only, with no capture layer and a fixed block size. It is small
// enough to keep the play area clear on a 246px-wide phone column: the measure
// takes the right slot (a full-width row below the play area on a narrow
// stage), and the stars sit on an ordinary card under it, as a results or
// pause screen shows them.
export function gameGuide(p = 'guide-game', heading = 3) {
  return `<div class="sc-stack"><div class="sc-game" id="${p}-stage" data-sc-game-specimen data-sc-game-scene="bright" style="block-size: 38rem">${canvas(p, false)}${crosshair}<div class="sc-game__hud">${level(p, heading)}${coins}${timer}${measure('right')}${hint(p)}</div></div>${sceneToggle(p)}<section class="sc-card" aria-labelledby="${p}-stars-title"><h${heading} id="${p}-stars-title">Stars, on an ordinary card</h${heading}>${starSlots('Stars for this level')}</section><section class="sc-card" aria-labelledby="${p}-keys-title"><h${heading} id="${p}-keys-title">Controls, on an ordinary card</h${heading}>${keys}</section><section class="sc-card" aria-labelledby="${p}-milestones-title"><h${heading} id="${p}-milestones-title">Milestones, on an ordinary card</h${heading}>${milestones({ label: 'coins this run', count: 12, total: 24, unit: 'coins', value: 0.5, markers: coinMarkers, list: coinStars(true, false) })}</section>${cinematicStage(p, heading)}${meterStage(p)}</div>`;
}

// Two more compact stages: a cinematic moment (letterbox bars, a caption with
// its speaker, the skip control and a title card; the crosshair and every
// other plate are hidden) and the meter's three states over the same art.
function cinematicStage(p, heading) {
  const q = `${p}-cinema`;
  return `<div class="sc-game sc-game--cinematic" id="${q}-stage" data-sc-game-specimen data-sc-game-scene="bright" style="block-size: 34rem">${canvas(q, false)}${crosshair}<div class="sc-game__hud"><div class="sc-game__slot sc-game__slot--bottom">${captions(q, caption('Grandma', 'Mind the window, love — that snowball has a mind of its own.'))}</div><div class="sc-game__slot sc-game__slot--br">${skip(false)}</div>${titleCard(q, titlePlate(q, heading, 'level 2 · illustrative', 'The ice cave'))}</div></div>`;
}
// In play: coins toward the next star (top) and the meter's three states.
// The full-screen specimen keeps its eight original plates — a 320 × 720
// phone has no room for more — so these sit on their own compact stage.
export function meterStage(p) {
  const q = `${p}-meters`;
  return `<div class="sc-game" id="${q}-stage" data-sc-game-specimen data-sc-game-scene="bright" style="block-size: 42rem">${canvas(q, false)}${crosshair}<div class="sc-game__hud">${coinTrack}<div class="sc-game__slot sc-game__slot--left">${meter(`${q}-calm`, 'calm')}</div><div class="sc-game__slot sc-game__slot--right">${meter(`${q}-alert`, 'alert')}</div><div class="sc-game__slot sc-game__slot--bottom">${meter(`${q}-danger`, 'danger')}</div></div></div>`;
}
