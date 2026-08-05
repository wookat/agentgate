---
'mcp-agentgate-core': patch
---

AG-SC-001 pin advice now uses the runner's syntax: `pkg==1.2.3` for uvx/pipx (PyPI), `pkg@1.2.3` for npx/pnpx/bunx — instead of always suggesting npm-style `@1.2.3` (which produced nonsense like `pkg==1.0@1.2.3`).
