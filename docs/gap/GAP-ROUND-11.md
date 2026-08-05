# GAP-ROUND-11 — honor the advisory-DB promise in `scan` + 0.3.0 clean-env regression fallout

Round type: maintenance (post-0.3.0). Subject: honesty gap between what our own
docs claim and what the CLI does, plus a real bug caught by the 0.3.0 clean-room
regression.

## Findings

### 1. `advisories/README.md` promised something the CLI didn't do (P0, honesty)

The advisory database README says: *"let `agentgate scan` cross-check your MCP
servers automatically"*, and `docs/spec/advisory-api.md` lists the CLI as a
consumer. Reality before this round: `scan` only queried OSV.dev `MAL-*`
records (AG-SC-002). The 15-entry MCPA database — which covers RCE
(CVE-2025-6514 in `mcp-remote`), SSRF, path traversal, and auth-bypass
advisories that OSV's malware feed does not — was never consulted.

**Fix**: the MCPA database is now bundled into `mcp-agentgate-core` at build
time (`packages/core/scripts/bundle-advisories.mjs` → generated
`src/advisories/data.ts`, kept in sync by a CI check) and `scan` matches every
package-runner server spec against it (new `AG-SC-003`):

- pinned version inside an affected SemVer range → advisory severity
  (`npx mcp-remote@0.1.10` → critical MCPA-2025-0001)
- pinned version outside every range → no finding (`mcp-remote@0.1.16` clean)
- unpinned spec with a version-scoped advisory → medium, "pin a fixed version"

Bundling (instead of calling the advisory API worker) keeps the check fully
offline — consistent with our structural advantage over cloud-dependent
scanners — and the DB ships with each release. The API remains the path for
fresher-than-release data; the worker endpoint is not yet deployed publicly, so
the CLI does not depend on it.

### 2. `agentgate --version` reported 0.1.0 forever (P1, caught by clean-env regression)

`packages/cli/src/index.ts` had `.version('0.1.0')` hardcoded since the first
release; `npx mcp-agentgate@0.3.0 --version` printed `0.1.0`. Now read from the
package's own `package.json`.

## 0.3.0 clean-environment regression (npx, cold cache)

- `scan` on a malicious-package config: AG-SC-002 critical + `--fail-on high`
  exit 1 ✔
- `deps` on `lodahs` + `debug`: malware + typosquat + version-aware advisory ✔
- `lock` → `ci` (tool description mutated): drift caught, `description-changed`
  reported, CI FAILED ✔
- no-network `deps`: two warnings, no crash ✔
- `--version`: **0.1.0** ✘ → fixed this round

## Honest limitations

- The bundled DB is only as fresh as the installed CLI version. The advisory
  API (docs/spec/advisory-api.md) is the future path for live data; it is not
  yet deployed under a public URL, so `scan` does not query it.
- MCPA coverage is curated and small (17 entries); it complements — not
  replaces — the OSV malware check and version-range CVE scanners
  (osv-scanner, npm audit).
