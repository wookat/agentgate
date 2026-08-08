# GAP-ROUND-239 — Google Antigravity client surface

Date: 2026-08-08. New client: Google Antigravity (antigravity.google), verified
against the official docs (antigravity.google/docs/mcp, /docs/skills,
/docs/hooks, /docs/rules-workflows) — no semantics were guessed.

## What shipped

1. **MCP discovery** — global `~/.gemini/config/mcp_config.json` and workspace
   `.agents/mcp_config.json` (standard `mcpServers` map; remote servers use
   `serverUrl`, which the parser already normalizes like `url` — the docs state
   legacy `url`/`httpUrl` fields are not supported). Both run the full config
   rule set + OSV/MCPA advisory checks + lockfile.
2. **Hooks (AG-SK-003)** — workspace `.agents/hooks.json` and global
   `~/.gemini/config/hooks.json`. Shape: `{ hookName: { enabled?, Event:
   [{ matcher, hooks: [{ command }] } | { type: "command", command }] } }`
   (events: PreToolUse/PostToolUse/PreInvocation/PostInvocation/Stop).
   Entries with `enabled: false` are skipped. Commands run the shared
   dangerous-command classifier.
3. **Rules (AG-SK-001)** — workspace rules `.agents/rules/*.md` plus the
   documented legacy `.agent/rules/*.md`; `.agent` added to the walked agent
   dot-dirs (also picks up legacy `.agent/skills/**/SKILL.md` via the existing
   SKILL.md match).

## Real-corpus verification (GitHub `.agents/mcp_config.json` + `.agents/hooks.json`)

6 cloned repos (FailproofAI/failproofai, NVIDIA/elements,
Foxfire1st/agents-remember, KUP-IP/the-bridge, P2ERGmbH/agentic-coding,
doggy8088/better-rm):

- True positives: KUP-IP/the-bridge `.agents/mcp_config.json` — hardcoded
  `Authorization` headers on two remote servers (AG-CL-001 high ×2);
  P2ERGmbH/agentic-coding — 4 unpinned npx servers incl. figma-developer-mcp
  with advisory MCPA-2025-0011 (AG-SC-001/003), previously invisible;
  Foxfire1st/agents-remember — unpinned `agents-remember-mcp` (AG-SC-001).
- Hooks: all three wild hook shapes parsed (named hook → wrapped `hooks`
  arrays: failproofai, better-rm; nested `hooks` top-level wrapper: NVIDIA
  elements). All commands benign — 0 AG-SK-003 false positives.
- No new false positives on any of the 6 repos.

## Boundaries recorded honestly

- Antigravity OAuth token storage (`~/.gemini/antigravity/mcp_oauth_tokens.json`)
  is not parsed; `authProviderType`/`oauth` fields on servers are ignored.
- `disabled: true` servers are still reported (consistent with other clients).
- Rule activation modes (Manual/Model/Always/Glob) and `@filename` references
  in rules files are not interpreted — text scanning only.
- Workflows (`.agents/workflows`) not yet modeled; candidate for a later round.

## Checks

- Tests 350/47/24 (3 new: discovery, hooks TP/enabled:false/benign, rules incl. legacy path).
- lint / typecheck / `git diff --check` clean; self-scan 21 findings (unchanged baseline).
