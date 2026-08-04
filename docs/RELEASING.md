# Releasing

Releases are automated with [changesets](https://github.com/changesets/changesets).

## Day-to-day

1. Every user-facing change lands with a changeset: `pnpm changeset`
   (pick bump level, write a summary). CI does not require one for
   internal-only changes.
2. On merge to `main`, the release workflow opens/updates a
   **"chore: version packages"** PR that bumps versions (`mcp-agentgate` and
   `mcp-agentgate-core` are version-fixed) and updates CHANGELOGs.
3. Merging that PR triggers `pnpm release`, publishing both packages to npm
   with `--access public`.

## Tag-triggered publish

Pushing a `v*` tag (e.g. `git tag v0.2.0 && git push origin v0.2.0`) also runs
the release workflow: it builds, tests, and runs `pnpm release` directly,
publishing every workspace package at its current `package.json` version.
Use this to (re)publish an exact revision outside the changesets PR flow —
make sure versions were already bumped (e.g. via the version PR) before
tagging, since npm rejects re-publishing an existing version.

## npm auth & provenance

The release workflow runs with `id-token: write` and
`NPM_CONFIG_PROVENANCE=true`, so published packages carry npm provenance
attestations.

Auth options (either works):

- **Trusted publishing (preferred, token-less):** on npmjs.com, configure
  `mcp-agentgate` and `mcp-agentgate-core` with GitHub Actions as a trusted
  publisher (repo `wookat/agentgate`, workflow `release.yml`). No secret
  needed.
- **Token fallback:** set the `NPM_TOKEN` repository secret (automation
  token with publish rights for both packages).

## Verifying locally

```bash
pnpm build && pnpm -r publish --dry-run --no-git-checks
```
