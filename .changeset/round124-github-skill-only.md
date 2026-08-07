---
'mcp-agentgate-core': patch
'mcp-agentgate': patch
---

Repo scanning no longer runs source-level rules over CI files under `.github/` (only `copilot-instructions.md` is read there) — fixes false-positive AG-RC-001 criticals on legitimate `curl | bash` install steps in GitHub workflows.
