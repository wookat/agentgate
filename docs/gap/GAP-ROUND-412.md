# GAP-ROUND-412 — routine windows + r411 fix verification

Routine advisory-verification round after #616 (r411 AG-SS-001
defensive-context fix) merged to main. Honest no-defect round: all three
windows clean, no code change, no changeset.

## Advisory watch (authenticated)

`api/scripts/watch.mjs` with a GitHub token: **no uncovered MCP-related
advisories found** (unauthenticated runs 403 — token required).

## OSV snapshot

- npm `all.zip` ETag `03cda0b0…` — unchanged since r408; MAL set unchanged.
- PyPI `all.zip` ETag `55f662c5…` (changed from r408's `22a6e7d4…`); full
  MAL diff vs the r403 baseline set: exactly 3 new records —
  MAL-2026-13709/13710/13711 (`neutrl-contracts`, `neutrl-core`,
  `plp-contract`). Inspected each record: crypto-contract typosquats, zero
  MCP/agent/skill/client keywords — not in scope, not bundled.
  PyPI MAL total now 11,641 (was 11,638).

## Client version window

Unchanged from r410: claude-code 2.1.226, codex 0.147.0, gemini-cli 0.54.4,
copilot-cli 1.0.79, opencode 1.18.16, crush 0.88.1, qwen-code 0.21.9,
goose v1.45.0, zed v1.14.2. No new client surface to cover.

## Production consistency

Site 200; advisory API 109; feed (JSON Feed `items`) 109; repository
`advisories/MCPA-*.json` (excluding watch-ignore.json) 109 — consistent.

## r411 fix verification on main

Rebuilt from main @ #616 and rescanned the two r411 sample repos:

- `RedHatProductSecurity/ai-guardian` — all 36 AG-SS-001 findings now low,
  including the target `web/pages/ssrf.py:24` (noun-first "SSRF Protection"
  header) — no high remains anywhere in the repo.
- `santifer/career-ops` — all 4 AG-SS-001 findings low, including the target
  `test-all.mjs:818` (`blockCases` identifier).

Matches the pre-merge 19-corpus head-to-head (exactly two downgrades, zero
other drift).

## Residuals

- r411 deferred singletons unchanged: doctor.sh continuation-line
  multi-string curl|bash hint; ai-guardian scenario-yaml fake AKIA values;
  Agent_panel `isPublicHttpHost` positive-named guard (same repo as r399 —
  still one independent sample).
- 0.67.53 shipped; one patch changeset (r411) accrued since.

No generalized defect found this round.
