---
'mcp-agentgate': minor
---

New `agentgate auth login|status|logout` commands: log in to a remote (`url`) MCP server via its OAuth 2.1 flow (metadata discovery, dynamic client registration or `--client-id`, PKCE, loopback browser callback). Tokens are stored per server origin in the agentgate config dir (`0600`), never in the project tree. Live scans do not consume these tokens yet — that lands in the next round; CI remains strictly non-interactive.
