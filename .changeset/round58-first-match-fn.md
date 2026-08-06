---
'mcp-agentgate-core': patch
'mcp-agentgate': patch
---

AG-SK-001 no longer lets an early fenced-code example mask a real prompt injection later in the same skill file: all matches per pattern are inspected and one outside fenced code (`critical`) wins over a quoted example (`low`).
