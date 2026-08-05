---
'mcp-agentgate-core': patch
'mcp-agentgate': patch
---

Advisory DB: add MCPA-2026-0007 (gemini-bridge arbitrary file read, CVE-2026-54785) and MCPA-2026-0008 (flyto-core arbitrary file write, CVE-2026-67429). Fix: PyPI servers pinned with PEP 508 `==` (e.g. `uvx pkg==1.2.0`) are now parsed as pinned name+version, so advisory matching and AG-SC-001 pin advice work for uvx/pipx launches.
