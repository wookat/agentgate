# GAP-ROUND-315 — goose recipe prose precision (quoted examples, recipe curl|sh)

## Context

Advisory routine window (last real check: round 313): automated GitHub watch re-run clean
(GHSA + malware windows, zero uncovered). npm OSV `all.zip` genuinely refreshed for the
first time since the r295 snapshot (etag changed) — MAL id diff against r295: **0 new MAL
ids** (219,308 in both; the refresh touched non-MAL records). PyPI export unchanged since
r313. Window honestly zero, so the round pivoted to a wild-corpus precision sweep of the
round-314 `.goose` surface.

## Sweep

12 fresh GitHub repos with `.goose/skills` or `.goose/recipes` (r315 corpus), scanned with
the post-#460 build. 10/12 clean or expected-low. One repo exposed a real FP class:

**jlcatonjr/researchteam `.goose/recipes/security.yaml`** — a *defensive* security-review
recipe whose instructions list the very patterns it tells the agent to block:

- `- ❌ \`ignore previous instructions\` / \`disregard the above\` …` → AG-SK-001 **critical** (FP)
- `…no inspectable intermediate step (\`curl ... | sh\`, \`iwr ... | iex\`)` → AG-RC-001 **critical** (FP)

## Gap 1 — recipe injection check had no quoted-example downgrade

Skill markdown has had fenced-block/inline-code/quote downgrades since rounds 55/199, but
the goose-recipe branch of AG-SK-001 matched raw `instructions`/`prompt`/`activities` text
with no such context. Fix: same policy — a match inside a fenced block, inline code span,
or quotes reports **low** ("likely quoted example"); a non-quoted match is preferred over
an earlier quoted one so an example can't mask a real injection (regression pinned).

## Gap 2 — recipe-shaped YAML treated as executable for curl|sh

`isExecutableFile()` counts `.yaml` as executable (CI workflows, crushrc-likes), so a
curl|sh string in recipe *prose* reported critical "Source pipes a remote download into an
interpreter". A goose-recipe-shaped document carries prompt text a runner never executes
as shell — recipes' real exec surface (`inline_python`, extensions) is covered by the
dedicated AG-SK-003/AG-SC rules. Fix: files that parse as goose recipe docs are excluded
from the executable class; the string falls through to the medium text warning
(low if deny-listed).

## After

- researchteam: AG-SK-001 low (quoted example) + AG-RC-001 medium text warning — no criticals.
- DeanMojo/polysmith-mvp: 2 AG-SK-001 low in vendored reference docs (quoted/structural) — correct.
- True-positive recipe fixtures unchanged (unquoted injection still critical, incl. when a
  quoted example appears first).
- Full suite 484 green; self-scan unchanged (227 files / 21 findings).

## Boundaries

- Recipe `activities` are short strings; fenced blocks are unlikely there but the same
  helper applies uniformly.
- The AG-RC-001 medium text warning on defensive prose is retained (it *is* a curl|sh
  string in text); only the false "executable" escalation was removed.
