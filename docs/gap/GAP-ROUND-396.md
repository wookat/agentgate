# GAP-ROUND-396 — routine windows + r395 residual verification (docs)

Date: 2026-08-03. Baseline: main @ #592 (0.67.48 versioned, npm latest 0.67.46;
version PR #594 open for 0.67.48 covering unpublished 0.67.47).

## Advisory windows — clear

- **Authenticated watch** (`api/scripts/watch.mjs`, 8-day window): "No uncovered
  MCP-related advisories found."
- **OSV npm snapshot**: ETag changed (`ad90…` → `5198cee0c60be4ef1852c8cfc62305d3`);
  full MAL member diff = exactly 22 new records (MAL-2026-13687..13708). Every one
  inspected by package name and record text: `tokocrytodev` (already triaged r394),
  a `chai-*` typosquat cluster, crypto/discord stealers, and generic utility squats
  (`env-local`, `hex-encode-utils`, `postcss-initial-provider`, …). Zero MCP / Model
  Context Protocol / agent-client keywords in any record — none are in scope for MCPA.
- **OSV PyPI snapshot**: MAL member count 11,638, identical to r393/r394 baseline.
- **Client version window** (9 clients): Claude Code v2.1.226, Gemini CLI v0.54.4,
  Copilot CLI v1.0.78, Crush v0.88.1, Qwen Code v0.21.8, Codex rust-v0.147.0,
  OpenCode v1.18.16, Goose v1.45.0 — all unchanged since r394; no new config
  surfaces to cover.
- **Production consistency**: advisory API and JSON feed both serve 109 entries,
  matching the repository; website 200.

## r395 residual verification (main @ #592)

The merged r395 build (0.67.48 working tree ≡ merged #592) was head-to-head
verified across 17 corpora in GAP-ROUND-395; the r395 corpus now grades
325 findings as 11 critical / 26 high / 110 medium / 178 low with exactly the
r395-fix deltas (comment-line and Python-prose curl|sh mediums → low; preferred
match moves off comment/prose lines onto live matches).

Residual sampling by rule on the post-fix output:

- **AG-TP-001 low (57)**: hidden-Unicode hits in test/fixture/golden paths and
  generated dashboards (U+202E in a *labeled-attempts* security test corpus,
  zero-width chars in golden JSON fixtures, U+Fxxx in vendored lint snapshots) —
  test-path low grade is rule-semantically correct.
- **AG-SK-001 low (29)**: prompt-injection patterns inside fenced code blocks of
  red-team/defense skill docs (injection-pattern reference catalogs, security
  auditor references) — quoted-example low grade correct; the 7 criticals remain
  intentionally malicious fixtures verified in GAP-395.
- **AG-SS-001 low (16)**: metadata-endpoint references in test files
  (exfil-destination denylist tests, home-assistant context tests) — test-path
  low correct; the single high remains the live IR-script IMDS probe.
- **AG-CL-001 low (10)**: sk-/xox/AIza-shaped values in test files, Firebase
  client configs, and Supabase anon-role JWTs — all under established
  deliberate low categories.
- **AG-RC-001 medium (45)** and **AG-SK-002 medium/high (77)**: re-checked by
  class in GAP-395 — real exec call sites, executed installer registries, and
  genuine permission/autonomy grants; unchanged.

No new generalizable defect met the multi-sample bar this round. No code
changes; docs-only, no changeset.

## Version state

r393 + r395 patch changesets consumed into 0.67.48 (version PR #594);
publishing 0.67.48 will also cover versioned-but-unpublished 0.67.47.
