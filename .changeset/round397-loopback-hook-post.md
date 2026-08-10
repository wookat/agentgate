---
'mcp-agentgate-core': patch
'mcp-agentgate': patch
---

AG-SK-003 precision: hook commands that POST data only to a loopback address (`127.0.0.1`, `localhost`, `[::1]`) are no longer classified as sending data to a remote host — a local notifier daemon receives nothing off the machine. Commands with any remote URL, a mixed loopback+remote pair, or no URL literal (variable host) keep their previous high grade.
