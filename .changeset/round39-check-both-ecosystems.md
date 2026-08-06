---
"mcp-agentgate": minor
---

`agentgate advisory check` no longer requires `-e` for PyPI packages: when the ecosystem flag is omitted, both npm and PyPI are checked (each JSON match now carries its `ecosystem`; `package.ecosystem` is `null` when unset).
