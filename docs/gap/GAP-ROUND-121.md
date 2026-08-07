# GAP-ROUND-121 — Kiro steering files are agent instructions; scan + lock them

Date: 2026-08-07 · Round type: coverage expansion (instruction-file scanning)

## Gap found (same class as round 118)

Kiro's MCP config (`.kiro/settings/mcp.json`) has been discovered since
round 73, but Kiro also has an officially documented instruction surface:
steering files in `.kiro/steering/*.md` (kiro.dev/docs/cli/steering,
/docs/web/steering — markdown "persistent instructions" auto-loaded into
every chat session in the workspace, same trust model as Trae rules /
Continue rules). Skill scanning and `lock --skills` ignored them.

## What shipped

- `SKILL_FILE` now matches `.kiro/steering/*.md`; `.kiro` added to the
  agent dot-dirs the repo walker descends into.
- `lock --skills` pins them automatically (same collection path).
- Test: poisoned steering file reports AG-SK-001 critical; benign
  coding-standards steering file (taken from Kiro's own docs example)
  reports nothing.
- Docs: skills guide lists the Kiro layout.

## Deliberately NOT added (honest)

- Global `~/.kiro/steering/` (officially documented): repo scanning is
  project-tree scoped by design; global steering lives outside any repo.
  Same limitation applies to every client's home-dir instruction files —
  noted as a possible future `scan --home` surface.

## Evidence

- Fixture scan: `.kiro/steering/evil.md` (instruction-override text) →
  AG-SK-001 critical; `.kiro/steering/benign.md` → 0 findings.
- Full suite green: core 199, cli 47, config-convert 23; website 65 pages.
