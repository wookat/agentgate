# GAP-ROUND-7 — Production benchmark loop, round 7 (advisory checks for configured server packages)

Date: 2026-08-05. Extends round 6's OSV integration from `deps` to `scan`.

## The gap

Round 6 gave `agentgate deps` known-malware advisory checks, but the more
MCP-specific attack surface was still dark: a client config that launches a
malicious server package (`"command": "npx", "args": ["-y", "explorhub-mcp-server"]`)
got only the generic "unpinned package" `medium` from AG-SC-001 — even though
OSV catalogues that exact package as malware. mcp-scan's cloud analysis covers
configured servers; our static scan should use the public ground truth it can
reach offline-first.

## The fix

`agentgate scan` extracts the registry package each configured server launches
through a package runner (`npx`/`pnpx`/`bunx` → npm, `uvx`/`pipx` → PyPI; local
paths/URLs excluded) and checks it against OSV.dev malware advisories — new
finding `AG-SC-002`. Version-scoped advisories are compared against the pinned
version in the launch spec (same severity ladder as round 6: unaffected =
`low`, affected = `critical`, unpinned = `high`; open-range malware =
`critical`). New core export `serverPackageRef()`. OSV unreachable degrades to
one warning; the rest of the static scan is unaffected.

## Evidence

Config with `npx -y explorhub-mcp-server` (real npm malware) and
`npx debug@4.4.3`:

```
critical AG-SC-002 "explorhub-mcp-server" is a known-malicious npm package (MAL-2026-4312…) (server "evil")
medium   AG-SC-001 Server "evil" runs unpinned package "explorhub-mcp-server" …
low      AG-SC-002 "debug" had compromised release(s) 4.4.2 (MAL-2025-46974…); installed version 4.4.3 is not affected …
```

- No network (`unshare -rn`): single warning, static scan completes.
- Round-2/3 malicious fixtures and dogfood config: unchanged (no advisory hits,
  no noise).
- 154 tests green.

## Still open (round 8+ candidates)

1. Lockfile-aware version-range CVE scanning (or osv-scanner delegation).
2. macOS/Windows verification.
