---
'mcp-agentgate-core': patch
'mcp-agentgate': patch
---

AG-SS-001 no longer reports high-severity SSRF for Kubernetes/Cilium network-policy manifests that reference the cloud metadata IP (these rules typically block egress to it); such hits are now low with a verify-the-rule hint.
