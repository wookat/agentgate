---
'mcp-agentgate-core': patch
---

AG-SK-001 exfiltration-instruction precision: generic sensitive words (key/token/secret) only match with credential context — a qualifier ("ssh keys", "your token", "api key") or a file target ("token file") — so ordinary documentation language ("Keyspaces", "condition key", "key tradeoffs", "thousands of tokens", "this token injection") no longer reports critical findings.
