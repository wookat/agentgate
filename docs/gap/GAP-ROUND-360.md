# GAP-ROUND-360 — data checkpoint (rounds 351-359)

## Block storyline

Rounds 351-359 were a corpus-precision block: three fresh corpora (r353
130 repos, r356 120 repos, r359 135 repos) were scanned end-to-end with every
critical and residual-high finding manually verified, producing seven narrow
precision fixes (AG-CL-001 sequential/interleaved dummies, example: values,
Supabase anon JWTs r351; AG-TP-001 suffixed test dirs r352; nested CI
exemption + defensive private-IP + mock dummies r353; concealment object
analysis r354; other-CI pipeline exemption r355; cited-prose injection
phrases r356; gitleaks variants / test-*.sh / local anon JWTs / restrict*
guards r357; interleaved dummies / testdata/ / Firebase configs / defensive
headers / commented-out metadata config r359) and one advisory batch
(r358 MCPA-2026-0090, 103→104). v0.67.17 and v0.67.20 shipped and were
close-looped; the 0.67.23 version PR (consuming r356-359 patches) is open.

## Measured data (2026-08-03, main @ #524)

- Tests: 534 (config-convert 30, core 445, cli 59), all green.
- Core coverage: statements 94.04%, branches 85.62% (gate ≥80%).
- Self-scan (dogfood): 233 source files, 24 findings, ~0.91 s wall.
- Advisory database: 104 entries; production consistent — API count 104,
  website feed 104 items, site 200.
- Advisory window: authenticated watch clean ("No uncovered MCP-related
  advisories found") after the r358 batch.
- Client version window: nine clients unchanged (r359 check).

## Distribution

npm last-month downloads hold at the elevated level first seen at the r350
checkpoint: **11,996 (cli) / 12,929 (core)** — same reporting window
(2026-07-10 → 2026-08-08), so this is the same burst, not yet a second
independent data point. Whether the jump is real adoption or mirror scanning
still cannot be distinguished from npm counts alone; re-check next checkpoint
once the window advances.

## Remaining gaps

- Distribution attribution: no way to distinguish CI adoption from mirror
  traffic in npm counts (unchanged since r350).
- AG-SK-002 high volume on skill `allowed-tools: Bash` pre-approvals is rule
  semantics working as designed, but remains the biggest single severity
  bucket in fresh corpora — a future round could consider sub-grading by
  scope breadth if real-world triage feedback warrants it.
