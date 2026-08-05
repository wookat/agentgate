---
'mcp-agentgate': patch
'mcp-agentgate-core': patch
---

Repo scans report dynamic code-execution primitives (`eval(`, `new Function(`, child_process spawns) only in files that are part of an MCP server — that is where model-controlled input can reach them; flagging every one in ordinary application code buried the findings that matter (microsoft/vscode: 67 → 5 medium RCE findings, with a real catch surviving).
