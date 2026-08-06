# GAP Report — Round 65 (table UX: truncated paths)

## Gap (caught in the v0.14.0 clean-environment regression)

The findings table truncated the Target column at 24 chars with an
ellipsis: `.windsurf/workflows/deploy.md` rendered as
`.windsurf/workflows/d…` — with the new deeper instruction-tree paths
(rounds 61/62) most skill findings no longer showed which file they were
in, forcing users to re-run with `--format json`.

## Fix

`renderFindingsTable` sets `wrapOnWordBoundary: false` on the Target cell
only: paths (no spaces) wrap mid-word across lines so the full path is
always visible; messages keep word-boundary wrapping. cli-table3 supports
this per-cell, so no layout change elsewhere.

## Verified

- Real fixture: `.windsurf/workflows/deploy.md`, `.gemini/commands/setup.toml`
  etc. all render complete (wrapped) paths, messages unchanged.
- New CLI test extracts the Target column and asserts the full path plus no
  `…` in output.
- Full checks green: build, lint, typecheck, 159 core + 37 cli + 12 convert.

## Release status this round

v0.14.0 published, tagged, Release created; clean-env regression passed
(all round-61/62/63 behaviors verified via npx, live advisory DB at 29).
