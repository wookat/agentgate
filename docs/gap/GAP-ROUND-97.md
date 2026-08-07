# GAP-ROUND-97 — deps FP sweep on real repos: Deno import maps

Date: 2026-08-07

## Context

Round 93 made `deps` gate by default, so false positives are now
breaking. This round ran the released 0.20.0 `deps` against three real,
popular repos (fresh shallow clones).

## Real results (pre-fix)

| Repo | Time | Exit | Findings |
|---|---|---|---|
| honojs/hono | 2.4s | 1 | 3× AG-DP-001 critical — `@std/assert`, `@std/path`, `@std/testing` (imports in `runtime-tests/deno/*.ts`) |
| fastify/fastify | 1.2s | 0 | none |
| sindresorhus/got | 1.5s | 1 | 3× AG-DP-006 high — axios / cacheable-request / keyv "had compromised release(s) … could not determine the resolved version" |

## FP fixed: Deno/JSR import maps

The hono hits are false positives: `@std/*` are JSR packages resolved
through `runtime-tests/deno/deno.json`'s `imports` map — they don't
exist on npm by design, and nothing installs them from npm. Fix:
`deno.json`/`deno.jsonc` import-map keys (JSONC comments/trailing
commas tolerated) are added to the declared-names set, so imports they
resolve are never registry-checked. Post-fix: hono reports 0 findings;
the phantom-import fixture still reports.

## Judged not-a-bug (recorded)

The got hits are real MAL-* advisories (Shai-Hulud wave) against
dependencies got declares with ranges; got has no committed lockfile, so
the resolved version cannot be determined and `deps` says exactly that
and asks you to verify. Honest, actionable — kept at high. If field
noise grows, a future round could downgrade unresolvable
version-scoped advisories to medium.

## Verification

- core test suite includes a new true/false-positive fixture
  (`deno.jsonc` with `@std/assert` + an undeclared phantom import: only
  the phantom is reported). Suite green: core 184 / cli 40 /
  config-convert 21; build/lint/typecheck pass.
