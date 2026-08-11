# GAP-ROUND-422 — routine windows + r421 fix verification

Date: 2026-08-03. Scanner at main@9f9813d (post-#632). Honest no-defect
round; no code change, no changeset added this round.

## Advisory windows

- **Authenticated GHSA/OSV watch** (`api/scripts/watch.mjs` with token):
  "No uncovered MCP-related advisories found."
- **OSV npm**: ETag `d9092619…` — same object as r420. Full MAL set diff vs
  r418 baseline: exactly the 15 entries already triaged in r420
  (MAL-2026-13713..13727); each re-checked — zero MCP/agent/claude/cursor/
  copilot keywords in any record. Zero net-new since r420; none enter MCPA.
- **OSV PyPI**: ETag `93f7c32e…` — identical to r414/r416/r418/r420;
  set unchanged.
- **Client version window**: unchanged from r420 — claude-code v2.1.227,
  codex 0.147.0, gemini-cli v0.54.4, qwen-code v0.21.9, crush v0.88.1,
  copilot-cli v1.0.79, zed v1.14.2, opencode v1.18.16, goose v1.45.0.
  No new client surface to cover.

## Production consistency

Website 200; advisory API 109; JSON feed items 109; repo `advisories/`
MCPA files 109 — all consistent.

## r421 fix verification on main

Rebuilt at main@9f9813d and rescanned the three defensive-detection repos:

- `Asymptote-Labs_agent-beacon`: rule.yaml now low (was high at line 35);
  reported hit moved to the zero-width fixture at line 41.
- `MythologIQ-Labs-LLC_Qor-logic`: canaries.py:89 now low (was high).
- `Pantheon-Security_medusa`: signatures.yaml:130 now low (was high);
  `rule_integrity.py:85` stays high — the documented deferred singleton
  (underscore-bound `_BIDI_` identifier, prose one line outside the window).

Matches the pre-merge 97-repo head-to-head exactly; ordinary-code bidi
payloads remain pinned high by regression tests.

## Deferred singletons (unchanged, still 1 repo each)

medusa `rule_integrity.py` underscore-bound `_BIDI_` char-class (AG-TP-001);
Infrawrench defensive metadata prose/validator (AG-SS-001); medusa
rule-description installer prose (AG-RC-001); benchmark-fixture credentials
(AG-CL-001).

## Release state

npm latest 0.67.56; version PR #633 (0.67.57, consumes r421) open awaiting
merge/publish. GitHub Actions remains down (account-level outage); degraded
gate in effect.
