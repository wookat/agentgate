---
"mcp-agentgate": patch
---

Scan output consistency (round 388): findings from discovered config files (an `.mcp.json` server launched through a shell, an unpinned server spec) now report their `file` posix-relative to the scan root like repo-walk findings do, instead of as an absolute path; configs outside the scan root (user-level client configs) keep their absolute path.
