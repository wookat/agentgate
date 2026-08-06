# GAP Report — Round 55 (skill-rule FP sweep on real marketplace repos)

## Method (real runs, 2026-08-07)

Scanned three fresh clones with the local 0.12.0 build:

| Repo | Findings | Skill findings |
|---|---|---|
| anthropics/claude-code | 7 | 6 (all AG-SK-002 on official plugin commands) |
| davila7/claude-code-templates (~133 skills) | 148 | 133 |
| hesreallyhim/awesome-claude-code | 0 | 0 |

## Findings

- **AG-SK-002 hits are true positives by rule semantics**: even Anthropic's
  own `plugin-dev`/`pr-review-toolkit` plugins pre-approve unscoped `Bash` —
  the rule flags a real pre-approval, not a bug. No change.
- **Both AG-SK-001 criticals in the 133-skill sweep were false positives of
  one class**: injection strings quoted inside fenced code blocks
  (a NeMo-Guardrails example listing jailbreak strings as *blocked* input;
  a pentest doc using `<secret>` as a CLI placeholder). Same class as the
  2 FPs recorded in GAP-ROUND-46.

## Fix

`AG-SK-001` injection-pattern matches whose line falls inside a fenced code
block (``` or ~~~) are downgraded to `low` with an explicit "quoted example
content, but review it" message. They stay visible but no longer fail a
`--fail-on high` gate. Hidden-Unicode detection is unchanged (`critical`
everywhere — invisible characters have no legitimate quoting use).

Post-fix re-run: both marketplace FPs report `low`; the malicious fixture
and all prior tests still report `critical` (155 core tests green).

## Not changed

- AG-SK-002 severity on official Anthropic plugins — flagging unscoped
  `Bash` pre-approval is the rule working as designed.
