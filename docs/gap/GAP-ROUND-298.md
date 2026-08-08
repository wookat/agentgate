# GAP-ROUND-298 — advisory sweep (clean) + Poetry table-form remote dependencies (AG-DP-007)

Date: 2026-08-08. Previous advisory sweep: round 295. Previous AG-DP-007 rounds: 294 (npm), 296 (PEP 508), 297 (wild-form sweep).

## Part 1: advisory routine sweep — zero new entries

- GHSA vulnerability-window watch (`node api/scripts/watch.mjs --dry-run`): **no uncovered
  MCP-related advisories** (round-295 watch-ignore entries hold; nothing new resurfaced).
- npm + PyPI OSV malware windows, diffed against the round-295 `all.zip` snapshots:
  **0 new `MAL-` ids in either ecosystem** (snapshots byte-identical — OSV export of
  2026-08-08 15:26 UTC; round 295 ran against the same export earlier the same day).
- Honest note: this window is unusually short (same-day re-sweep after rounds 296/297
  landed); the next advisory round should re-pull with a real multi-day window.

Competitor freshness spot-check while at it: snyk-agent-scan 0.5.16 (PyPI), thynkQ
mcp-scan 2.0.2, socket 1.1.155, osv-scanner v2.5.0, mcp-observatory 1.36.4 — all
unchanged since the round-278 comparison page date. npm last-month downloads for
mcp-agentgate: 3,124 (flat, sixteenth checkpoint).

## Part 2: closing the round-296 boundary — Poetry table-form git/url dependencies

Round 296 recorded as a boundary: Poetry table-form git dependencies
(`pkg = { git = "…", branch = "…" }`) were left undone because the general corpus had
zero occurrences. A *targeted* corpus proves the form is common in the wild.

### Corpus (real, targeted)

GitHub code search (`tool.poetry.dependencies` + `git`/`url`/`branch` in
`pyproject.toml`, three queries, 187 unique candidate files) → 138 wild `pyproject.toml`
manifests fetched to `~/corpora/r298/poetry/`.

### Before

All Poetry table-form entries were flattened to bare names (`Object.keys`): the remote
source was invisible — no AG-DP-007, and git-only names were sent to PyPI registry
lookup as if they were registry packages.

### After (this round)

`refsFromPyproject` now inspects each `[tool.poetry.dependencies]`,
`[tool.poetry.dev-dependencies]`, and `[tool.poetry.group.<g>.dependencies]` entry:

- `{ git = "…", branch/tag/rev = "…" }` → remote spec `git+<url>@<ref>` (pip-style),
  classified by the existing round-292/294 policy: no ref or branch/tag → medium
  ("pin a full commit SHA"); `rev` = full 40-hex SHA → exempt.
- `{ url = "…" }` → non-registry archive URL → high. `.whl` added to the archive
  extension set (a direct wheel URL is a replaceable binary artifact, same as a zip;
  registry-host and commit-addressed exemptions unchanged).
- `{ path = "…" }` / version strings / array-of-constraints forms → unchanged
  (registry-name path).

### Wild results (real runs, built CLI, offline)

138 manifests → **30 AG-DP-007 findings that were previously invisible**
(8 high / 22 medium). Spot audit: all true positives — e.g. `karateclub` from a
GitHub branch (medium), `wxpython` from `extras.wxpython.org` wheel (high),
`en-core-web-sm` from a GitHub release archive (high). SHA-pinned repos
(e.g. golemfactory/goth, all `rev = "<40-hex>"`) correctly produce **zero** findings.

### Boundaries (documented, not implemented)

- Poetry array-of-constraints entries (`torch = [{url=…, platform=…}, …]`) fall back to
  the registry-name path; the corpus shows them only for platform-split wheels.
- `source`-based Poetry repositories (`[[tool.poetry.source]]`) are registry mirrors,
  not per-dependency remote sources — out of AG-DP-007 scope.

## Checks

470 → 471 tests green; lint/typecheck/build/`git diff --check` clean; patch changeset added.
