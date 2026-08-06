# GAP Report — Round 42 (skill `allowed-tools` grants were unanalyzed)

## Gap

Round 41 added skill-file scanning for poisoning content, but flagged its own
limit: the frontmatter was not analyzed. Per the official Claude Code skills
docs (code.claude.com/docs/en/skills), `allowed-tools` grants the listed tools
**without a permission prompt** for the invoking turn, and the docs explicitly
warn: "Review project skills before trusting a repository, since a skill can
grant itself broad tool access." A repo-checked skill with `allowed-tools:
Bash` is a standing self-granted RCE the user never gets prompted about.

## Fixed

- New rule `AG-SK-002` (category `overprivileged`): parses `allowed-tools`
  (inline string, comma/space separated, or YAML list) from SKILL.md
  frontmatter and flags dangerous unscoped grants:
  - `Bash` / `Bash(*)` → high (unrestricted shell execution)
  - `Write` / `Edit` unscoped → medium (unrestricted file writes)
  - `WebFetch` / `WebSearch` unscoped → medium (exfiltration channel)
  Scoped grants (`Bash(git add *)`) and read-only tools are not flagged.
- SARIF security-severity 8.0; docs section on the overprivileged rule page +
  rules index row.

## Verified

- 2 new core tests (mixed inline grant → high+medium; scoped/YAML-list benign
  → clean); suite green.
- Grammar cross-checked against the official docs fetched this round (inline,
  comma/space separated, YAML list, `Bash(pattern)` scoping, `${CLAUDE_SKILL_DIR}`
  substitution examples).

## Honest limits

- No YAML parser: the frontmatter extraction is a regex over the common forms;
  exotic YAML (flow sequences, anchors) may be missed — acceptable for a
  tripwire, revisit if real-world skills use them.
- `disallowed-tools`, `model`, and dynamic context injection (`` !`cmd` ``)
  are not yet analyzed; dynamic context is a candidate for a later round
  (a skill can run shell commands at load time).
