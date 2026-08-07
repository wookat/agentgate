# GAP-ROUND-195 — Qwen Code client coverage

Date: 2026-08-08 · Round type: coverage (new client)

## Problem

Qwen Code (QwenLM/qwen-code, a Gemini CLI fork) configures MCP servers in
`~/.qwen/settings.json` and project `.qwen/settings.json` (official
settings reference verified) — neither was discovered, and its risky
project settings (`tools.approvalMode`, Claude-style `permissions.allow`
rules, `trust: true` MCP servers) were unmodeled. The `.qwen` dot-dir was
not even walked by the repo scanner.

## Change

- Discovery: `~/.qwen/settings.json` (user) + project `.qwen/settings.json`,
  new `qwen-code` client, standard `mcpServers-json` format — full config
  rule set + OSV/MCPA advisory checks.
- AG-SK-002 on project `.qwen/settings.json`:
  - `tools.approvalMode: "yolo"` high (every tool call auto-approved;
    docs warn it does not enable a sandbox), `"auto-edit"` medium;
  - unscoped `permissions.allow` grants via the shared Claude-style
    RISKY_GRANTS classifier (`Bash` high; `Write`/`Edit`, `WebFetch`
    medium); scoped `Bash(git *)` and `deny`/`ask` rules stay clean;
  - `trust: true` MCP servers medium (bypass tool-call confirmations).
- Scanner walks the `.qwen` dot-dir (AGENT_DOT_DIRS).

## Verification

Fixtures cover yolo/auto-edit, unscoped vs scoped grants, trusted vs
plain servers, and safe-config zero-findings. Real corpus:
QwenLM/qwen-code itself ships a `.qwen/` tree (agents, skills, specs, no
settings.json) — 0 findings, no FP. Skills under `.qwen/skills/` were
already scanned via the generic `SKILL.md` pattern.

## Boundaries

- `permissions.ask`/`deny` and legacy `tools.core`/`tools.allowed`
  (deprecated, auto-migrated) not modeled.
- System-level settings (`/etc/qwen-code/settings.json`) out of scope
  (not project-borne).
- `config convert` does not emit qwen-code (same format as gemini-cli).

## Evidence

- Full suite green: core 276, cli 47, config-convert 24.
- Self-scan 155 files: 18 findings (14 medium, 4 low), unchanged.
