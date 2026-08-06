---
title: Rule reference
description: The AgentGate scan rules — what each detects, why it matters, and how to fix findings.
---

`agentgate scan` runs twelve rules across seven finding categories. Each rule can inspect up to four surfaces:

- **config** — MCP client config entries (static, always runs).
- **tool** — a single tool's name/description/input schema (`--live` or lockfile audit).
- **toolset** — a server's whole tool surface at once.
- **source** — files in a repo target (`agentgate scan path/to/repo`), including agent skill files (`SKILL.md`).

| Rule | Category | Detects |
|---|---|---|
| [AG-TP-001](/docs/rules/tool-poisoning/) | `tool-poisoning` | Hidden Unicode and prompt-injection patterns in tool descriptions |
| [AG-XS-001](/docs/rules/tool-poisoning/) | `tool-poisoning` | Cross-server tool-name shadowing and hijacking instructions |
| [AG-SK-001](/docs/rules/tool-poisoning/#agent-skill-files-ag-sk-001) | `tool-poisoning` | Hidden Unicode and prompt-injection patterns in agent skill files (`SKILL.md`) |
| [AG-CL-001](/docs/rules/credential-leak/) | `credential-leak` | Hardcoded secrets in configs; tools soliciting credentials |
| [AG-OP-001](/docs/rules/overprivileged/) | `overprivileged` | Dangerous capability combos; overly broad filesystem grants |
| [AG-TF-001](/docs/rules/overprivileged/) | `overprivileged` | Cross-server toxic flows (read + exfiltrate + untrusted input) |
| [AG-SK-002](/docs/rules/overprivileged/#agent-skill-grants-ag-sk-002) | `overprivileged` | Unscoped dangerous `allowed-tools` grants in skill frontmatter |
| [AG-AM-001](/docs/rules/auth-missing/) | `auth-missing` | Remote servers without auth or over plain HTTP |
| [AG-SS-001](/docs/rules/ssrf/) | `ssrf` | Cloud-metadata endpoints; unrestricted URL-fetching tools |
| [AG-RC-001](/docs/rules/rce-vectors/) | `rce-vectors` | Shell-wrapped launches, `curl\|sh`, arbitrary code-execution tools |
| [AG-SK-003](/docs/rules/rce-vectors/#skill-dynamic-context-ag-sk-003) | `rce-vectors` | Dangerous load-time dynamic-context commands in skill files |
| [AG-SC-001](/docs/rules/supply-chain/) | `supply-chain` | Unpinned `npx pkg@latest` launches, unpinned docker images |

Severities: `critical` > `high` > `medium` > `low` > `info`. Gate on them with `agentgate scan --fail-on <severity>` or [`agentgate ci`](/docs/cli/ci/).
