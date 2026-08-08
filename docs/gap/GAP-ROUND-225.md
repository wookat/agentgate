# GAP-ROUND-225 — New client: Crush (Charm)

Date: 2026-08-08
Round type: new client surface

## Surface (verified against official sources)

- README / config docs: https://github.com/charmbracelet/crush (README.md, docs/config/README.md)
- JSON schema: https://raw.githubusercontent.com/charmbracelet/crush/main/schema.json (`$schema: https://charm.land/crush.json`)

Verified facts:

- Config files: project `.crush.json` / `crush.json` and user-level `$XDG_CONFIG_HOME/crush/crush.json` (legacy JSON, deprecated but still supported; JSONC-tolerant). The successor `crushrc` is a **Bash-based DSL executed with shell privileges at startup** — see boundaries.
- `mcp` map: name → `{ type: "stdio"|"sse"|"http" (required), command, args, env, url, headers, disabled, disabled_tools, enabled_tools, timeout, oauth* }`.
- `hooks`: event → array of `{ name?, matcher?, command, timeout? }` — flat shape identical to Amazon Q agent hooks; commands run automatically on hook events.
- `permissions.allowed_tools`: array of tool names that skip the approval prompt for anyone opening the project.

## What was added

1. Discovery: `crush-json` format; user-level `~/.config/crush/crush.json` plus project `.crush.json`/`crush.json`. Servers from the `mcp` map are normalized (command/args/env/url/headers, `type` → transport) and run the full config rule set, advisory cross-checks (AG-SC-002/003), and lockfile pinning.
2. AG-SK-003: `hooks` event commands go through the shared risky-command classifier (reuses the Amazon Q flat-hook extractor).
3. AG-SK-002: `permissions.allowed_tools` pre-approvals — `bash` high (arbitrary shell), `edit`/`write` medium.
4. Docs client lists updated (README, npm README, homepage, quick-start, troubleshooting, FAQ, scan).

## Real-corpus evidence (fresh clones, 2026-08-08)

| Repo | File | Result |
| --- | --- | --- |
| charmbracelet/crush | `crush.json` (lsp-only) | 0 servers, 0 findings (correct negative) |
| SlopLabs/slopos | `crush.json` with `mcp.context7` | 1 server discovered; AG-SC-001 medium (`@upstash/context7-mcp@latest` unpinned) + low (`-y`) — end-to-end true positive |
| smucclaw/l4-ide | `crush.json` `allowed_tools` incl. `bash`, `edit` | AG-SK-002 high + medium true positives |
| jovandeginste/workout-tracker | `.crush.json` `allowed_tools` incl. `edit`, `write` | AG-SK-002 medium ×2 true positives |

Surface size: GitHub code search reports ~165 `crush.json` + ~114 `.crush.json` files.

Full checks green: 330/47/24 tests, lint, typecheck, `git diff --check`; self-scan 19 findings unchanged.

## Boundaries (honest)

- `crushrc` (project `.crushrc`/`crushrc`, user `$XDG_CONFIG_HOME/crush/crushrc`) is a Bash program executed before the UI appears. It is not parsed as structured config this round — a Bash DSL cannot be safely reduced to an MCP registry without executing it. It still receives normal source-file scanning when present in a repo. Candidate for a future round (e.g. flagging its mere presence, or pattern-scanning `mcp add`/`hook add` command lines).
- `allowed_tools` entries with scoping/colon syntax (e.g. `bash:execute`) or MCP tool names (`mcp_*`) are not classified — only exact `bash`/`edit`/`write`.
- `disabled: true` servers are still reported (consistent with other clients: a checked-in registry entry is one toggle away from running).
- Observed pre-existing boundary (not this round): AG-TP-001 low on U+200C in a Persian translation file (workout-tracker `translations/fa.yaml`) — ZWNJ is legitimate in Persian text; possible future precision candidate.
