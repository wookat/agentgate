---
'mcp-agentgate-core': patch
'mcp-agentgate': patch
---

Goose recipe precision: injection patterns quoted in code spans/fenced blocks/quotes inside recipe instructions now report low (quoted example) instead of critical, and a curl|sh string in recipe prose is no longer escalated as an executable launch vector (recipe-shaped YAML/JSON is prompt text; the medium text warning remains).
