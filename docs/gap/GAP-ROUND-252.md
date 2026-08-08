# GAP-ROUND-252 — Competitor re-check (versions unchanged, one drift fixed)

Date: 2026-08-08. Routine competitor re-verification (previous: round 231).

## Versions re-checked this round (all real lookups)

| Tool | Round-231 | Now | Changed |
| --- | --- | --- | --- |
| snyk-agent-scan (GitHub releases) | v0.5.16 | v0.5.16 | no |
| thynkQ mcp-scan (npm) | 2.0.2 | 2.0.2 | no |
| invariant mcp-scan (PyPI) | 0.4.3 | 0.4.3 | no |
| socket CLI (npm) | 1.1.155 | 1.1.155 | no |
| osv-scanner (GitHub releases) | v2.5.0 | v2.5.0 | no |

No competitor shipped a new version since round 231 (4 rounds ago), so the
behavioral claims on the comparison page remain backed by the round-231
real runs — re-running identical binaries on identical fixtures would
reproduce identical results and is skipped honestly rather than re-dated.

## Drift found and fixed

- Comparison page advisory count: 41 → **73** (stale since round 231; three
  advisory batches landed in rounds 234/235/238/244). Only our own side
  drifted; competitor cells unchanged.

## Unchanged boundaries

- snyk-agent-scan token-gated features remain "unknown — unverifiable
  without a token" (no account; recorded, not guessed).
