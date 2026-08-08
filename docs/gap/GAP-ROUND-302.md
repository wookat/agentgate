# GAP-ROUND-302 — AG-DP-007 covers lockfile-resolved remote sources (lockfile poisoning)

Date: 2026-08-08. Closes the boundary recorded in GAP-ROUND-301.

## Gap

`package-lock.json` / `yarn.lock` `resolved` fields can point any package —
including transitive ones no manifest mentions — at a git remote or branch
tarball (`https://codeload.github.com/…/tar.gz/main`, `git+ssh://…`). This is
the classic lockfile-poisoning shape: the manifest diff looks clean, the
lockfile hunk is thousands of lines nobody reads, and `npm ci` installs
whatever the ref points at today. Before this round lockfiles were only used
for version resolution; `resolved` sources were never inspected.

## After (this round)

- `package-lock.json` (v1/v2/v3 sections) and `yarn.lock` (v1) are walked
  (dedicated 20 MB cap — lockfiles routinely exceed the 1 MB manifest cap);
  each remote-shaped `resolved` (git+/git:/ssh:/http(s)) becomes a remote spec
  with context `lockfile resolved`, scored by the existing AG-DP-007 policy.
- `codeload.github.com/<o>/<r>/(tar.gz|zip)/<ref>` is now classified as a
  git-ref-addressed source (medium when the ref is mutable; a 40-hex ref is
  already exempt via the commit-archive rule).
- Exempt: default registry hosts, and version-addressed registry-path tarballs
  (`…/-/name-version.tgz`) on **any** host — mirror/private registries
  (registry.npmmirror.com etc.) are configuration, not poisoning.
- Deduped against manifests: a remote dep declared in package.json is reported
  once from the manifest; only lockfile resolutions no manifest accounts for
  are reported from the lockfile.

## Wild results (real runs, built CLI, offline)

Targeted GitHub corpus (55 wild repos' package-lock.json / yarn.lock with
git+ssh / codeload / git+https resolved fields, fetched with sibling
package.json): raw analysis found 51 git/codeload resolved entries of which 30
were undeclared in the manifest; after SHA-pin exemptions the scanner reports
**15 previously invisible lockfile-resolved findings (all medium)**, spot-audit
all true positives:

- the widespread `distubejs/prism-media tar.gz/main` branch tarball — pulled in
  transitively by distube, undeclared in any of those repos' own manifests
  (12 repos);
- `gluegun` resolved from `git+ssh://git@github.com/…` in messari/subgraphs;
- RIAEvangelist/node-ipc (the protestware package) branch tarball in the corpus
  raw scan — SHA-pinned entries correctly stay silent.

255 registry.npmmirror.com resolutions in the corpus: zero findings (registry-
path exemption). agentgate self-scan (pnpm lockfile): zero findings.

## Boundaries

- `pnpm-lock.yaml` remote-tarball dependency keys are not parsed (pnpm stores
  them differently per lockfile version; the repo-level manifest declaration is
  still covered). Candidate for a future round with real corpus evidence.
- Lockfile `integrity` hash verification (does the recorded hash match the
  artifact?) requires network fetches — out of scope for a static scan.

## Checks

473 → 474 tests green; lint/typecheck/build/`git diff --check` clean; patch changeset added.
