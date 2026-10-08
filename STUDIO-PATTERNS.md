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

## Intrinsic media (v2.15.0)

Use `.sc-media-stage` with `.sc-media-stage__frame` on an image, video or
SVG source. Supply genuine width/height metadata. The source determines the
ratio: no universal square, fixed-height crop or unrelated 16:9 box is added.
Matching-ratio frames share one grid area; inactive frames carry
`aria-hidden="true"` and remain hidden while retaining layout geometry.
The authored first frame is exposed without JavaScript. The consumer changes
frame/pressed states together and owns playback, focus, errors and attribution.

A stable shared stage requires matching frame ratios. Different ratios cannot
all fill one rectangle without empty space, cropping or distortion; show them
separately or prepare genuinely aligned sources. Publisher-video borders are
not application-container borders. Do not crop instructional contact points.
Use existing `sc-note`/`sc-empty` for attribution and fallback.

The three `sc-media-specimen-*.svg` files are small illustrative geometry
fixtures with real source bounds; they contain no exercise or health records.
`build/media-dock-specimen.js` is a specimen-only selector, not a published
consumer playback runtime. Production applications own their controls.

## Reserved phone dock (v2.15.0)

`.sc-dock-layout` contains an optional `.sc-dock-layout__head`, a
`.sc-dock-layout__body`, and `.sc-bottom-dock`. At 720px and below these
occupy real header/body/dock rows. The body scrolls above the dock rather than
beneath a fixed overlay. Reuse the existing named `sc-workspace-nav--compact`
and one `sc-actionbar`; do not stack independent fixed phone bars. A nested
`sc-actionbar--sticky` is static within this reserved row.

The complete header belongs inside the shell. Optional layout channel
`--sc-dock-block-size` accepts the actual available block size when a host or
application must account for a different viewport region. The fallback is vh;
dynamic viewport units are used when supported. Browsers handle virtual
keyboards differently, so test an actual device rather than promising that dvh
alone solves keyboard resizing. Any visual-viewport enhancement and teardown
remain consumer-owned.

Physical left/right/bottom safe-area insets are reserved. Controls wrap, and a
short-screen dock may scroll instead of erasing the body or clipping controls.
Focus must scroll into view in both regions. Desktop remains ordinary flow;
print removes the dock and releases body clipping. Open
`templates/media-dock.html` for the complete specimen.

## Media/dock verification

`node build/media-dock-check.mjs` checks geometry invariants using synthetic
observations, negative controls, genuine SVG metadata and specimen state. It is
not rendered browser verification. The reviewer supplies actual observations to
`build/media-dock-contract.mjs` and records phone/desktop, both themes, cold
loading, paired-frame selection, last-control focus, safe areas, enlarged text,
short viewports, keyboard resizing and print results separately. The contract
must reject crop/distortion, duplicate active frames, overlapping rows, clipped
or undersized targets and focused controls hidden by the dock.

The compact navigation layout channel `--sc-workspace-nav-basis` optionally changes its 60px flex basis without replacing the component layout. The six-destination dock specimen uses an authored three-column fraction; a five-destination app can keep the unchanged default. In dock bodies, named control groups wrap within the column. Put intrinsic media inside `sc-disclosure__body` when a disclosure supplies surrounding margins.

## Select, collect, review, apply

This is a composition of existing task labels, disclosures, comparison values
and an action bar, not a new component or selection runtime. See the illustrative
document-selection state in `templates/studio.html#studio-selection`.

1. **Select:** use native checkboxes with named `.sc-task__label` rows. Keep the
   glyph bounded and give its whole label at least 44px height. A filter changes
   visible candidates, not the selected set. Say when a candidate is unavailable.
2. **Collect:** show the names and count in a basket that stays readable while
   filters change. Define whether Select all means visible or all eligible rows;
   name that scope. Duplicate IDs, stale IDs and silent truncation are errors.
   If the next step exceeds capacity, retain the selection and explain the limit.
3. **Review:** list exactly the selected eligible records and each previous/new
   value. Reuse `.sc-compare-pair__values` or a native table. The count must match
   those rows. Cancel returns to the unchanged draft, with selection intact.
4. **Apply:** one `.sc-actionbar` names the scope and the owned action. A checkbox
   changes selection; it never implies a save. Pending work has a written state.
   Lock editing during the request or retain newer edits as a separate draft.

Use stable record IDs rather than positions. Undo/reorder/removal and an external
refresh must reconcile the basket and selected IDs against the current record
set. Unrelated background updates must not erase dirty fields. Before in-app
navigation, dialog close or account change, keep the draft or offer an explicit
Keep/Discard choice. A close decision must be visible and focused; appending an
alert far below a long form does not make its actions reachable.

The consumer owns draft recovery, authorization, revision checks, save requests
and Undo lifetime. A local Undo before save is different from a reversible saved
operation. Name which one is available; do not offer a no-op Apply to zero rows.
At phone width, stack search, basket and review in reading order. Prefer the
existing wrapping controls and bounded actionbar over a second fixed dock.

## Restore selected fields with a visible difference

