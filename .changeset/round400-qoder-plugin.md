---
'mcp-agentgate-core': patch
'mcp-agentgate': patch
---

Cover the Qoder plugin surface (`.qoder-plugin/`): plugin manifests (`plugin.json` hooks and bundled mcpServers), marketplace catalogs (`marketplace.json` mutable sources), manifest-gated component markdown, and the plugin root's `system-prompt.md` extension context — Qwen Code v0.21.9 installs Qoder plugins natively, so these files now run for Qwen users too.
