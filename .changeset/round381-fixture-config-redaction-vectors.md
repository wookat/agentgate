---
'mcp-agentgate-core': patch
'mcp-agentgate': patch
---

AG-CL-001 precision: server configs in test/fixture trees report their hardcoded fake credentials as low with fixture wording; hyphen/underscore-delimited `test`/`selfcheck` filename tokens (integration-test-*.mjs, selfcheck-*.mjs) count as test paths; redaction test vectors (a `[REDACTED` mask on the same line, or redact-named utility files) grade low. Non-fixture configs and opaque secrets keep their original severities.
