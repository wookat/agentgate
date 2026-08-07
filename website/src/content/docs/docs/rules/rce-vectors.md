---
title: "AG-RC-001 · rce-vectors"
description: Shell-wrapped launches, curl|sh patterns, and arbitrary code-execution tools.
---

Detects remote-code-execution vectors in how servers are launched and what their tools can execute.

## What it checks

**Config** (static):

- Servers launched through a shell (`sh -c`, `cmd /c`, PowerShell) (`medium`) — inline shell strings are an injection-prone launch vector.
- Launch commands piping a remote download into an interpreter — the `curl … | sh` pattern (`critical`).

**Tool surface** (`--live`): tools that execute arbitrary commands/code. `high` with no documented sandboxing; `low` if the description claims a sandbox/isolated environment (verify the claim).

**Source scan**:

- `curl|sh` patterns in repo files: `critical` in files that are actually executed (shell scripts, Dockerfiles, CI YAML, `package.json`), `medium` elsewhere (usually documentation or prompt text — confirm it is never executed).
- Dynamic code-execution primitives — `eval(`, `new Function(`, `child_process`/`execSync` shell spawns (`medium`) — review how inputs reach them. Reported only in files that are part of an MCP server (referencing `modelcontextprotocol`, `FastMCP`, `McpServer`, …): that is where model-controlled input can reach them. Dynamic execution in ordinary application code is out of scope for this scanner.

## Skill dynamic context (AG-SK-003)

Agent skill files (`SKILL.md`) can embed dynamic-context commands — inline
`` !`command` `` placeholders and ```` ```! ```` fenced blocks — that run as
shell commands **the moment the skill loads**, before anyone reviews the
rendered prompt. Repo scans flag load-time commands that go beyond gathering
local context: piping a remote download into a shell (`critical`), sending
data to a remote host (`high`), and reading credential material (`~/.ssh`,
`.aws/credentials`, `.env`) into the prompt (`high`). Benign context commands
like `` !`git diff HEAD` `` are not flagged.

The same command analysis covers Claude Code hooks in `.claude/settings.json`
and `.claude/settings.local.json`: `type: "command"` hooks run automatically
on session events (SessionStart, PreToolUse, PostToolUse, …) for everyone who
opens the project. Local helper scripts and formatters are not flagged.

Kiro project hooks (`.kiro/hooks/*.json`) get the same treatment: command
actions run automatically on session events (SessionStart, PostFileSave,
PreToolUse, …) for everyone who opens the project, so remote-script pipes and
data-exfiltration commands report while local lint/setup commands and agent
prompt actions stay clean. Kiro agent hook files (`.kiro/hooks/*.kiro.hook`,
when/then schema) are covered too: `then.type: "runCommand"` actions execute
automatically on IDE events (file save, prompt submit, tool use) and get the
same classification; disabled hooks are not flagged. `askAgent` prompt
actions are checked for hidden Unicode and prompt-injection patterns
instead (AG-SK-001) — a poisoned prompt is injected automatically on the
same events.

Codex project hook files (`.codex/hooks.json`, and equivalent inline
`[hooks]` tables in `.codex/config.toml`) are checked the same way:
command hooks run on lifecycle events (SessionStart, PreToolUse,
UserPromptSubmit, …) for anyone who trusts the project's `.codex/` layer,
so remote-script pipes and data-exfiltration commands report while local
policy/lint scripts stay clean. Windows-only overrides
(`commandWindows`/`command_windows`) are classified too, and PowerShell
download-and-execute idioms (`irm … | iex`, `iex (irm …)`) report the
same as `curl | sh`. (Codex asks you to review and trust each
non-managed hook by hash before it runs — the finding still matters
because trust prompts are routinely accepted and can be bypassed with
`--dangerously-bypass-hook-trust`.)

Amazon Q CLI agent files (`.amazonq/cli-agents/*.json`) are covered too:
their `hooks` field runs commands at lifecycle trigger points (agentSpawn,
userPromptSubmit, preToolUse, postToolUse) with the same classification.

VS Code workspace tasks (`.vscode/tasks.json`) with `"runOn": "folderOpen"`
run automatically when the folder opens in a trusted workspace, so their
commands get the same classification too; ordinary run-on-demand tasks and
benign watch/build tasks stay clean.

Cursor project hooks (`.cursor/hooks.json`) are covered as well: their
`hooks` field runs command scripts around agent-loop stages (sessionStart,
beforeShellExecution, afterFileEdit, …) — including in Cursor cloud agents —
so the same dangerous-command classification applies while guard scripts
and local formatters stay clean.

Claude Code plugin hooks are covered too: a plugin ships hook config in
`hooks/hooks.json` (or inline in `.claude-plugin/plugin.json`), and those
commands run automatically on lifecycle events for everyone who installs
the plugin. `type: "command"` entries get the same classification;
manifests whose `hooks` field is just a config path and bundled formatter
scripts stay clean.

Plugin LSP servers get the same treatment: `.lsp.json` (or inline
`lspServers` in the manifest) declares commands that run automatically
after workspace trust whenever matching files are edited. The command plus
its args go through the shared classification, so an LSP entry wrapping a
remote-script pipe or credential read is flagged while real language
servers (`gopls serve`, `typescript-language-server --stdio`) stay clean.

## Why it matters

An exec-capable tool gives every upstream influence on your agent (poisoned descriptions, injected page content) a direct path to code execution on your machine. CVE-2025-6514 (mcp-remote) showed the launch path itself can be the RCE.

## Fixing findings

- Launch servers directly (binary + args array), not via `sh -c` one-liners.
- Never pipe remote scripts into interpreters — download, review, pin, then run.
- Prefer sandboxed/containerized exec tools, and gate them behind [`agentgate lock`](/docs/cli/lock/) so their surface can't silently grow.
