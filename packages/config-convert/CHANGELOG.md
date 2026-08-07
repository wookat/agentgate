# mcp-agentgate-config-convert

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
