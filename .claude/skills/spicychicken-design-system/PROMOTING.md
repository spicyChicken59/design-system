# Promoting work into the system

The loop that produced 2.3.0, written down so the next one does not depend on
anyone remembering how this one went.

A consumer is where design gets decided under real pressure — real data, a real
reader, a real deadline. Most of what gets decided there is generic and stays
stranded. This is how it comes home.

## 1. Find what is stranded

```sh
node build/consumer-lint.mjs ../<project>/**/*.html
```

Five kinds of finding, in the order that matters:

| | |
|---|---|
| **SQUAT** | the page defines an `.sc-*` rule the sheet does not own. The system will claim that name eventually, and the page wins the tie by source order, so the sheet's version arrives dead. Fix now. |
| **UNKNOWN** | the markup uses an `sc-` class the sheet does not define. A typo, or a rename upstream nobody followed. |
| **OVERRIDE** | the page redefines what the sheet decided. Sometimes right — but each one is a decision the system did not get to make. |
| **HYGIENE** | raw colour where a token belongs. |
| **CANDIDATE** | portable: no page identity, tokens only. A prompt to *ask* whether it is generic, never proof that it is. |

Read the page's CSS yourself too. The linter finds names; it cannot tell you
that two components in two files are the same component.

**The consumer keeps the verdicts, not the system.** A CANDIDATE the consumer
has already thought about is recorded on the consumer side — SpicyCar keeps
`tools/promotion-verdicts.json`, mapping each settled selector to a verdict, the
reasoning, and the condition that should REOPEN it. The linter then reports
decided and open candidates separately, so a question is asked once rather than
every release, and a rule can be un-settled by deleting its entry. Keeping the
ledger in the consumer is deliberate: the system should not carry a list of one
project's local class names.

**Nobody has to remember to look.** SpicyCar runs the policy weekly
(`.github/workflows/loop.yml`) and keeps ONE issue up to date whenever something
is open — an unrecorded candidate, or a pin behind the newest release. Nothing
open means no issue. The linter also compares the pinned tag against the newest
release tag and says so; that check is a warning and never a build failure,
because a stale pin is not a correctness bug and failing on it would block pull
requests that have nothing to do with the design system.

## 2. Decide, and be willing to delete

Not everything generic should be promoted, and not everything found should be
kept. In 2.3.0 three rules were deleted rather than promoted because
measurement said they did nothing: a class that appeared in no markup, a rule
the sheet already set to the same value on the same element, and a width a
later rule in the same file overrode. Measure before you move.

The test for generic is not "could another project use it" — almost anything
passes that. It is **"would another project be wrong to write it differently"**.
A photo card, yes. A column width tuned to one dataset, no.

## 3. Check the cascade before you move anything

This is where promotion goes quietly wrong. The consumer's `<style>` loads
*after* `sc.css`, so a page rule wins every equal-specificity tie. Move it into
the sheet and it loses that tiebreak.

- A rule whose selector out-specifies the sheet's is safe anywhere.
- A rule that ties needs to land **after** what it overrides. Band 4c sits after
  band 4 for exactly this reason.
- A `@media` query buys no specificity. `.sc-brand` inside one still ties bare
  `.sc-brand`.

## 4. Naming

Promote under an `sc-` name that fits the existing vocabulary
(`block__element--modifier`). Two traps:

- A name already squatted in the sheet's namespace is promoted **unchanged** —
  it was always the sheet's.
- Renaming `photo-card__media` → `sc-photo-card__media` and then
  `photo-card` → `sc-photo-card` produces `sc-sc-photo-card__media`. Order
  longest-first, then grep for `sc-sc-`.

## 5. Colour: the one rule that is easy to get backwards

A mark carries a **tone slot**, never a colour, through the `--sc-tone` channel:

```html
<path class="sc-chart__series" style="--sc-tone: var(--sc-chart-3)">
```

Both alternatives look right and fail quietly:

- `stroke="#4682CC"` — a presentation attribute is outranked by *any* author
  rule, so wherever the sheet sets that property the attribute paints nothing.
- inline `stroke:` — wins, and takes the property away from the sheet for good.

Marks the sheet leaves uncoloured (`.sc-dot`'s fill) do take a plain attribute,
because nothing competes there. The channel also keeps the value a live
`var()`, so a theme flip costs no JavaScript.

## 6. Ship it properly

- Add to band 4c (or extend the component that already exists).
- **Show it in the guide.** Rule 12 fails otherwise, and it is right to: a
  component the guide does not show is one nobody can find. If it cannot be
  demonstrated — an invisible hit rect, a touch-only modifier — name it in a
  rule line. Telling counts.
- Update `DESIGN_SYSTEM.md`'s component table and this skill's vocabulary.
  Rule 13 fails if the skill teaches a class the sheet lacks.
- Write the changelog entry with the *reasoning*, not just the list.
- Bump the version everywhere; `node build/check.mjs` walks you through it.
- `git push origin vX.Y.Z`. Until that tag exists every documented pin 404s —
  ask 2.2.0, which shipped that way and nobody noticed for a release.

## 7. Then rebuild the consumer on it

This is the step that proves the promotion was real. If the consumer cannot
delete its local copy, the promotion was wrong — either the shape is off or it
was never generic. Re-run the linter; it should come back clean.
