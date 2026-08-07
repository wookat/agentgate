# GAP-ROUND-138 — enableAllProjectMcpServers auto-approval

Date: 2026-08-07 · Round type: overprivilege coverage (settings, cont.)

## Source (official)

Claude Code settings reference (https://code.claude.com/docs/en/settings):
`enableAllProjectMcpServers` — "Automatically approve all MCP servers
defined in project .mcp.json files."

## Gap

Rounds 134/136/137 covered `permissions.allow`, `defaultMode:
bypassPermissions`, JSONC parsing, and hook commands, but a checked-in
`"enableAllProjectMcpServers": true` — which removes the per-server
approval step for every `.mcp.json` server in the project — was not
flagged.

## What shipped

- AG-SK-002's settings check reports `enableAllProjectMcpServers: true`
  as medium (auto-approval removes review, but the servers themselves
  are still visible to `.mcp.json` scanning and other rules).
  `false`/absent report nothing.

## Honest boundaries

- Official docs note that as of Claude Code v2.1.196 this key is
  honored in untrusted folders only from settings files that aren't
  checked in — the checked-in copy still applies once the folder is
  trusted, which is the common case for a team repo; severity medium
  reflects that mitigation.
- `allowedMcpServers`/`deniedMcpServers` are managed-settings
  (machine-level) keys outside the project tree — out of scope.

## Verification

- Round-135 corpus (4 repos): none set the key → 0 new findings.
- Full suite green: core 215, cli 47, config-convert 24.
