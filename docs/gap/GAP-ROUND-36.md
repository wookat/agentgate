# GAP Report — Round 36 (docs pinned integrations to the v0.1.0 tag)

## Gap

Every GitHub Action and pre-commit snippet in our docs pinned
`wookat/agentgate/packages/action@v0.1.0` / `rev: v0.1.0` — a 35-releases-old
tag. Anyone copy-pasting got a working but stale integration: the v0.1.0
action.yml predates `deps` command support, and the v0.1.0
`.pre-commit-hooks.yaml` lacks the `agentgate-deps` hook entirely (verified
via `git diff v0.1.0 main` on both files).

## Fixed

All doc references updated `v0.1.0` → `v0.7.2` (current latest tag):
`README.md`, `README.zh-CN.md`, `packages/action/README.md`,
`.pre-commit-hooks.yaml` header comment, and
`website/src/content/docs/docs/cli/deps.md`.

## Honest limits

- These pins will go stale again with each release; bumping them is now part
  of the release-collection checklist (tag → update doc pins in the next
  round). A doc-lint that greps for old tags would automate this — deferred.
- The action itself runs `npx mcp-agentgate@latest` regardless of ref, so the
  stale pin mainly affected the newer inputs/hooks, not the scan engine.
