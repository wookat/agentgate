# GAP-ROUND-398 — routine windows + r397 residual verification (docs)

Date: 2026-08-03. Baseline: main `42caea7` (post #596/#597 version merge, npm latest 0.67.48;
main has 0.67.49 versioned but unpublished, carrying the r397 patch).

## Advisory windows — all clear

- **Authenticated watch sweep** (`api/scripts/watch.mjs` with GitHub token): zero
  uncovered MCP-related advisories.
- **OSV npm snapshot**: ETag `5198cee0…` unchanged since r396 — no new MAL records.
- **OSV PyPI snapshot**: ETag `47668b29…` unchanged since the r394 baseline — no diff.
- **Client version window** (9 clients): Claude Code v2.1.226, Gemini CLI v0.54.4,
  Copilot CLI v1.0.78, Crush v0.88.1, Qwen Code v0.21.8, Codex rust-v0.147.0,
  OpenCode v1.18.16, Goose v1.45.0 — all unchanged since r396; no new config
  surfaces to cover.
- **Production consistency**: advisory API and JSON feed both serve 109 entries,
  matching the repository (109 MCPA records); website 200.

## r397 residual verification (main @ #596)

- **Fix landed**: claude-notch (loopback notifier hooks) rescanned on main — the
  three AG-SK-003 highs are gone (only the bundled-JS hidden-unicode low remains);
  the r387 agent-audit remote-collector fixture keeps its high (positive preserved).
- **AG-SK-002 medium** (Write/Edit/WebFetch grants) sampled: real skill frontmatter
  pre-approvals, including properly scoped `Bash(cmd:*)` lists graded medium rather
  than high — correct semantics.
- **AG-CL-001** sampled: secret-shaped fakes in `test_*.py` / `__tests__` /
  e2e test files, all already graded low via test-path handling — correct.
- **AG-SS-001 low** sampled: SSRF URL-allowlist/blocklist defensive code and test
  files — correct defensive-context downgrades.

No new generalizable defect met the multi-sample bar this round; no code change,
no changeset.

## Residual (carried)

- `BANNED_HOSTS` denylist identifier (AG-SS-001, agentic-security) — single sample,
  deferred (see GAP-ROUND-397).
- Security-scanner attack-payload catalogs stay high — dual-use material, cautious
  grade kept.
