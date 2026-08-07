# GAP-ROUND-125 — Copilot path-specific instructions + prompt files

Date: 2026-08-07 · Round type: coverage expansion (instruction-file scanning)

## Gap found (follow-on to rounds 123/124)

Round 123 covered Copilot's repo-wide `.github/copilot-instructions.md`,
but GitHub's customization cheat sheet documents two more in-repo
instruction surfaces (docs.github.com/copilot/reference/customization-cheat-sheet):

- path-specific instructions: `NAME.instructions.md` "within or below"
  `.github/instructions/` (frontmatter `applyTo` glob) — auto-applied to
  matching requests;
- prompt files: `.github/prompts/*.prompt.md` — reusable prompts run
  from chat.

Both are model-context injections; neither was scanned or lockable.

## What shipped

- `SKILL_FILE` now matches `.github/instructions/**.instructions.md`
  (nested dirs included, per docs) and `.github/prompts/*.prompt.md`.
- `.github` stays a skill-only dot-dir (round-124 FP fix intact) —
  workflows are still not source-scanned.
- Tests: poisoned nested instructions file + poisoned prompt file report
  AG-SK-001; benign `applyTo`-scoped style instructions report nothing.
- Docs: skills guide lists both.

## Evidence

- Full suite green: core 204, cli 47, config-convert 23; website 65 pages.
