---
'mcp-agentgate-core': patch
'mcp-agentgate': patch
---

AG-SK-002 expands Amazon Q `allowedTools` glob entries (`fs_*`, `*_bash`, `fs_?ead`) against the built-in tool names, so wildcards matching `execute_bash`, `use_aws`, or `fs_write` are flagged like the exact names instead of escaping the check.
