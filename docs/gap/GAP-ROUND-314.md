# GAP-ROUND-314 — goose `.goose` project tree + symlink-aliased skill trees

## Context

Deployment check after #456–#458: production site 200; advisory API, feed, and index all consistent at 99. Client-version window unchanged (Claude Code 2.1.226 / Codex 0.147 / Gemini CLI 0.54.4 / Copilot CLI 1.0.78 / opencode 1.18.15 / Crush 0.88.1 / Kilo CLI 7.4.20 / Qwen Code 0.21.8). Continued the round-313 upstream-source method on goose.

## Gap 1 — `.goose` never walked

goose upstream (`crates/goose/src/skills/mod.rs`, `sources.rs`, `agents/platform_extensions/summon.rs`) reads project-level `.goose/skills`, `.goose/agents` (subagent Markdown), and `.goose/recipes` (recipe YAML/JSON). `.goose` was missing from `AGENT_DOT_DIRS`, so all three were invisible — including recipe files that our shape-gated goose-recipe rules (rounds 214–222) would otherwise scan.

Fix: `.goose` added to `AGENT_DOT_DIRS`; `goose` added to the shared skills/agents dir group in `SKILL_FILE`. goose's `SkillFrontmatter` reads only name/description, so `.goose/skills` joins `ALLOWED_TOOLS_INERT_FILE` (same policy as `.crush/skills`, round 313).

Wild evidence: GitHub reports ~1,216 `SKILL.md` under `.goose/skills` and ~114 YAML under `.goose/recipes`. 5-repo sweep: 490 previously invisible `.goose` files now scanned, 0 new FPs.

## Gap 2 — symlinked skill files silently dropped (found by the sweep)

block/buzz (Block's own repo) commits `.goose/skills/*/SKILL.md` as **symlinks** to shared in-repo files; awesome-genmedia/skills aliases one `.agents/skills` tree into ~40 client dirs via symlinked directories. The walker used `Dirent.isFile()/isDirectory()`, which are false for symlinks — so a symlinked SKILL.md was never scanned and never lockable (this also explains genmedia's zero-file anomaly recorded in round 313).

Fix: `walk()` now follows symlinks whose realpath stays inside the scan root (escaping links are skipped), and dedupes every directory by realpath — so alias trees are walked exactly once and symlink cycles cannot loop.

Evidence:
- Regression tests: symlinked SKILL.md → critical AG-SK-001 at the discovered path; link escaping the root not scanned; self-referential dir link terminates (skipped on Windows runners — symlink creation needs elevation).
- block/buzz: 2 previously invisible symlinked skills now scanned.
- genmedia: 576 skills scanned exactly once (579 files total; alias dirs deduped — before dedupe the same content was double-reported under two path spellings).
- Self-scan unchanged (226 files, 21 findings); full suite green.

## Boundaries

- goose global dirs (`~/.goose`, `~/.config/goose`, `GOOSE_RECIPE_PATH`) are not repo-carried — out of scope.
- Which alias path a deduped tree is reported under follows directory iteration order (first claimant); content is scanned exactly once either way.
