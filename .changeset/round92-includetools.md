---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

Parse the `includeTools` allowlist on skill-declared MCP servers (Amp convention) and report a low AG-OP-001 finding when a skill-declared server omits it, since the skill then exposes the server's full tool surface.
