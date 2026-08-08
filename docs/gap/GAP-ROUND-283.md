# GAP-ROUND-283 — precision sweep of the round-282 Roo/Kilo command surface

## Corpus

Fresh GitHub corpus: full `path:.roo/commands extension:md` (996 code hits →
172 unique repos) plus `path:.kilo/commands extension:md` (14 repos); 180/186
repos cloned (6 deleted/renamed upstream), **2,009 wild command files**
scanned end-to-end with the built CLI on the round-282 branch.

## Result — one real FP class found and fixed

- 53 of 54 hits were AG-SK-002 `allowed-tools` grants (3 repos, e.g.
  `allowed-tools: Bash, Read, Write, Edit` in openspec/BMAD-style command
  packs copied from Claude-style commands).
- Verified in upstream source that both hosts **ignore** `allowed-tools`
  frontmatter: Roo-Code `src/services/command/commands.ts` parses only
  `description` / `argument-hint` / `mode`; Kilo CLI
  `packages/opencode/src/command/index.ts` schema has only
  `description` / `agent` / `model` / `subtask`. A pasted grant is inert —
  not an approval surface — so reporting "pre-approves without a permission
  prompt" was wrong for these clients.
- Fix: `ALLOWED_TOOLS_INERT_FILE` (`.roo/commands/*.md`, `.kilo/commands/*.md`)
  skips the allowed-tools check; everything else (AG-SK-001/003 text pipeline,
  `.claude/commands` allowed-tools) unchanged. Regression test pins the same
  file body firing in `.claude/commands` but not in `.roo`/`.kilo` commands.
- Remaining 1 hit: AG-SK-001 low — a known poisoning marker inside a fenced
  code block in a `.kilo/commands` file, exactly the deliberate quiet
  downgrade from round 55/58; correct behavior, left as is.

## Post-fix corpus numbers

2,009 wild command files → 1 low/quiet finding, 0 loud findings, 0 FPs.
