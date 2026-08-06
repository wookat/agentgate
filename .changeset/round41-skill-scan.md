---
"mcp-agentgate-core": minor
"mcp-agentgate": minor
---

New rule AG-SK-001: repo scans now check agent skill files (`SKILL.md`, and markdown under `.agents/.claude/.cursor/.codex/.opencode` `skills/` trees) for hidden Unicode and prompt-injection patterns — skills are executed as agent instructions, so matches are critical.
