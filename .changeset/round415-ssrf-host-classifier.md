---
'mcp-agentgate-core': patch
'mcp-agentgate': patch
---

AG-SS-001 defensive-context recognition covers boolean host-classifier predicates: when the metadata literal sits on an equality-comparison line (`host === "metadata.google.internal"`, or a `return false; // … cloud metadata` branch comment) with a boolean return in the near window and no fetch call on that line, the finding grades low. Code that dials the endpoint (urllib/requests/curl) keeps grading high.
