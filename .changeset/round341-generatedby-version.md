---
'mcp-agentgate': patch
'mcp-agentgate-core': patch
---

Lockfiles written by `lock` now record the real CLI version in `generatedBy`
(e.g. `mcp-agentgate@0.67.12`) instead of the hardcoded `mcp-agentgate@0.1.0`
left over from the first release. `generatedBy` is informational and not part
of drift comparison, so existing lockfiles keep verifying unchanged.
