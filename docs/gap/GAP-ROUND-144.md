# GAP-ROUND-144 — Gemini settings corpus + trusted MCP servers

Date: 2026-08-07 · Round type: real-corpus verification + fix

## Corpus check of round-143 (Gemini CLI settings)

GitHub code search: ~122 project `.gemini/settings.json` files mention
`allowed`, ~100 mention `auto_edit`. Cloned four real repositories:

- rgushchin/kengp: 3 true positives — bare `run_shell_command` (high),
  `write_file` + `replace` (medium).
- a2a-js / apps-script-samples: fully scoped
  `run_shell_command(npm ...)` allowlists → correctly 0.
- verdad: no tools.allowed → 0 (its unpinned `npx` server is separately
  reported by AG-SC-001, as designed).

## New gap caught: `trust: true`

Three of the four corpus repos set `"trust": true` on `mcpServers`
entries. Official docs (docs/reference/configuration.md): "Trust this
server and bypass all tool call confirmations." A checked-in trusted
server silently auto-runs its tools for everyone opening the project —
the same class of pre-approval AG-SK-002 already flags.

## What shipped

- AG-SK-002's Gemini settings check also flags
  `mcpServers.<name>.trust: true` → medium per trusted server.

## Post-fix corpus results

- kengp: +1 medium (semcode trusted), apps-script-samples: 1 medium
  (workspace-developer trusted), verdad: 1 medium (searxng trusted —
  though scoped by includeTools, trust still bypasses confirmation).
- a2a-js: still 0.

## Honest boundaries

- `includeTools` narrowing doesn't lower the severity — the trusted
  tools still run unconfirmed; severity stays medium (not high) because
  the tool surface is at least enumerable and lockable.
- Other clients' `trust`-like flags (e.g. Qoder/Amazon Q equivalents)
  not surveyed this round.

## Evidence

- Full suite green: core 219, cli 47, config-convert 24.
