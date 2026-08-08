# GAP-ROUND-229 — Crush allowed_tools: scoped keys + MCP tool names (closes round-225 boundary)

Date: 2026-08-08
Round type: boundary close-out (GAP-ROUND-225)

## Semantics (verified against Crush source, not guessed)

- `internal/permission/permission.go` (line 187-188): a request is auto-approved when `allowed_tools` contains either the bare `ToolName` or the scoped `ToolName + ":" + Action` key — so `bash:execute` grants the same shell execution as `bash` for that action.
- `internal/agent/tools/mcp-tools.go` (line 59): MCP tools are registered as `mcp_<server>_<tool>`, so `allowed_tools` can pre-approve individual MCP tools (seen in the wild: `mcp_context7_get-library-doc` in reVrost/counterspell).

## What was added

`classifyCrushAllowedTool()` shared by the `crush.json` `permissions.allowed_tools` check and the crushrc `permissions allow` line check:

1. Scoped keys: the entry's base tool (before `:`) is matched against the risky built-ins — `bash:execute` now reports high (round-225 explicitly did not).
2. MCP tool names: `mcp_<server>_<tool>` entries whose tool part matches the shared `DANGEROUS_TOOL_NAME` heuristic (exec/shell/sql/write/delete/deploy/…, same as the Roo/Zed auto-approval checks) report medium.

## Evidence

- Tests: `bash:execute` high + `mcp_db_execute_sql` medium flagged; `mcp_context7_get-library-docs` and `view` not flagged; 335/47/24 green.
- Corpus regression: reVrost/counterspell (real `mcp_context7_get-library-doc` entry) unchanged at 2 findings — read-only MCP tool correctly not flagged; spec-cleanroom and cchooks baselines unchanged.
- Self-scan 20 unchanged (the 20th is the round-228 advisory JSON low).

## Boundaries

- MCP tool-name classification is name-heuristic only (no live tool surface) — same limitation as Roo/Zed/VS Code auto-approval checks; `scan --live` remains the way to inspect actual tool descriptions.
- The scoped `:action` suffix is not itself interpreted (any action on a risky base tool reports); Crush actions are tool-defined strings with no public registry to gate on.
