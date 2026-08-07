---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

AG-SK-003 now classifies Claude Code plugin monitor commands: `monitors/monitors.json` (or `experimental.monitors` / top-level `monitors` inline in the plugin manifest) declares shell commands that run as persistent unsandboxed background processes for the whole session, at the same trust level as hooks. Benign watchers like `tail -F` stay clean.
