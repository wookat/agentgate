# GAP-ROUND-115 — discover + convert LM Studio MCP configs

Date: 2026-08-07 · Round type: coverage expansion (client discovery)

## Gap found (real research)

LM Studio (≥0.3.17) supports local and remote MCP servers via a file-based
config — officially documented at lmstudio.ai/docs/app/mcp and the 0.3.17
release blog: `~/.lmstudio/mcp.json` on macOS/Linux,
`%USERPROFILE%/.lmstudio/mcp.json` on Windows, explicitly following
"Cursor's mcp.json notation" (`mcpServers` map, `command/args` or
`url` + `headers`). AgentGate didn't discover it, so LM Studio users' MCP
surface was invisible to `scan`/`lock`/`ci`.

## What shipped

- Discovery: `lmstudio` client, user-level `~/.lmstudio/mcp.json`
  (`mcpServers-json` format, same relative path on every platform). 15→16
  named clients.
- Convert: `lmstudio` as source/target in `config convert`
  (standard-notation adapter, remote servers preserved).
- Docs: client lists in README, cli README, quick-start, scan reference,
  FAQ, troubleshooting, homepage, config-convert table.
- Real test: pseudo-HOME with ludus-mcp@1.0.24 + hosted server in
  `~/.lmstudio/mcp.json` → both discovered; ludus hits 3 bundled
  advisories (AG-SC-003); cursor→lmstudio convert verified.

## Known limits (honest)

- A macOS bug report (lmstudio-bug-tracker#1371) says the file can
  actually live at `~/.cache/lm-studio/mcp.json` on some installs; the
  documented `~/.lmstudio` path is what we scan. Revisit if user reports
  confirm the alternate path is the real one.
- LM Studio's per-request "ephemeral" MCP servers (API-only) have no file
  on disk and are out of scope.

## Routine sweep (this round)

- advisory watch: no uncovered MCP-related advisories.
- Competitors unchanged: thynkQ mcp-scan 2.0.2, socket 1.1.154.
