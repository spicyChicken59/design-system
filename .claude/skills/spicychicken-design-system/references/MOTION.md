# Motion that earns its place

SpicyChicken motion makes a page feel considered: a cover settles into place,
a row of cards arrives in order, a control answers a press. The original chick
can make an entrance without becoming a different logo. Reading, navigation,
and data never depend on an animation finishing.

This optional library is part of **v2.10.0**. Load the matching CSS and runtime.
Pinned release URLs become available when the corresponding release is published.

```html
<link rel="stylesheet" href="sc.css">
<script defer src="sc-motion.js"></script>

<section class="sc-cover sc-on-ink">
  <div class="sc-cover__content">
    <p class="sc-eyebrow">made by spicychicken</p>
    <h1>Your next great idea.</h1>
  </div>
  <div class="sc-cover__art">
    <img class="sc-mark sc-chick-arrive" src="assets/sc-mark-color-dark.svg"
      width="224" height="224" alt="" aria-hidden="true">
  </div>
</section>

<div class="sc-grid sc-grid--3 sc-stagger">
  <article class="sc-card">First idea</article>
  <article class="sc-card">Second idea</article>
  <article class="sc-card">Third idea</article>
</div>
```

Leave the main page heading immediately readable. Give a cover illustration,
one group of feature cards, or a chapter entrance a deliberate arrival. A page
full of separately animated sentences is harder to read.

## A small, expressive vocabulary

| Recipe | Markup | Best use |
| --- | --- | --- |
| Rise | `class="sc-reveal"` | Section introductions; a 16px entrance. |
| Fade | `class="sc-reveal" data-sc-motion="fade"` | Quiet changes with no travel. |
| Scale | `class="sc-reveal" data-sc-motion="scale"` | A contained illustration; 97% to full size. |
| Slide | `class="sc-reveal" data-sc-motion="slide"` | A short horizontal introduction. |
| Wipe | `class="sc-reveal" data-sc-motion="wipe"` | Decorative artwork in a reserved frame. |
| Stagger | `class="sc-stagger"` on a parent | Direct children arrive 60ms apart, capped at 300ms total waiting. |
| Chick arrival | `class="sc-chick-arrive"` on an original mark | One gentle entrance, with original geometry and proportions. |
| Rule draw | `class="sc-rule-reveal"` on a decorative rule | A chapter rule grows from its leading edge. |
| Hover lift | `class="sc-hover-lift"` | A linked card lifts 3px under a fine pointer. |
| Press | `class="sc-press"` | An enabled button answers a press with a slight compression. |

Reveal effects play once as they enter the viewport. There are no scroll
listeners, parallax, cursor followers, spring bounces, animated number values,
or continuous decoration. Use the ordinary component focus and color treatment
alongside motion. A transform must never be the only indication of interaction.

`.sc-stagger` sequences its direct children automatically; they do not also need
`.sc-reveal`. A child can set `data-sc-motion="fade"` or another reveal effect.
Nested stagger containers sequence their own children. Do not combine a reveal
on a whole section with another reveal on every element inside it.

## Loading and progress

Show an actual waiting state, with words that name the task. Decorative loaders
animate only while a containing region has `aria-busy="true"`. The indicator makes three gentle cycles, then rests after 3.6 seconds while
the status stays visible. End the busy state when the application finishes;
the motion library never changes it for you.

```html
<div class="sc-row">
  <span aria-busy="true">
    <span class="sc-loader" aria-hidden="true"></span>
  </span>
  <span role="status">Loading your collection…</span>
</div>

<div class="sc-row">
  <span aria-busy="true">
    <span class="sc-loading-dots" aria-hidden="true">
      <span></span><span></span><span></span>
    </span>
  </span>
  <span role="status">Preparing the report…</span>
</div>

<label for="report-progress">Preparing report · 65%</label>
<progress id="report-progress" class="sc-progress" value="65" max="100">65%</progress>
```

Use real progress values when available. Keep progress determinate when showing
a percentage, and do not animate invented increments to make a task look faster.
The finite default prevents a long task from creating endless movement.
Reduced motion or a paused library leaves a static indicator and the same label.
Do not restart the animation on a timer or use it as a permanently decorative
brand moment. The pause control below can stop all library motion immediately.

## Replay and pause

Replay is useful in a catalog or a product introduction the reader explicitly
chooses to revisit. It respects focus and the reader's motion preference.

```html
<div id="arrival-demo" class="sc-stagger">
  <div class="sc-card">A clear first thought.</div>
  <div class="sc-card">Room for the next one.</div>
</div>
<button class="sc-btn sc-btn--secondary" type="button"
  data-sc-motion-replay="#arrival-demo">Replay arrival</button>
<button class="sc-btn sc-btn--ghost" type="button"
  data-sc-motion-toggle aria-pressed="false">Pause motion</button>
```

