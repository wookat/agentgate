---
'mcp-agentgate-core': patch
---

PyPI servers launched with PEP 508 range specs (`uvx pkg>=1.0`, `~=`, extras like `pkg[extra]`) now have their bare package name extracted for advisory matching — previously the range operator stayed in the name and MCPA/OSV advisories could never match. `uvx gemini-bridge>=1.0` now reports the MCPA-2026-0007 advisory with pin advice in addition to the unpinned warning.
