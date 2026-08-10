---
'mcp-agentgate-core': patch
'mcp-agentgate': patch
---

AG-SS-001 defensive-context recognition covers two more real shapes: noun-first module headers ("SSRF Protection page — … IP blocking") and lowercase camelCase block identifiers (`blockCases`, `blockList` variants). Defensive SSRF-guard pages and blocklist test harnesses that reference the metadata IP now grade low instead of high; exploitation scripts with no defensive wording keep grading high.
