# GAP Report — Round 48 (scan output UX polish from the 0.11.0 regression transcript)

## Gap

Re-reading the 0.11.0 clean-env regression output surfaced two paper cuts:

1. A repo/skill scan prints "Scanned 0 server(s) across 3 file(s)" — the
   "0 server(s)" reads like a failure when the user deliberately scanned a
   directory with no MCP configs.
2. AG-SK-002 findings had no line number, so GitHub code-scanning annotations
   from SARIF land on line 1 instead of the `allowed-tools` line (AG-SK-001/003
   already carry lines).

## Fixed

- Table summary: repo-only scans (0 servers, >0 files) now print
  "Scanned N source file(s), no MCP servers configured".
- AG-SK-002 findings report the `allowed-tools` frontmatter line.

## Verified

- Unit test asserts the line number; full suite green.
- JSON/SARIF contracts unchanged (line was already optional in the schema).
