---
'mcp-agentgate-core': patch
'mcp-agentgate': patch
---

Deterministic repo walk: directory entries are sorted, so scan/lock file ordering — and which alias path a realpath-deduped symlink tree is reported under — is stable across filesystems and platforms.
