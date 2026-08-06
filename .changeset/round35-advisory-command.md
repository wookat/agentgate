---
"mcp-agentgate": minor
"mcp-agentgate-core": minor
---

New `agentgate advisory` subcommand: `advisory check <pkg>[@version]` queries the MCPA advisory database for a single package (exit 1 on a match, usable as a pre-install gate) and `advisory list` prints the whole database — live API with bundled offline fallback, `--json` for scripting. The bundled advisory subset now carries the `published` date.
