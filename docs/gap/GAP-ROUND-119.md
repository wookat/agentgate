# GAP-ROUND-119 — discover Qoder MCP configs

Date: 2026-08-07 · Round type: coverage expansion (client discovery)

## Gap found (real research)

Qoder (Alibaba's AI IDE + CLI) officially documents MCP server storage in
three scopes (docs.qoder.com/cli/mcp-servers, docs.qoder.com/cli/sdk/references):

- user: `~/.qoder/settings.json`
- project (committed): `.qoder/settings.json` and project `.mcp.json`
- local (gitignored): `.qoder/settings.local.json`

`settings.json` carries a standard `mcpServers` map (`Record<string,
McpServerConfig>`, confirmed in the SDK reference and the IDE MCP guide).
Project `.mcp.json` was already discovered (Claude Code convention); the
three settings files were not. 17→18 named clients.

## What shipped

- Discovery: user `~/.qoder/settings.json`; project `.qoder/settings.json`
  + `.qoder/settings.local.json` (all `mcpServers-json` — the parser
  ignores unrelated settings keys, same as Gemini CLI's settings.json).
- Docs: client lists across README/site.
- Tests: user path + both project files.

## Deliberately NOT added (honest)

- `config convert` target: Qoder's settings.json holds many non-MCP
  settings (permissions, models); emitting a whole-file settings.json from
  the converter would invite clobbering. Project `.mcp.json` (standard)
  already works for conversion into Qoder.
- The `~/Library/Application Support/Qoder/SharedClientCache/mcp.json`
  paths circulating in third-party guides are not in Qoder's official docs;
  skipped under the documented-paths policy.

## Routine sweep (this round)

- advisory watch: `No uncovered MCP-related advisories found.`
- Competitors: thynkQ mcp-scan 2.0.2, socket 1.1.154 — no movement.
- Doc integration pins auto-bumped to v0.24.1 (round-37 automation working).
