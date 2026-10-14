# Working in this repository

Notes for anyone — a person or an agent — changing the SpicyChicken design
system, or building a game or app that consumes it.

## Build and check

```sh
npm run setup                 # once: the React wrappers' dev dependencies
npm run build                 # regenerate every derived file, then build react/
node build/check.mjs          # the gate (CI runs it); --offline skips only the tag lookup
npm --prefix react run build  # the wrappers alone
node build/visual-check.mjs --browser --shots /tmp/sc-shots   # rendered Chromium checks
```

The rendered checks need Playwright 1.56.1 and Chromium installed separately;
without a browser they report SKIP and exit nonzero. Node 20 or newer, no Python.

## Edit sources, never generated files

`tokens.json`, `styleguide.html`, `sc-theme.js`, `sc-charts.js`, `sc-map.js`,
`sc-activity.js`, `sc-game.js`, everything in `templates/`, the generated
recipes in `visual-library.html` and the whole skill bundle under
`.claude/skills/spicychicken-design-system/assets/` and `references/` are
produced by `build/`. Edit `sc.css`, `build/*.js`, `build/*-examples.mjs`,
`build/styleguide-body.html` or the root docs, then run `npm run build`. The gate
regenerates into a temp directory and fails on any drift.

## The reciprocal contribution rule

Every game and app that uses the system gives back what it learns about
presentation and interaction. When a consumer needs something:

1. **Need** — name the interface problem, not the product feature.
2. **Reuse or extend a shared pattern** — check `styleguide.html`, the visual
   library and the pattern docs (`STUDIO-PATTERNS.md`, `GAME-PATTERNS.md`) first.
   Extend an existing primitive before adding a new one; a new one must be
   something another product would be wrong to write differently.
3. **Source files** — land it in `sc.css` (an opt-in band in section 4, semantic
   tokens only), a `build/` source and an examples module; regenerate.
4. **Tests** — a check with deliberate negative controls, wired into
   `build/check.mjs`, plus rendered checks where geometry or focus matters.
5. **Documented local exceptions** — whatever stays product-specific is written
   down in the consumer (a promotion-verdicts file or its own docs) with the
   reason, so the question is asked once.

Physics, rules, records, saves and domain logic never come upstream. See
`.claude/skills/spicychicken-design-system/PROMOTING.md` for the cascade,
naming and colour traps.

## Snapshots and provenance

Consumers vendor an immutable snapshot with
`node build/vendor.mjs <consumer>/design-system`, from a clean, committed
checkout. It copies the stylesheet, optional scripts and original assets and
writes `provenance.json` with the source commit and SHA-256 hashes. Never
hand-edit vendored files: change the source here, commit, and re-vendor the whole
snapshot. Releases bump the `sc.css` header, both `package.json` files, the lock
file, the style guide strings and the `AUDIT-AND-ROADMAP.md` §5 changelog
together; `node build/check.mjs` lists anything that disagrees.
