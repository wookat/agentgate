# GAP-ROUND-123 — root instruction files (AGENTS.md et al.) scan + lock

Date: 2026-08-07 · Round type: coverage expansion (instruction-file scanning)

## Gap found — the most ubiquitous instruction surface was unscanned

The agents.md standard (agents.md, adopted by Codex, Amp, Zed, Cursor and
others) plus the per-agent natives are read verbatim at session start:

- `AGENTS.md` / `AGENT.md` — nested files apply to their subtree
  (agents.md spec), so a poisoned file deep in a monorepo still loads.
- `CLAUDE.md` (Claude Code native, also nested), `GEMINI.md` (Gemini CLI).
- Zed `.rules` at the worktree root (zed.dev/docs/ai/instructions — Zed
  also reads `.cursorrules`/`.windsurfrules`/`.clinerules`/`AGENTS.md`…).
- GitHub Copilot `.github/copilot-instructions.md`.

We scanned niche per-client rule dirs (rounds 61/81/118/121/122) but not
these — arguably the highest-traffic instruction files in real repos.
`lock --skills` could not pin them either.

## What shipped

- `SKILL_FILE` now matches `agents|agent|claude|gemini.md` anywhere,
  `.rules` at the scan root only (per Zed: top level of worktrees), and
  `.github/copilot-instructions.md`; `.github` added to the walked
  dot-dirs.
- `lock --skills` pins them automatically.
- Tests: poisoned root `AGENTS.md`, nested `sub/CLAUDE.md`, root
  `.rules`, and copilot-instructions all report AG-SK-001; a `sub/.rules`
  is deliberately NOT matched; benign AGENTS.md/CLAUDE.md (taken from our
  own website tree) report 0 findings.

## FP verification (real corpora)

- Self-scan of this repo (which carries real `website/AGENTS.md` +
  `website/CLAUDE.md` and 8 GitHub workflow files now walked): findings
  unchanged at 17 — zero new findings from the expanded surface.
- Note: walking `.github` also puts workflow YAML through source rules;
  on this repo that produced no findings. Watching for FP reports.

## Deliberately NOT added (honest)

- Home-dir instruction files (`~/.config/zed/AGENTS.md`, `~/.claude/CLAUDE.md`):
  outside the project tree — same `scan --home` future noted in
  GAP-ROUND-121/122.

## Evidence

- Full suite green: core 202, cli 47, config-convert 23; website 65 pages.
