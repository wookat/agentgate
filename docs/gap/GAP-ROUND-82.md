# GAP-ROUND-82 — advisory watch: word-edge MCP matching

Date: 2026-08-07

## Gap (real evidence)

Round-80's routine watch run surfaced 3 "GHSA advisories mentioning MCP":
all were false keyword hits — two FFmpeg CVEs and one Contiki-NG MQTT CVE
whose descriptions contain **`memcpy`**, which the bare substring check
(`text.includes("mcp")`) matched. Every such hit costs a manual triage and,
worse, trains the reader to skim past the report — the exact failure mode a
watch exists to prevent.

## Fix

`filterGhsa` now requires "mcp" at a word edge:
`/\bmcp|mcp\b|model context protocol/`. This keeps every real-world naming
shape we track — `mcp-server-foo`, `LudusMCP`, `MCPServer` — while rejecting
mid-word hits like `memcpy`.

## Verification

- New unit test: memcpy-description advisory filtered out; LudusMCP /
  MCPServer / mcp-server-foo shapes all kept. api suite green (fail 0).
- Real re-run (`WATCH_DAYS=2`): "No uncovered MCP-related advisories found."
  — the 3 round-80 false hits are gone, and the GHSA sample they came from
  contained no true MCP advisory (verified manually in round 80).

## Still open (honest)

- OSV leg is package-list driven (no keyword matching) — unaffected.
- Watch is still weekly + manual; auto-drafting an advisory JSON from a
  triaged hit remains future work.
