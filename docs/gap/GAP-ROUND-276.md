# GAP-ROUND-276 — advisory sweep (GHSA/OSV window 2026-07-25..08-03)

## Window scanned

- GHSA vulnerability advisories via `api/scripts/watch.mjs` (10-day window):
  **no uncovered MCP-related advisories**.
- GHSA malware advisories, 2026-07-25..08-03: 3,218 entries fetched; 131
  matched MCP/agent-ecosystem name filters and were triaged by hand.

## Accepted (79 → 81)

- **MCPA-2026-0066** — Mini Shai-Hulud campaign (npm account `atool`
  compromised; 631 malicious versions across 314 packages in a 22-minute
  burst on 2026-07-27) included three real, widely used MCP servers:
  `@antv/mcp-server-antv` 0.2.8, `mcp-echarts` 0.8.1, `mcp-mermaid` 0.5.1.
  Each injects a preinstall hook running a 498KB obfuscated Bun script that
  exfiltrates credentials via the GitHub API. Version-scoped
  (`introduced == last_affected`): npm removed the bad versions and current
  maintainer releases are clean (verified via `npm view`: latest 0.1.8 /
  0.7.1 / 0.4.1 — the trojaned versions are gone from the registry).
  The other ~300 compromised `@antv/*` visualization libraries are ordinary
  dependencies, not MCP scan surface — they stay with OSV live checks.
- **MCPA-2026-0067** — `brave-search-mcp-server` (unscoped npm) 1.0.0,
  a malicious squat of the official `@brave/brave-search-mcp-server` name,
  flagged by OpenSSF Package Analysis (malicious C2 domain + command
  execution). npm replaced it with a `0.0.1-security` placeholder; all real
  versions recorded as affected (`introduced: "0"`).
- **MCPA-2026-0009 aliases** — the June reference-server typosquat campaign
  (mcp-server-fetch et al.) reappeared in this window as ten new GHSA
  mirrors; the ten GHSA IDs are now recorded as aliases (same packages,
  already fully covered by `introduced: "0"`).

## Rejected (honest)

- `t-invest-mcp-server` 9999.99.99 — dependency-confusion squat (canonical
  max-version trick against an internal name); per standing policy
  dependency-confusion internal names are left to OSV live checks.
- ~115 remaining candidates: generic malware naming spam (`claude-*`,
  `agent-*`, `*-mcp` droppers with no squatted real target and no plausible
  MCP-config reach), scoped dependency-confusion names
  (`@cloudplatform-single-spa/*`, `@wagni_bot/*`, …), and movie-spam noise.
  None squat a name that an MCP client config would plausibly launch.

## Verification

- 81 advisories pass schema validation; bundled data (`api/src/data.json`,
  `packages/core/src/advisories/data.ts`) rebuilt; comparison page count
  79 → 81 (CI advisory-count gate enforces).
- End-to-end scan of an mcp.json pinning the affected versions:
  `@antv/mcp-server-antv@0.2.8`, `mcp-echarts@0.8.1` → AG-SC-003 critical
  (+ AG-SC-002 critical per-release); `brave-search-mcp-server` (unpinned)
  → AG-SC-003 critical; clean `mcp-mermaid@0.4.1` → no critical (only the
  informational had-compromised-releases low).
