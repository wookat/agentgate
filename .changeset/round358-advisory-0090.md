---
'mcp-agentgate-core': patch
---

Advisory MCPA-2026-0090 — alibabacloud-dataworks-mcp-server ReadResource SSRF (CVE-2026-19339): the MCP ReadResource handler fetches any caller-controlled uri starting with http and returns the body; vulnerable code verified still present in npm latest 1.0.45 (last_affected). 103 → 104.
