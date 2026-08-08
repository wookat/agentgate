---
"mcp-agentgate-core": patch
"mcp-agentgate": patch
---

`agentgate deps` flags dependencies installed from mutable remote sources (AG-DP-007): a git specifier without a full commit pin is medium, a non-registry archive URL is high; commit-pinned specs and registry tarball hosts are exempt. Works in `--offline` mode too.
