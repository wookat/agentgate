# GAP-ROUND-386 — routine windows + r385 residual verification (honest no-defect round)

Date: 2026-08-10. Baseline: main @ #576 (v0.67.42 published and verified).

## Advisory window (clean)

- Authenticated watch re-run: no uncovered MCP-related advisories.
- OSV exports: npm all.zip ETag `14bc0eba…` unchanged since round 385. PyPI ETag
  changed (`df798022…` → `53ac9d13…`); full MAL-id diff against the stored
  round-358 snapshot shows exactly 5 additions and 0 removals:
  `cubesat-upstream-driver`, `kotanku`, `btcflip`, `btcflx`, `kotoraka` — none
  match MCP/agent/Claude keywords in id, package name, or summary. No entries
  to add.
- Client version window: Claude Code v2.1.226, Gemini CLI v0.54.4, Copilot CLI
  v1.0.78, Crush v0.88.1, Qwen Code v0.21.8, Goose v1.45.0, Codex
  rust-v0.147.0, Cline npm 3.0.52 all unchanged. OpenCode moved
  1.18.15 → 1.18.16; release notes are bugfix-only (tolerate unknown top-level
  config fields, project registration) — no new config surface or semantics
  change relevant to discovery/scanning.
- Production consistency (verified during the v0.67.42 closeout today):
  repo 109 advisories, API 109, feed 109; published core tarball bundles 109.

## r385 residual verification (rescan at main @ #576)

The full 140-repo round-385 corpus was rescanned with the merged r385 fixes.
Aggregate counts confirm the five fixed classes landed: AG-CL-001 high 3 → 1,
AG-TP-001 high 1 → 0, AG-SS-001 high 1 → 0, AG-RC-001 critical 8 → 7 (the
Prismor `patterns:` rule-table critical is gone; the 7 remaining criticals are
the previously verified true positives).

- Remaining AG-CL-001 high: `PrismorSec_prismor prismor/runtime/canary.py:49`
  — the SSH private-key template single instance already deferred in
  GAP-ROUND-385; still a single-example class, still deferred.
- AG-RC-001 medium (81) sampled by class, sources read:
  - dynamic-exec primitives (`exec(`, `execSync(`, `spawn`) — all real
    execution sites (installer drivers, CLI wrappers, test harnesses);
    rule semantics correct.
  - non-executable curl|sh text warnings — sources verified: a CLI-tool
    installer registry whose `install.command` entries (`curl
    https://install.duckdb.org | sh`) are executed by the product, and a
    compliance self-test probing its own deny-pattern scanner with a
    `curl … | bash` string. The registry entries are genuinely
    execution-bound data (medium correct); the self-test probe is a
    single-example defensive pattern with no second-corpus support —
    deferred, not generalized.
- AG-SK-002 medium (233) sampled: unscoped `Edit`/`Write`/`WebFetch`/
  `WebSearch` allowed-tools grants in skill frontmatter — rule-semantics
  true positives.

No new generalizable false-positive class found; no code change this round.

## Outcome

Docs-only checkpoint; no changeset. Next fresh-corpus round continues the loop.
