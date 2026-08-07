# mcp-agentgate-config-convert

## 0.3.0

### Minor Changes

- a9a1841: `config convert` supports three more clients: `kiro` and `roo-code` (standard `mcpServers`) and `zed` (`context_servers` inside `settings.json`, JSONC comments/trailing commas tolerated on parse; output is a standalone `context_servers` document to merge into your settings).

## 0.2.0

### Minor Changes

- c58fbd7: `config convert` supports three new client formats: `windsurf` (remote servers via `serverUrl`), `cline` (`disabled` flag mapped to enabled state, `autoApprove` warned as lossy), and `gemini-cli` (`url` = SSE vs `httpUrl` = streamable HTTP preserved in both directions). Default-path auto-discovery picks up the new clients too.
