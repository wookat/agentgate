# GAP-ROUND-1 — Production benchmark loop, round 1

Date: 2026-08-05. Reference tools (all actually installed and run — commands and
outputs recorded below, not README-read): **npm audit** (npm 10.9.8),
**osv-scanner v2.4.0** (official Linux binary), **socket CLI v1.1.153** (npm).
snyk CLI was excluded this round: it requires an authenticated account for any
scan, so there is no anonymous experience to compare. Benchmarked both
capability lines: `deps` (against all three) and MCP `scan` (output/UX
conventions, same reference set).

Real-world test subjects: `expressjs/express` (368 npm packages after
`npm i --package-lock-only`) and `pallets/flask` (full clone incl. examples
and tests) — plus a malformed-input directory.

## What the reference tools do well (observed)

### npm audit (`npm audit`, express)
- 0.4 s on a 368-package tree. Groups by vulnerable package, shows severity,
  advisory title + `https://github.com/advisories/GHSA-…` link per issue, and a
  concrete remediation (`fix available via npm audit fix --force` +
  "Will install mocha@11.3.0, which is a breaking change").
- Exit gate built in: exits 1 when findings ≥ `--audit-level`, so
  `npm audit --audit-level=critical` returned 0 on express (max was high).
- Broken `package.json` → loud, readable JSON parse error (EJSONPARSE), not a
  silent success.

### osv-scanner (`osv-scanner scan source -L package-lock.json`, express)
- 0.9 s. Table has OSV URL, CVSS score, ecosystem, package, installed version,
  **fixed version**, source file. Dev-dependencies are labelled `(dev)`.
- Summary line quantifies scope: "Total 3 packages affected by 4 known
  vulnerabilities (0 Critical, 2 High, 1 Medium, 1 Low) from 1 ecosystem.
  4 vulnerabilities can be fixed."
- Honest failure mode: without a lockfile it says "No package sources found"
  and exits 128 (distinct exit code), not a fake pass.

### socket CLI (`socket npm audit`, express)
- Clear branded header showing CLI version, token/org state, command, cwd — you
  always know what context you're in. Without a token it degrades gracefully
  and tells you which permissions/quota a command needs (`socket scan create
  --help` lists "Quota: 1 unit / Permissions: full-scans:create").

## Where AgentGate stands (same projects, mcp-agentgate@0.2.0)

- express: `deps` checked 46 refs across 142 files in 1.6 s, no findings. Good.
- **flask: 11 findings, 11 false positives (100 % FP rate).** All from source
  import extraction: `blueprintapp`, `js_example`, `flaskr`, `task_app`… are
  the repo's own local packages/example apps, and `yourapplication` / `name`
  come from **docstring example code** in `src/flask/config.py` /
  `src/flask/app.py`. A new user running `agentgate deps` on flask sees
  10 CRITICAL findings that are all noise → instant credibility loss. No
  reference tool has this failure mode (they scan manifests/lockfiles only).
- **Malformed `package.json` → silent `✔ No findings.` with exit 0.** npm audit
  errors loudly here. Silent pass on unparseable input is the worst possible
  behavior for a gate.
- Table output has no links (rule docs or remediation), no origin column;
  osv-scanner/npm audit both link every finding.
- No summary quantification beyond "N finding(s): …" and no "(dev)"-style
  origin marker (manifest vs import) in the table.

## Gap list

| # | Reference behavior | AgentGate today | Gap | Priority |
|---|---|---|---|---|
| 1 | No FP on first-party code (manifest/lockfile based) | 11/11 FP on flask from local modules + docstring imports | Local-module resolution + docstring/comment stripping for import extraction | **P0** |
| 2 | npm audit fails loudly on broken package.json | Silent `No findings`, exit 0 | Surface unparseable-manifest warnings on stderr + in report warnings | **P0** |
| 3 | Every finding links to an advisory/OSV page | No links in table/JSON | Add rule-doc URL per finding (agentgate.zalize.com/docs/rules/…) in table + SARIF `helpUri` | P1 |
| 4 | osv-scanner labels `(dev)`, shows source | Origin (manifest vs import, which file) only in message text | Add origin to table target column (e.g. `npm:foo (import)`) | P1 |
| 5 | Summary lines quantify scope ("Total 3 packages affected … can be fixed") | "N finding(s): 1 high …" | Enrich summary: refs checked, packages affected, ecosystems | P2 |
| 6 | socket header shows version/context | No version in output | `--debug` already prints diagnostics; add version to debug header | P2 |
| 7 | npm audit gates by default (exit 1 on any finding) | exit 0 unless `--fail-on` | Keep opt-in gate (documented contract), revisit in a future major | P2 (decision: keep) |

## Fixes shipped this round

- **P0-1**: `collect.ts` now (a) strips Python docstrings/comments and JS
  block/line comments before import extraction, (b) resolves local modules —
  any import matching a `*.py` file / package directory in the scan root, a
  sibling of the importing file, or a workspace `package.json` name is skipped.
- **P0-2**: unparseable `package.json` / `pyproject.toml` / requirements lines
  now produce warnings (stderr + report `warnings[]`), never a silent pass.
- **P1-3**: findings carry `helpUri` (rule docs); table prints a docs link per
  rule; SARIF rules get `helpUri`.
- **P1-4**: table target shows origin, e.g. `npm:lodahs` vs `pypi:requests (import)`.

## Regression verdict (fresh-eyes rerun after fixes)

Before/after on the same clones: flask goes **11 findings (10 critical / 1 high)
→ 5 low** — the local packages, docstring examples and the `flaskr` typosquat FP
are gone; the remaining 5 are runtime-generated modules in
`tests/test_instance_config.py`, honestly downgraded to `low` with an explicit
"imported only under a test/example path" message (manifest-declared
nonexistent packages stay critical). express stays clean (46 refs / 142 files,
~1.6 s). Malformed `package.json` now warns loudly on stderr and in
`warnings[]`. The seeded competitor-comparison fixture still exits 1 at
`--fail-on high` (no lost recall).

Honest answer to "are we as good as the best reference?": after this round the
`deps` false-positive story matches the reference tools on the projects tested;
output link/UX polish now partially matches (links + origin), osv-scanner's
fixed-version remediation column has no equivalent for us yet (our findings are
not version-range vulns). Biggest remaining gaps for round 2: MCP `scan`
line's remediation guidance, Windows/macOS verification, and performance
numbers on a very large monorepo.

## Round 2 plan

1. MCP `scan` UX: per-rule remediation hint + doc link parity with `deps`.
2. Large-scale perf: run `deps`/`scan` on a 2 000+ file monorepo, record time/RSS.
3. macOS/Windows smoke verification (document or CI matrix).
4. Evaluate lockfile-aware `deps` (scan `package-lock.json`/`uv.lock` transitives).
