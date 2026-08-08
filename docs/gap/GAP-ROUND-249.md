# GAP-ROUND-249 — OpenCode singular agent/command/mode directories

Date: 2026-08-08. Follow-up closing a round-247/248 boundary.

## Gap

OpenCode's loader scans **both singular and plural** project directories
(verified in the sst/opencode source, `packages/opencode/src/config/agent.ts`
and `command.ts`):

- agents: `{agent,agents}/**/*.md`
- commands: `{command,commands}/**/*.md`
- modes: `{mode,modes}/*.md` (legacy primary agents; same `Info` schema,
  including the `permission` frontmatter block)

AgentGate only matched the plural `agents`/`commands` forms, so the singular
directories — which dominate in the wild (GitHub code search: ~9.6k files
under `.opencode/command/`, ~4.7k under `.opencode/agent/`, vs. fewer under
the plural forms) — were invisible to both AG-SK-001 skill scanning and the
round-247 AG-SK-002 permission-frontmatter check.

## Fix

- `SKILL_FILE` adds `.opencode/{command,agent,mode,modes}/**.md`.
- `OPENCODE_AGENT_MD` (AG-SK-002 permission frontmatter) becomes
  `.opencode/{agent,agents,mode,modes}/**.md`.

Same severities as round 247: catch-all `"*": allow` / `bash: allow` high,
unrestricted `edit`/`write`/`webfetch`/`websearch` medium; granular globs and
`ask`/`deny` stay quiet.

## Corpus verification (7 real repositories)

- 182 `.opencode/` files now scanned (agent-brain 71, agent-bank 44,
  ai-coding-factory 31, human-mcp 23, …) — previously all invisible.
- ai-coding-factory's per-agent scoped skill permissions
  (`skill: {"net-*": allow, "*": deny}`) correctly quiet — the catch-all
  resolves to deny.
- 1 quiet-low AG-SK-001 structural-tag note (agent-brain `gsd-planner.md`
  documents an `<instructions>` template), consistent with all other skill
  surfaces. **0 permission false positives.**

## Boundaries (recorded)

- OpenCode command markdown has no `permission` frontmatter (commands run as
  the invoking agent) — commands get AG-SK-001 text scanning only.
- Global `~/.config/opencode/` trees stay outside repo scans (existing
  policy).
