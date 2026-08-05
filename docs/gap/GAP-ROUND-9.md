# GAP-ROUND-9 — Production benchmark loop, round 9 (macOS/Windows verification)

Date: 2026-08-05. Closes the compatibility item open since round 2.

## The gap

The production baseline requires macOS/Linux (ideally Windows) verification.
Reference tools (osv-scanner, socket CLI, npm audit) all ship and test
cross-platform. AgentGate had platform-aware config discovery
(`knownConfigLocations` handles darwin/win32 paths) but CI only ever ran on
`ubuntu-latest` — macOS and Windows behavior was asserted, never verified.

## The fix

1. CI matrix: `ubuntu-latest` / `macos-latest` / `windows-latest` on Node 22.
   (A Node 20 job was tried and dropped: `engines` requires `>=22` and pnpm 11
   itself needs Node >=22.13, so 20 is out of the support window by design.)
   `fail-fast: false` so one platform's failure doesn't mask another's.
2. The first matrix run caught a real Windows failure: the discovery test
   asserted a `/`-separated substring against `path.join` output (fixed to be
   separator-agnostic). An audit of path handling then found one real Windows
   product bug: `scanRepo` passed
   native-separator relative paths (`tests\x.spec.ts`) into `checkSource`
   rules, so the round-5 test-path downgrade (`/(^|\/)tests?\//`) and the
   dynamic-exec heuristics would not match on Windows. Fixed: rules now always
   receive posix-style relative paths (the already-computed `relPosix`).

## Evidence

- CI on this PR: ubuntu / macos / windows all green (see the PR checks).
- `knownConfigLocations` already covered win32 (`%APPDATA%`) and darwin
  (`Library/Application Support`) paths with tests injecting each platform.
- Full local suite unchanged: 160 tests green on Linux.

## Honest boundary

CI verifies build/lint/typecheck/unit+e2e tests on all three OSes, including
the live stdio fixture server. It does not exercise real client installs
(Claude Desktop on macOS/Windows) — config discovery there relies on the
path-table tests.

## Still open (round 10+ candidates)

1. Full version-range CVE scanning stays delegated to osv-scanner (documented).
2. README compatibility table once the matrix has a few weeks of history.
