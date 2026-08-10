# GAP-ROUND-404 — routine windows + r403 residual verification (honest no-defect round)

Date: 2026-08-03. Baseline: main @ #606 (0.67.51 published; no changesets pending).

## Routine windows

- Authenticated advisory watch (GHSA/OSV): zero uncovered MCP-related
  advisories.
- OSV snapshots: npm ETag `03cda0b0…` and PyPI ETag `22a6e7d4…` both identical
  to the r403 snapshot — MAL sets unchanged, no diff to triage.
- Client version window (nine clients): all unchanged from r402/r403
  (gemini-cli v0.54.4, copilot-cli v1.0.79, crush v0.88.1, qwen-code v0.21.9,
  codex rust-v0.147.0, goose v1.45.0, opencode v1.18.16, zed v1.14.2,
  claude-code v2.1.226).
- Production consistency: website 200; advisory API 109; feed 109; repository
  `advisories/MCPA-*.json` 109. (A raw `*.json` glob counts 110 because it
  includes `watch-ignore.json` — not an advisory; noted to avoid future
  miscounts.)

## r403 residual verification (main @ #606)

Sampled the remaining medium/low buckets from the r403 corpus scan:

- AG-SK-002 medium (420): unscoped `Write`/`Edit`/`WebFetch`/`WebSearch`
  pre-approvals in real skill/command/agent frontmatter — genuine grants,
  rule semantics correct. Golden-test skill trees (coding-os
  `tests/golden/...`) carry real frontmatter grants and stay medium by
  design.
- AG-RC-001 low (32): commented install one-liners with comment wording,
  deny/block-list keys with defensive wording, test-path quoted payloads —
  all correctly quiet with accurate rationale text.
- AG-SC-001 low (11): `-y` auto-confirm on unpinned specs — correct.

No new generalizable defect; the three r403 watch-list singletons
(placeholder-phrase env values, named `firebaseApiKey` constants, exec tokens
in rule-DB JSON descriptions) remain single-example and deferred.

## Outcome

No code change, no changeset — docs-only evidence record.
