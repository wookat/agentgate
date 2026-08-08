---
'mcp-agentgate-core': patch
'mcp-agentgate': patch
---

Precision fixes from a real-corpus false-positive sweep: AG-RC-001 masks echo/printf string literals in shell scripts (help text quoting a curl|sh one-liner no longer reports; `$(…)` command substitutions stay live); AG-SS-001 reads one more surrounding line so a blocklist header comment above a metadata-IP entry is seen; AG-CL-001 treats underscore-delimited placeholder words (`sk-YOUR_OPENAI_KEY_HERE`) as placeholders; AG-TP-001 reports Trojan-Source bidi characters in test/fixture paths quietly (defensive fixtures).
