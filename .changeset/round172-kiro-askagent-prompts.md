---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

AG-SK-001 checks Kiro agent hook askAgent prompts (`.kiro/hooks/*.kiro.hook`): the prompt text is injected automatically on IDE events (file save, prompt submit, tool use), so hidden Unicode characters and prompt-injection patterns (instruction override, concealment, exfiltration instructions) report critical. Disabled hooks and benign guard/review prompts are not flagged.
