# GAP-ROUND-8 — Production benchmark loop, round 8 (lockfile-aware version resolution)

Date: 2026-08-05. Hardens rounds 6–7's advisory severity logic.

## The gap

osv-scanner's core competence is resolving *exact* installed versions from
lockfiles. Our round-6 advisory check resolved versions only from
`node_modules` — so on a project with a lockfile but no install (fresh clone,
CI before `npm ci`), a version-scoped malware advisory could only report the
hedged `high` ("verify your lockfile") instead of a definitive answer. Checked
on a fixture pinning `debug@4.4.2` (the actual compromised release) via
`package-lock.json` only: round-7 code said `high`/verify; the ground truth
(`critical`) was sitting in the lockfile.

## The fix

New core module `loadResolvedVersions(dir)`: best-effort resolved-version
lookup from `node_modules` (highest priority), `package-lock.json` v1/v2/v3,
`pnpm-lock.yaml`, `yarn.lock` (v1), `poetry.lock`, and `uv.lock` (PyPI names
normalized PEP 503-style). `agentgate deps` uses it for AG-DP-006 comparisons.
Honest boundary: lockfile parsing is regex/JSON-level, not a reimplementation
of each format; unparsable lockfiles are ignored silently and the severity
ladder falls back to `high`.

## Evidence

- Fixture with `package-lock.json` pinning `debug@4.4.2`, **no**
  `node_modules`: now `critical AG-DP-006 "debug" 4.4.2 is a compromised release…`
  (was `high`/verify).
- express repo (has both lockfile and node_modules): unchanged, still
  `low` — installed 4.4.3 not affected.
- Unparsable lockfiles: ignored, no crash (tested).
- 160 tests green.

## Still open (round 9+ candidates)

1. Full version-range CVE scanning stays delegated to osv-scanner (documented).
2. macOS/Windows verification.
