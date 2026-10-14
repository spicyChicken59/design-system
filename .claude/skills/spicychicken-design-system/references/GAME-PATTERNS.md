# Game shell patterns

A browser game draws its world on a canvas. The design system cannot see that
canvas and does not try to: it supplies the readable layer above it. The first
consumer is **Untitled Snowball Game** (a third-person 3D game: a Three.js
canvas plus an accessible HTML/CSS overlay), but nothing here knows about
Three.js, snow or snowballs. Any engine that paints a `<canvas>` (or a
container) can use it.

Open `templates/game.html` for the complete full-screen specimen, or copy the
compact recipe from the visual library. The specimen paints illustrative flat
art with a tiny 2D script (`build/game-specimen.js`); it contains no engine, no
game rules and no persistence.

| Shared (this repository) | Owned by the game |
|---|---|
| The stage, HUD slots, plates, crosshair, timer, measurement, count, stars, milestones, meter, hint, controls legend, the capture/pause layer and cinematic moments — letterbox, captions, skip, title card (`sc.css` band 4i) | Physics, snow, levels, coin and star rules, what raises or lowers a meter, difficulty, audio, cutscene scripts and their timing |
| The optional capture lifecycle and truncating formatters (`sc-game.js`) | The engine's input handling, including clearing held keys and buttons on blur or release |
| The world/canvas colour rule below | Every colour on the canvas |
| Accessibility contracts and their checks | Saves (local-only by default), settings storage and any account |

New games follow the reciprocal rule in [AGENTS.md](AGENTS.md): a need first
reuses or extends a shared pattern, then lands in source files with tests, and
anything that stays game-specific is written down as a local exception.

## The world is art; the interface is SpicyChicken

The interface keeps SpicyChicken's semantic tokens. A game's canvas is **art
owned by the game**. Snow whites, ice, timber, gold coins and coloured keys are
world materials:

