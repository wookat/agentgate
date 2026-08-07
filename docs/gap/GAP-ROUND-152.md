# GAP-ROUND-152 — Amazon Q allowedTools glob expansion

Date: 2026-08-08 · Round type: gap closure (round-151 boundary)

## Gap (recorded in GAP-ROUND-151)

Round-151 checked exact names only; official `agent-format.md` documents
glob wildcards (`fs_*`, `*_bash`, `fs_?ead`, middle wildcards). A
checked-in agent with `"*_bash"` or `"execute_*"` pre-approves
execute_bash but escaped the high check.

## What shipped

Non-`@` glob entries containing `*`/`?` are compiled to anchored
regexes and tested against the risky built-ins: a match on
`execute_bash`/`use_aws` → high, on `fs_write` → medium, with the
finding naming both the glob and the matched tool. `toolsSettings`
scoping still suppresses as before; `fs_?ead` (only fs_read) stays
clean. MCP `@server/...` globs unchanged (already covered by the
whole-server check where applicable).

## Corpus

Round-151's four corpus repos re-scanned: identical results (their
entries are exact names) — no new findings, no regressions.

## Honest boundaries

- MCP-side glob patterns (`@*-mcp/read_*`) are still not expanded
  against live tool surfaces — static scan has no tool inventory;
  `scan --live` includeTools correlation is the dynamic complement.
- `autoAllowReadonly` still not modeled.

## Evidence

- Full suite green: core 225, cli 47, config-convert 24.
- Self-scan unchanged (17 findings).
