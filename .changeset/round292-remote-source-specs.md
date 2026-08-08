---
"mcp-agentgate-core": patch
"mcp-agentgate": patch
---

AG-SC-001 classifies remote-source MCP server launch specs: git sources without a commit pin get git-specific advice (tags called out as movable), non-registry archive URLs (.tgz/.tar.gz/.zip) report high — the artifact behind the URL can be replaced in place with no version or provenance. Registry tarball hosts and commit-pinned specs are not flagged, and the low `-y` auto-confirm finding is only emitted alongside an unpinned spec.
