# GAP-ROUND-432 — routine windows + r431 fix verification (honest no-defect round)

Date: 2026-08-03. Scanner: `main@67821c8` (post-#644).

## Advisory windows

- **Authenticated watch** (`api/scripts/watch.mjs` with GITHUB_TOKEN):
  "No uncovered MCP-related advisories found." Zero uncovered.
- **OSV npm**: ETag `"53128261faf337a1aa51e8c5812805fd"` — identical to
  r428/r430 (no change).
- **OSV PyPI**: ETag `"b4c2b2138b4bedcbee06b632a0cedc56"` — unchanged
  since r426.
- **Client release window**: all nine monitored clients unchanged from
  r430 (claude-code v2.1.227, codex 0.147.0, gemini-cli v0.54.4,
  qwen-code v0.21.9, crush v0.88.1, copilot-cli v1.0.79, zed v1.14.2,
  opencode v1.18.16, goose v1.45.0).

## Production consistency

Website 200; advisory API 109; website feed (`items`) 109; npm
latest → 0.67.58 (0.67.59 version PR #645 pending release). Consistent.

## r431 fix verification on main

Rescanned the three evidence repos with `main@67821c8`:

- `KeeperHub/keeperhub`: `lib/safe-fetch.ts` and
  `lib/security/content-scanner.ts` now low ("Only code comments…");
  all other AG-SS-001 findings low (tests/fixtures, network-policy
  manifests, defensive guards). Zero high — matches the pre-merge
  head-to-head.
- `brainwhocodes/branchlight-repo`: `utils/proxy.ts` low at the doc
  comment; the live IMDS credential clients `aws-credentials.ts:692`
  and `google-auth.ts:24` remain high. Correct.
- `Infrawrench`: `build-cloud.ts:152` (live metadata token fetch)
  remains high; `workflows/fetch.ts`, `uploadthing/client.ts`, and the
  other guard/validator files are low. Correct — a leading comment does
  not mask the live fetch.

## Deferred singletons

r431's pipixia-labs defensive set-membership metadata classification —
no second sample this round; remains deferred.

## Outcome

Honest no-defect round. No code change, no changeset.

## Gate

GitHub Actions outage ongoing — ordinary CI did not run. GitGuardian +
local lint green (docs-only change).
