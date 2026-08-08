---
'mcp-agentgate-config-convert': minor
'mcp-agentgate': minor
---

`config convert` supports five more clients with existing discovery surfaces: `factory` (Factory Droid `.factory/mcp.json`), `junie` (JetBrains Junie `.junie/mcp/mcp.json`), `qoder` (`.qoder/settings.json`), `qwen-code` (`.qwen/settings.json`) — all standard `mcpServers` notation — and `copilot-cli` (GitHub Copilot CLI `~/.copilot/mcp-config.json` / `.github/mcp.json`: `mcpServers` wrapper or bare project map, `type: local` normalized to stdio, `tools` allowlists and `timeout` warn as lossy).
