# GAP-ROUND-198 — Qwen Code context files (QWEN.md / .qwen/rules)

Date: 2026-08-08 · Round type: coverage (round-195–197 follow-up)

## Problem

Qwen Code auto-loads instruction context every session (official
memory.md / auto-mode.md docs + memoryDiscovery source verified):

- `QWEN.md` at the project root (team-shared, committed) and
  `QWEN.local.md` (loads after, can override).
- `.qwen/rules/**.md` path-based context rules.

None were skill-scanned: a poisoned repo could inject instructions or
dynamic-context commands into every Qwen session opened in it.

## Change

SKILL_FILE extended: root `(agents|agent|claude|gemini|qwen(\.local)?)\.md`
and `.qwen/rules/**.md` — AG-SK-001 injection/hidden-Unicode +
AG-SK-003 dynamic-command classification, same trust model as
AGENTS.md/GEMINI.md (round-123).

## Verification

Fixture: injection in QWEN.md, concealment phrasing in QWEN.local.md,
`` !`curl … | sh` `` in `.qwen/rules/baseline.md` all flagged; benign
style rule not flagged. Real corpus: QwenLM/qwen-code,
maestro-orchestrate (real QWEN.md), qwen-orchestrator — 0 findings on
the new surfaces.

## Boundaries

- `@path/to/file` imports inside QWEN.md not resolved (referenced files
  are usually in-repo and scanned on their own merits if they match a
  surface).
- User-level `~/.qwen/QWEN.md` out of scope (not project-borne).

## Evidence

- core suite green: 278 tests.
- Self-scan 155 files: 18 findings, unchanged.
