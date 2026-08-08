# GAP-ROUND-299 — uv source overrides ([tool.uv.sources]) join AG-DP-007

Date: 2026-08-08. Follows rounds 294 (npm), 296 (PEP 508), 297 (wild-form sweep), 298 (Poetry tables).

## Surface check first (no new client surfaces this window)

Client version sweep: Claude Code 2.1.226 (already reviewed round 287), Codex 0.147
(round 293), Gemini CLI 0.54.4 (release notes show no new repo-carried surface),
Copilot CLI 1.0.78, opencode 1.18.15. Nothing actionable — so this round closes the
remaining big PyPI remote-source gap instead: **uv**.

## The gap

uv (the now-dominant Python package manager) redirects registry names to remote
sources via `[tool.uv.sources]`:

```toml
[project]
dependencies = ["s2wrapper", "flash-attn"]

[tool.uv.sources]
s2wrapper = { git = "https://github.com/bfshi/scaling_on_scales.git" }
flash-attn = { url = "https://…/flash_attn-2.5.6+cu121-cp311-linux_x86_64.whl" }
```

Before this round the sources table was never read: both names were treated as plain
PyPI registry dependencies — the git/wheel redirection was invisible, and the
registry lookup checked a package that is not what actually gets installed.

## After (this round)

- `[tool.uv.sources]` entries with `git`/`url` shapes are collected (list-form
  platform-conditional entries supported: first remote entry wins).
- When a declared dependency (project.dependencies, optional-dependencies, PEP 735
  groups) matches a source override (PEP 503 name normalization), it is emitted as a
  remote spec instead of a registry ref, classified by the existing policy:
  unpinned/branch/tag git → medium, 40-hex `rev` → exempt, non-registry archive/wheel
  URL → high.
- Sources entries with `path`/`workspace`/`index` shapes keep the registry path;
  sources for undeclared names are ignored (uv ignores them too).

## Wild results (real runs, built CLI, offline)

Targeted GitHub corpus (`tool.uv.sources` + git/url, 109 candidates → 98 fetched wild
`pyproject.toml`): **64 previously invisible AG-DP-007 findings (12 high / 52 medium)**.
Spot audit all true positives — e.g. `flash-attn` prebuilt wheel from a personal GitHub
release (high), `transformers` tracking a git default branch (medium), `rev = "main"`
(a branch, not a SHA — correctly medium). SHA-pinned repos (e.g. yield-basis/yb-core,
all `rev = "<40-hex>"`) correctly produce **zero** findings.

## Boundaries

- `[tool.uv.sources]` in a *workspace member* redirecting via `{ workspace = true }`
  is a local path — registry path kept, correct.
- uv `index =` named-index redirection points at an alternative registry, not a mutable
  artifact — out of AG-DP-007 scope (same call as Poetry `[[tool.poetry.source]]`).
- `uv.lock` resolution data is not parsed; manifests are the declaration surface.

## Checks

471 → 472 tests green; lint/typecheck/build/`git diff --check` clean; patch changeset added.
