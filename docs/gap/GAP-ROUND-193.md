# GAP-ROUND-193 — Gemini CLI extensions + hooks

Date: 2026-08-08 · Round type: coverage (new surface)

## Problem

Gemini CLI extensions (official docs: extensions package prompts, MCP
servers, custom commands, hooks, and skills; installed via
`gemini extensions install <github-url>`) declare `mcpServers` in
`gemini-extension.json` — those servers start automatically for anyone
with the extension installed, but the manifest was not discovered.
Gemini CLI also runs `hooks` from `.gemini/settings.json` on agent-loop
events (SessionStart, BeforeTool, BeforeModel, …), same nested schema as
Claude Code settings hooks, but only got the generic shape-detection
fallback message.

## Change

- Discovery: `gemini-extension.json` at the project root (extension
  development repos) and every `~/.gemini/extensions/<name>/` manifest
  (installed extensions) — top-level `mcpServers` map, standard format,
  full config rule set + advisory checks.
- AG-SK-003: `.gemini/settings.json` `hooks` is now a named surface with
  an accurate Gemini CLI message via the shared `extractHookCommands` +
  dangerous-command classifier.

## Verification

Real corpus (official gemini-cli-extensions org): `workspace` and
`security` (local node commands) correctly clean; `observability`
true positive — unpinned `npx -y @google-cloud/observability-mcp`
(AG-SC-001 medium + low). Fixture tests cover discovery (project root +
installed dir) and hook classification (curl|bash critical, guard
script clean).

## Boundaries

- Extension `hooks/hooks.json` files already classify via the generic
  `hooks/hooks.json` pattern but carry the Claude Code plugin message.
- `${extensionPath}`/`${/}` variables in commands are kept verbatim.
- `excludeTools`/`contextFileName` semantics not risk-modeled.

## Evidence

- Full suite green: core 273, cli 47, config-convert 24.
- Self-scan 155 files: 18 findings (14 medium, 4 low), unchanged.
