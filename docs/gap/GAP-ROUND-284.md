# GAP-ROUND-284 — Kilo CLI (OpenCode fork) project-tree completeness

Round type: new-surface completeness audit + wild-corpus verification (follow-up to rounds 269/282/283).

## Question

Kilo Code shipped a new CLI built as an OpenCode fork. Rounds 269/282 covered the
VS Code-extension surfaces (`.kilocode`/`.kilo` mcp.json, rules, workflows, modes files,
commands). Does the new CLI architecture carry additional repository surfaces under
`.kilo`/`.kilocode` (or at the repo root) that AgentGate cannot see?

## Upstream source evidence (kilocode monorepo, `packages/opencode`)

- `src/config/config.ts`: project config directories are `.kilocode` and `.kilo`
  (`primaryPaths(..., [".kilocode", ".kilo"])`); for each, Kilo loads config files,
  commands, agents, modes, and plugins.
- `src/kilocode/config/config.ts`: `ALL_CONFIG_FILES = ["kilo.jsonc", "kilo.json",
  "opencode.jsonc", "opencode.json"]` — `kilo.json(c)` uses the OpenCode schema
  (`mcp`, `permission`, `agent`, `plugin`, `instructions` blocks), JSONC allowed.
- `src/config/agent.ts`: loads `{agent,agents}/**/*.md` and `{mode,modes}/*.md`;
  frontmatter schema is `@opencode-ai/core` `ConfigAgentV1` — `permission` plus the
  deprecated `tools` boolean map. **No `allowed-tools` field is read anywhere in the
  Kilo source** (checked `packages/core/src` + `packages/opencode/src`), so that
  frontmatter key is inert in Kilo command/agent/mode files (same result as round 283
  found for commands).
- `src/config/plugin.ts`: auto-discovers `{plugin,plugins}/*.{ts,js}` in each config
  dir — startup-executed code, same as OpenCode.

## Gaps found (all previously invisible)

1. `kilo.json` / `kilo.jsonc` — MCP discovery (`opencode-json` format, now
   JSONC-tolerant) + AG-SK-002 permission checks + AG-SC-001/002/003 plugin and
   remote-instruction checks.
2. `.kilo{,code}/agent{,s}/*.md` and `.kilo{,code}/mode{,s}/*.md` — AG-SK-002
   frontmatter permission checks + AG-SK-001/003 skill pipeline.
3. `.kilo{,code}/plugin{,s}/*.{ts,js}` — AG-RC-001 startup-execution surface.
4. Messages label the client (`Kilo CLI` vs `OpenCode`) by path.

## Corpus verification

- Queries: `path:.kilo/agents` (549), `path:.kilo/agent` (291), `path:.kilo/plugins`
  (11), `path:.kilo/plugin` (7), `filename:kilo.jsonc` (252), `path:.kilo/modes` (3).
- 314 candidate repos; 311 cloned (3 unavailable: SFARPak/ACode,
  acester822/kilocode.unplugged, fulvian/kiloclaw); 904 files under
  `.kilo` agent/mode/plugin trees + 86 `kilo.json(c)` files scanned end-to-end.
- 1,179 new-surface findings across 107 repos:
  - AG-SK-002 1,099 (518 high, 581 medium) — real `permission: bash/edit/webfetch: allow`
    grants in agent frontmatter and `kilo.json(c)` (widely propagated GSD agent packs
    ship `bash: allow` on every agent). Spot-checked samples all true positives.
  - AG-SC-001 53 — unpinned npm servers/plugins in `kilo.json(c)`.
  - AG-AM-001 15 — plain-HTTP / no-auth remote servers.
  - AG-CL-001 3 high — real hardcoded API keys (incl. an `sk-…` key) in `kilo.json(c)`.
  - AG-SC-003 2 — `@modelcontextprotocol/server-filesystem` advisory hits.
  - AG-RC-001 2 — one true positive (`.kilo/plugin/vexp-hint.js` startup
    `child_process` exec); one false positive, fixed below.
  - AG-SK-001 5 low — fenced-code quoted patterns, correct deliberate downgrades.

## False positive found and fixed

`kilo.json` with `"deniedCommands": [ …, "curl * | sh" ]` (a denylist, i.e. a
defensive control) triggered the generic AG-RC-001 curl|sh text warning at medium.
Fix: when the match sits in a string under the nearest enclosing deny/block key
(`denied…`, `block…`, `disallow…`, `forbid…`, `blacklist`), report low with defensive
wording — mirrors the round-169 SSRF defensive-context policy. Regression test pinned.

## Boundaries (as-is)

- Kilo CLI global/user paths (`~/.config/kilo` etc.) stay out of repository scans,
  consistent with the global-surface policy for every other client.
- `opencode.json(c)` inside `.kilo`/`.kilocode` dirs already matched the existing
  OpenCode patterns; no change needed.
- The inert `allowed-tools` skip now covers Kilo command/agent/mode files (source
  evidence above); `.claude` surfaces unchanged.
