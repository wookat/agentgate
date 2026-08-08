# GAP-ROUND-303 — pnpm-lock.yaml remote resolutions + advisory window

Date: 2026-08-08. Closes the pnpm-lock boundary recorded in GAP-ROUND-302.

## Advisory window (honest zero)

- GHSA watch (authenticated): no uncovered MCP-related advisories.
- OSV npm/PyPI `all.zip`: ETags still byte-identical to the r295 snapshots
  (npm `60a9dfb…`, PyPI `0539f5e…`) despite fresh `Last-Modified` headers —
  the upstream export content has not changed, so there is nothing to diff.
  No advisories added; next advisory round should re-check the ETags first.

## Gap

Round 302 covered `package-lock.json` / `yarn.lock` `resolved` sources but not
`pnpm-lock.yaml`: pnpm records remote sources as `resolution: {tarball: …}`
values (v5/v6/v9) and, for v6/v9, `name@<url>` package keys. A poisoned pnpm
lockfile could point any package at a mutable branch tarball or git remote
with zero warnings.

## After (this round)

- `pnpm-lock.yaml` packages-section blocks are parsed (all three key shapes):
  v6/v9 `name@<url>` keys, v5 URL/path keys with a `name:` field, and
  `/name@version` keys with a mirror tarball. Remote-shaped resolutions become
  `lockfile resolved` remote specs under the same AG-DP-007 policy and the
  same manifest-declared dedupe as round 302.
- pnpm git-type resolutions (`type: git` + `commit:`) are commit-pinned by
  construction; the mutable manifest ref is covered by the manifest pass.
- Real FP class found and fixed during the corpus run: cnpm-style mirror
  tarball paths (`/name/download/[@scope/]name-version.tgz` on
  registry.npmmirror.com, registry.nlark.com, r2.cnpmjs.org,
  registry.npm.taobao.org) are version-addressed registry paths —
  now exempt alongside the standard `/-/` form. Before the fix the corpus
  produced 64 false highs; after, zero.

## Wild results (real runs, built CLI, offline)

Targeted GitHub corpus: 74 wild repos' pnpm-lock.yaml (+ sibling
package.json), 3,152 tarball resolutions across lockfile v5.3/5.4/6.0/9.0.
**8 previously invisible findings (5 high / 3 medium)**, spot-audit all true
positives: GitHub Releases tarballs (aspect-build test packages), the sheetjs
CDN tarball (`cdn.sheetjs.com/xlsx-0.20.3.tgz`, round-294 severity precedent),
and undeclared codeload branch tarballs (`@primer/octicons`,
`@datasworn-community-content/ironsmith`). ~2,300 mirror-registry resolutions:
zero findings after the cnpm-path exemption. agentgate self-scan (own
pnpm-lock.yaml): zero findings.

## Boundaries

- pnpm `link:`/`file:` and workspace resolutions are local, not collected.
- Lockfile `integrity`-hash verification still requires network — out of scope.

## Checks

474 → 475 tests green; lint/typecheck/build/`git diff --check` clean; patch changeset added.
