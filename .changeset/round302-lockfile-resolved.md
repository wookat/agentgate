---
"mcp-agentgate-core": patch
"mcp-agentgate": patch
---

`agentgate deps` extends AG-DP-007 to lockfile-resolved remote sources: `package-lock.json` and `yarn.lock` entries whose `resolved` field points at a git remote or branch tarball (including `codeload.github.com` ref tarballs) are flagged when no manifest declares that remote source — the lockfile-poisoning shape. Commit-pinned refs, default registry hosts, and version-addressed registry-path tarballs on mirror/private registries stay silent.
