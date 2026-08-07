---
'mcp-agentgate-core': patch
'mcp-agentgate': patch
---

Two real-corpus false-positive fixes: AG-CL-001's PEM pattern now requires key material after the header, so detector code quoting `-----BEGIN ... PRIVATE KEY-----` (e.g. VS Code's SSH key parser) no longer reports; AG-SK-001's exfiltration pattern no longer spans lines, so adjacent benign bullet points (e.g. "read the PR description" / "key files") no longer combine into a critical.
