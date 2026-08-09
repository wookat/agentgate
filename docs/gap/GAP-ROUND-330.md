# GAP-ROUND-330 — data checkpoint (rounds 321–329) + advisory MCPA-2026-0086

## Block summary (rounds 321–329, PRs #468–#478)

Main line of the block: close out the plugin-ecosystem repo-carried surface
against official Claude Code semantics, with wild-corpus precision evidence at
every step.

- **321 (#468, docs)**: wild precision sweep of the r319 manifest-gated plugin
  component surface (118 repos). *Corrected in 323.*
- **322 (#470)**: AG-CL-001 treats boundary-delimited `test`/`demo` segments as
  placeholders (wild FP: `xoxb-test-token`). Reopened as #470 after
  GitGuardian blocked #469's fixture literal.
- **323 (#471)**: concealment-pattern precision (quoted object / `only`
  alternative-presentation) + honest correction of GAP-321's measurement
  (path-comparison bug in the sweep script, not the scanner): full 496-repo
  corpus = 9,902 component md, 1,356 findings, 10 criticals hand-verified.
- **324 (#472)**: follow `plugin.json`-declared custom component paths
  (files / dirs / globs) — ~250 previously invisible md in the wild corpus.
- **325 (#474)**: scan output-style markdown (project `.claude/output-styles/`,
  plugin `output-styles/`, manifest `outputStyles`).
- **326 (#475)**: scan plugin `bin/` entries as Bash-PATH exec surface
  (AG-RC-001), any extension, binary-safe.
- **327 (#476)**: flag `bin/` entries shadowing core system commands
  (AG-RC-001 high) + name-scan NUL binaries.
- **328 (#477, docs)**: fresh-corpus (48 new repos, 21,638 files) precision
  sweep of 325–327: zero new FPs.
- **329 (#478)**: marketplace-entry declared components — local `source` roots
  gate like plugin roots even with no `plugin.json` (`strict:false`), entry
  `skills`/`commands`/`agents`/`outputStyles` merged via the r324 resolver.
  Honest zero measured wild delta (89 manifest-less local entries all happen
  to be covered by existing conventions today).

## Measured data (this checkpoint, local HEAD = #478 merged)

- Tests: **499 passing** (413 core + 56 cli + 30 config-convert); suites green
  on Node 22 (ubuntu/macos/windows in CI).
- Core coverage: **94.15% stmts / 85.44% branch / 99.04% funcs**.
- Self-scan: **227 files, 21 findings, ~0.80 s** (unchanged through the block —
  the new surfaces add no self-noise).
- Production consistency: advisory API **99**, feed **99**, site 200 (checked
  pre-intake; 100th entry ships with this PR and deploys on merge).
- npm (last month): mcp-agentgate **3,124**, core **3,355** — 21st consecutive
  flat checkpoint; distribution remains the biggest gap (owner decision).
- Published: cli/core **0.67.6**; rounds 322–329 patches pending next version
  PR.

## Advisory intake: MCPA-2026-0086

Automated watch (GHSA window, 8 days) surfaced one uncovered id:

- `GHSA-g23h-49jw-gw6q` / CVE-2026-19323 — **react-analyzer-mcp** (npm,
  1.0.0 only release): `analyze-project` passes caller-controlled
  `projectName` into `path.join(PROJECT_ROOT, subFolder)` unchecked → path
  traversal, arbitrary `.jsx`/`.tsx` read (public issue #3 with code paths;
  maintainer unresponsive; rolling release → `last_affected: 1.0.0`, same
  policy as MCPA-2026-0060). Severity low per GHSA CVSS 5.3/local.

Database 99 → **100**; schema validation green; bundled core db regenerated;
comparison-page count updated (CI count gate enforced it).

OSV malware exports: npm/PyPI ETags unchanged vs the r324 snapshots — no diff
material. No other uncovered ids; watch-ignore additions: none.
