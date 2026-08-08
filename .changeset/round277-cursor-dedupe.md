---
"mcp-agentgate-core": patch
"mcp-agentgate": patch
---

Stop double-reporting curl|sh in Cursor hook/environment configs: `.cursor/hooks.json` and `.cursor/environment.json` are named AG-SK-003 surfaces whose command strings run through the risky-command classifier, so the generic AG-RC-001 "text contains a curl|sh pattern" warning on the same file only duplicated the more accurate finding. Wild corpus (296 real environment.json files): every flagged repo previously produced an identical medium duplicate next to the critical.
