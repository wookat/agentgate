---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

Cover the Open Plugin Spec's first lookup location — a bare `plugin.json` at the plugin root (repo root or a marketplace's `plugins/<name>/`): its `mcpServers` (inline or path-referenced) are discovered and advisory-checked, and inline flat-event Copilot hooks are classified via the existing shape detection. `plugin.json` files from unrelated ecosystems (Grafana, Obsidian) carry neither shape and stay quiet.