- never `--sc-*` tokens, never status colours, never chart slots;
- never used for HUD text, plate fills, borders or focus rings;
- never the only carrier of meaning. A world colour the HUD must reference ("the
  purple key") is **named in words** in the HUD and shown on the canvas with a
  distinct **silhouette**, so it survives colour blindness, forced colours and a
  dark cave.

HUD meaning is carried by words, shapes and plates. Do not turn the suite white
to match a snow level and do not add UI gradients: the plates stay ink in both
page modes because the canvas, not the page theme, decides what is behind them.

## Stage and canvas

```html
<div class="sc-game sc-game--viewport">
  <canvas class="sc-game__canvas" tabindex="0" role="img" aria-label="…"></canvas>
  <span class="sc-game__crosshair" aria-hidden="true"></span>
  <div class="sc-game__hud">…slots…</div>
  <div class="sc-game__layer">…start / pause panel…</div>
</div>
```

`.sc-game` is `position: relative; isolation: isolate; overflow: clip` (with
`hidden` as the fallback) and a flat ink background before the first frame. It
is never a scroll container, so focus can never scroll the canvas or the
crosshair off centre. It is also a named size container
(`container: sc-game / inline-size`): the HUD and the controls legend change
layout on the **stage's** width, so a narrow stage embedded in a wide page gets
the narrow layout. Inline-size containment means the stage's width must come
from its container (a block, a stretched flex or grid item), never from its
content. It has no intrinsic height: give an embedded stage a block size, or add
`.sc-game--viewport` to fill the viewport (`100vh`, upgraded to `100dvh` where
supported).

For a page that **is** the game, add `viewport-fit=cover` to the viewport meta
so `env(safe-area-inset-*)` reports the notch and rounded corners; the HUD and
the layer already pad by those insets. The specimen (`templates/game.html`)
deliberately keeps the default viewport, because it carries ordinary page
content — a masthead, notes and a footer — below the stage, and that content
does not pad for a landscape notch.

`.sc-game__canvas` absolutely fills the stage. `touch-action: none` applies to
this element only; the band never changes `touch-action`, `user-select`,
`cursor` or `pointer-events` outside its own classes. A keyboard user can focus
the canvas (`tabindex="0"`); its focus ring is two-tone because it sits over art
of any brightness: `--sc-on-ink-accent` (spice-400 in both page modes, 6.8:1
against ink, 8:1 against a near-black cave) with an ink ring just inside it
(16:1 against white snow). It does not use the page's `--sc-focus`, which is
spice-700 in light mode and would vanish into dark art.

## HUD slots

`.sc-game__hud` is an absolutely positioned, `pointer-events: none` grid of named
areas, padded by `max(var(--sc-s3), env(safe-area-inset-*))` on every side.
Interactive descendants (`a`, `button`, `input`, `select`, `summary`,
`textarea`, `[tabindex]`) take pointer input back.

| Slot | Area | Alignment |
|---|---|---|
| `.sc-game__slot--tl` / `--top` / `--tr` | first row | start / centre / end |
| `.sc-game__slot--left` / `--right` | middle row, beside the play area | start / end, vertically centred |
| `.sc-game__slot--bl` / `--bottom` / `--br` | last row | start / centre / end |

Every slot is a `.sc-game__slot` stacking its children with an 8px gap. The
columns are `minmax(0, 1fr)` and slots wrap long words, so content shrinks and
wraps instead of overflowing a neighbour; the middle row has an automatic
minimum, so a tall slot pushes the grid rather than sliding under another. In
the three-column layout the centre cell of the middle row is the play area,
which holds the crosshair.

On a stage 600px wide or narrower (a container query on the stage, with a
viewport media query as the fallback) the grid becomes two columns around a
clear play area:

| Above the play area | The play area | Below the play area |
|---|---|---|
| `tl` beside `tr`, with `top` under `tr` (end-aligned); then `left` on a full-width row | the `1fr` row, holding the crosshair | `right` on a full-width row, then `bottom`, then `bl` beside `br` |

The grid cannot centre that row for you: the crosshair stays clear only while
each half of the HUD fits in half the stage. So put the taller side plate where
its half has room — the specimen puts its stars in `left`, because `bl` (a
measure with a benchmark) already makes the lower half heavy. It keeps the
centre clear at 320 × 640 and larger phones (360 × 640, 375 × 667, 390 × 664 and
up). The crosshair paints above the HUD (and below a layer), so if a crowded HUD
reaches the centre anyway the reference stays visible on top of the plate.

Slots never overlap. When a short screen (a 640 × 360 landscape phone, a
320 × 568 phone) cannot hold everything, the grid runs past the stage edge
instead of overlapping, and the HUD clips it. The HUD is not user-scrollable
(it lets pointer input through), but when Tab reaches a control that runs past
the edge the HUD scrolls **itself** to show it; the stage, the canvas and the
crosshair never move. That keeps every control reachable, not every plate
visible: show fewer plates on a short screen. Which ones is a game decision, so
the shell does not hide anything for you — and the specimen deliberately keeps
all eight on a short screen to show this behaviour.

## Plates

`.sc-game__plate` is the only thing that guarantees contrast over a canvas: an
**opaque** flat `--sc-ink` surface, an `--sc-ink-line` hairline, `--sc-r-md` and
compact padding. It takes the same on-ink re-scope as `.sc-on-ink` (§2c of the
sheet): text, headings, brand, accent, focus, borders, the surface tokens
(`--sc-surface`, `--sc-raised`, `--sc-border`, `--sc-border-strong`) and the
mark and control-edge tokens (`--sc-chart-emphasis`, `--sc-border-control`), so a
`.sc-benchmark`, `progress.sc-progress`, `.sc-chip`, `kbd` or `.sc-input` inside
a plate renders identically in both page modes. No translucency, no blur, no
blend, no gradient, no shadow — on the plate or on the slot, HUD or stage that
holds it. Headings inside a plate are compact (18px display).

## Crosshair

`.sc-game__crosshair` is a 20px navigation reference at the exact stage centre
(`left: 50%; top: 50%; translate: -50% -50%`), decorative (`aria-hidden="true"`)
and `pointer-events: none`. It is two-tone — an on-ink ring and dot with ink
outlines inside and out — so it reads on pure white and on near-black. It paints
above the HUD and below a layer. It is not a weapon reticle: no hit markers, no
spread, and it never animates with motion.

## Timer, measurement and counts

```html
<div class="sc-game__plate sc-game__timer" role="timer" aria-label="Level time">
  <time class="sc-game__timer-value" datetime="PT47.32S">0:47.32</time>
  <span class="sc-game__timer-state">running</span>
</div>
```

The timer value is large, tabular and never wraps — a running clock in
proportional figures jitters every tick, which is why this one exception to
"proportional figures for big numbers" exists. The state is always a word
(`ready`, `running`, `paused`, `finished`, `not eligible for the time star`),
never colour alone. `role="timer"` is not a live region; do not announce every
tick.

`.sc-game__measure` holds a mono `.sc-game__measure-label`, a tabular
`.sc-game__measure-value` with its unit in `<small>`, and one short
`.sc-game__measure-note` of guidance ("arch limit 38 ft · fits"). A size against
a limit composes the existing `.sc-benchmark` (the threshold is its reference
line) or native `progress.sc-progress`. A level that rises and falls with a
written state is the [meter](#meter); a count moving toward thresholds is
[milestones](#milestones).

`.sc-game__count` with a tabular `.sc-game__count-value` shows a collectible
count. The words are in the markup: "12 / 24 coins", "1 purple key held".

### Display truncation is presentation only

`SC.game.formatElapsed(ms, { places = 2 })` returns `m:ss.cc` with unbounded
minutes (`61:05.12`). `SC.game.formatMeasure(value, { places = 1 })` returns a
fixed-point string. Both **truncate toward zero and never round up**:

| Raw value | Shown |
|---|---|
| 179 999 ms | `2:59.99` |
| 180 000 ms, 180 000.4 ms, 180 000.9 ms | `3:00.00` |
| 3 723 456 ms | `62:03.45` |
| `NaN`, negative, `Infinity` | `0:00.00` |
| 37.99 / 38.04 / 100.04 | `37.9` / `38.0` / `100.0` |

Rounding would show a 179 999 ms run as `3:00.00`; truncation keeps the display
honest about which side of a limit it is on. But the display is not the rule:
**compare the raw values.** An inclusive 180 s time star tests
`elapsedMs <= 180000`, so a 180 000.4 ms run is shown as `3:00.00` and still
does not earn it — say so in the result ("0.4 ms over") when it matters. A
strict "more than 100" threshold tests `value > 100`, so 100.04 earns it while
showing `100.0`. Never parse a formatted string back into a number.

## Stars

```html
<ol class="sc-game__stars" aria-label="Stars for this level">
  <li class="sc-game__star is-earned">
    <span class="sc-game__star-glyph" aria-hidden="true"></span>
    <span class="sc-game__star-label">explorer</span>
    <span class="sc-game__star-state">earned</span>
    <span class="sc-game__star-rule">collect 8 of 24 coins in one run</span>
  </li>
</ol>
```

Each slot has a label, the rule that earns it, and a written state ("earned",
"earned this run", "not yet"). The glyph is decorative; earned and not-yet differ
in **shape** (filled and outlined) as well as tone, using heading and brand ink —
never a new gold. Three labelled slots fit a 320px plate; labels and states wrap
beside the glyph and the rule takes its own line. The same list reads on an
ordinary `.sc-card`, for a results screen.

## Milestones

A count moving along a track toward thresholds — coins toward the explorer and
collector stars, on a HUD plate and on a results card.

```html
<div class="sc-game__milestones sc-game__milestones--animate" style="--sc-game-milestones-value: .5">
  <p class="sc-game__milestones-head">
    <span class="sc-game__milestones-label">coins this run</span>
    <span class="sc-game__milestones-count"><span class="sc-game__milestones-value">12</span> of 24 coins</span>
  </p>
  <div class="sc-game__milestones-track" aria-hidden="true">
    <span class="sc-game__milestones-fill"></span>
    <span class="sc-game__milestones-marker is-earned" style="--sc-game-milestone-at: .3333"></span>
    <span class="sc-game__milestones-marker" style="--sc-game-milestone-at: 1"></span>
  </div>
  <p class="sc-game__milestones-note">collector star at 24</p>   <!-- and/or an ol.sc-game__stars -->
</div>
<p class="sc-sr-only" role="status"></p>   <!-- filled once, when a count-up ends -->
```

- **Words first.** The count is written in `.sc-game__milestones-count` ("12 of
  24 coins"), the thresholds are written in a `.sc-game__milestones-note` naming
  the next one, an `ol.sc-game__stars` of the stars the markers stand for, or
  both. The track is `aria-hidden="true"`; the label is optional.
- **The consumer computes, the system draws.** Set `--sc-game-milestones-value`
  (count ÷ total, 0–1) on the block and `--sc-game-milestone-at` (threshold ÷
  total) on each marker, and add `.is-earned` to a marker once the count has
  reached it. A lit marker is a **filled** star in heading ink; an unlit one an
  **outlined** star in brand ink, slightly smaller — shape, not a new gold. Each
  `.sc-game__star` in a list beside it says the same thing in words
  ("explorer · earned this run · 8 of 24 coins").
- **Counting up.** The count-up is the animation: step the number yourself (one
  step per coin, or per frame), set the value with it, light each marker and its
  star as the count passes the threshold, and under reduced motion show the end
  at once. The band draws the fill exactly where the value says and **never
  transitions it**: a count-up retargets it every step, and a transition
  retargeted faster than frames arrive — a game drawing a few frames a second
  behind the panel — starts over each time and never moves. `--animate` only
  lets a marker grow as it lights, under `prefers-reduced-motion:
  no-preference` and never on a `.sc-game--still` stage. **Draw the start
  before you show the block**, so its first frame is not the end. **Announce once**: the count readout is never a
  live region (it would announce every step); put the final sentence in one
  polite status when the count stops ("12 of 24 coins. Explorer star earned;
  collector star not yet."). Every total works — a level with 30 coins puts
  explorer at 10 (`.3333`); two thresholds at the same place draw on top of each
  other, and the words keep them apart.

## Meter

One level that rises and falls with a written state — awareness while
sneaking, stamina, heat — on a plate.

```html
<div class="sc-game__plate sc-game__meter" role="meter" aria-labelledby="awareness-label"
     aria-valuemin="0" aria-valuemax="100" aria-valuenow="58"
     aria-valuetext="Mom noticed something (58%)" data-state="alert" style="--sc-game-meter-value: .58">
  <p class="sc-game__meter-label" id="awareness-label">awareness</p>
  <span class="sc-game__meter-glyph" aria-hidden="true"></span>
  <p class="sc-game__meter-state">Mom noticed something</p>
  <span class="sc-game__meter-track" aria-hidden="true"><span class="sc-game__meter-fill"></span></span>
</div>
```

| `data-state` | Word (the game's) | Glyph | Fill |
|---|---|---|---|
| `calm` | "Hidden", "Unseen" | an open ring | a third of the track's height |
| `alert` | "Mom noticed something" | an open triangle | two thirds |
| `danger` | "Spotted!" | a solid triangle with a knocked-out "!" | the whole track |

States differ in **words, shape and thickness**; the tone (brand, warn, danger
on the plate's dark-mode values) only repeats them. `role="meter"` makes the
plate one node for assistive technology: name it, keep `aria-valuenow` and the
drawn `--sc-game-meter-value` in step, and put the written state in
`aria-valuetext`. A meter is not a live region; when the **state** changes (not
every value tick), say so once in a polite region of your own. The game decides
what moves the value and when a state begins; the meter is static and moves
only when the game moves it.

## Cinematic moments

A cutscene, a story beat or a level intro over the live canvas.

```html
<div class="sc-game sc-game--viewport sc-game--cinematic">
  <canvas class="sc-game__canvas" …></canvas>
  <span class="sc-game__crosshair" aria-hidden="true"></span>        <!-- hidden while cinematic -->
  <div class="sc-game__hud">
    <div class="sc-game__slot sc-game__slot--bottom">
      <div class="sc-game__captions" aria-live="polite" aria-atomic="true">
        <p class="sc-game__plate sc-game__caption">
          <span class="sc-game__caption-speaker">Mom</span>
          <span class="sc-game__caption-line">Kids! Inside, now — dinner's on the table.</span>
        </p>
      </div>
    </div>
    <div class="sc-game__slot sc-game__slot--br">
      <div class="sc-game__plate sc-game__skip">
        <button class="sc-btn sc-btn--secondary sc-btn--sm" type="button" aria-keyshortcuts="Space Enter">Skip</button>
        <span class="sc-game__skip-hint"><kbd>Space</kbd> or <kbd>Enter</kbd></span>
      </div>
    </div>
    <div class="sc-game__title-card" aria-live="polite">
      <div class="sc-game__plate">
        <p class="sc-eyebrow">level 1</p>
        <h2 class="sc-game__title-card-title">The new house</h2>
      </div>
    </div>
  </div>
</div>
```

- **`.sc-game--cinematic`** on the stage draws letterbox bars (flat ink, one
  `::before` under the HUD that never takes pointer input, `7cqi` thick within
  16–96px), hides the crosshair and the content of every HUD slot except
  `.sc-game__captions` / `.sc-game__caption` and `.sc-game__skip`, and widens the
  centre column for subtitles. Remove the class and the HUD is back exactly as
  it was. The bars grow in from the edges only under
  `prefers-reduced-motion: no-preference`; add **`.sc-game--still`** to the stage
  when the game's own reduced-motion setting is on, and nothing in the band
  moves at all. The page's motion pause (`data-sc-motion-paused` from
  `sc-motion.js`) stills it too.
- **Captions** are subtitles on a plate, bottom centre, at most `60ch` wide (two
  lines of about 60 characters at most). The speaker is a **written label** on
  its own line — mono, weight — never a colour. `aria-live="polite"` (with
  `aria-atomic="true"`) sits on the persistent `.sc-game__captions` container,
  which stays in the document while lines come and go; replace its plate once
  per line with the **final** text, never letter by letter, so each line is
  announced once. Leave it empty between lines.
- **Skip** is a plate in the bottom-right slot with a real button and its keys
  written beside it — in one row where the corner has room, the keys under the
  button where it does not (a stage up to 900px wide), the plate hugging them
  either way. Move focus to it when the moment starts and back to where it was
  when the moment ends. A game may also map <kbd>Space</kbd> and
  <kbd>Enter</kbd> to it while the moment plays (ignore repeats, and every key
  while a dialog such as the pause menu is open: a moment that is paused cannot
  be skipped, and a press it ignored must not use up the skip). **Escape never
  skips** — Escape pauses, as it does everywhere else in the shell. An
  unskippable moment hides the plate.
- **Title card** — `.sc-game__title-card` is a direct child of a HUD, outside
  the slots: a persistent, centred region (it may carry `aria-live="polite"`)
  that draws nothing until a plate with an eyebrow and a heading is put inside
  it. It lets the pointer through. Its title scales with the stage (20–56px).
  On a short stage, show a title card and a caption one after the other rather
  than together.
- The engine owns the script: when lines change, how long they stay, what
  happens on skip, and pausing on Escape. The shell owns how it reads.

## Hints and the controls legend

`.sc-game__hint` is a short contextual line, typically in the bottom slot and
usually on a plate, with `kbd` inside ("hold <kbd>E</kbd> to melt"). Give it
`aria-live="polite"` and change it only when the context changes.

`.sc-game__keys` is a `dl` of `kbd` combinations (`dt`) and actions (`dd`).
Optional `div` wrappers group each pair. It is two columns, and one column on a
stage 480px wide or narrower, or on a viewport that narrow (a legend on a card
outside any stage has only the viewport to go by); it reads on a plate and on a
card.

## Capture and pause layer

`.sc-game__layer` covers the stage with a flat ink wash, takes pointer input and
centres one composed panel: a `.sc-card` with `.sc-game__panel` (a 36rem
measure), the existing `.sc-actionbar` for the one primary action, and
`.sc-notice` for a refusal. Auto margins centre the panel without pushing its
top out of reach, so on a 360px-tall landscape phone the layer scrolls and the
primary action stays reachable. `--sc-scrim` is a caption gradient for photos;
a layer is flat, so it mixes ink at 86% (opaque ink where `color-mix()` is
unsupported).

It works two ways:

- **A plain `div`** inside the stage, shown and hidden with `hidden`. While it is
  open, make the canvas and the HUD's **controls** `inert` so keyboard focus
  cannot reach what the layer covers; remove `inert` before requesting capture.
  Do not make the whole HUD inert: inert content leaves the accessibility tree,
  and the HUD usually holds the level heading (often the page's only `h1`), the
  objective and the readouts a screen-reader user needs while the game waits or
  is paused.
- **A native `<dialog class="sc-game__layer">`** opened with `showModal()` — the
  browser makes everything else inert. The UA chrome is removed, the
  `::backdrop` carries the same wash and the panel is the visible surface. Focus
  the dialog's primary control on open and return focus to the opener on close.

A start or pause panel should contain: the controls legend, how to get the mouse
back ("Escape releases the mouse and pauses"), exactly one primary action
("Click to play" / "Resume"), and — after a refusal — a written way forward
(keyboard look keys, or try again).

## The capture lifecycle (`sc-game.js`)

Optional and engine-independent. Loading it registers `window.SC.game` and does
nothing else: no listener, no attribute, no request.

```js
const capture = SC.game.capture(stage, {
  target: canvas,              // default: the stage's .sc-game__canvas
  resumeControl: playButton,   // focused after a release or a refusal
  onCapture() { hideLayer(); canvas.focus({ preventScroll: true }); },
  onRelease(reason) { showPause(reason); },   // 'escape' | 'blur' | 'api'
  onDenied(error) { showKeyboardFallback(error); }
});
playButton.addEventListener('click', () => capture.request());
```

- `capture(stage, options)` returns one controller per stage (a second call
  before `dispose()` returns the same controller) and sets
  `data-sc-capture="idle"` on the stage. Only now does it listen — to
  `pointerlockchange` and `pointerlockerror` on the target's document and to
  window `blur`.
- `request()` must run from an explicit user gesture (a Play or Resume click).
  It never runs on load, on focus or on a key. It calls
  `target.requestPointerLock()`, handling both the promise-returning form and
  the legacy form that returns nothing, and moves the stage through
  `requesting → captured`, or `denied` on a rejected promise, a thrown error, a
  `pointerlockerror` event or a browser without the API.
- A release while captured sets `released`, calls `onRelease`, then focuses
  `resumeControl`. The browser's own Escape exit is reason `'escape'`; window
  `blur` releases with `'blur'` and exits the lock; `release()` exits it with
  `'api'`. A refusal calls `onDenied(error)` and focuses `resumeControl` too.
- `state` reports `idle`, `requesting`, `captured`, `released` or `denied`.
- `dispose()` removes every listener it added, exits a lock it holds, and
  removes `data-sc-capture` (or restores the stage's previous value). Disposed
  while a request is still in flight, it leaves one self-removing guard for the
  browser's answer: a lock granted afterwards is exited at once, so the pointer
  is never left hidden with nothing to release it. If a new controller mounts on
  the same stage first, the guard stands down and the new controller adopts the
  lock.
- It never listens for keys and never calls `preventDefault`. The engine owns
  input; the Escape release is the browser's own pointer-lock behaviour.

Some browsers (Chromium among them) refuse a new capture for a moment after the
user released one with Escape. Treat that refusal like any other: say so, offer
the keyboard, and let the player try again.

`formatElapsed` accepts `places` 0–3 and `formatMeasure` 0–6; anything else falls
back to the default. Both show zero for `NaN`, `Infinity` and anything that is
not a number, and `formatElapsed` shows zero for a negative time; neither ever
shows `-0`.

`data-sc-capture` is a hook for presentation and tests. The band deliberately
styles nothing from it, so a page looks the same with or without the runtime;
behaviour stays in the consumer.

## Accessibility

- **Keyboard.** Every action has a keyboard path: Tab reaches the primary action
  on the layer, Enter activates it, and a refusal offers keyboard look keys. The
  canvas is focusable so an engine can listen there; focus it on capture and when
  the player continues with the keyboard. Give back focus on release and on
  refusal (`resumeControl`).
- **Screen readers.** Name the canvas with `aria-label`. When the engine reads
  keys on it, give it `role="application"` (with `aria-roledescription="game"`)
  so a screen reader in browse mode passes arrow keys through; the specimen uses
  `role="img"` because its canvas takes no input. Keep anything a player must
  read in the HUD's HTML, never only on the canvas.
- **Held input is the engine's job.** When the window blurs or the lock is
  released, the engine must clear held keys and mouse buttons so a key that went
  up while the page was not listening does not stay "down".
- **Saves are the game's job.** A save stays local unless the player chooses
  otherwise; the shell neither reads nor writes storage.
- **Reduced motion.** Only two things in the band move, and only under
  `prefers-reduced-motion: no-preference`: the cinematic letterbox bars grow in,
  and an `--animate` milestones marker grows as it lights. A fill (meter or
  milestones) is drawn where its value says, never transitioned.
  `.sc-game--still` on the stage stops both, for a game whose own setting says
  reduced motion, and so does the page's motion pause (`data-sc-motion-paused`
  on the root, set by `sc-motion.js`). Keep camera shake, screen flashes and other HUD motion behind
  that setting in the game.
- **Forced colours.** Plates keep a CanvasText border on Canvas; the crosshair,
  star glyphs, meter glyph and fill, and milestones markers and fill opt out of
  forced-colour adjustment and draw in CanvasText/Canvas so they keep their
  shape; meter and milestones tracks keep a CanvasText edge; letterbox bars
  become Canvas, a frame rather than content.
- **Live regions** persist and speak once: the hint and the caption region are
  polite containers that stay in the document; a title-card region may be one
  too; a counting readout never is (announce its total once, at the end); a
  meter is not one (announce a change of state once, yourself).
- **Print** keeps the record, not the moment: the canvas, crosshair, layers and
  letterbox bars are hidden, and plates (a title card's included) print
  statically in flow, in ink.
- **Text** never wears a world colour, and the HUD never depends on colour alone.

## What is not shared

Physics, snow accumulation, level geometry, coin placement and rules, star
thresholds, timing source, difficulty, audio, saves, settings, analytics and the
engine itself stay in the game. So do world palettes and any art style. Promote
something only when another game or app would be wrong to write it differently —
see `.claude/skills/spicychicken-design-system/PROMOTING.md`.

## Verification

`node build/game-check.mjs` (run by `node build/check.mjs`) drives `sc-game.js`
in a fake DOM — no listeners or attributes at load, requests only through
`request()` to `options.target` (or the default canvas), every refusal path,
capture and release reasons, focus restoration, `dispose()` cleanup including a
lock granted after a mid-request dispose, and no key listener or
`preventDefault` ever — and checks the formatter boundaries, the specimen markup
contract and the band's CSS: opt-in and scoped (no selector reaches a sibling of
the stage), the contract's own declarations (HUD `pointer-events: none`, canvas
`touch-action: none`, safe-area padding, a nowrap tabular timer, filled vs
outlined star shapes, a two-tone crosshair above the HUD, an undrawn closed
dialog) and opaque plates across the whole sheet, each with negative controls.
The 2.16 moments have their own contracts, each with negative controls: in
markup, a meter is a named `role="meter"` plate whose `aria-valuetext` carries
the written state and whose drawn value matches `aria-valuenow`; a milestones
writes its count in words (never as a live region), writes its thresholds, hides
its track, and lights exactly the markers its value has reached, in agreement
with its written stars; captions sit on plates inside a persistent polite
region with the speaker written before a line of at most two subtitle lines; the
skip control is one real "Skip" button in the bottom-right slot whose keys never
include Escape; a title card is a plate-backed heading with an eyebrow, a direct
child of a HUD. In CSS: three meter glyph shapes and fill thicknesses, filled vs
outlined markers, a `60ch` caption, a cinematic that hides the crosshair and
every slot but captions and skip (never the title card), bars under the HUD that
take no input, motion only inside `prefers-reduced-motion: no-preference` and
stopped by `.sc-game--still` and by the page's motion pause, and marks that keep their shape in forced colours.
`build/contrast.mjs` checks the moments' text on a plate at 4.5:1 and their
marks (meter fills against the track and glyphs against the plate in each state,
milestones fill and markers on a plate and on a card) at 3:1, in both modes.

`node build/visual-check.mjs --browser` renders `templates/game.html` in Chromium
at 320 × 720, 390 × 844, 820 and 1280px in both themes; the refusal path in
both themes; the native API; the results dialog; 640 × 360 and 320 × 568 short
screens; reduced motion with forced colours; and the compact stage embedded in
the style guide and the visual library at 320 and 390px, plus a 320px stage
inside a 1280px page. It asserts, from real geometry, computed styles and the
accessibility tree: a centred crosshair that no plate covers and a pointer at
the centre reaching the canvas; no overlapping slots or plates and nothing
spilling out of a plate; plates inside the safe area (except on the short
screens, where it asserts a still stage, a centred crosshair and every HUD
control reachable by Tab instead); opaque plates with 4.5:1 text over the bright
and the dark scene, rendered identically in both page modes; a canvas focus ring
at 3:1 over both scenes in both modes; the level `h1` in the accessibility tree
while the layer is open and while paused; and a results dialog that is not drawn
while closed. The results count-up starts from zero, only goes up, lights each
marker and its written star exactly as the count passes the threshold, says
nothing until it stops and then announces the total once; under reduced motion
it shows the end at once, static. The drawn fill is exactly the count at every
frame (a planted fill transition is caught trailing it). The meter scenarios (390 and 1280px) find three
named meters in the accessibility tree whose values carry their words, three
glyph shapes, fills that thicken with the state and are drawn at the reported
value, and 3:1 marks with 4.5:1 words. The cinematic scenarios (390 and 1280px,
both themes, and reduced motion) find equal letterbox bars under the HUD that
grow in only when motion is allowed, nothing on screen but the caption, the skip
control and the title card, a caption centred low and at most `60ch` wide, a
centred title card that lets a pointer through to the canvas, focus on Skip with
a visible ring, a skip plate that hugs its button and keys (a planted wrapping
row is caught stretching it on a phone), the page's motion pause stilling the
bars and markers, Escape that does not skip, Space that does and focus back on
the opener; in forced colours, bars drawn as Canvas and every plate keeping its edge
— and rendered negative controls (bars or a title card that take input, a
caption let out past `60ch`) caught by the same measurements. The compact
cinematic and meter stages embedded in the style guide and the visual library
pass the same geometry at 320 and 390px and as a 320px stage in a 1280px page.
