# GAP-ROUND-288 — CLI/CI output UX recheck: GitHub annotation cap

Round type: CLI output UX / performance walkthrough (last: 274).

## What was rechecked (real runs, 87-advisory database)

- Self-scan baseline: 21 findings, ~0.8s wall clock — unchanged from the
  round-280 checkpoint.
- Random 25-repo sample from the round-284 wild corpus re-scanned (JSON):
  557 findings, 13.4s total, no crashes and no new FP classes spotted.
- Error paths: missing target and malformed `-c` config both exit 2 with a
  one-line readable error.
- `advisory check` against the four round-286 entries and `advisory list`
  (87, live database) render correctly.
- Table output on the worst-case repo (392 findings): severity-sorted rows,
  correct footer (`1 critical, 186 high, 205 medium` + per-rule doc links).

## Defect found and fixed: annotations beyond GitHub's display limit

`rabelojunior81-collab/tessy-argenta-fenix` (real wild repo, 392 findings)
emitted 392 `::error|::warning` workflow commands under `GITHUB_ACTIONS`.
GitHub renders at most **10 annotations per level (error/warning/notice) per
step** and drops the rest silently (actions/toolkit
`docs/problem-matchers.md`), so 372+ findings never surfaced in the PR UI and
nothing told the user annotations were missing.

Fix (`packages/cli/src/output.ts`): emit annotations in severity order capped
at 10 per level, then one summary annotation — placed on the least-severe
level that still has a free slot — saying how many findings were left out and
where to find the full list. Same treatment for lockfile drift annotations.
Verified on the same repo: now exactly 10 error + 10 warning + 1 notice
summary (`372 more finding(s) not annotated …`). Outputs within the cap are
byte-identical to before; the table/JSON/SARIF paths are untouched.

## Boundary noted, not implemented

GitHub also caps 50 annotations per job; a job running scan + deps + ci steps
could still exceed that in pathological repos. Left alone until real evidence
— the per-step cap is the one that fired in the wild.
