---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

Live scans of remote (`url`) MCP servers now transparently use OAuth tokens cached by `agentgate auth login`. Precedence: configured static `headers` → cached OAuth tokens → anonymous. 401/403 hints now point at `agentgate auth login <name>` (and distinguish rejected cached tokens from missing credentials). CI stays non-interactive — a browser flow is never started during scans.
