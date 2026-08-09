---
'mcp-agentgate-core': patch
'mcp-agentgate': patch
---

Codex inline hooks-file forms are now visible to AG-SK-003: marketplace entries and plugin manifests carrying `hooks` as a single inline hooks-file object (`{ description?, hooks: { Event: [...] } }`) or a list of them are unwrapped before command classification. Discovery also follows path-form `mcpServers` on local-source marketplace entries (Codex fallback-manifest semantics), resolving refs inside the entry's source root so pin/advisory checks reach the referenced servers.
