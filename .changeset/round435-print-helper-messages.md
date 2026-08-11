---
'mcp-agentgate-core': patch
'mcp-agentgate': patch
---

AG-RC-001: mask curl|sh text inside print/log-helper message strings in shell scripts (`info "curl … | sh"`, `…_warn_or_fail "uses curl|sh"`, multi-line `fail "…"` messages with command substitutions) — the helper displays its argument, it does not execute it. Findings now attribute to the first genuinely live pipeline; `run 'curl … | bash'` wrapper idioms and real pipelines stay critical.
