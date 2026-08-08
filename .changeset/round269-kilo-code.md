---
"mcp-agentgate-core": minor
"mcp-agentgate": minor
"mcp-agentgate-config-convert": minor
---

Kilo Code client coverage: discover project MCP configs (`.kilocode/mcp.json` + the newer `.kilo/mcp.json`) and the user-level VS Code globalStorage `mcp_settings.json`; classify `alwaysAllow`/`autoApprove` lists like Roo Code (AG-SK-002); scan Kilo project trees for poisoning — rules (`rules/`, `rules-<mode>/`, legacy `.kilocoderules`), workflows, custom modes (`.kilocodemodes`), and `system-prompt-<mode-slug>` overrides (AG-SK-001); `config convert` gains the `kilocode` client.
