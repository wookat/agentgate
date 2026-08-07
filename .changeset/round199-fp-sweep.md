---
'mcp-agentgate-core': patch
'mcp-agentgate': patch
---

Precision fixes from a flagship-repo false-positive sweep: AG-SS-001 reads surrounding comment lines (and guard/validate vocabulary) for the defensive downgrade; AG-SK-001 treats inline code spans (`...`) as quoted like fenced blocks; AG-RC-001 downgrades curl|sh matches on `#`-comment lines and ignores quoted-heredoc usage banners in shell scripts (a live match is still preferred over a commented one).
