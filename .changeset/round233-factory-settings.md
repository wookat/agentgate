---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

AG-SK-002 checks Factory Droid settings (`.factory/settings.json` and `settings.local.json`): dangerous `commandAllowlist` entries (shells, rm, curl, privilege escalation run without confirmation), high default autonomy (`sessionDefaultSettings.autonomyLevel: high` or legacy `autonomyMode: auto-high`), and `enableDroidShield: false` (disables secret scanning and git guardrails). The AG-SK-003 hook check also covers a `hooks` key in `settings.local.json`.
