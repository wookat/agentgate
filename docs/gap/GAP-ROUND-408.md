# GAP-ROUND-408 — routine windows + r407 residual verification (honest no-defect round)

Date: 2026-08-03. Baseline: main @ #611 (0.67.52 published and closed out; no
changesets pending).

## Routine windows

- Authenticated advisory watch (GHSA/OSV): zero uncovered MCP-related
  advisories.
- OSV snapshots: npm ETag `03cda0b0…` and PyPI ETag `22a6e7d4…` both identical
  to the r403/r404/r406 snapshots — MAL sets unchanged, no diff to triage.
- Client version window (nine clients): all unchanged from r406
  (gemini-cli v0.54.4, copilot-cli v1.0.79, crush v0.88.1, qwen-code v0.21.9,
  codex rust-v0.147.0, goose v1.45.0, opencode 1.18.16, zed v1.14.2,
  claude-code v2.1.226).
- Production consistency: website 200; advisory API 109; feed 109; repository
  `advisories/MCPA-*.json` 109.

## r407 residual verification

Sampled the buckets not already covered in GAP-ROUND-407:

- AG-SK-002 medium (190): real unscoped `Write`/`Edit`/`WebSearch`
  pre-approvals in live skill/command frontmatter and Claude Code settings
  `permissions.allow` (keboola, maka-agent bundled skills, sebc-dev commands,
  depot settings) — genuine grants, correct severity.
- AG-RC-001 low (52): comment-line curl|sh mentions with the r395 comment
  wording (install scripts quoting their own one-liner, doctor/release
  tooling) — correctly quiet.
- AG-SC-001 low (6): `-y` auto-confirm combined-risk notes on unpinned npm
  server specs — correct.

## Outcome

No generalizable scanner defect established this round: honest no-defect
record, docs only, no changeset.
