# GAP-ROUND-68 — public messaging lagged lockfile v2: READMEs still said "frozen as v1", no `--skills` mention

Date: 2026-08-06

## How the gap was found (real evidence)

Post-merge review of #132 (lockfile v2, `lock --skills`) against every public
entry point, same drift class as rounds 45/54:

- `README.md` line 58 still said "The lockfile format is frozen as v1" and the
  quick-start lock block had no `--skills`;
- `README.zh-CN.md` pointed only at the v1 schema;
- `packages/cli/README.md` (the npm-facing README) described the lock gate as
  tool-surface only.

The website was already updated in #132; only the GitHub/npm READMEs drifted.
Also audited `.pre-commit-hooks.yaml` for the round-67 bug class (invalid CLI
flags): all three hooks use default flags only — no issue.

## Fix (this round)

- Both READMEs: `lock --skills` line in the quick-start block, Lock feature
  row mentions optional skill/instruction pinning, lockfile-format note now
  lists v1 (frozen) and v2 (`docs/spec/lockfile-v2.md`).
- `packages/cli/README.md`: same, so the npm page is accurate when 0.15.0
  ships v2 support.

Docs-only; no changeset.

## Remaining gaps (unchanged)

- 0.15.0 version PR still blocked on GitHub Actions queue backlog (Release
  workflow for the round-65/66 merges queued > 1 h at the time of writing).
- Marketplace publishing of the action still deferred.
- Cloudflare repo secrets absent → manual deploys.
- npm trusted publisher not configured.
