# Working studio patterns

These patterns share presentation and inspection behaviour. The application owns
the records, elapsed-time calculation, persistence, source attribution and any
interpretation. The examples use clearly labelled illustrative editorial reviews.

Open `templates/studio.html` for the complete specimen, or copy the recipe from
the visual library. No page-specific stylesheet is needed.

## Dated activity

Use `.sc-activity` around `.sc-activity__grid`, a written
`.sc-activity__selection`, a `.sc-activity__legend` and a native table twin.
Every cell is a `button.sc-activity__day` with `type="button"`, a unique
`data-date="YYYY-MM-DD"`, and an `aria-label` containing its full date, value,
unit and measurement basis. Keep the dates in chronological DOM order.

`data-level="0"` is an actual zero. `data-level="missing"` is absent data.
Levels `1`–`5` use the existing sequential chart slots. The caller authors and
explains the bin thresholds; the component never derives a score or fills a gap.
Text sits on the surface beside the coloured mark, preserving text contrast.
The cells fit into responsive rows and retain 44px targets; this is a dated
activity sequence, not a fixed seven-column month calendar.

The optional `sc-activity.js` progressively enhances `[data-sc-activity]` hosts:

```html
<script src="design-system/sc-activity.js" defer></script>
```

Include `[data-sc-activity-selection]` with `aria-live="polite"` and
`aria-atomic="true"`. The runtime sets one roving tab stop, updates `aria-pressed`
and repeats the selected cell's authored label in that written output. Left/right
move one date; up/down move by the currently rendered row width; Home/End move to
the first/last date. Tab and modified browser shortcuts retain their native
behaviour. Initialization and clicks do not move focus; arrow inspection does.

For asynchronous content, call `SC.activity.init(root)` and keep the returned
controllers. `refresh()` rereads cells and preserves selection by date;
`dispose()` removes listeners and restores authored tab stops, pressed states and
fallback output. Reinitialization is idempotent. A React component may own this
same interaction directly and consume the CSS without loading the runtime.

Without JavaScript every native button remains in normal tab order and the table
retains every value. Do not depend on a hover-only tooltip. The table has row/column
headers and a named focusable `.sc-table-scroll` wrapper.

## Task session

`.sc-session` contains `.sc-session__head`, `.sc-session__timer`,
`.sc-session__status`, `.sc-task-list` and `.sc-session__actions`. Show the elapsed
value as a labelled `time` element and the running, paused or finished state in
words. A timer must not be an assertive live region announcing every second.
The component does not start or advance a timer.

Use ordered tasks: `.sc-task` contains a `.sc-task__label` with a native
`input[type="checkbox"]` or an accessible `[role="checkbox"]` primitive and
`.sc-task__body`, an optional `.sc-task__target`, and optional
`.sc-task__detail` and `.sc-task__save`. Long names and targets wrap at narrow
widths; the 20px control remains visible and does not shrink, while the labelled
row retains at least 44px height. Native `:checked` and primitive
`aria-checked="true"` states receive the same checked-row treatment. A checkbox
says that the user confirmed a
task, not that all unmeasured details were completed.

The application or primitive library owns focus, Space activation and checked
state. Supply a visible associated label, `aria-labelledby` or an equivalent
accessible name. A role by itself does not implement checkbox behaviour. The
disabled primitive in the specimen demonstrates styling and naming without
pretending to provide an interactive checkbox implementation.

The application controls checked state and `data-save-state="saved|pending|error"`.
Repeat each state in written text and associate it using `aria-describedby`.
While a save is pending, use `aria-busy="true"` and disable repeat submissions as
appropriate. Preserve the previously saved state on failure. A checked box never
implicitly means the server persisted it. Use existing `.sc-progress` for actual
completion, with a label and real `value`/`max`.

## Navigation and the available action

`.sc-workspace-nav` is a named native `nav`. Use links when destinations have URLs;
use buttons when an application owns the destination change. The router supplies
`aria-current`, and the current destination remains readable in words. For native
section links, the existing optional `sc-reading.js` can keep `aria-current="location"`
in sync when the nav carries `data-sc-reading`. Subject choices remain separately
named `.sc-field--group` / `.sc-tabs` groups; navigation is not a tab list.

The controls wrap into rows at phone widths and retain 44px targets. They do not
create a clipped horizontal navigation rail.

For a phone row with short labels, add `.sc-workspace-nav--compact` alongside
`.sc-workspace-nav`. Its controls use a 60px flex basis, stack an optional icon
above the visible label, retain at least 44px height, and wrap when six items do
not fit. Use `.sc-workspace-nav__icon` on a decorative glyph or icon; direct SVG
and image children receive the same bounded 18px size. Set `aria-hidden="true"`
on decorative icons and retain a visible name for every destination. This variant
does not become a viewport-fixed overlay, and the default navigation remains
unchanged. The complete specimen shows six real design-library destinations.

Extend the existing `.sc-actionbar` with `.sc-actionbar--sticky` inside the section
that owns the action. It stays in normal flow, is bounded by that section, respects
the device safe area, and becomes static in print. Keep one primary action and
state the reason/status beside it. Do not put it inside a clipped ancestor or use
it as a viewport-fixed overlay; confirm it never covers the focused control at
the widths the application supports. Avoid global smooth scrolling, especially
for reduced-motion users.

## Before shipping

Check keyboard inspection, Tab exit, missing versus zero, table scrolling,
pending/error labels, long names, and sticky bounds at 320px, 390px and desktop.
Review both themes, reduced motion, forced colours and print. Run
`node build/activity-check.mjs` and the normal repository gate. The style guide,
gallery and complete specimen must stay consistent with the shared stylesheet.
