# GAP Report — Round 46 (real-world FP/FN sweep of the skill rules)

## Method

Scanned real public repos with 0.11.0-equivalent local build:
anthropics/skills (18 SKILL.md), obra/superpowers (14), wshobson/agents
(180 SKILL.md + plugin commands), VoltAgent/awesome-claude-code-subagents.

## Found

1. **False negative (fixed):** wshobson/agents declares `allowed-tools` as a
   YAML flow list on a continuation line (`["Read", "Write", "Bash", ...]`).
   The parser returned nothing — a silent miss on the exact overprivilege
   AG-SK-002 targets. Now parsed; the three plugin command files correctly
   report unscoped Bash (high) + Write/Edit/WebSearch/WebFetch (medium).
2. **Surface gap (fixed):** slash-command and agent markdown (`.claude/commands/`,
   `plugins/<name>/commands|agents|skills/`) support the same frontmatter
   grants and dynamic-context injection as skills but were not in the scan
   surface. SKILL_FILE now covers them.
3. **False positives (documented, not fixed):** prompt-engineering content
   (wshobson/agents llm-application-dev) trips AG-SK-001 twice — a template
   discussing exfiltration-style wording and a `conversation_history` variable
   matching a poisoning marker. Inherent to pattern rules on prompt-education
   text; loosening INJECTION_PATTERNS would weaken AG-TP-001. FP rate across
   the sweep: 2 findings / 200+ instruction files.

## Verified

- anthropics/skills and obra/superpowers still scan clean (0 findings).
- New unit test: flow-list grant in `.claude/commands/*.md` → high + 2 medium.
- Full suite green (153 core + 34 cli + 9 config-convert).
