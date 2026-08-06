# GAP Report — Round 52 (client discovery gap: Windsurf, Cline, Gemini CLI)

## Gap

Discovery covered six clients (Claude Desktop/Code, Cursor, VS Code, Codex,
OpenCode) but missed three widely-used MCP clients. A user running plain
`agentgate scan` on a machine that only uses Windsurf, Cline, or Gemini CLI
got "nothing was scanned" — a silent coverage hole.

## Paths added (verified against each client's official docs, 2026-08-06)

- **Windsurf**: `~/.codeium/windsurf/mcp_config.json` (current, per
  docs.windsurf.com) plus legacy `~/.codeium/mcp_config.json`. Global only —
  Windsurf has no project-level MCP config. `serverUrl` remote fields were
  already handled by the normalizer.
- **Cline**: `<VS Code user dir>/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
  on all three OSes (path confirmed in cline/cline `src/core/storage/disk.ts`).
- **Gemini CLI**: `~/.gemini/settings.json` (user) and `.gemini/settings.json`
  (project) — `mcpServers` key per google-gemini/gemini-cli docs.

All three use the standard `mcpServers` JSON shape, so no new parser was
needed. Docs/README client lists updated (EN + zh).

## Not added

- Gemini CLI system-level settings (`/etc/gemini-cli/settings.json` etc.) —
  machine-wide admin config, out of scope for per-user discovery.
- Cline portable-VS-Code paths — no stable location (cline/cline#10894).
- `config convert` output formats unchanged (all three read `mcpServers`,
  which convert already emits).

## Verified

- 2 new discovery tests (client set + exact per-client paths).
- Full suite green: build, lint, typecheck, core/cli/config-convert tests.
