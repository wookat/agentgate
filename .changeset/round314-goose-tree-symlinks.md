---
'mcp-agentgate-core': patch
'mcp-agentgate': patch
---

Scan the goose `.goose` project tree (skills, agents, recipes) and follow in-repo symlinks: symlinked skill files/dirs are now scanned (dir dedupe by realpath, cycle-safe; links escaping the repo are skipped). `allowed-tools` in `.goose/skills` is inert for goose and no longer reported as a grant.
