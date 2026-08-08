# GAP-ROUND-321 — wild-corpus precision sweep of the manifest-gated plugin component surface

## Context

Round 319 gated `commands/`, `agents/`, and `skills/` markdown on a sibling plugin
manifest so standalone plugin repos' component files are skill-scanned. That round's
corpus was 6 repos; before trusting the gate at scale, this round runs the same
methodology as rounds 297/304: large wild corpus, verify every hit.

## Method

- GitHub code search for in-repo `.claude-plugin/plugin.json` (5 pages → 497 unique
  repos), cloned the first 118 (depth 1, corpus only, unmodified).
- 170 root-level `commands/`/`agents/`/`skills/` dirs across the corpus; 484 component
  markdown files within depth 3, 3,397 component markdown files scanned in total
  (including nested plugin layouts).
- Full `scan` per repo; every finding attributed to a component markdown file reviewed.

## Result

- **3,397 component markdown files scanned, 0 findings** — zero false positives and
  zero true positives. The wild population is currently benign developer tooling
  (slash commands, subagent prompts); the gate adds visibility without noise.
- No scanner defect surfaced; no code change needed this round.

## Boundaries

- Corpus skews to Claude Code plugins (search keyed on `.claude-plugin`); other
  manifest dirs (`.goose-plugin` etc.) are thin in the wild (round 318: one repo).
- Zero hits is a precision statement, not a recall one: regressions from round 319
  pin the true-positive path (poisoned command file → AG-SK-001 critical).
