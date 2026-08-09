# GAP-ROUND-340 — data checkpoint (rounds 331–339) + advisory MCPA-2026-0087

Routine data-checkpoint round: measure the block, verify production, run the
advisory window. One new advisory entered the database this round.

## Block summary (rounds 331–339)

Mainline: close out the Codex plugin/marketplace semantics per upstream
source, then fix two output-channel path defects found by UX walkthroughs.

- 331 (#482): Codex `.agents/plugins` marketplace catalogs + object-form
  local sources feed component gating.
- 332 (#483): inline hooks-file forms unwrapped for AG-SK-003; entry-level
  path-form `mcpServers` followed into discovery.
- 333 (#484): Agent Plugins spec root manifests (`$schema`-gated) — skills
  trees, implicit `./mcp.json`, `com.openai` inline hooks.
- 334 (#486): 162-repo fresh-corpus sweep — fixed the bare-manifest walker
  regression (r333, unreleased) and `test_*`-filename secret noise.
- 335 (#487): findings-table rows identical except for the config file
  collapse at ≥4 copies.
- 336 (#489, docs): Agent Plugins v1.0.0 spec conformance verification.
- 337 (#490, docs): routine windows all clear + r335 grouping full-corpus
  verification.
- 338 (#491): SARIF artifact URIs valid when scanning outside cwd
  (fallback base dirs + `file://` for unmatched absolute paths).
- 339 (#493): GitHub annotation `file=` paths relativized under the
  workspace (same leak, annotation channel).

Released during the block: v0.67.11 (npm cli/core published, tag/Release,
deploy checks, clean-environment `npx` regression all passed).

## Measured data (this checkout)

- Tests: 512 passing (config-convert 30, core 423, cli 59); core coverage
  93.99% statements / 85.43% branches.
- Self-scan: 228 files, 21 findings, ~0.9 s wall.
- Production: website 200; advisory API and feed each served 100 entries,
  consistent (101 after this PR deploys).
- npm downloads (last month): mcp-agentgate 3,124; mcp-agentgate-core
  3,355 — flat for the 22nd consecutive checkpoint. Distribution remains
  the biggest gap, pending your call.

## Advisory window

Authenticated GHSA watch (window since r337) surfaced three candidates, all
VulDB-batch path traversals; triaged against original sources:

- **Entered — MCPA-2026-0087** (CVE-2026-19328, GHSA-866p-rrc7-6r5x):
  skill-ninja-mcp-server 0.1.0 passes caller-controlled `workspacePath`
  into installer filesystem ops with no trusted-root check; fixed in 0.1.1
  (public issue + patch commit verified). Also mapped the
  `@iflow-mcp/aktsmm-skill-ninja-mcp-server` republish: tarball diff shows
  the vulnerable `installer.js` byte-identical, and the mirror only ships
  0.1.0 with no fixed release (`last_affected`). End-to-end:
  `advisory check skill-ninja-mcp-server@0.1.0` hits, `@0.1.1` is silent,
  the mirror hits at 0.1.0.
- **Ignored** (added to watch-ignore): GHSA-46jg-c454-8hm3
  (roo-code-memory-bank-mcp-server) and GHSA-3r2r-p86c-vj94
  (shadcn-vue-mcp) — GitHub-only projects with no npm/PyPI release, so no
  installable package to map (registry search confirmed), per the standing
  mapping bar.

OSV npm/PyPI export snapshots unchanged vs r337 (no new MAL diff source).

## Changesets

One patch changeset (advisory data, cli + core). The comparison-page count
bump and this document carry no behavior change.