Keep the pause button's name stable. Its `aria-pressed` state indicates whether
motion is paused. All pause buttons stay synchronized. An optional child with
`data-sc-motion-status` receives “Motion paused” or “Motion enabled” text.
The pause choice applies to the current page; it does not write storage or
change an application's own preferences. The operating system's reduced-motion
setting always wins. A replay button can target a local ID or `all`.

## Runtime API

The script adds `SC.motion` alongside any existing `SC` exports. It starts after
DOM readiness and discovers inserted content automatically. Loading it twice
is harmless. It does not import a framework or modify application data.

| Method or property | Behavior |
| --- | --- |
| `SC.motion.init(root = document)` | Observe a page or mounted subtree; safe to call repeatedly. Re-enables an explicitly destroyed subtree. |
| `SC.motion.refresh(root?)` | Find new motion markup; call after adding classes or attributes to existing elements. |
| `SC.motion.replay(root = document)` | Replay arrivals in that scope as they enter the viewport. |
| `SC.motion.setPaused(boolean)` | Finish arrivals and stop decorative loading motion, or enable future motion. |
| `SC.motion.destroy(root = document)` | Release a subtree, restore its inline sequence value, and leave content visible. With no root, disconnect all observers and listeners. |
| `SC.motion.paused` | Read the current explicit pause state. |
| `SC.motion.reducedMotion` | Read the current operating-system preference. |

Mount a framework component normally. Automatic discovery handles inserted
elements; an explicit integration may call `SC.motion.init(element)` after
mount and `SC.motion.destroy(element)` when the component unmounts. A destroyed
subtree stays inactive until explicitly initialized again. Do not read animation
completion as application state.

## Timing tokens

| Token | Default | Purpose |
| --- | --- | --- |
| `--sc-motion-fast` | 160ms | Hover and press feedback. |
| `--sc-motion-enter` | 480ms | Section and card arrivals. |
| `--sc-motion-brand` | 640ms | One original-mark entrance. |
| `--sc-motion-stagger` | 60ms | Sequence spacing, capped at five steps. |
| `--sc-motion-loading` | 1200ms | Genuine waiting indicators. |
| `--sc-motion-distance` | 16px | Maximum default entrance travel. |
| `--sc-ease-out` | `cubic-bezier(.16, 1, .3, 1)` | A quick start and calm landing. |
| `--sc-ease-in-out` | `cubic-bezier(.4, 0, .2, 1)` | A quiet loading rhythm. |

The existing `--sc-motion` and `--sc-ease` remain the ordinary component
transition defaults. Override motion tokens at a component scope only when a
composition calls for it. Keep the delay bounded; do not make readers wait.

## Accessibility and failure behavior

- Content is visible before JavaScript runs. Observing an element never applies
  a hidden, inert, or opacity-zero waiting state. If the runtime or observer
  cannot start, the ordinary page remains available.
- Only an actual arrival gets a finite CSS animation. It ends in the normal,
  visible state even if later JavaScript stops working.
- Keyboard focus immediately cancels an element's arrival and its animated
  ancestors. CSS `:focus-within` also prevents a focused control from being
  obscured during a sequence delay.
- Reduced motion at startup prevents all library animation. A preference change
  immediately finishes running arrivals. Re-enabling motion does not replay
  already-seen content.
- Pause finishes arrivals immediately instead of freezing content halfway
  through an opacity or clip effect. Reading content remains available.
- Print cancels animation and hides catalog replay/pause controls. Forced-colors
  uses system colors for waiting indicators. Neither mode depends on JavaScript.
- Removed nodes are unobserved; full teardown releases event listeners and
  mutation/intersection observers. No global polling or scroll listeners run.

`node build/motion-check.mjs` exercises observer failure, one-time arrivals,
replay, reduced motion and live preference changes, focus safety, stagger
bounds, dynamic insertion/removal, pause synchronization, print, and teardown.
Visual review still matters: inspect the actual composition at phone and desktop
sizes with reduced motion enabled as well as disabled.


### Native disclosures and reinitialization

`.sc-disclosure` uses native `details` state. Its indicator rotates once; an optional
`.sc-disclosure__body` fades in for 160ms. Reduced motion, page motion pause and print
remove these effects. Closing is immediate, with no JavaScript-owned height or state.

Reinitializing `SC.motion` after teardown resamples the current operating-system
motion preference. Pausing completes all already registered arrivals, including
ones below the viewport. Resuming allows newly registered elements to animate;
use explicit replay when you want to see an earlier composition again.
