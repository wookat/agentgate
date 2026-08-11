# GAP-ROUND-436 — routine advisory windows + r435 fix verification

Date: 2026-08-11. Scanner: `main@3e041c5` (0.67.60 version PR merged).

## Advisory windows

- **Authenticated watch** (`api/scripts/watch.mjs` with a live GitHub
  token): **one uncovered hit** — GHSA-fr94-7cqc-vjrq (CVE-2026-19516,
  critical 9.1): mcp-grafana honors a caller-supplied `X-Grafana-URL`
  header controlling the destination of outbound requests, and
  `grafana_api_request` lets the caller pick method/path/body — SSRF
  into loopback/link-local/metadata endpoints. Verified against the
  GHSA record and the upstream repo: v1.1.0 (2026-08-10) removes the
  undocumented header (grafana/mcp-grafana#1052, confirmed in the
  release notes). Official PyPI package `mcp-grafana` exists (latest
  1.1.0, homepage grafana/mcp-grafana). **Published as
  MCPA-2026-0096** (pypi/mcp-grafana, introduced 0 → fixed 1.1.0);
  schema validation passes, bundle regenerated (109 → 110).
- **OSV npm**: ETag `"53128261faf337a1aa51e8c5812805fd"` — identical to
  r430/r432/r434; MAL set unchanged, no diff needed.
- **OSV PyPI**: ETag changed
  (`"4e707918…"` → `"5f95571e63ccfc48ef1bfb0782fa67cd"`). Full MAL diff
  against the r434 snapshot: 11,643 → 11,644, exactly **one** new
  record — MAL-2026-13729 (`dlmm-sdk`, env/credential exfiltration on
  import; sibling of r434's `dlmm`). Zero MCP/agent/client keywords;
  out of MCPA scope. Snapshot saved at `~/corpora/osv-r436/`.
- **Client release window**: all nine monitored clients unchanged from
  r434 (claude-code v2.1.227, codex 0.147.0, gemini-cli v0.54.4,
  qwen-code v0.21.9, crush v0.88.1, copilot-cli v1.0.79, zed v1.14.2,
  opencode v1.18.16, goose v1.45.0 — stable channels; nightlies/pre-
  releases excluded as usual).

## Production consistency

Website 200; advisory API 109; website feed (`items`) 109; npm
latest → 0.67.59 (0.67.60 version PR #650 merged, release pending).
Consistent pre-release state. After this PR merges, main deploy takes
the API/feed to 110.

## r435 fix verification on main

Rescanned both defect repos with `main@3e041c5` build:

- `openbkn-ai/bkn-foundry`: AG-RC-001 criticals land only on genuine
  installers (onboard.sh:348, preflight_checks.sh:1990, k8s.sh:473) —
  the print-helper message criticals (preflight 691, info K3s hint) are
  gone, matching the pre-merge head-to-head.
- `hanjukim/prep-cli`: single critical at bootstrap.sh:875 (the real
  bun installer); the line-664 login-help message finding is gone.

## Outcome

One new advisory published (MCPA-2026-0096, critical SSRF, fixed
version confirmed upstream); doc advisory count gate updated
(109 → 110). No scanner-rule code change. Patch changeset added for
the bundled-database update.

## Gate

GitHub Actions outage ongoing — ordinary CI did not run. Degraded
gates: `node api/scripts/validate.mjs` (110 valid), full local
build/test (549 core + 60 cli + 30 convert) / lint / typecheck /
`git diff --check` all green; GitGuardian on the PR.
