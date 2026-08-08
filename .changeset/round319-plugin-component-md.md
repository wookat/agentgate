---
'mcp-agentgate-core': patch
'mcp-agentgate': patch
---

Skill-scan standalone plugin repositories' component markdown: `commands/*.md`, `agents/*.md`, and `skills/*.md` under a directory carrying a plugin manifest (`.claude-plugin/`, `.plugin/`, `.factory-plugin/`, `.codex-plugin/`, `.cursor-plugin/`, `.goose-plugin/`) are now scanned for poisoning and pinnable via `lock --skills`. Gated on the manifest so generic `commands/`/`agents/` doc trees are unaffected.
