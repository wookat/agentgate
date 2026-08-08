# GAP-ROUND-264 — config convert catches up to the discovery client list

Date: 2026-08-08.

## Gap

After rounds 262–263 the convert side still lagged discovery by five
clients: factory, junie, qoder, qwen-code, and copilot-cli all have
discovery + scanning surfaces (rounds 119/126/201–208/209/232) but could
not be used as `config convert` sources or targets. This round closes the
gap completely: every discovery client whose config is a client-owned MCP
server file is now convertible (26 client ids, 24 adapters + agents/plugin
pseudo-clients excluded — see boundary).

## Semantics

- **factory / junie / qoder / qwen-code** — all standard `mcpServers`
  notation, verified during their discovery rounds (Factory docs, JetBrains
  Junie docs, Qoder docs, Qwen Code settings docs); discovery already
  parses them with the shared `mcpServers-json` parser. Convert reuses the
  shared `mcpServersAdapter` (same as cursor/trae/amazonq). Default paths
  are the project-level locations (`.factory/mcp.json`,
  `.junie/mcp/mcp.json`, `.qoder/settings.json`, `.qwen/settings.json`);
  `--in` auto-discovery also finds the user-level files via core discovery.
- **copilot-cli** — verified against GitHub Docs "Adding MCP servers for
  GitHub Copilot CLI": user config `~/.copilot/mcp-config.json` uses an
  `mcpServers` wrapper; project files (`.github/mcp.json`, `.mcp.json`)
  may also use a bare top-level map. `type` accepts `local`/`stdio`
  (equivalent), `http`, `sse`; entries carry an optional `tools` allowlist
  (default `["*"]`) and `timeout` (ms). The adapter normalizes `local` →
  stdio, accepts both shapes, and warns when a non-`["*"]` tools allowlist
  or timeout is dropped (no canonical representation). Render emits the
  `mcpServers` wrapper with explicit `type` (docs recommend `stdio` for
  cross-client compatibility).

## Verification

- copilot-cli fixture test from the official docs example (local type
  normalization, bare project map, tools-allowlist warning boundary:
  `["*"]` silent, named list warns) + render round-trip.
- The all-adapter stdio round-trip loop now covers 26 clients
  automatically. Suite: 28 passed.
- CLI end-to-end: `--from copilot-cli --to factory` and back.

## Boundary

- `qoder`/`qwen-code` renders emit only the `mcpServers` key of their
  settings files (same convention as kiro/zed settings adapters); users
  merge into existing settings.
- Pseudo-clients without a client-owned config file are not convert
  targets: `agents` (generic .agents convention, covered by warp),
  `claude-plugin`/`factory-plugin`/`gemini-extension`/`qwen-extension`
  (plugin-bundled servers), `copilot-agent` (frontmatter inside agent
  markdown), `unknown`.
- Copilot CLI `COPILOT_HOME` relocation is not read (fixed default paths,
  same as discovery, round 202).
