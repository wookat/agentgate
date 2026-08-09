# GAP-ROUND-370 — data checkpoint (rounds 361-369)

## Block storyline

Rounds 361-369 opened with the 0.67.23 release incident close-out (broken
`workspace:*` CLI package → latest rollback → 0.67.24 pnpm republish → SOP
guardrails in RELEASING.md, r361) and then ran a message-quality and
corpus-precision block: single-line finding messages across all excerpt sites
(r361/r362); two fresh corpora (r363 140 repos, r368 140 repos via repository
search during the code-search outage) with every critical and residual-high
finding manually verified, producing narrow precision fixes (guard
declarations outside the window / truncated-run dummies / demo+postman paths
r363; camelCase denied identifiers / trigger-pattern tables / Firebase web
configs r364; test-path curl|sh text warnings r366; data heredocs /
inline-program pipes / yaml+toml fixtures / usage metavariables r368;
comment-only curl|sh grading r369); an output-channel walkthrough (r367,
docs-only); and clean advisory windows throughout (no new records this
block). v0.67.24 and v0.67.26 shipped and were close-looped.

## Measured data (2026-08-04, main @ #541)

- Tests: 545 (config-convert 30, core 456, cli 59), all green.
- Core coverage: statements 94.05%, branches 85.81% (gate ≥80%).
- Self-scan (dogfood): 233 source files, 25 findings, ~0.92 s wall (the +1
  vs r360 is an AG-RC-001 dynamic-exec medium from the new r368/r369 test
  fixtures in packages/core/test/scanner.test.ts — verified by rule mix:
  AG-RC-001 ×17, AG-SS-001 ×5, AG-CL-001 ×3, all expected self-hits).
- Advisory database: 104 entries; production consistent — API count 104,
  website feed 104 items, site 200.
- Advisory window: authenticated watch clean; OSV npm ETag unchanged, PyPI
  MAL diff additions-only with zero MCP-related ids (r369).
- Client version window: nine clients unchanged (r369 check).

## Distribution

npm last-month downloads still report **11,996 (cli) / 12,929 (core)** in the
same 2026-07-10 → 2026-08-08 window as the r350/r360 checkpoints — the
reporting window has not advanced, so this remains one data point, not three.
Attribution (real CI adoption vs mirror scanning) still cannot be determined
from npm counts; re-check once the window moves past 2026-08-08.

## Remaining gaps

- Distribution attribution unchanged (r350).
- AG-SK-002 `allowed-tools: Bash` pre-approvals remain the largest severity
  bucket in fresh corpora (287 of 363 mediums in r368); sub-grading by scope
  breadth is still a candidate if triage feedback warrants it.
- GitHub code search remained degraded through r368; repository search proved
  a workable fallback for corpus construction but skews toward
  recently-pushed whole repos rather than surface-targeted files.
