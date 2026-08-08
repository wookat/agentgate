---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

Plugin LSP coverage extends to the Open Plugin Spec: `lsp-config/servers.json` files (Copilot CLI convention) are classified like `.lsp.json`, and the LSP command extractor now also reads the cross-platform `bash`/`powershell` launch-script keys — a dangerous command can hide in either platform's variant.
