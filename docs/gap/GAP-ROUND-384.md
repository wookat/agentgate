# GAP-ROUND-384 — AG-RC-001 precision: bare curl|bash labels and sentence-crossing command lists

Date: 2026-08-04. Baseline: main @ #570.

## Routine windows

- Authenticated advisory watch: zero uncovered MCP-related advisories.
- OSV snapshots: npm ETag unchanged, PyPI ETag unchanged (no MAL diff to triage).
- Production API/feed: 109/109, consistent with the repository.

## False-positive class fixed (AG-RC-001)

Verifying the r383 residual mediums surfaced a generalizable class: the remote-exec
candidate regex `(curl|wget)…|\s*(sh|bash|node|python)` matched text that names the
*pattern* rather than running a command:

- bare `curl|bash` / `curl|sh` category labels in security-audit metadata
  (`_scores.json`: `"category": "curl|bash"`);
- regex alternations in scanner rule tables (`(rm|cat|wget|curl|bash|sh|python)`);
- prose that mentions curl/wget in one sentence and lists `| sh` / `| bash`
  pipe patterns in a later one (skill registry descriptions);
- comments containing only the bare label (`# … curl|bash builds …`,
  `"sudo curl|bash"`).

Fix (one regex, two added constraints):

1. the span between the downloader and the pipe must contain whitespace — a real
   pipeline fetches *something*; a bare `curl|bash` token is a label;
2. the span may not cross a sentence boundary (`.` followed by whitespace), so a
   pipe in a later sentence is not attributed to a `curl` mention in an earlier one.

Preserved (regression-pinned): live installers (`curl -fsSL … | bash`, `| bash -`,
backslash-continuation), `| node -e` / `| python -c` / `| python -m` data-pipe
exclusions, deny/rule-table downgrades, comment-only grading.

## Head-to-head (11 corpora, 1,533 repos)

All 169 changed output lines manually classified: removals are exclusively the four
label/prose shapes above; the only critical-level change is a same-file line shift in
`quiz/questions/13-security.yaml` (225 → 228: the bare-label option line no longer
matches, the prose `curl | bash` explanation line still does). No true-positive
critical/high finding was lost; real installers (e.g. `site/src/data/version.ts`
install command) still report.

## Residual gaps

- Prose like `# curl | bash pattern` (spaced label inside a defensive scanner
  comment) still reports as a medium text warning; harmless but could be folded
  into the label class if it recurs.
