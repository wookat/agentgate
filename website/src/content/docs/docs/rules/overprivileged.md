---
title: "AG-OP-001 · overprivileged"
description: Dangerous capability combinations and overly broad filesystem grants.
---

Detects servers whose combined tool surface enables exfiltration-class behavior, and filesystem servers granted far more than they need.

## What it checks

**Config** (static):

- Filesystem servers rooted at `/`, `/home`, `/Users`, `~`, or `C:\` (`high`) — the agent can read everything you own.
- Permission-bypass launch flags such as `--dangerously-skip-permissions` / `--yolo` (`high`).
- Skill-declared servers ([Amp convention](/docs/guides/skills/)) without an `includeTools` allowlist (`low`) — the skill exposes the server's full tool surface instead of the tools it needs.
- Under `--live`, `includeTools` entries that match none of the server's actual tools (`low`) — stale or typoed allowlist entries scope nothing.

**Toolset** (`--live`): tool names/descriptions/schemas are classified into capabilities (`read-files`, `write-files`, `exec`, `network`, `send-messages`). Dangerous combinations on one server are flagged at `medium`:

| Combination | Risk |
|---|---|
| read-files + network | read local files and exfiltrate them over the network |
| read-files + send-messages | read local files and exfiltrate them via messages/email |
| exec + network | download-and-run |

**Configuration** (`--live`, `AG-TF-001`): the agent sees every configured server's tools in one namespace, so the same analysis runs *across* servers. A tool that reads private data (files, notes, email, repos) on one server plus a tool that sends data out (email, Slack, webhooks) on another is an exfiltration flow (`medium`); if a third tool ingests untrusted external content (web pages, issues, feeds) the toxic flow is complete — poisoned content can drive the other two — and severity is `high`.

## Agent skill grants (AG-SK-002)

Repo scans also check agent skill files (`SKILL.md`) and slash-command /
agent markdown (under `skills/`, `commands/`, or `agents/` of `.claude`-style
config trees and Claude Code plugins) for frontmatter that pre-approves
dangerous tool access via `allowed-tools` (inline, YAML list, or flow-list
form). An unscoped `Bash`
grant lets the skill run any shell command without a permission prompt
(`high`); unscoped `Write`/`Edit` (`medium`) and `WebFetch`/`WebSearch`
(`medium`, an exfiltration channel) are also flagged. Scoped grants such as
`Bash(git add *)` and read-only tools are fine.

The same analysis covers Claude Code settings files (`.claude/settings.json`
and `.claude/settings.local.json`): entries in `permissions.allow` such as a
bare `Bash` or unscoped `WebFetch` pre-approve those tools for everyone who
opens the project, `permissions.defaultMode: "bypassPermissions"`
(`high`) disables permission prompts entirely, and
`enableAllProjectMcpServers: true` (`medium`) auto-approves every MCP
server defined in project `.mcp.json` files.

OpenCode project configs (`opencode.json` / `opencode.jsonc`) are checked
too: a catch-all `"permission": "allow"` (or `"*": "allow"`) is `high`, and
per-tool `bash` (`high`) / `edit` / `write` / `webfetch` (`medium`) rules
whose effective action is `"allow"` are flagged. Granular rules such as
`"git *": "allow"` under an `"ask"` catch-all are fine.

Gemini CLI project settings (`.gemini/settings.json`) get the same
treatment: a bare `run_shell_command` (`high`), `write_file`/`replace`, or
`web_fetch`/`google_web_search` (`medium`) in `tools.allowed` bypasses the
confirmation dialog, and `general.defaultApprovalMode: "auto_edit"`
(`medium`) auto-approves edit tools, as does `trust: true` on an
`mcpServers` entry (`medium` — all that server's tool calls bypass
confirmation). Scoped grants such as `run_shell_command(git)` are fine.

Roo Code project MCP configs (`.roo/mcp.json`) are checked as well: a
wildcard `"*"` in a server's `alwaysAllow`/`autoApprove` list is `high`,
and auto-approved tools with destructive-looking names (`execute_sql`,
`apply_migration`, shell/write/delete-style tools) are `medium`.
Auto-approving clearly read-only tools is not flagged.

VS Code workspace settings (`.vscode/settings.json`) are checked for
`chat.tools.global.autoApprove: true` (or the legacy
`chat.tools.autoApprove`) — `high`, since it bypasses every chat tool
approval, including terminal commands and file edits, for anyone opening
the project. The `chat.tools.terminal.autoApprove` map is checked too: a
catch-all regex rule (`"/.*/": true`) is `high`, and approving a command
from VS Code's own default-deny list (`rm`, `curl`, `chmod`, shells,
`sudo`, ...) is `medium`. Approving scoped safe commands (`git status`,
`npm test`) is fine. The `chat.tools.edits.autoApprove` glob map is
checked as well: a catch-all (`"**/*": true`) with no re-denied
sensitive paths, or `true` on a sensitive path (`.env`, `.vscode`,
`.github`, keys/secrets), is `medium` — the agent can rewrite its own
guardrails or secrets without approval. The documented safe pattern
(catch-all plus `false` re-denies for sensitive files) is fine.
`task.allowAutomaticTasks: "on"` is `medium`: it removes the one prompt
standing between a checked-in `"runOn": "folderOpen"` task and automatic
execution in a trusted workspace (the task commands themselves are
classified under [RCE vectors](/docs/rules/rce-vectors/)).

Zed project settings (`.zed/settings.json`) are checked for the legacy
`agent.always_allow_tool_actions: true` (`high`) and the newer
`agent.tool_permissions`: a global `default: "allow"` is `high`, a
per-tool `default: "allow"` is `high` for `terminal` and `medium` for
file-write/delete/fetch tools. MCP tool keys (`mcp:<server>:<tool>`)
defaulted to `"allow"` are `medium` when the tool name looks
destructive (exec/sql/write/delete/deploy, …); read-only-named MCP
allows are not flagged — rug-pull risk is covered by the tool-surface
lockfile. `always_allow` pattern rules with a `confirm` default are
fine.

Cursor CLI project permission configs (`.cursor/cli.json`) are checked
for risky `permissions.allow` tokens: `Shell(*)` and `Mcp(*:*)` are
`high`; a catch-all `Write(**)`, `WebFetch(*)`, and whole-server
`Mcp(server:*)` are `medium`. `Read`/`Write` allows on secret-shaped
paths (`.env`, `.pem`, `.key`, `.p12`/`.pfx`, secrets, credentials,
`id_rsa`) are also `medium` — pre-approved credential access. Scoped
tokens (`Shell(git)`, `Write(src/**)`, other `Read(...)`) are not
flagged, and a matching entry in `permissions.deny` suppresses the
allow (deny takes precedence).

Kiro project custom agents (`.kiro/agents/*.json` and `*.md` with YAML
frontmatter) are checked for embedded `permissions.rules`: a catch-all
`allow` (no `match`, or a `*` pattern) is `high` for the `shell`
capability and the `all`/`builtin` meta-capabilities, and `medium` for
`filesystem`/`fs_write`, `mcp`, and `web_fetch`. Scoped matches
(`git *`, `src/**`) and `fs_read` are not flagged, and a catch-all
`deny` for the same capability suppresses the allow (deny always
wins).

Amazon Q CLI project agent files (`.amazonq/cli-agents/*.json`) are
checked for `allowedTools` pre-approvals: a catch-all (`"*"`) is `high`,
unscoped `execute_bash`/`use_aws` are `high`, unscoped `fs_write` is
`medium`, and a whole-MCP-server allow (`"@server"` / `"@server/*"`) is
`medium`. Glob entries (`fs_*`, `*_bash`) are expanded against the
built-in tool names, so a wildcard that matches `execute_bash`,
`use_aws`, or `fs_write` is flagged like the exact name. Tools scoped
by a matching `toolsSettings` allowlist (`allowedCommands`,
`allowedServices`, `allowedPaths`) are not flagged.

Codex project-scoped config overrides (`.codex/config.toml`, loaded for
anyone who trusts the project) are checked for sandbox/approval
opt-outs: `sandbox_mode = "danger-full-access"` (no filesystem or
network sandbox) and `default_permissions = ":danger-full-access"`
(full-access permission profile) are `high`; `approval_policy = "never"` (no approval
prompts) and `sandbox_workspace_write.network_access = true` (egress
inside the workspace-write sandbox) are `medium`. `read-only` /
`workspace-write` modes and interactive approval policies are not
flagged. Named `[permissions.<name>]` profile tables are checked too: a
filesystem grant of `"write"` on `/`, `/**`, `~`, or `$HOME` (the whole
filesystem or home directory becomes writable) is `high`, and
`network.enabled = true` inside a profile (sandboxed egress) is
`medium`; scoped path grants, deny rules, and disabled networking are
not flagged.

## Why it matters

Individually harmless tools compose into an exfiltration pipeline the moment a poisoned description (see [AG-TP-001](/docs/rules/tool-poisoning/)) chains them. Least privilege at the server level is the mitigation that still works when prompt-level defenses fail.

## Fixing findings

- Scope filesystem servers to the specific project directories the agent needs.
- Split multi-purpose servers, or disable tools you don't use.
- Never launch agent tooling with permission-bypass flags in shared configs.
