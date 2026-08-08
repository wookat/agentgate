# GAP-ROUND-317 — goose local memory files (.goose/memory/*.txt)

## Context

New-surface round. Client version window unchanged (Claude Code 2.1.226 / Codex 0.147.0 /
Gemini CLI 0.54.4 / Copilot CLI 1.0.78 / opencode 1.18.15 / crush 0.88.1 / kilo 7.4.20 /
qwen-code 0.21.8 / cline 3.0.51). Verified against goose upstream (`block/goose`) that the
summon platform's other project directories are already covered: `.agents/agents/*.md`
matches the skill matcher and `.agents/recipes/*.yaml` is caught by shape-gated recipe
parsing (end-to-end check confirmed critical hits for both).

## Gap — repo-carried goose memory was invisible to text scanning

`goose-mcp`'s memory extension stores *local* memories at `<working_dir>/.goose/memory/<category>.txt`
(`crates/goose-mcp/src/memory/mod.rs`). Retrieved memories are injected into the agent's
context (`retrieve_memories`, category `*` returns everything; global memories are even
appended to the extension's system instructions at startup). The local store is
repo-carried: anyone committing a poisoned category file plants text that becomes model
context for every collaborator who uses the memory extension in that repo.

The walker already entered `.goose` (round 314), so these files were source-scanned, but
`SKILL_FILE` did not match them — no AG-SK-001 injection/hidden-Unicode checks. Fix: add
`.goose/memory/*.txt` to the skill matcher (plain-text memories; upstream writes only
`<category>.txt`).

## Evidence

- GitHub code search: 54 in-repo `.goose/memory/*.txt` files (path search), 102 references.
- 8 wild repos cloned (r317 corpus: heynow, chorus, goose-rpg, simmer, rcct,
  fabric-schematics, medical-dashboard-system, bioinf-cli-env) — 27 memory files now
  scanned, **0 false positives** (all are genuine dev-notes memories).
- Regression: poisoned `development.txt` → AG-SK-001 critical; benign workflow notes silent.
- Full suite 486 green; self-scan unchanged (227 files / 21 findings).

## Boundaries

- Global memory (`~/.config/goose/memory/`) is user-local, not repository-carried — out of
  scope, consistent with prior rounds.
- Memory files also become lockable via `lock --skills` as a side effect of the matcher.
