---
'mcp-agentgate-core': patch
---

AG-CL-001 precision: AWS documentation example credentials (values ending in the reserved literal `EXAMPLE`/`EXAMPLEKEY`, e.g. `AKIAIOSFODNN7EXAMPLE`) are treated as placeholders, and secret-scanner configs (`.gitleaks.toml`, `.secrets.baseline`) that quote secret-shaped patterns as scan rules are skipped. Real-shaped keys keep reporting high.
