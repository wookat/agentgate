# GAP-ROUND-428 — routine windows + GoReleaser-config source-scan exemption

Date: 2026-08-03. Scanner base: `main@bbe0161` (post-0.67.57).

## Advisory windows

- **Authenticated watch** (`api/scripts/watch.mjs` with a real token):
  `No uncovered MCP-related advisories found.`
- **OSV npm**: ETag changed (`"53128261faf337a1aa51e8c5812805fd"`), but the
  full MAL set diff against the r422 snapshot is empty (219,359 → 219,359,
  0 new IDs). Zero net-new.
- **OSV PyPI**: ETag `"b4c2b2138b4bedcbee06b632a0cedc56"` — unchanged since
  r426. Zero net-new.

## Client version window (all nine unchanged from r426)

```text
claude-code v2.1.227 | codex 0.147.0 | gemini-cli v0.54.4 | qwen-code v0.21.9
crush v0.88.1 | copilot-cli v1.0.79 | zed v1.14.2 | opencode v1.18.16 | goose v1.45.0
```

## Production consistency

website 200 · advisory API 109 · advisory feed 109 (`items`) · npm latest
→ 0.67.57.

## Generalized fix: GoReleaser configs are CI pipeline configs

The r427 singleton (`ystsbry_revu` `.goreleaser.yaml` — curl|sh in the
release-notes `header:` fenced block graded critical "source pipes") found a
second independent sample in the historical corpus: `liza-mas_liza` (r401)
`.goreleaser.yaml:101` — the identical shape (install one-liner inside the
release-notes template), also graded critical by 0.67.57. Two independent
repos → generalized.

Fix: add `\.?goreleaser(\.[\w-]+)?\.ya?ml` to `CI_CONFIG_FILE` in
`packages/core/src/scanner.ts` — GoReleaser configs are release-pipeline
build automation, the same rationale as the r355 exemption for GitLab CI /
CircleCI / Azure / Buildkite et al. Regression test added (goreleaser
release-notes header skipped at root and nested; sibling `setup.sh` with the
same curl|sh still reports).

Head-to-head (npm 0.67.57 vs patched) over the full 140-repo r427 corpus:
457 → 456 findings, diff is exactly the one target critical removal, zero
other drift. Spot checks on the other historical goreleaser repos
(code-nexus r413, DataDog_pup r415, lingqu-ai r427): no findings either
side, unchanged.

## r427 residual

The other r427 singletons (autopw2 execution-fixture metadata redirect)
remain single-repo — deferral stands.

## Gate

`pnpm build` / `pnpm test` (544 core + 60 cli + 30 convert) / `pnpm lint` /
`pnpm typecheck` / `git diff --check` all green locally. GitHub Actions
outage ongoing — ordinary CI did not run; GitGuardian + local gates as
agreed. Patch changeset added.
