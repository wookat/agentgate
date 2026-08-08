---
"mcp-agentgate-core": patch
"mcp-agentgate": patch
---

`agentgate deps` extends the lockfile-resolved AG-DP-007 check to `pnpm-lock.yaml` (v5/v6/v9): remote tarball and git-URL resolutions undeclared in any manifest are flagged like other remote sources. cnpm-style mirror tarball paths (`/name/download/[@scope/]name-version.tgz`) are recognized as version-addressed registry artifacts and stay silent, alongside the standard `/-/` form.
