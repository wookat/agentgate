---
'mcp-agentgate': patch
---

Harden the OAuth token store: a corrupted or non-object `oauth.json` is treated as empty instead of crashing later on a bad shape, and rewriting the store re-tightens file permissions to `0600` even if they were loosened externally.
