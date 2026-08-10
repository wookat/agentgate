# GAP-ROUND-410 — routine windows + r409 fix verification

Date: 2026-08-03. Baseline: main @ #613 (fence-tracking fix merged; r409 patch
changeset pending after 0.67.52).

## Windows (all clear)

- Authenticated advisory watch: "No uncovered MCP-related advisories found."
- OSV snapshots: npm ETag `03cda0b0…` and PyPI ETag `22a6e7d4…` both unchanged
  from the r408 baseline — no MAL diff to triage.
- Client version window unchanged: gemini-cli v0.54.4, copilot-cli v1.0.79,
  crush v0.88.1, qwen-code v0.21.9, codex rust-v0.147.0, goose v1.45.0,
  opencode 1.18.16, zed v1.14.2, claude-code v2.1.226.
- Production: site 200; advisory API 109; feed 109; repository
  `advisories/MCPA-*.json` 109 — consistent.

## r409 fix verification on main

Rebuilt from main @ #613 and rescanned GliteTech/glite-english-audit: the
line-658 injection example now reports low with fenced-code-block wording
(first in-fence match at 648); no critical remains. Matches the pre-merge
head-to-head.

## r409 residual sampling (main @ #613)

- AG-SC-003 medium (1): Heretek mcp-pack `.mcp.json` pins no version for
  `serena-agent` with advisory MCPA-2026-0045 — correct.
- AG-RC-001 medium: real `execSync` call sites (cursor restart script), real
  installer-command string literals (claude-code native install ladder), a
  live rustup pipe executed in a benchmark sandbox — rule semantics correct.
- AG-AM-001 medium: remote MCP endpoints configured without auth headers
  (context7, ceramic, deepwiki, devin, linear) — correct as stated.

## Singleton deferred

`laurentvv/graph-orchestrator-smolagents` `bash_guard.py:103`: a curl|sh
regex row inside `_DENY_PATTERNS: list[Tuple[re.Pattern, str]] = [` reports
medium — the enclosing deny-table declaration sits 63 lines above the hit,
past the 60-line lookback cap in `isDenyListEntry`. Single sample; the
comparable r368 table (Caseous hooks.py) already reports clean. Deferred
until a second independent sample justifies widening the cap.

`<System>` placeholder token class (r409): still a singleton — deferred.

## Outcome

No generalizable defect this round; docs-only, no changeset.
