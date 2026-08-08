# GAP-ROUND-309 — Post-merge deployment verification of the 99-advisory database (docs)

## Why this round

Rounds 307/308 landed the automated GitHub-malware watch, four new advisories
(95 → 99), and the version-bounded channel-muting fix (#450, #451). The last
website/production walkthrough was round 287 (at 87 advisories). This round
verifies the production deployment actually serves the new database before
anything claims "99 in production".

## What was verified (all live, 2026-08-03)

- **Advisory API**: `GET /v1/advisories` on
  `agentgate-advisory-api.wookat520.workers.dev` returns **99** records.
- **JSON feed**: `https://agentgate.zalize.com/feeds/advisories.json` has
  **99** items.
- **Advisory index**: `https://agentgate.zalize.com/advisories/` renders **99**
  unique detail links; severity filter counts 45 critical / 34 high /
  15 medium / 5 low match the local database exactly (the four
  `data-severity` filter buttons account for the +1 per bucket in a raw
  attribute count).
- **New detail pages**: `mcpa-2026-0082` through `mcpa-2026-0085` all return
  200; 0082 spot-checked for content (CVE-2025-49596, MAL-2026-13414,
  `@atom8n/inspector` all present).
- **Homepage**: 200.
- **Clean-environment end-to-end**: fresh `npx -y mcp-agentgate@latest scan`
  (published 0.67.3) against a config launching `@atom8n/inspector` pulls the
  refreshed live database and reports the new advisory as critical
  (AG-SC-002/003), plus the expected unpinned-spec findings — the live-refresh
  path serves the new records to already-published CLI versions.

No defects found; no code change needed this round.

## Also noted

- Version PR #448 merged: repo is at mcp-agentgate/core **0.67.4**
  (config-convert stays 0.14.0), containing the round-305/306/307 patches.
  npm still has 0.67.3 — the usual manual publish SOP applies.
- Competitor versions unchanged (snyk-agent-scan 0.5.16, mcp-scan 2.0.2,
  socket 1.1.155, osv-scanner v2.5.0, @kryptosai/mcp-observatory 1.36.4);
  npm monthly downloads flat at 3,124 (cli) / 3,355 (core) — the eighteenth
  consecutive flat checkpoint.
