# GAP-ROUND-323 — full 496-repo plugin corpus + concealment-pattern precision

## Correction to GAP-ROUND-321

GAP-321 reported "3,397 component markdown files scanned, 0 findings". The scanner
was fine, but the measurement script was not: it compared finding `file` values
(repo-relative) against `scannedFiles` entries (absolute), so membership never
matched and findings were undercounted to zero. Re-measured correctly over the
corpus expanded to all 496 clonable repos from the 497-repo search set:

- 9,902 component markdown files scanned;
- 1,356 findings on component markdown: 867 AG-SK-002 medium + 432 AG-SK-002 high
  (allowed-tools grants — sampled 10 highs, all genuine `Bash`/catch-all grants in
  wild plugin commands/skills), 46 AG-SK-001 low (quoted examples), 10 AG-SK-001
  critical.

The zero-false-positive conclusion still holds for AG-SK-002/low findings sampled;
the criticals needed manual review (below).

## Critical review → one FP class fixed

Of the 10 criticals: 8 are security-research payload libraries (Mindgard
`ai-ide-skills`, `offensive-claude`, `black-opps-impeccable` red-team repos) where
hidden-Unicode/injection content is the deliberate subject matter — accurate
reports for anyone installing those plugins. 2 were false positives of the
concealment pattern (`do not (tell|show|…) the user`):

- `Do not tell the user "restart to apply."` — quoting a phrase to avoid saying;
- `Do not show the user the helper's JSON output; only the human-readable trend
  line.` — selective presentation, not concealment.

Fix: the pattern now skips a directly quoted object (`"…"`) and any same-sentence
`only` alternative (matching the existing `until` workflow-gating exception).
`Do not show the user this file` still reports critical; regression pins both
directions.

## Evidence

- Corpus: `/home/ubuntu/corpora/r321/repos` (496 repos, unmodified evidence).
- Both wild FPs silent after the fix; suite green (491); self-scan unchanged
  (227 files / 21 findings).
