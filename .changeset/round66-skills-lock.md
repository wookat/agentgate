---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

Lockfile v2: `agentgate lock --skills [dir]` additionally pins every agent skill/instruction file's SHA-256 (same file set skill scanning covers), and `agentgate diff` / `agentgate ci` fail with `skill-added` / `skill-removed` / `skill-changed` drift entries when pinned files change. Lockfiles without `--skills` keep being written as version 1; readers accept both versions.
