# GAP Report — Round 25 (deep benchmark: output quality vs first-class security tools)

Focus set by leadership: reach the polish of the best contemporary tools. This round
re-benchmarked competitors, audited our own scan/ci/SARIF/error output, ran the routine
advisory sweep, and walked the website on mobile and desktop viewports.

## 1. Competitor re-check (2026-08-05)

| Tool | Version | Movement since round 24 |
| --- | --- | --- |
| socket (npm CLI) | 1.1.153 | none |
| snyk-agent-scan (PyPI, ex mcp-scan) | 0.5.16 | none |
| osv-scanner | v2.4.0 (2026-06-18) | none |

Re-ran `osv-scanner scan --lockfile package-lock.json` against a fresh express clone
(368 packages, 4 vulns found, exit 1) and our own `agentgate deps` on the same tree
(46 refs / 142 files, 1 low AG-DP-006 for the debug 4.4.2 event with version-aware
downgrade). Output design remains comparable: both give a severity-labelled table,
fixed-version guidance (osv-scanner) vs rule-doc links (us).

## 2. Own output audit — findings and fixes (this PR)

- **P1 — SARIF `tool.driver.version` was hardcoded `0.1.0`** while the CLI is 0.6.x.
  Any consumer (GitHub code scanning, SARIF viewers) saw a bogus tool version.
  Fixed: the CLI passes its real version into `toSarif`.
- **P1 — SARIF artifact URIs were absolute paths** (`/tmp/.../cfg.json`). GitHub code
  scanning requires repository-relative URIs to map alerts to files; absolute paths
  break alert display. Fixed: URIs are now emitted relative to cwd (configurable via
  `SarifOptions.baseDir`), with Windows backslash normalization.
- `toSarif(findings, toolVersion: string)` became `toSarif(findings, opts: SarifOptions)`
  (minor breaking signature change for core; CLI output unchanged apart from the fixes).
- Error-message spot checks all good: missing target → `error: target not found` exit 2;
  bad `--format` → commander lists allowed choices; `ci` without lockfile → actionable
  `run \`agentgate lock\` first` exit 2.

## 3. Advisory sweep

- GHSA past week: the only MCP-relevant advisory (GHSA-xc48-889x-5qmw, Flowise
  npm_config_yes bypass) is already covered by MCPA-2026-0006 with matching ranges.
- OSV probe of bare MCP reference-server names found one uncovered malicious package:
  **`mcp-server-everything` (npm, MAL-2025-46986 / GHSA-6j44-frpv-rvv9, Sept 2025)** —
  squats `@modelcontextprotocol/server-everything`. Added as **MCPA-2025-0014**
  (database now 24 records; schema-validated; offline AG-SC-003 hit verified:
  `npx -y mcp-server-everything` config → critical).
- Other bare reference names (time/memory/filesystem/sqlite/puppeteer/gdrive/everart/
  aws-kb-retrieval/slack/brave-search) have no OSV records — nothing else to add.

## 4. Website mobile/visual walk

Playwright at 390×844 and 1280×800 over `/`, `/advisories/`, an advisory detail page,
and rule docs: no horizontal scroll, layout intact, severity pills and hero render well.

- **P2 fixed — `/docs/` returned 404** (Starlight has no docs index). Added a redirect
  `/docs` → `/docs/introduction/`.
- **P2 fixed — missing spaces around inline links** on `/advisories/` intro ("via
  theAdvisory API", "orcontribute") caused by Astro HTML compression across source line
  breaks. Reflowed the markup; build output now preserves spacing.
- `/advisories/mcpa-2025-0014/` will 404 in production until the next website deploy
  (auto-deploy still awaits Cloudflare repo secrets; manual deploy after merge).

## Honest limits

- Rule-level `security-severity` in SARIF is still a static 8.0 per rule; per-result
  severity is accurate. GitHub uses the rule-level value for default filtering — a
  future round could derive per-rule defaults.
- No `partialFingerprints` are emitted; GitHub computes its own, so dedup works, but
  cross-tool SARIF consumers may dedup less precisely.
