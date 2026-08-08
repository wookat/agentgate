# GAP-ROUND-262 — config convert supports crush (Charm)

Date: 2026-08-08.

## Gap

Discovery has modeled Crush's MCP surface since round 225 (`.crush.json` /
`crush.json` project files and `~/.config/crush/crush.json`, `mcp` map), but
`config convert` could not read or write the format — Crush users could not
migrate servers to/from the other 19 supported clients.

## Semantics (verified against the official schema + README)

Source: https://charm.land/crush.json (JSON Schema, `$defs.MCPConfig`) and
charmbracelet/crush README.

- `mcp` maps name → `{ type: stdio|sse|http (default stdio), command, args,
  env, url, headers, disabled, disabled_tools, enabled_tools, timeout }`.
- OAuth remote servers use `"oauth": true` (+ optional `oauth_client_id`
  etc.) instead of static headers.

## Implementation

- New `crush` adapter (20th client): parses the `mcp` map with the shared
  common-entry logic; `disabled: true` → canonical `enabled: false`.
- Lossy crush-only fields warn and drop on parse: `oauth`, `disabled_tools`,
  `enabled_tools`, `timeout`.
- Render emits `$schema: https://charm.land/crush.json` + `mcp`, `type` only
  for non-stdio (stdio is the schema default), `disabled: true` for disabled
  servers.
- `--in` auto-discovery works for free: the CLI reuses core discovery
  locations filtered by client, and crush locations landed in round 225.

## Verification

- Fixture test: parse (type/disabled/oauth/disabled_tools warnings) +
  render round-trip; all-adapter stdio round-trip loop covers crush
  automatically. Suite: 26 passed.
- CLI end-to-end: `--from crush --to claude-code --in .crush.json` (README
  http + stdio examples) and `--from claude-code --to crush` both correct.
- No `.crush.json` files exist in the retained r248/r249/r258 corpora
  (OpenCode/Roo-focused); the round-225/227 Crush wild-corpus semantics were
  the basis of the discovery parser this adapter mirrors.

## Boundary

- Crush OAuth configuration (`oauth`, `oauth_client_id`,
  `oauth_client_secret`, `oauth_callback_port`) is client-managed and not
  migrated; conversions warn.
- `crushrc` (the Bash-based successor config) is not a convert source —
  same call as discovery (round 226 scans it as an exec surface instead).
