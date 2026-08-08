# GAP-ROUND-304 — wild-corpus precision sweep of lockfile-resolved AG-DP-007

Date: 2026-08-08. Round-297-style sweep of the rounds 302/303 surface.

## Corpus

Targeted GitHub code search across all three lockfile forms (codeload,
git+ssh, git+https, releases-download tarballs): 323 wild lockfile+manifest
pairs fetched (`~/corpora/r304`), scanned with the built CLI offline.

## Results

42 lockfile-resolved AG-DP-007 findings (22 high / 20 medium) across the
corpus, spot-audit true positives:

- 17× `prism-media` distube branch tarball (`tar.gz/main#workaround.tar.gz`)
  — the round-302 wild pattern, reproduced at larger scale.
- Releases-download tarballs pinned only by a movable release tag:
  `jq-web`, `tsc-multi` (stainless-api), 10× `@webassemblyjs/*` fork
  (mitschabaude), 4× `@ucl-nuee/*`, `@react-icons/all-files`,
  `@types/three` fork — all high.
- `gluegun` git+ssh, `@datasworn-community-content/ironsmith` short-sha
  codeload (7-char sha is not a full pin — stays medium per policy).

## Real FP found and fixed

pnpm snapshots-section keys carry **nested** peer suffixes, e.g.
`name@<url>(encoding@0.1.13)(eslint-config-prettier@10.1.8(eslint@8.57.1))`.
The single-pass paren strip left a dangling `)` on the spec, which broke the
40-hex commit-archive exemption — a commit-pinned `@primer/octicons` codeload
tarball reported a false medium. The key is now truncated at the first `(`;
the corpus paren-spec count went from 1 to 0 and the false medium disappeared
(42 findings, all verified shapes). Regression pinned in the pnpm fixture.

## Boundaries

- Short-sha (`tar.gz/79bc272`) commit tarballs remain medium: 7-hex prefixes
  are not accepted as pins anywhere else in AG-DP-007 either.

## Checks

475 tests green (regression folded into the existing pnpm fixture);
lint/typecheck/build/`git diff --check` clean; agentgate self-scan clean;
patch changeset added.
