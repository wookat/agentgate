---
'mcp-agentgate-core': patch
---

AG-SK-001 hidden-unicode grading: a stray zero-width space/BOM at a word boundary in a skill file — a copy-paste artifact from web content — now reports low instead of critical. Bidi overrides/isolates, Unicode tag characters, and zero-width characters wedged inside a word (keyword-splitting evasion) stay critical.
