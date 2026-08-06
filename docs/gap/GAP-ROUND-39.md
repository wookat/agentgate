# GAP Report — Round 39 (advisory check: no `-e` needed)

## Gap

Round 35's honest-limits list: `advisory check` defaulted to npm, so
`agentgate advisory check flyto-core@2.26.2` silently reported "clean" unless
the user knew to add `-e pypi` — a wrong-by-default answer for every PyPI
MCP server package, and the most dangerous kind of false negative for a
pre-install gate.

## Fixed

- `-e/--ecosystem` no longer defaults to npm: when omitted, both npm and PyPI
  are checked and each match reports which ecosystem it came from
  (`npm+pypi/<name>` in the human output, `matches[].ecosystem` in JSON;
  `package.ecosystem` is `null` when unset). Explicit `-e` still restricts.
- Contract updated in `docs/spec/cli-contract.md`; 1 new + 1 updated test.

## Verified

- `advisory check flyto-core@2.26.2` (no `-e`) now exits 1 with the four
  flyto advisories; `-e npm` on the same name stays clean (no npm package).
- Full suite green: 145 core + 34 cli; lint/typecheck/build pass.

## Honest limits

- A name colliding across ecosystems would report both; explicit `-e`
  disambiguates.
