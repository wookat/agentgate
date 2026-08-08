---
"mcp-agentgate-core": patch
"mcp-agentgate": patch
---

`agentgate deps` strips nested peer suffixes from pnpm-lock snapshot keys, so commit-pinned tarball resolutions are exempted correctly instead of reporting a false AG-DP-007 medium.
