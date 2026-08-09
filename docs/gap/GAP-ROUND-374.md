# GAP-ROUND-374 — advisories MCPA-2026-0091/0092: LudusMCP SSRF + path traversal (104 → 106)

Date: 2026-08-04

## Routine windows

- Advisory watch (authenticated): five new VulDB-family MCP CVE candidates
  (published 2026-08-09), triaged below. OSV npm export ETag unchanged
  (e31fe9a2…); PyPI ETag changed (df798022…) but the full MAL id diff shows
  only MAL-2026-11198 (mcp-search-server) modified — already covered by
  MCPA-2026-0005.
- Nine-client version window: unchanged (Claude Code v2.1.226, Gemini CLI
  v0.54.4, Copilot CLI v1.0.78, OpenCode v1.18.15, Crush v0.88.1, Qwen Code
  v0.21.8, Goose v1.45.0, Codex rust-v0.147.0, Cline npm 3.0.52).

## Triage — two true hits, three below the mapping bar

**In (both verified in the published `ludus-mcp@1.0.24` npm tarball; repo
mapping confirmed via `npm view ludus-mcp repository.url` →
NocteDefensor/LudusMCP; no fixed release, so `last_affected: 1.0.24`):**

- **MCPA-2026-0091** — CVE-2026-19367 / GHSA-6fh8-4v8j-r4gw: SSRF in
  `src/tools/rangeConfig.ts` (`read_range_config`) — any `source` argument
  starting with http(s):// goes straight to `fetch()` with no allowlist
  (tarball lines 369–385). Medium 6.3.
- **MCPA-2026-0092** — CVE-2026-19366 / GHSA-hj87-3g9g-3832: path traversal
  in `src/tools/insertCredsRangeConfig.ts` (`insert_creds_range_config`) —
  `configPath`/`outputPath` resolved with `path.join`/`path.resolve` against
  the templates dir with no traversal sanitization. Low 5.3 (AV:L).

**Ignored (per the package-mapping standard, recorded in watch-ignore):**

- GHSA-5r3x-hrv2-fg58 (PV-Bhat/gemsuite-mcp): package.json name
  `gemsuite-mcp` never published to npm.
- GHSA-rmrp-j9qh-xwh9 (KS-GEN-AI/jira-mcp-server): package.json name is
  `jira_communication_server`, never published; the npm and PyPI
  `jira-mcp-server` packages are different projects (different
  maintainers/summaries).
- GHSA-xm38-q6p9-jrgg (Ichigo3766/image-gen-mcp): package.json name
  `image-gen` never published; the PyPI `image-gen-mcp` is simonChoi034's
  different project.

## v0.67.32 release close-out (this round)

npm verified (latest → 0.67.32 both packages, CLI dependencies rewritten to
real versions), tag at 6980d97, GitHub Release published, deployment
verified (website 200, advisory API/feed both 104 pre-merge), clean-
environment regression passed (fresh-cache `npx -y mcp-agentgate@0.67.32`:
poisoned SKILL.md double critical + curl|sh + mcp-echarts advisory hit).

## Validation

566 package tests + 24 api tests green, `validate.mjs` 106 files valid,
bundle regenerated (data.ts 104 → 106), lint/typecheck clean,
`git diff --check` clean.
