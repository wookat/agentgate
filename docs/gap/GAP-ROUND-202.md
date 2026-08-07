# GAP-ROUND-202 — Copilot CLI MCP config discovery

Date: 2026-08-08 · Round type: coverage (new surface, follows round 201)

## Official evidence

- GitHub Docs "Adding MCP servers for GitHub Copilot CLI": `copilot mcp add`
  and the interactive `/mcp add` write the user configuration to
  `~/.copilot/mcp-config.json` (an `mcpServers` map with
  `type`/`command`/`args`/`env`/`url`/`headers`/`tools`); the location can
  be moved with `COPILOT_HOME`.
- Same page: project-level configs live at `.mcp.json` and `.github/mcp.json`
  (closest to the working directory wins; project definitions override the
  user config). Project files accept either the `mcpServers` wrapper or a
  bare top-level map where each key is a server name.
- The CLI's own `--additional-mcp-config` help text confirms the user path
  ("augments config from ~/.copilot/mcp-config.json").

## What shipped

- User-level discovery: `~/.copilot/mcp-config.json` (client `copilot-cli`,
  standard `mcpServers` parsing).
- Project-level discovery: `.github/mcp.json` with a new `copilot-mcp-json`
  parser that accepts the `mcpServers` wrapper or the bare top-level map
  (only entries shaped like servers — carrying `command`/`url`/`type` — are
  taken from the bare form). Project `.mcp.json` was already covered
  (round-1 claude-code surface; same format, shared file).
- All servers run through the full config rule set + OSV/MCPA advisory
  checks.

## Surface / corpus evidence

- GitHub code search: 439 files named `mcp.json` under `.github/`.
- Real repos scanned (unmodified): github/gh-aw and
  MicrosoftDocs/architecture-center both carry `.github/mcp.json`
  (`mcpServers` wrapper, local `gh aw mcp-server`) — discovered, parsed,
  correctly 0 findings (local pinned-binary command, no rug-pull face).

## Boundaries (recorded, not modeled)

- `COPILOT_HOME` relocation of the user config is not read (consistent with
  other clients: fixed default paths only).
- `--additional-mcp-config` session-only JSON never touches disk — out of
  scope for static scanning.
- `.github/copilot-mcp.json` (seen once in the wild at storybookjs) is not
  a documented path; not added without official evidence.

## Validation

- Full suite green: core 284, cli 47, config-convert 24.
- Self-scan 155 files: 18 findings, unchanged.
