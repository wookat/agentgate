# GAP-ROUND-335 — advisory routine check (clean) + collapse mass-duplicated table rows

Date: 2026-08-04

## Advisory window (honest zero)

- Automated GitHub GHSA/malware watch (authenticated, WATCH_DAYS=3): "No uncovered
  MCP-related advisories found."
- OSV npm export refreshed since r333 (`ETag "e31fe9a2…"` vs `"9f8ab640…"`), but the
  MAL id set is byte-identical to the r315 snapshot: 219,308 ids, diff 0 added / 0 removed.
- OSV PyPI export unchanged (`ETag "0006eded…"`, same as r313).
- No advisory added — nothing verifiable surfaced.

## Report-UX fix: collapse rows identical except for the file

Closes the boundary recorded in GAP-ROUND-334: `withoneai/one-agent-plugin` ships 650
platform directories each carrying an identical Agent Plugins manifest + `mcp.json` for
the same unauthenticated endpoint, producing 651 AG-AM-001 findings whose table rows
differ only in the (truncated) file path — the table was ~4,000 lines of identical rows.

The findings-table renderer now groups findings identical in
(ruleId, severity, target, message) that differ only in the source config file, and
collapses groups of 4+ into one row showing the first file plus "…and N more file(s)".

Deliberate boundaries:
- Only the human-oriented table collapses. JSON and SARIF output still list every
  finding individually (contract snapshots untouched), the summary line still counts all
  findings (`651 finding(s)`), and the per-rule footer counts are unchanged — so nothing
  is hidden from machine consumers or the totals.
- Findings without a distinct source file never group (a repeated row there would mean
  genuinely distinct findings).
- Threshold 4 keeps the common 2-3-config case (e.g. `.mcp.json` + `mcp.json` bundles)
  fully itemized; measured on the r334 corpus the only collapse is the 650-copy repo
  (651 rows → 2 rows) — every other repo's table is byte-identical.

## Verification

- Regression tests: 6 identical-but-for-file rows collapse ("…and 5 more file(s)", total
  still "6 finding(s)"); 3 rows stay itemized.
- Real-world: `withoneai/one-agent-plugin` table now renders 2 AG-AM-001 rows
  (root `mcp.json` + collapsed 650-file group) instead of 651.
- Self-scan unchanged (228 files / 21 findings, no grouping triggered).