See `templates/studio.html#studio-restore` for a non-operational field-difference
state. Reuse native checkbox task labels and paired current/incoming values.
Every field states its name, present value, incoming value and selection. A
difference is not a winner; missing, empty, zero and omitted stay distinct.
Long values wrap or live in a named disclosure. Keep both sides named on phones.

The preview and apply operation must share the same selected field set. Show
included and excluded categories before exporting or restoring. A partial file
is a patch of explicitly included fields: never fill omissions with schema
defaults and then describe it as a complete replacement. Current history or
authorization cannot be overwritten merely because a profile field was chosen.
Present source/date and the restore scope beside the action, without tokens or
private data in the specimen.

Before Apply, retain the prior values and expected revision for only the fields
being changed. Undo must name its scope and detect intervening edits: restore
those prior field values through a reviewed revision check, rather than replace
the entire object with a stale snapshot. A changed server revision requires
reload/review; preserve the draft while showing that conflict. Cancel keeps all
current values. Completion states refer to the actual saved result.

Verification: two filters with retained selection; capacity after Undo; zero or
stale selected rows; pending and failed save; dirty in-app navigation; selected
field parity between preview/apply; omitted versus empty values; conflicting
Undo; and keyboard focus on the review/close decision at 320px and 390px in both
themes. `node build/selection-review-check.mjs` checks illustrative selection and
field-scope contracts with negative controls. It does not claim live persistence
or rendered browser verification. No new CSS vocabulary or release is introduced.

## Review a dated batch from a saved starting point

Use `templates/studio.html#studio-batch` for an illustrative review schedule.
This extends the selection composition with dates and existing reservations;
it does not supply a scheduler. Prefill from the saved intent, state the source
version/date range, and distinguish each row as **Will add**, **Keep existing**,
**Blocked** or **Left out**. Existing rows name the actual retained record,
including its date/setup when relevant, rather than the proposed candidate.

Selection is deliberate. Refreshing a source or extending a date horizon keeps
omissions by stable date/kind key where they still apply. A proposed date is not
a completed task. Do not backfill past dates, compress missed work into the next
day, copy observed history, or claim that time hints send reminders. Counts name
their basis; capacity overflow requires a choice rather than truncation.

The reviewed source witness must include the account, relevant revision and
current local date. A changed reservation, newly started task or restored record
requires a fresh review. Keep valid choices; show what changed. The authoritative
apply path verifies the witness again and appends only the reviewed eligible
IDs. A retry cannot create another copy of the same reservation silently.

Undo has its own current scope: say how many original additions remain untouched
and how many are protected before the action. Never remove an edited, started
or linked task merely because it once belonged to that batch. Consumer-owned
revision checks prevent a concurrent start/restore from changing the meaning
between review and removal. Do not replace a stale full object as an Undo.

Compose `.sc-task` rows, `.sc-facts`, disclosures and one `.sc-actionbar`.
Dates and reasons wrap vertically at 320px and 390px. Review focuses a named
heading/region; Cancel returns to its opener. A failed apply retains the draft.
The specimen's controls are disabled: all records are illustrative and nothing
is scheduled, applied or undone by the page.

## Prepare the exact task, including pinned continuation

Use `templates/studio.html#studio-prepared` for an illustrative document-review
continuation. Show source identity/version, exact target rows, already confirmed
work and remaining work before one deliberate Start/Continue action. Opening
the review does not start a timer, confirm a task or write a record.

First-run choices may alter the executable preview; refetch/recompute the
authoritative task when they change and disable Start while loading. A pinned
continuation instead prints the saved name/version/mode/targets as read-only
values. A renamed, edited or removed current template must not make the saved
task's heading describe another version or incorrectly say it is unavailable.
Already confirmed work stays confirmed and is not counted again.

Keep permitted per-visit choices visibly separate from pinned targets. For
example, an available-time hint may change without changing the source task;
say that it does not shorten, stop or complete the task. Preserve original work
identities and ordering. Required resources apply to remaining work; unresolved
resources or permissions have a written reason and an owned repair route.

The preview and eventual Start share the same authoritative resolution. Bind
their exact content and source witness, not a client reconstruction that can
drift. Refresh when local date, relevant history, account or template state
changes, including on return to a visible page. Cancel outstanding responses
when the selected task changes. Lock choices during Start or retain newer edits
explicitly. Source payloads, permissions and persistence remain consumer-owned.

Use a named loading/ready/error state. Future reservations can show an explicitly
provisional preview, but cannot start without the relevant date/ownership rules.
An already active task offers Return to task, rather than another timer. Cancel
restores the invoking control; successful Start focuses the active task. An
imperative dialog has no automatic trigger reference: the consumer must provide
that focus handoff. Relevant saved guidance remains available while respecting
the application's privacy/presentation preferences.

Compose `.sc-session`, `.sc-facts`, task target rows and one bounded actionbar.
Avoid nested scrolling lists that hide the final control. Test dark/light,
320/390px, short height, large text, pending/failure and continuation. The
specimen adds no playback, timer, scheduling or save runtime. Run
`node build/reviewed-work-check.mjs` for authored-state/negative-control checks;
actual browser/persistence/ownership verification remains separate.
