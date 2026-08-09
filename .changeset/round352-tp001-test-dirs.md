---
'mcp-agentgate-core': patch
---

AG-TP-001 precision: bidi/trojan characters in suffixed test directories (`browser-tests/`, `e2e_tests/`) and standalone fixture files (`fixtures.mjs`) now report low as likely defensive fixtures; non-test paths (including lookalikes such as `latest/`) stay high.
