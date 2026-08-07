---
'mcp-agentgate-core': patch
'mcp-agentgate': patch
---

AG-SS-001 downgrades cloud-metadata-endpoint references on blocking/defensive lines (block/reject/deny/SSRF vocabulary on the matching line) from high to low — security-guidance prompts and SSRF-guard code reference the endpoint to forbid it, not to fetch it. Plain references in non-test paths still report high.
