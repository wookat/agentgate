---
'mcp-agentgate-core': patch
'mcp-agentgate': patch
---

SARIF artifact URIs are now always valid relative references: when a scanned
target lies outside the working directory, URIs are relativized against the
scan target (scan) or checked directory (deps) as a fallback, and any file
matching no base is emitted as a `file://` URI instead of a slash-leading
relative reference (SARIF1004).
