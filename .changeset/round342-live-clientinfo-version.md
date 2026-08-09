---
'mcp-agentgate-core': patch
---

Live scans now advertise the real mcp-agentgate-core version in the MCP
initialize handshake (clientInfo) instead of the hardcoded 0.1.0 left over
from the first release.
