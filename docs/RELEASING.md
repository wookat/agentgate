# Releasing

Releases are automated with [changesets](https://github.com/changesets/changesets).

## Day-to-day

1. Every user-facing change lands with a changeset: `pnpm changeset`
   (pick bump level, write a summary). CI does not require one for
   internal-only changes.
2. On merge to `main`, the release workflow opens/updates a
   **"chore: version packages"** PR that bumps versions (`agentgate` and
   `@agentgate/core` are version-fixed) and updates CHANGELOGs.
3. Merging that PR triggers `pnpm release`, publishing both packages to npm
   with `--access public`.

## npm auth & provenance

The release workflow runs with `id-token: write` and
`NPM_CONFIG_PROVENANCE=true`, so published packages carry npm provenance
attestations.

Auth options (either works):

- **Trusted publishing (preferred, token-less):** on npmjs.com, configure
  `agentgate` and `@agentgate/core` with GitHub Actions as a trusted
  publisher (repo `wookat/agentgate`, workflow `release.yml`). No secret
  needed.
- **Token fallback:** set the `NPM_TOKEN` repository secret (automation
  token with publish rights for both packages).

## Verifying locally

```bash
pnpm build && pnpm -r publish --dry-run --no-git-checks
```
