# GAP-ROUND-406 — routine windows + r405 residual verification (honest no-defect round)

Date: 2026-08-03. Baseline: main @ #608 (0.67.51 published; one pending patch
changeset from r405).

## Routine windows

- Authenticated advisory watch (GHSA/OSV): zero uncovered MCP-related
  advisories.
- OSV snapshots: npm ETag `03cda0b0…` and PyPI ETag `22a6e7d4…` both identical
  to the r403/r404 snapshots — MAL sets unchanged, no diff to triage.
- Client version window (nine clients): all unchanged from r404
  (gemini-cli v0.54.4, copilot-cli v1.0.79, crush v0.88.1, qwen-code v0.21.9,
  codex rust-v0.147.0, goose v1.45.0, opencode v1.18.16, zed v1.14.2,
  claude-code v2.1.226).
- Production consistency: website 200; advisory API 109; feed 109; repository
  `advisories/MCPA-*.json` 109.

## r405 fix verification (main @ #608)

Rescanned `blamejs_exceptd-skills` with the built main: the defensive
bidi-comment hit in `bin/exceptd.js` now reports low ("illustrative example"
wording), alongside the pre-existing low test-path hits — the #608 behavior is
live on main.

## r405 residual verification

Sampled the remaining medium/low buckets from the r405 corpus rescan
(390 findings):

- AG-RC-001 medium (59): real `execSync`/`child_process` call points
  (ThumbGate gcloud probes, rigscore spawnSync harness) and genuine installer
  command strings carried in vendor/dep tables (Navide `install_cmd=` values,
  9router jcode install warning text) — rule semantics correct, the medium
  "confirm it is never executed" wording is accurate for the prose carriers.
- AG-SK-002 medium (49): real unscoped `Write`/`Edit` pre-approvals in skill
  frontmatter (bendrucker, opmau, vdsmon) — genuine grants.
- AG-SC-001 medium (34): unpinned `@latest`/bare npm server specs and
  microsoft/hve-core marketplace plugins served from a mutable
  `#plugins-v3.2.2` ref — correct findings.
- AG-AM-001 medium (10): remote servers configured without auth headers
  (context7, stripe, sketchi playground) — verify-auth wording correct.
- Lows (177): TP-001 BOM/zero-width in real sources and test paths, SS-001
  defensive/test-path metadata references, CL-001 test-path secret shapes —
  all correctly quiet.

## Residual singleton (slow-track)

- rulesync `src/linter/rules/noUnsafeCommands.ts:5` — a JS detection-rule
  table declared as `const UNSAFE_PATTERNS = [ { pattern: /…/, desc: '…' } ]`
  reports medium: the `desc` prose carries "curl | bash" and the
  assignment-declaration deny-name check does not recognize the `UNSAFE`
  token (nor a bare plural `…_PATTERNS` name). Single sample this round —
  below the multi-sample modification bar; watch for recurrence.

## Outcome

No generalizable scanner defect established this round: honest no-defect
record, docs only, no changeset.
