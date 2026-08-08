# GAP-ROUND-292 — remote-source MCP server launch specs (git / VCS shorthand / archive URL)

**Round type:** boundary close-out from GAP-ROUND-291 (mutable remote tarball dependency shape) applied to the
scan surface we already own: the launch spec of a configured MCP server.

## Trigger

Round 291 verified `@ohos-ports/codex`, which resolves its runtime from a **mutable gitcode.com branch tarball**.
That round recorded the shape as an open coverage question. This round checked what AG-SC-001 actually says when
an MCP server itself is launched from a remote source instead of a registry package.

## What the rule said before (real output)

```
npx https://gitcode.com/api/v5/repos/x/y/raw/packages/openai-codex-0.140.0.tgz?ref=main
→ MEDIUM: runs unpinned package "https://gitcode.com/…tgz?ref=main" … Pin an exact version (e.g. https://gitcode.com/…@1.2.3)

npx github:acme/mcp-server
→ MEDIUM: … Pin an exact version (e.g. github:acme/mcp-server@1.2.3)
```

Both were *reported* (no silent gap), but with registry-flavored messaging and pin advice that cannot be followed:
there is no registry version to pin on a raw archive URL, and `github:owner/repo@1.2.3` is not how a git spec is
pinned. An HTTPS archive was also treated as severity-equivalent to an unpinned registry version, although the
artifact behind such a URL can be replaced in place, with no version, no registry metadata, and no provenance —
strictly worse than registry drift (this is exactly the `@ohos-ports/codex` shape).

## Corpus evidence (existing corpora, no fabricated data)

917 parsed MCP config files across the r249/r265/r266/r283/r284 and r193–r258 corpora:

| Shape | Wild count | Example |
| --- | --- | --- |
| `git+https://…` (no commit pin) | 25 | `uvx --from git+https://github.com/oraios/serena serena-mcp-server` (Serena's own documented install — 24 configs) |
| VCS shorthand `github:owner/repo` | 2 | `npx github:Storks/obsidian-mcp` (`rudironsoni__obsidian-advanced-code-editor/.copilot/mcp-config.json`) |
| Non-registry archive URL | 0 in configs | shape attested by `@ohos-ports/codex` (npm dependency form, MAL-2026-13210, round 291) |

One wild spec uses a git *tag* (`git+https://github.com/oraios/serena@v0.1.4`) — tags are movable refs, not pins.

## Change

`AG-SC-001` now classifies remote-source launch specs before the registry path:

- **git source** (`git+…`, `git://`, `ssh://`, `.git` URL, `github:`/`gitlab:`/`bitbucket:` shorthand) without a
  40-char commit pin → medium, message names the shape and advises pinning a full commit SHA (tags called out as
  movable). Commit-pinned specs (`…#<40-hex>`) are not flagged (unchanged behavior, now tested).
- **archive URL** (`.tgz`/`.tar.gz`/`.zip`) on a non-registry host → **high**: the host can replace the contents
  behind the URL at any time; advice is to vendor or install from a registry with a pinned version. Severity
  precedent: round 256 (remote-URL OpenCode instructions = high, mutable remote content executed/injected per
  session). Version-addressed registry tarball hosts (`registry.npmjs.org`, `registry.yarnpkg.com`,
  `files.pythonhosted.org`) are immutable and not flagged.
- `serverPackageRef` no longer treats `github:owner/repo` shorthand as an npm package name for advisory/registry
  lookups (URL specs were already excluded).
- Precision fix found while walking this path: the low `-y` auto-confirm finding claimed "combined with an unpinned
  spec this installs new upstream code silently" even when the spec **was** pinned; it is now only emitted alongside
  an unpinned/unpinnable spec.

## Verification

- New regression tests pin all six branches (git URL, tag, shorthand, sha-pinned, non-registry archive, registry
  tarball) plus the `-y` gating (378 core tests green; full suite 462).
- Wild re-scan: `rudironsoni__obsidian-advanced-code-editor` now reports `github:Storks/obsidian-mcp` as a git
  source with commit-pin advice; Serena `git+https` configs report the same shape (medium, actionable advice).
- `pnpm build && pnpm lint && pnpm typecheck` green.

## Honest boundaries

- The npm *dependency* form of the shape (a package.json dependency pointing at a mutable tarball, as in
  `@ohos-ports/codex`) lives in the `deps` surface, not server launch specs; wild config corpus showed 0 archive-URL
  launches, so the archive branch is attested by the malware sample only. Recorded as remaining follow-up if the
  shape shows up in configs.
- Custom config filenames outside the discovery set (e.g. `mcp-server.json`, rulesync trees) are out of scope, as
  before.
