---
"mcp-agentgate-core": minor
"mcp-agentgate": minor
---

Crush `crushrc` coverage: repo scans now include `crushrc`/`.crushrc` files (a Bash program Crush executes with shell privileges at startup) — source rules apply with executable-file severity (a piped remote download is critical, AG-RC-001), and risky `permissions allow` command lines (`bash` high, `edit`/`write` medium) are flagged (AG-SK-002).
