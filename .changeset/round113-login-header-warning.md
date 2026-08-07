---
'mcp-agentgate': patch
---

`agentgate auth login <server-name>` now warns when the server config has static `headers` configured, since those take precedence over cached OAuth tokens during live scans.
