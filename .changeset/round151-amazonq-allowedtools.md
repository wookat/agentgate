---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

AG-SK-002 checks `allowedTools` in Amazon Q CLI project agent files (`.amazonq/cli-agents/*.json`): a catch-all `"*"` is high, unscoped `execute_bash`/`use_aws` are high, unscoped `fs_write` is medium, and whole-MCP-server allows (`"@server"`, `"@server/*"`) are medium. Tools scoped by a matching `toolsSettings` allowlist stay clean.
