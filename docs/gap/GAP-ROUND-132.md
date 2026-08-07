# GAP-ROUND-132 — VS Code custom agent files (.github/agents)

Date: 2026-08-07 · Round type: instruction-surface coverage

## Source (official)

VS Code docs, "Custom agents"
(https://code.visualstudio.com/docs/agent-customization/custom-agents):

- Workspace custom agents live in `.github/agents/`; files use the
  `.agent.md` extension (legacy `.chatmode.md` still supported).
- "VS Code detects any .md files in the .github/agents folder of your
  workspace as custom agents."
- The Markdown body is the agent's instructions — injected verbatim,
  same poisoning surface as prompt files/instructions.
- Claude-format agents in `.claude/agents/` are also loaded — already
  covered by our existing `.claude/agents/*.md` pattern.

## What shipped

- `SKILL_FILE` matches `.github/agents/**.md` (any .md per the docs, not
  just `*.agent.md`); `.github` was already walked for instruction files
  (round 124's workflow carve-out untouched).
- `lock --skills` therefore pins these agent files too.
- Fixtures: poisoned `.agent.md` + legacy `.chatmode.md` report
  AG-SK-001 critical; a benign read-only reviewer agent reports nothing.

## Honest boundaries

- User-profile agents (`~/.copilot/agents`) are outside the project tree
  — not scanned (same boundary as Kiro global steering, GAP-121).
- Frontmatter `tools:` uses VS Code tool names, not `allowed-tools`;
  AG-SK-002 grant analysis doesn't apply to this format yet — recorded
  as a candidate follow-up if unscoped dangerous grants prove common.

## Evidence

- Full suite green: core 210, cli 47, config-convert 24.
