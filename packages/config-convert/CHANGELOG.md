# mcp-agentgate-config-convert

## 0.10.0

### Minor Changes

- 73acf28: `config convert` supports `antigravity` (Google Antigravity): parse/render `.agents/mcp_config.json` / `~/.gemini/config/mcp_config.json`, emitting remote servers with the official `serverUrl` field.

## 0.9.0

### Minor Changes

- d324bde: `config convert` supports `amazonq` (Amazon Q Developer, standard `mcpServers` notation at `.amazonq/mcp.json`) as source and target.

## 0.8.0

### Minor Changes

- 84d246b: Discover Trae (ByteDance) project-level MCP configs (`.trae/mcp.json`, standard `mcpServers` notation) and support `trae` as a source/target in `config convert`.

## 0.7.0

### Minor Changes

- 67a0bcf: Discover LM Studio MCP configs (`~/.lmstudio/mcp.json`, Cursor-style `mcpServers` notation, same path on every platform) and support `lmstudio` as a source/target in `config convert`.

## 0.6.0

### Minor Changes

- cad6f07: Discover Warp MCP configs (`~/.warp/.mcp.json`, project `.warp/.mcp.json`) and the generic other-agents convention (`~/.agents/.mcp.json`, project `.agents/.mcp.json`); `config convert` supports `warp` (standard `mcpServers`, `working_directory` ↔ cwd).

## 0.5.0

### Minor Changes

- 754deef: Discover Amp (Sourcegraph) MCP configs — the `amp.mcpServers` key in `~/.config/amp/settings.json` and workspace `.amp/settings.json` — and support `amp` in `config convert` (14 clients total).

## 0.4.0

### Minor Changes

- f943c78: `config convert` supports `continue` (Continue.dev): parses the YAML `mcpServers` list from `~/.continue/config.yaml` or `.continue/mcpServers/*.yaml` blocks, and renders a standalone YAML block document (save under `.continue/mcpServers/` or merge into your config.yaml).

## 0.3.0

### Minor Changes

- a9a1841: `config convert` supports three more clients: `kiro` and `roo-code` (standard `mcpServers`) and `zed` (`context_servers` inside `settings.json`, JSONC comments/trailing commas tolerated on parse; output is a standalone `context_servers` document to merge into your settings).

## 0.2.0

### Minor Changes

- c58fbd7: `config convert` supports three new client formats: `windsurf` (remote servers via `serverUrl`), `cline` (`disabled` flag mapped to enabled state, `autoApprove` warned as lossy), and `gemini-cli` (`url` = SSE vs `httpUrl` = streamable HTTP preserved in both directions). Default-path auto-discovery picks up the new clients too.
