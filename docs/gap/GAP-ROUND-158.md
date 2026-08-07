# GAP-ROUND-158 — Kiro custom-agent embedded permissions

Date: 2026-08-08 · Round type: overprivilege coverage (new client surface)

## Source (official)

kiro.dev/docs/custom-agents + kiro.dev/docs/permissions: project agents
live in `.kiro/agents/[name].json|md` ("shared via version control"),
and may embed a `permissions` field with capability rules
(`capability` / `match` globs / `effect: deny|ask|allow`; priority
deny > ask > allow, "a deny rule always wins regardless of scope").
User- and workspace-scoped `permissions.yaml` live under `~/.kiro/`
— outside the repository, intentionally out of scope.

## What shipped

Embedded `permissions.rules` with `effect: allow` and a catch-all
match (no `match`, empty, or a `*`/`**` pattern) report: high for
`shell` and the `all`/`builtin` meta-capabilities, medium for
`filesystem`/`fs_write`, `mcp`, and `web_fetch`. `fs_read` and scoped
matches stay clean. A catch-all `deny` for the same capability (or
`all`) suppresses the allow. Markdown agents' frontmatter is parsed
with the YAML parser; their bodies now also go through AG-SK-001/003
as instruction files.

## Corpus (4 real repos with .kiro/agents/)

- xiangthebung/reality-room `luna.md`: `filesystem` allow + `shell`
  allow, both catch-all → 1 high + 1 medium (true positives — every
  shell command and file write runs unprompted).
- naccdata/flywheel-gear-extensions (3 agents): scoped `git * ` allows
  with ask/deny fallbacks → 0 (correct).
- rosselps/whyguard: scoped `pnpm */git *` allows + protective denies
  (`rm -rf *`, `.env`, `**/*.pem`) → 0 (correct).
- hoycdanny/kiro-multi-agent-game-studio (49 agents): `tools` lists
  only, no `permissions` → 0 (the `tools` field controls availability,
  not approval — still prompts).

Setup note: research-only clones (no commits); hook configs noted but
not installed.

## Honest boundaries

- `exclude` patterns are not modeled: `match: ["**"], exclude:
  ["secrets/**"]` still reports (the allow is still broad — arguably
  correct, but the exclusion is not weighed).
- Non-catch-all-but-broad globs (`src/**` on fs_write) are not graded.
- `ask` effects and the `subagent`/`skill`/`power` capabilities are
  not risk-classified this round.

## Routine checks

- advisory watch: no uncovered public MCP advisories this sweep.
- Competitors: no relevant releases observed since round 155's check.

## Evidence

- Full suite green: core 231, cli 47, config-convert 24.
- Self-scan: 17 findings (13 medium, 4 low) unchanged.
