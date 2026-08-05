---
'mcp-agentgate': minor
'mcp-agentgate-core': minor
---

Cross-server analysis: `scan --live` now analyzes every inspected server's tool surface together.

- `AG-TF-001` toxic flows: tools that read private data + tools that send data out across different servers = exfiltration flow (medium); plus a tool ingesting untrusted external content = complete toxic flow (high)
- `AG-XS-001` shadowing/hijack: duplicate tool names across servers (high); a tool instructing the agent about another server's tool (critical)
- new core API `scanConfiguration(surfaces)` and rule hook `checkConfiguration`
- fixed: the `$schema` meta-URL in zod-generated input schemas no longer gives every tool a network capability; sibilant third-person verbs ("Fetches", "Searches") now match capability patterns
