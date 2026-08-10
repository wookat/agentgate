# GAP-ROUND-380 — data checkpoint (rounds 371-379)

## Block storyline

Rounds 371-379 ran a corpus-precision and advisory block: three fresh
140-repo corpora with every critical and residual-high finding manually
verified, producing narrow precision fixes (deny-list data / multi-line
data strings / compound example keys / demo JWTs / guard-wrapper SSRF
context r371; example-marked-key curl|sh r372; enclosing example lists /
placeholder-shaped dummies / self-test paths / IOC-scanner headers r373;
pattern-table keys / module pipes / plugin-bin comments / URL slugs /
wrapped placeholders / guard declarations r375; assignment-declared
deny/guard pattern tables r376; code-identifier poisoning markers /
detection-rule-row curl|sh r378); four advisory rounds that ingested five
new records after tarball/wheel-level verification (MCPA-2026-0091/0092
LudusMCP r374; 0093/0094 server-koboldai + article-scraper-mcp SSRF r377;
0095 @copilot-mcp/apex postinstall dropper r379, with the fa-mcp-sdk
amazon-inspector FP rejected on tarball evidence); and a watch-ignore
data-model fix (rationale-only ids never suppressed; two invariant tests
added, r379). v0.67.32 and v0.67.36 shipped and were close-looped.

## Measured data (2026-08-10, main @ #563)

- Tests: 585 (config-convert 30, core 496, cli 59) + 26 api, all green.
- Core coverage: statements 94.06%, branches 86.04% (gate ≥80%).
- Self-scan (dogfood): 238 source files, 24 findings, ~0.93 s wall
  (AG-RC-001 ×17, AG-SS-001 ×5, AG-CL-001 ×2 — the net -1 vs r370 is the
  r371-378 precision work applying to our own fixtures; all expected
  self-hits).
- Advisory database: 109 entries; production consistent — API count 109
  after the #563 deploy, website feed 109 items, site 200. (API returned
  a transient 0-length response mid-deploy during collection; re-query
  confirmed 109.)
- Advisory window: authenticated watch clean after the r379 ignore fix;
  npm export ETag changed once this block (r379, triaged fully), PyPI
  unchanged since r374.
- Client version window: nine clients unchanged (r379 check).

## Distribution

npm last-month downloads still report **11,996 (cli) / 12,929 (core)** in
the same 2026-07-10 → 2026-08-08 window as the r350/r360/r370 checkpoints —
the reporting window has not advanced, so this remains one data point.
Attribution (real CI adoption vs mirror scanning) still cannot be
determined from npm counts; re-check once the window moves past 2026-08-08.

## Remaining gaps

- Distribution attribution unchanged (r350).
- AG-SK-002 `allowed-tools: Bash` pre-approvals remain the largest severity
  bucket in fresh corpora; sub-grading by scope breadth is still a
  candidate if triage feedback warrants it.
- semgrep planted-defect SSRF fixture (r371) remains deliberately unfixed
  pending a test-path convention signal.
- Two patch changesets (r378, r379) are accumulated since 0.67.36; a
  version PR is warranted when the boss approves.
