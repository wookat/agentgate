# GAP-ROUND-274 — CLI output UX walkthrough

Date: 2026-08-08. CLI output UX round (previous focused passes: rounds 48,
65, 89). Re-ran the built CLI over the round-269 wild corpus (134 real Kilo
repos) and reviewed table output quality on the noisiest repos.

## Issue found and fixed

Repos that declare the same MCP server in several client configs (common:
`.roo/mcp.json` + `.kilocode/mcp.json` + `.gemini/settings.json` carrying an
identical server block) produced visually identical table rows for
server-scoped findings — AG-SC-001 "unpinned package" appeared three times
for server "filesystem" with nothing distinguishing them, reading as
duplicate/buggy output. The JSON output already carried distinct `file`
fields; only the table hid them.

Fix: the Target cell now shows the source config file (dimmed, cwd-relative
when inside the working dir) under the target whenever the finding carries a
`file` that isn't the target itself. File-scoped findings (target already the
path) are unchanged — no double-printing. Regression test pins the two-config
case; the round-65 wrap behavior still applies to the added path.

## Also checked, no change

- Scanning a non-config file surfaces the raw JSON parse error with the file
  path — honest and actionable; exit codes per the documented convention.
- Zero-findings, footer per-rule counts, doc links, `--live` warning wording
  all render as designed on wild repos.
- GHA annotations already carried `file=`, so PR annotations were never
  ambiguous — this was table-only.

## Boundaries

- No dedupe/grouping of identical findings across configs: each config file
  is independently attackable surface, so one row per file is correct; the
  fix makes the rows distinguishable rather than collapsing them.
