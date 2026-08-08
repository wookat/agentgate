# GAP-ROUND-311 — CLI output UX re-check: over-wide message tokens were truncated

## Why this round

Advisory window honestly skipped: the automated watch (`--dry-run`) is still
clean hours after round 307's sweep and the OSV npm/PyPI export ETags are
unchanged since r295 — nothing to diff. Last CLI/CI output UX round was 288;
since then the lockfile-poisoning surface (301–304), Copilot extensions (305),
and 8 new advisories landed, all producing new output shapes worth a re-check.

## What the corpus surfaced

Re-running `deps`/`scan` over the round-304/305 wild corpora exposed one real
defect: the findings table wraps the Message column at word boundaries, and
cli-table3 truncates any single token wider than the column with "…". New
AG-DP-007 messages embed the offending source URL — e.g.

```
("https://codeload.github.com/distubejs/prism-media/tar.g…
```

— so the one thing the user needs to judge the finding (where the dependency
actually comes from) was cut off. Same class of bug as the Target column fix
in round 65; the Target column already wraps mid-word, the Message column did
not.

## Fix

`renderFindingsTable` now checks each message for whitespace-separated tokens
wider than the column's content width (58); only those cells switch to
mid-word wrapping (`wrapOnWordBoundary: false`), so ordinary prose keeps
clean word-boundary wrapping. Regression tests pin both behaviors.

## Sweep results (no other defects)

- All 323 round-304 corpus manifests re-run through `deps`: zero remaining
  "…" truncations.
- Round-305 corpus re-run through `scan`: remaining "…" occurrences are
  deliberate message content (AG-CL-001 shortens the matched regex source to
  30 chars by design), not table truncation.
- Doc-link footer, per-rule counts, severity summary, and GHA annotation
  paths unchanged and correct on spot checks.

## Boundaries

- AG-CL-001's intentional regex-source shortening keeps its "…" — that is
  message content, not layout truncation.
- Terminal-width-aware column sizing (wider Message column on wide
  terminals) remains unimplemented; fixed 60-char column is still the
  readability sweet spot for CI logs.
