# GAP-ROUND-124 — real-corpus FP sweep of round-123; .github source-scan FP fixed

Date: 2026-08-07 · Round type: false-positive verification + fix

## Sweep (real repos, 0.27.0-equivalent build)

Cloned and scanned four flagship agent repos that carry the newly covered
instruction surfaces:

- openai/codex, sst/opencode, anthropics/claude-code, google-gemini/gemini-cli.

## FP found and fixed

Round-123 added `.github` to the walked dot-dirs so
`copilot-instructions.md` could be found — but that also put every CI
workflow YAML through the source-level rules. On sst/opencode this
produced 6 false-positive AG-RC-001 *criticals* for legitimate
`curl … | bash` install steps in GitHub workflows (`.github/workflows/*`,
`.github/publish-python-sdk.yml`). CI files are not MCP server source.

Fix: `.github` is now a skill-only dot-dir — walked, but only instruction
files are scanned there. opencode drops 30 → 24 findings (the 6 workflow
criticals gone); a poisoned `copilot-instructions.md` fixture still
reports. Self-scan of this repo unchanged at 17.

## Remaining hits reviewed (not FPs of the new surface)

- codex: 1× AG-SK-001 critical on
  `codex-rs/skills/src/assets/samples/plugin-creator/SKILL.md`
  ("Do not tell the user") — a bundled sample skill; the text genuinely
  contains a concealment instruction, and the path is not a test/fixture
  dir we quiet. Accurate flag on real shipped content.
- gemini-cli: 1× AG-SK-001 critical (exfiltration pattern) in a
  `.gemini/commands` TOML — pre-existing coverage (round 62), not from
  round 123.
- claude-code: 6× AG-SK-002 on plugin commands pre-approving Bash/Write —
  accurate, pre-existing rule behavior.
- opencode remaining criticals: `github/action.yml` + `patches/*.sh`
  curl|sh — non-hidden paths already scanned before round 123.
- Zero findings from AGENTS.md/CLAUDE.md/GEMINI.md/.rules across all four
  repos — the new root-instruction matching itself produced no FPs.

## Evidence

- Full suite green: core 203, cli 47, config-convert 23.
