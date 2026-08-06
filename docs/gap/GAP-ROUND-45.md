# GAP Report — Round 45 (public messaging didn't reflect the skills scan surface)

## Gap

Rounds 41–43 added three skill-file rules (AG-SK-001/002/003), but every
public claim about scan coverage still said "seven rules, one per category":
README (en/zh), the website rules index intro, the scan CLI docs, the
quick-start, and the homepage feature card. Rule count drift also hid
AG-TF-001 / AG-XS-001, which were never in the rule reference table at all.

## Fixed

- READMEs (en/zh), rules index intro, scan docs, quick-start: "twelve rules
  across seven categories", with the skill surfaces called out per category.
- Rule reference table: added the missing AG-XS-001 and AG-TF-001 rows —
  the table now lists all 12 rules in ALL_RULES.
- Homepage scan feature card mentions agent skill files (SKILL.md).

## Verified

- Count cross-checked against `ALL_RULES` in `packages/core/src/rules/index.ts`
  (12 entries). Website production build green.

## Honest limits

- Rule-count claims are now a maintenance liability; the pin-bump automation
  pattern (round 37) could later derive the count from ALL_RULES, but a
  generator is overkill for now — documented here as the update checklist.
