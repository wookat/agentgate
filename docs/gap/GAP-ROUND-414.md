# GAP-ROUND-414 — routine windows + r413 fix verification

Date: 2026-08-04. Scanner at main@bf6222a (post-#622). Honest no-defect round;
no code change, no changeset.

## Advisory windows

- **Authenticated GHSA/OSV watch** (`api/scripts/watch.mjs` with token):
  "No uncovered MCP-related advisories found."
- **OSV npm**: ETag `0f1e3bf0…` (changed since r412's `03cda0b0…`), but full
  MAL diff vs r403 baseline is empty — zero new MAL entries.
- **OSV PyPI**: ETag `93f7c32e…` (changed since r412's `55f662c5…`); full MAL
  diff vs r412 is exactly 1 new entry — MAL-2026-13712 (`bigtime`,
  file-write exfiltration via patched `open`). No MCP/agent/skill/client
  keywords; generic PyPI malware outside mapping bar — not bundled.
- **Client version window**: unchanged from r412 — claude-code v2.1.226,
  codex 0.147.0, gemini-cli v0.54.4, qwen-code v0.21.9, opencode v1.18.16,
  goose v1.45.0, crush v0.88.1, copilot-cli v1.0.79, zed v1.14.2. No new
  client surface to cover.

## Production consistency

Website 200; advisory API 109; JSON feed 109; repo `advisories/` 109 — all
consistent.

## r413 fix verification on main

Rebuilt at main@bf6222a and rescanned the two r413 target repos:

- `karthikrshet/Career-Agents` — `packages/security/url-validator.ts:10`
  now low (was high).
- `JSONbored/metagraphed` — all 20 AG-SS-001 findings low, including the
  target `scripts/check-adversarial-surface.ts:95`; the repo's defensive
  test/guard files were already low and stay low.

Matches the pre-merge 254-repo head-to-head (3 downgrades, zero upgrades).

## Release state

v0.67.54 closed out in r413 (manual SOP publish during the Actions outage;
tag at 08ca8e6, Release created, clean-env npx regression passed). One r413
patch changeset (`round413-ssrf-validator-context`) accumulated since.

## Residual

- GitHub Actions still not triggering (account-level incident; owner-side
  billing/quota investigation ongoing). Degraded merge gate remains:
  GitGuardian green + local build/test/lint/typecheck green, disclosed.
- No new generalized defects found this round.
