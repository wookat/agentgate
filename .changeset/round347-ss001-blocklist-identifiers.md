---
'mcp-agentgate-core': patch
---

AG-SS-001 precision: metadata-endpoint hits inside blocklist data structures (identifiers like `BLOCKED_METADATA_HOSTS`, `_BLOCKED_SAFE_MODE_NETWORKS`, denylist/blacklist markers, matched at underscore boundaries and up to seven lines above the IP literal) now report low as defensive context. Offensive payload lists (e.g. `SSRF_PAYLOADS`) and code that actually fetches the metadata endpoint stay high.
