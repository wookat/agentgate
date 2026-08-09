---
'mcp-agentgate-core': patch
---

Precision fixes from fresh-corpus verification: AG-SS-001 recognizes private/blocked-range guard declarations (isPrivateIPv4/isBlockedIPv4) whose metadata-range comment sits outside the generic defensive window; AG-CL-001 skips sequential-run dummies with a truncated final run (sk-abcdef0123456789abcdef0123) and reports secret-shaped values under demo/ directories and in .postman_collection.json files quietly.
