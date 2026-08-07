---
'mcp-agentgate-core': patch
'mcp-agentgate': patch
---

AG-AM-001 resolves shell parameter-expansion defaults (`${VAR:-default}`) in remote server URLs before analysis: when the variable is unset the default is the effective endpoint, so those servers now get real HTTPS/auth checks instead of an "unparseable URL" low finding.
