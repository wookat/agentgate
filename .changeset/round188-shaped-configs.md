---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

AG-SK-003 now shape-detects hook- and monitor-config JSON at non-conventional paths: plugin manifests can point `hooks` / `experimental.monitors` at arbitrary relative files, so any JSON whose structure matches the hook schema (nested `type: "command"` entries) or monitor schema (array of `{ name, command, description }`) gets its commands run through the shared dangerous-command classifier. Benign configs carry no risky patterns and stay clean.
