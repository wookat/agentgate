---
'mcp-agentgate-core': patch
---

AG-RC-001/AG-SK-001 precision: mask data heredocs (usage banners) while keeping rendered-script heredocs live, exclude `| node -e`/`| python -c` inline-program pipes (stdin is data), grade yaml/toml curl|sh fixtures under test paths low, and treat `<tag>` usage metavariables after a command word as template notation.
