# GAP-ROUND-313 — Crush project skills tree (`.crush/skills`) was never walked

## Advisory window (honest)

- Automated GitHub malware watch `--dry-run`: `No uncovered MCP-related advisories found.`
- OSV PyPI export refreshed this window (ETag changed) — first real snapshot diff since r295: exactly **1 new MAL id** (`MAL-2026-13665`, PyPI `riakcs`): install-time host-info beacon, kam193 `PROBABLY_PENTEST` category, no MCP/agent relation. Rejected per the existing bar (same class as `trtllm-subdir-test`, round 295). npm export ETag unchanged.
- New PyPI baseline snapshot retained at `~/corpora/r313/pypi-all.zip`.

## Gap

Crush (upstream `internal/config/load.go` `projectSkillSubdirs`) discovers project skills in `.agents/skills`, `.crush/skills`, `.claude/skills`, `.cursor/skills`. Three of the four were covered; `.crush` was missing from the scanner's `AGENT_DOT_DIRS`, so the whole `.crush` tree was skipped by the walker — a poisoned `.crush/skills/*/SKILL.md` was invisible to every rule and to `lock --skills`.

Wild evidence: GitHub code search reports ~1,496 `SKILL.md` files under `.crush/skills` paths; 13 wild repos cloned for the sweep contain 2,103 such files that were previously never scanned.

## Fix

- `.crush` added to `AGENT_DOT_DIRS` (scanner walk) and to the shared agent-skills dir group in `SKILL_FILE`.
- Precision guard, per the round-283 inert-frontmatter policy: Crush's skill frontmatter parser (upstream `internal/skills/skills.go`) reads only `name`/`description`/`user-invocable`/`disable-model-invocation`/`license`/`compatibility`/`metadata` — a pasted `allowed-tools:` grant in a Crush-only skill tree is inert, so `.crush/skills` is added to `ALLOWED_TOOLS_INERT_FILE` (AG-SK-002 allowed-tools skipped there; AG-SK-001 text scanning fully applies).

## Evidence

- Regression test: poisoned `.crush/skills/deploy/SKILL.md` → 1 critical AG-SK-001; its `allowed-tools: Bash` produces no AG-SK-002.
- Wild sweep (13 repos, 2,103 previously invisible files): text findings limited to 2 plausible low structural-tag hits (DeanMojo/polysmith-mvp reference docs); without the inert guard, 25 inert AG-SK-002 grants (TheMystic07/OpenWalc) would have been reported — all suppressed, 0 remaining FPs.
- Full suite green; self-scan unchanged.

## Boundaries

- Crush global/user skill dirs (`~/.config/crush/skills`, `~/.agents/skills`, appData) are not repo-carried — out of scope.
- `crushrc`/`crush.json` surfaces unchanged (rounds 225–229).
