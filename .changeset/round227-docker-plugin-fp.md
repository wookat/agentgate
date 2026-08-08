---
"mcp-agentgate-core": patch
"mcp-agentgate": patch
---

AG-SC-001 docker check only fires on the `docker run` / `docker container run` forms — CLI plugin subcommands like `docker mcp gateway run` no longer misreport their last word as an unpinned image.
