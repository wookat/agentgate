---
'mcp-agentgate-core': patch
'mcp-agentgate': patch
---

Bundle advisories MCPA-2026-0028..0034: mcp-atlassian batch (unauthenticated SSRF via X-Atlassian-*-Url headers CVE-2026-27826, DNS-rebinding TOCTOU bypass of that fix, two arbitrary server-side file reads via attachment-upload file_path — all fixed in 0.22.0) and MCP Python SDK batch (cross-session task access CVE-2026-52870, HTTP session requests served without principal verification CVE-2026-52869 — fixed 1.27.2; WebSocket transport missing Host/Origin validation CVE-2026-59950 — fixed 1.28.1).
