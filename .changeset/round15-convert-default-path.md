---
'mcp-agentgate': patch
---

`agentgate config convert` now auto-discovers the source client's config at its default location (project-level first, then user-level) when `--in` is omitted and stdin is a terminal; piped stdin still wins.
