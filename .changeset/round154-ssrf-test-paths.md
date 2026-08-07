---
'mcp-agentgate-core': patch
'mcp-agentgate': patch
---

AG-SS-001 reports metadata-endpoint references in test/fixture paths (`tests/`, `__tests__/`, `*.test.*`, `*.spec.*`, `examples/`, `fixtures/`, `mocks/`) as low instead of high — they are usually fixtures for the SSRF protection under test, mirroring how AG-CL-001 treats secret-shaped strings in test trees.
