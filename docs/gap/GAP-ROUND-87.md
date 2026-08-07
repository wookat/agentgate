# GAP-ROUND-87 — dedupe scannedFiles; routine sweep

Date: 2026-08-07

## Gap (real evidence)

Round-86 verification exposed a report-quality defect: a skill's `mcp.json`
inside the scanned directory is visited twice — once by the repo source walk
and once by MCP config discovery — and appeared twice in `scannedFiles`
(observed: 4 entries, 3 unique). JSON consumers counting scanned files get
inflated numbers, and the table footer overcounts.

## Fix

`scan` now skips discovery-provided paths the repo walk already recorded.
Regression test asserts one `mcp.json` entry while the AG-SC-001 finding for
its unpinned server is still reported.

## Routine sweep (real runs)

- Advisory watch (GHSA+OSV, word-edge filter): **no uncovered MCP-related
  advisories**.
- Competitors: mcp-scan (npm/thynkQ) 2.0.2 — unchanged; socket 1.1.154 —
  unchanged; snyk-agent-scan (PyPI) 0.5.16 — unchanged; osv-scanner v2.4.0 —
  unchanged. (Note: snyk-agent-scan is PyPI-only; the npm 404 is expected,
  not a takedown.)
- v0.18.0 version PR (#153) verified green with round-85 + round-86
  changesets after bot merge.

## Still open (honest)

- `includeTools` allowlists in skill server entries still uninterpreted
  (carried from GAP-ROUND-86).
