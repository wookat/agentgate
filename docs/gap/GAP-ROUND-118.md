# GAP-ROUND-118 — Trae rule files are agent instructions; scan + lock them

Date: 2026-08-07 · Round type: coverage expansion (instruction-file scanning)

## Gap found (follow-up to round 117)

Round 117 added discovery of Trae's project MCP config, but Trae also has an
officially documented instruction surface: project rules in `.trae/rules/*.md`
(docs.trae.ai/ide/rules — frontmatter `alwaysApply`/`globs`/`description`,
"Always Apply" rules are injected into every AI chat in the project). Third-
party tooling also writes the older `.trae/project_rules.md` /
`.trae/user_rules.md` convention. These are exactly the kind of committed,
verbatim-injected files that skill-poisoning attacks target — AgentGate's
skill scanning (AG-SK-001/002/003) and `lock --skills` ignored them.

## What shipped

- `SKILL_FILE` now matches `.trae/rules/*.md`, `.trae/project_rules.md`,
  and `.trae/user_rules.md`; `.trae` added to the agent dot-dirs the repo
  walker descends into.
- `lock --skills` pins them automatically (same collection path).
- Test: poisoned always-apply rule + poisoned `project_rules.md` report
  AG-SK-001 critical; benign rule file reports nothing.
- Docs: skills guide lists the Trae layout.

## Evidence

- Fixture scan: `.trae/rules/evil.md` (instruction-override text) and
  `.trae/project_rules.md` → 2× AG-SK-001 critical; `.trae/rules/benign.md`
  → 0 findings.
- Full suite green: core 196, cli 47, config-convert 23; website 65 pages.

## Routine sweep

- v0.24.1 tag + Release + quick regression done earlier this round window.
- Round-117 (#199) merged; changesets accumulating toward 0.25.0.
