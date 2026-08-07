---
'mcp-agentgate': patch
---

`scan --live`, `lock`, `diff`, and `ci` now connect to servers with a concurrency of 4 instead of strictly one at a time. Measured on 6 stdio servers with 500 ms startup each: `lock` 4.2 s → 1.6 s. Lockfile output is byte-identical (ordering preserved); per-server errors are still reported individually.
