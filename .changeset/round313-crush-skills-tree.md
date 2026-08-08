---
"mcp-agentgate-core": patch
"mcp-agentgate": patch
---

Repo scans now walk the Crush `.crush/skills` project tree (one of Crush's four upstream project-skill conventions; the other three were already covered), so poisoned Crush skill files are scanned by AG-SK-001 and pinned by `lock --skills`. `allowed-tools:` frontmatter under `.crush/skills` is treated as inert (Crush's skill parser ignores it), so no AG-SK-002 noise is added.
