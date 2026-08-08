# GAP-ROUND-242 — config convert supports antigravity

Date: 2026-08-08. Follow-up to round 239 (Antigravity discovery/scanning):
`agentgate config convert` now speaks Google Antigravity's MCP config format.

## What shipped

New `antigravity` adapter in `mcp-agentgate-config-convert` (windsurf-style):

- Parse: standard `mcpServers` map; remote entries use the official
  `serverUrl` field (normalized to the canonical `url`); `command/args/env`
  and `headers` pass through the shared entry parser.
- Render: remote servers are emitted as `serverUrl` (never `url`/`httpUrl`,
  which Antigravity documents as unsupported); `sse` inputs warn and emit as
  `serverUrl` (Antigravity remotes are streamable HTTP); `cwd` warns and
  drops (not documented by Antigravity); `enabled:false` warns (no disabled
  flag).
- Default path `.agents/mcp_config.json`; the CLI's `--in` auto-discovery
  resolves workspace `.agents/mcp_config.json` first, then the global
  `~/.gemini/config/mcp_config.json`, via the core discovery locations added
  in round 239.

## Verification

- Round-trip test: official docs sample (stdio `sqlite` + `serverUrl`
  remote) parses and re-renders with `serverUrl` preserved and no `url` leak.
- The existing all-adapters stdio round-trip loop now covers `antigravity`
  automatically.
- End-to-end CLI: `config convert --from antigravity --to claude-code` on a
  real workspace file, and `--from cursor --to antigravity` emitting
  `serverUrl`; auto-discovery verified to resolve
  `<project>/.agents/mcp_config.json`.

## Boundaries

- Antigravity's MCP OAuth token store
  (`~/.gemini/antigravity/mcp_oauth_tokens.json`) is not migrated — tokens
  are client-managed and re-acquired on first connect.

## Checks

- Tests 350/47/25 (+1 convert test); lint/typecheck/build/diff-check clean.
