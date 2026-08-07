---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

Skill/instruction scanning (and `lock --skills`) now covers root instruction files read verbatim by many agents: the agents.md standard (`AGENTS.md`/`AGENT.md`, nested files included), `CLAUDE.md`, `GEMINI.md`, Zed's `.rules`, and GitHub Copilot's `.github/copilot-instructions.md`.
