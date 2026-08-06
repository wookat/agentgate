---
'mcp-agentgate-core': patch
'mcp-agentgate': patch
---

AG-SK-001 prompt-injection matches that sit inside a fenced code block are now reported at `low` severity instead of `critical` — guardrail/security skills legitimately quote jailbreak strings as example data (both real-world false positives found in a 133-skill marketplace sweep were this case). Hidden-Unicode detection is unchanged and stays `critical` everywhere.
