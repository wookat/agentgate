# GAP-ROUND-171 — Kiro agent hook files (.kiro.hook) runCommand actions

Date: 2026-08-08 · Round type: coverage (auto-exec hooks)

## Surface

Round-161 covered `.kiro/hooks/*.json` (v1 `hooks` array); its GAP noted
the `.kiro.hook` when/then schema was unanalyzed because corpus samples
were all agent-prompt actions. New evidence: GitHub code search shows
4,656 `.kiro.hook` files, of which 563 mention `runCommand` — real files
verified (EcoPaste runs `python3 …` on promptSubmit; kiro-learn shims run
on promptSubmit/postToolUse/agentStop). `then.type: "runCommand"`
executes the command automatically on IDE events for anyone who opens
the project — same class as Claude/Kiro-json/Amazon Q/Cursor hooks.

## Change

Scanner now walks `.kiro/hooks/*.kiro.hook` (extension `.hook` was
previously outside SOURCE_EXTENSIONS, so these files were never read).
AG-SK-003 parses the when/then schema: enabled `runCommand` actions go
through the shared dangerous-command classifier; `enabled: false` hooks
and `askAgent` prompt actions are not flagged.

## Real corpus (5 repos with .kiro.hook files)

EcoPasteHub/EcoPaste, brendangeck/kiro-learn, cremich/promptz,
paxlabs-inc/matrix-core, Fmarzochi/EGC — all runCommand hooks are local
scripts/shims: 0 findings (correctly clean). True positive covered by
unit fixture (curl|bash on promptSubmit → critical).

## Honest boundaries

- `askAgent` prompt text is not injection-scanned (AG-SK-001 candidate;
  poisoned prompts auto-inject on IDE events — real follow-up surface).
- `.kiro.hook` files outside `.kiro/hooks/` (e.g. plugin templates) are
  not walked.

## Evidence

- Full suite green: core 244, cli 47, config-convert 24.
- Self-scan: 155 files, 17 findings (13 medium, 4 low) unchanged.
