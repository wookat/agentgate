# GAP-ROUND-438 — routine windows + r437 fix verification

Routine advisory-watch round. Honest zero: no new advisories, no scanner
defects. Docs only.

## Advisory windows

- **Authenticated advisory watch** (GHSA + OSV, `api/scripts/watch.mjs`):
  "No uncovered MCP-related advisories found." Zero uncovered.
- **OSV npm**: ETag `"53128261faf337a1aa51e8c5812805fd"` — identical to
  r430/r432/r434/r436; MAL set unchanged, no diff needed.
- **OSV PyPI**: ETag `"5f95571e63ccfc48ef1bfb0782fa67cd"` — identical to the
  r436 snapshot; unchanged, no diff needed.
- **Client release window**: all nine monitored clients unchanged from r436
  (claude-code v2.1.227, codex rust-v0.147.0, gemini-cli v0.54.4, qwen-code
  v0.21.9, crush v0.88.1, copilot-cli v1.0.79, zed v1.14.2, opencode v1.18.16,
  goose v1.45.0 — stable channels; nightlies/pre-releases excluded as usual).

## Production consistency

Website 200; advisory API 110; website feed (`items`) 110;
`/advisories/mcpa-2026-0096/` 200; npm latest → 0.67.60. All consistent.

## r437 fix verification on main

Rebuilt from `main@f80f6fc` (#652 merged) and re-scanned the two r437 evidence
repos:

- `mreichhoff_TrieLingual`: AG-TP-001 all **low** (3,138 — the 354 former
  highs plus 2,784 pre-existing lows), zero high.
- `mbarnes-code_expert-dollop`: AG-TP-001 all **low** (25), zero high —
  includes the `ar-SA.json` locale hit.

Matches the pre-merge head-to-head exactly (355 target high→low, zero other
drift).

## r437 singletons (no second sample this round)

The three r437 singleton FP shapes (benign epistemic "do not tell the user
what is true" prose, `-sk-` package-name slugs, doc-example/detection-rule
tokens) remain single-repo; still below the two-repo bar. Carried.

## Disclosure

GitHub Actions remains unavailable; checks above ran locally/against live
endpoints. No code changes, no changeset.
