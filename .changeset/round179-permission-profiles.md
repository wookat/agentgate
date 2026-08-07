---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

AG-SK-002 now checks named `[permissions.<name>]` profile tables in Codex project config (`.codex/config.toml`): a filesystem `"write"` grant on `/`, `/**`, `~`, or `$HOME` reports high (the whole filesystem or home directory becomes writable for anyone who trusts the project), and `network.enabled = true` inside a profile reports medium (sandboxed egress). Scoped path grants, deny rules, and disabled networking stay clean.
