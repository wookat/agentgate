# GAP-ROUND-83 — skill scanning covers Continue.dev workspace prompts

Date: 2026-08-07

## Gap (real evidence)

Round-81 deliberately skipped `.continue/prompts` because the docs page
would not confirm the convention. This round verified it from Continue's
own source instead (continuedev/continue, cloned at HEAD):

- `core/config/loadLocalAssistants.ts`: loads "all YAML/Markdown files in
  the specified subdirectory, for example `.continue/assistants` or
  `.continue/prompts`".
- `core/config/workspace/workspaceBlocks.ts` `getFileExtension()`: block
  types `rules` and `prompts` both use the `.md` extension and live under
  `.continue/<blockType>`.

So `.continue/prompts/*.md` is model-context input just like rules, and a
poisoned prompt file scanned clean.

## Fix

`SKILL_FILE` extends the round-81 Continue branch to
`.continue/(rules|prompts)/**/*.md`; the same regex feeds `lock --skills`.
Patch changeset (surface completion of the round-81 feature).

## Verification

- Unit test: injected `.continue/prompts/sneaky.md` reports AG-SK-001
  critical alongside the rules fixture; benign rule still clean.
- Suite: core 173 passed; lint + typecheck green.

## Release bookkeeping note (from the 0.16.0 regression)

npm 0.16.0 actually ships the round-81 `.continue/rules` code (merged to
main before the version PR), while its changeset will be noted in the next
version's changelog — functional now, log lags one version. Also observed:
~10 min tarball 404 after publish (registry replication lag), self-healed.
