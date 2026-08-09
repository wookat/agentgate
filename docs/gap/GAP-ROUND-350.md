# GAP-ROUND-350 — data checkpoint (rounds 341-349)

## Block storyline

Rounds 341-349 were a precision-and-truthfulness block: two stale hardcoded
version strings fixed (lockfile `generatedBy` r341, live-handshake clientInfo
r342), four corpus-verified false-positive classes graded or removed
(AG-SK-001 exfiltration credential-context r343, AG-RC-001 quoted-data masking
r344, AG-SK-001 hidden-unicode grading r345, AG-CL-001 AWS EXAMPLE keys /
scanner configs r346, AG-SS-001 blocklist identifiers r347, AG-SK-001
quoted/template examples r348), and two advisory batches (r340 MCPA-2026-0087,
r349 MCPA-2026-0088/0089). v0.67.12 and v0.67.15 shipped and were
close-looped (npm/tag/Release/deploy/clean-env regression).

## Measured data (2026-08-09, main @ #508)

- Tests: 521 (config-convert 30, core 432, cli 59), all green.
- Core coverage: statements 94.00%, branches 85.49% (gate ≥80%).
- Self-scan (dogfood): 232 source files, 23 findings (16 medium, 7 low),
  ~0.83 s wall.
- Advisory database: 103 entries; production consistent — API count 103,
  website feed 103, site 200 (verified after the #508 deploy completed).
- Advisory window: authenticated watch clean after the r349 batch; OSV
  npm/PyPI export ETags unchanged (npm `e31fe9a2…`, PyPI `c18a1fdc…`).
- Client version window: nine clients unchanged (r348 check).

## Distribution — first real adoption signal

npm last-month downloads jumped from ~3.1k/3.4k (flat across 22 checkpoints,
mostly mirror noise) to **11,996 (cli) / 12,929 (core) / 2,652
(config-convert)**, driven by a burst starting 2026-08-04 and peaking
2026-08-07 (5.7k/6.2k in one day). Honest caveats: the per-day shape (zeros
through 08-03, then a synchronized spike across all three packages) is
consistent either with genuine adoption (e.g. a CI integration or a listing)
or with a registry-mirror sweep; npm download counts cannot distinguish these.
Worth watching at the next checkpoint whether the level persists.

## Boundaries carried forward

- MCPA-2026-0088 range should flip to `fixed` once spec-workflow-mcp publishes
  a fixed npm build (fix is merged upstream, repo v2.2.7).
- Codex entry-level mcpServers/hooks fallback fields beyond the covered forms
  (GAP-331) remain unmodeled pending wild evidence.
