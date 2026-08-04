---
title: Rule reference
description: The seven AgentGate scan rules — what each detects, why it matters, and how to fix findings.
---

`agentgate scan` runs seven rules, one per finding category. Each rule can inspect up to four surfaces:

- **config** — MCP client config entries (static, always runs).
- **tool** — a single tool's name/description/input schema (`--live` or lockfile audit).
- **toolset** — a server's whole tool surface at once.
- **source** — files in a repo target (`agentgate scan path/to/repo`).

| Rule | Category | Detects |
|---|---|---|
| [AG-TP-001](/docs/rules/tool-poisoning/) | `tool-poisoning` | Hidden Unicode and prompt-injection patterns in tool descriptions |
| [AG-CL-001](/docs/rules/credential-leak/) | `credential-leak` | Hardcoded secrets in configs; tools soliciting credentials |
| [AG-OP-001](/docs/rules/overprivileged/) | `overprivileged` | Dangerous capability combos; overly broad filesystem grants |
| [AG-AM-001](/docs/rules/auth-missing/) | `auth-missing` | Remote servers without auth or over plain HTTP |
| [AG-SS-001](/docs/rules/ssrf/) | `ssrf` | Cloud-metadata endpoints; unrestricted URL-fetching tools |
| [AG-RC-001](/docs/rules/rce-vectors/) | `rce-vectors` | Shell-wrapped launches, `curl\|sh`, arbitrary code-execution tools |
| [AG-SC-001](/docs/rules/supply-chain/) | `supply-chain` | Unpinned `npx pkg@latest` launches, unpinned docker images |

Severities: `critical` > `high` > `medium` > `low` > `info`. Gate on them with `agentgate scan --fail-on <severity>` or [`agentgate ci`](/docs/cli/ci/).
