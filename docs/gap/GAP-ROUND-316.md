# GAP-ROUND-316 — deterministic walk order (symlink alias reporting)

## Context

GAP-ROUND-314 recorded a boundary: when a repo aliases one skill tree to many client
directories with committed symlinks (genmedia: one tree → ~40 alias dirs), realpath
dedupe scans it exactly once, but *which* alias path claims the findings followed raw
`readdir` iteration order — filesystem- and platform-dependent. The same order also
leaked into `scannedFiles` and lockfile skill collection, so two machines could produce
differently-attributed reports for the same commit.

## Fix

`walk()` sorts directory entries lexicographically before iterating. The first claimant
of a realpath-deduped tree is now the lexicographically first alias, stable everywhere
(and `scannedFiles` / `collectSkillFiles` ordering is reproducible). Regression pins a
tree aliased into `.crush/skills` and `.goose/skills` from `.agents/skills`: exactly one
finding, reported under `.agents/skills/...`.

## Evidence

- genmedia (r313 corpus, the 40-alias repo): 3 consecutive runs identical — 579 scanned
  files, 576 findings, same file-attribution hash each run.
- Self-scan unchanged (227 files / 21 findings); full suite green (483).

## Boundaries

- Sorting is by raw name (byte order), not locale-aware — sufficient for determinism,
  which is the goal.
- Which alias "should" own findings is a policy question; lexicographic-first is a
  deterministic convention, not a semantic claim.
