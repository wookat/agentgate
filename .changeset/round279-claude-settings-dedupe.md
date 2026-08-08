---
"mcp-agentgate-core": patch
"mcp-agentgate": patch
---

Extend the round-277 duplicate suppression to Claude Code settings: `.claude/settings.json` / `settings.local.json` hook and command keys are named AG-SK-003 surfaces, so the generic AG-RC-001 curl|sh text warning there only duplicated the dedicated finding (observed in the wild: a settings hook installing deno via `curl | sh` reported twice).
