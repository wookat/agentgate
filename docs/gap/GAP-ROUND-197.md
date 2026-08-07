# GAP-ROUND-197 — Qwen Code extensions (qwen-extension.json)

Date: 2026-08-08 · Round type: coverage (round-195/196 follow-up)

## Problem

Qwen Code has its own extension ecosystem (official extension docs
verified): `qwen-extension.json` manifests — mirroring Gemini CLI's
`gemini-extension.json` — carry an `mcpServers` map that starts
automatically for anyone with the extension installed. Extensions install
under `~/.qwen/extensions/<name>/` (git/archive/npm delivery, HEAD of the
tracked ref is "latest"), and extension repos keep the manifest at the
project root. Neither location was discovered.

## Change

- Discovery: project-root `qwen-extension.json` + installed
  `~/.qwen/extensions/<name>/qwen-extension.json` manifests parsed as
  standard `mcpServers-json` (full config rule set + OSV/MCPA advisory
  checks). Shared helper with the Gemini extension walker.

## Verification

GitHub: 175 `qwen-extension.json` files. Real corpus:
- josstei/maestro-orchestrate — extension servers discovered, no config
  findings (skill AG-SK-002 hits are pre-existing surfaces).
- Omar-Obando/qwen-orchestrator — true positive on the new surface:
  manifest server "memory" runs unpinned `@modelcontextprotocol/server-memory`
  with `-y` (AG-SC-001 medium+low).

## Boundaries

- Extension `commands/**.md` markdown at extension-repo root not skill-
  scanned (generic root `commands/` too FP-prone); installed-extension
  copies under `.qwen/` are covered by round-196.
- Extension enable/disable scopes and `.qwen/.env` not modeled.

## Evidence

- Full suite green: core 278, cli 47, config-convert 24.
- Self-scan 155 files: 18 findings, unchanged.
