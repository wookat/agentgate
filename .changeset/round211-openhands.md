---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

OpenHands repository customization: `.openhands/skills/**.md` and the legacy `.openhands/microagents/**.md` (auto-loaded as agent context, always or on keyword triggers) get AG-SK-001 injection/hidden-Unicode skill scanning, and the `.openhands` tree is now walked so `.openhands/setup.sh` (runs automatically at session start) is covered by the source-scan rules (AG-RC-001 et al.).
