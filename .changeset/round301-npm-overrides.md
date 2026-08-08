---
"mcp-agentgate-core": patch
"mcp-agentgate": patch
---

`agentgate deps` extends AG-DP-007 to npm override tables: `overrides` (including nested forms), `resolutions`, and `pnpm.overrides` entries that redirect a package to a git or URL source are now classified like other remote specifiers (unpinned git ref medium, non-registry archive URL high; full-SHA pins and registry tarball hosts exempt).
