# GAP-ROUND-6 — Production benchmark loop, round 6 (known-malware advisories)

Date: 2026-08-05. Closes the "advisory feed" gap open since round 2.

## The gap

Reference points, actually exercised:

- **osv-scanner 2.4.0** resolves lockfile versions against OSV.dev and reports
  known vulnerabilities with fixed versions. Its data source (OSV.dev)
  aggregates the GitHub Advisory Database, PyPI advisories, and the OSV
  *malicious-packages* project — including the recent wave of malicious MCP
  server packages (e.g. `explorhub-mcp-server` npm malware GHSA-2qjx-pmc9-2jrj
  / MAL-2026-4312, `ray-mcp-server` PYSEC-2026-1074 from the Shai-Hulud
  campaign).
- **npm audit** covers npm version-range advisories only, requires a lockfile.

AgentGate `deps` verified existence and scored metadata, but a package that
*exists and is literally catalogued malware* only got heuristic scores
(`explorhub-mcp-server` scored medium/low on adoption signals — the ground
truth "this is malware" was available and unused).

## The fix

`agentgate deps` now queries the OSV.dev `querybatch` API (names deduplicated,
batches of 500) and reports dependencies with `MAL-*` advisories as
**`AG-DP-006`**, with the advisory summary and an osv.dev link.

False positive found while regression-testing: package-level matching flagged
`debug` — a legitimate package whose 4.4.2 release was compromised in the 2025
npm supply-chain incident — as critical on the express repo. Fix: advisories
that enumerate affected versions are compared against the resolved version
from `node_modules`: unaffected installed version = `low` (informational),
affected = `critical`, unresolvable = `high` ("verify your lockfile").
Advisories with open ranges (the package *is* malware, e.g.
`explorhub-mcp-server`) stay `critical` unconditionally.

Scope decision, documented honestly: only malware advisories — version-range
CVEs need full lockfile resolution (osv-scanner already does that job well and
the docs say to use it alongside). Unreachable OSV degrades to a single
warning, same as the registry path; `--offline` skips it.

## Evidence

Fixture with `explorhub-mcp-server` (real npm malware) + `lodash`:

```
CRITICAL AG-DP-006 npm:explorhub-mcp-server "explorhub-mcp-server" is a known-malicious npm
                    package (MAL-2026-4312: Malware in explorhub-mcp-server (npm)) — remove it
                    and rotate any secrets on machines that installed it
MEDIUM   AG-DP-003 …3 weekly downloads and only 1 version(s)…
```

- `lodash` stays clean: its 10 GHSA version-range entries are correctly out of
  scope, no noise added.
- express repo: `debug` correctly reported `low` —
  `"debug" had compromised release(s) 4.4.2 (MAL-2025-46974…); installed version 4.4.3 is not affected`.
- flask repo: unchanged (5 low, same as round 1).
- `--fail-on high` exits `1` on the malware finding.
- No network (`unshare -rn`): one warning, scan completes:
  `warning: OSV.dev unreachable (fetch failed): known-malware advisory check skipped`.
- 153 tests green.

## Still open (round 7+ candidates)

1. Lockfile-aware version-range vulnerability scanning (or explicit osv-scanner
   delegation).
2. Checking npx-launched server packages in `agentgate scan` configs against
   the same advisory data.
3. macOS/Windows verification.
