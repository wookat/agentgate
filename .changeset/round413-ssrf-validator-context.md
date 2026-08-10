---
'mcp-agentgate-core': patch
'mcp-agentgate': patch
---

AG-SS-001 defensive-context recognition covers two more real shapes: URL-validator modules (validator/validate identifiers or allowlist wording near the metadata-IP literal) and underscore-bounded SSRF identifiers (`SSRF_CORPUS` adversarial-check tables, plus "must never" wording). Defensive allowlist validators and SSRF test corpora that list the metadata IP now grade low instead of high; exploitation scripts with no defensive wording keep grading high.
