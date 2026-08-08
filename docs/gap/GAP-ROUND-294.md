# GAP-ROUND-294 — `deps`: mutable remote dependency specifiers (AG-DP-007)

Round type: boundary closure from GAP-ROUND-292.

## Gap

Round 292 gave AG-SC-001 remote-source classification for MCP *server launch
specs*, and recorded a boundary: dependencies declared in `package.json` with a
git or archive-URL specifier are a different pipeline (`agentgate deps`), which
silently treated them as "declared locals" and emitted **zero** findings.
That is exactly the shape of the round-291 real malware case: the
`@ohos-ports/codex` squat depended on
`https://gitcode.com/api/v5/repos/.../openai-codex-0.140.0.tgz?ref=main` — a
branch-addressed tarball whose content the attacker can swap at any time.

## Wild-corpus evidence (no invented data)

All `package.json` manifests across the existing corpora: **22,820** real
dependency specs.

- 6 unpinned git specs (e.g. `github:Kilo-Org/app-builder-db#main`,
  `github:rhashimoto/wa-sqlite#v0.9.11` — tags are movable refs).
- 8 non-registry archive URLs (mostly SheetJS's own
  `https://cdn.sheetjs.com/xlsx-<ver>/xlsx-<ver>.tgz`, plus a GitHub Releases
  tarball, plus the r291 malicious gitcode tarball itself).
- 0 full-commit-pinned specs and 0 registry-tarball specs in the corpora
  (both exempt classes covered by unit tests).

Before this round all 14 produced no output; after, all are flagged and the
malicious gitcode form scores **high** (verified end-to-end on the r291
tarball).

## Fix

- `collectDependencies` now returns `remoteSpecs` (name/spec/file/section) for
  git and http(s) dependency specifiers; they remain "declared" for
  hallucination checks, unchanged.
- New `scoreRemoteSpecs` → `AG-DP-007`, reusing round-292's classifier
  (`remoteSourceSpec` + immutable-spec exemption from `rules/supply-chain.ts`):
  unpinned git ref → **medium** (pin a full 40-char commit SHA);
  non-registry archive URL → **high** (in-place replaceable, no provenance).
  Full commit SHA and registry tarball hosts are exempt. No network needed —
  runs in `--offline` too.
- SARIF security-severity 7.0; deps docs and CLI contract updated.

## Severity rationale

Same policy and precedent as AG-SC-001 (rounds 256/292): a movable git ref is
version drift with a known remedy (medium); an arbitrary archive URL has no
version, no registry metadata, and silently replaceable content (high). The
vendor-official SheetJS CDN tarballs score high knowingly: version-addressed
but non-registry hosting with no provenance; the message points at lockfile
integrity hashes as the mitigation.

## Boundaries

- PyPI direct-URL requirements (`pkg @ https://…`, `git+https` in
  requirements.txt / pyproject) not covered this round — no wild evidence in
  the corpora yet; recorded as a follow-up candidate.
- Plain hosted-git HTTPS URLs without `.git`/archive suffix are not
  classified (same boundary as round 292).
