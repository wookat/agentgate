# GAP-ROUND-327 — plugin bin/ system-command shadowing (+ clean advisory window)

## Advisory window

- Automated GHSA + GitHub-malware watch rerun: zero uncovered candidates.
- OSV npm/PyPI exports byte-identical to the r324 snapshots (same ETags);
  no MAL diff possible. Honest zero — no new advisories this round.

## Gap

Round 326 made plugin `bin/` content scannable, but left two holes:

- a plugin bin entry named after a core system command (`git`, `curl`,
  `python`, …) shadows that command for every Bash tool call while the
  plugin is enabled — the classic PATH-hijack move — and nothing flagged
  the name itself;
- a compiled binary (NUL bytes) in plugin bin/ was skipped entirely, so a
  malicious binary named `git` was invisible even to name checks.

## Fix

- AG-RC-001 flags plugin bin files whose basename matches a curated list of
  ~35 core commands (shells, coreutils, vcs, package managers, runtimes,
  docker/kubectl/gh/ssh/sudo) as high: "shadows the system command on the
  Bash tool PATH".
- Binary plugin bin files are no longer dropped: they enter `scannedFiles`
  and run through rules with empty content, so name-based checks fire while
  text patterns cannot false-positive on binary garbage.

## Wild verification

- r321 full corpus (496 plugin repos, 136 manifest-gated bin entries):
  name census shows zero wild bin entries using system-command names
  (they use their own tool names — `plumbline`, `zizmor`, `cli.js`, …);
  full rescan confirms zero shadow findings → zero false positives.
- Regressions pin: `bin/git` script high, `bin/curl` binary high,
  `bin/my-tool` silent, no-manifest `bin/` untouched.

## Boundaries

- Only exact basename matches are flagged; extensioned entries
  (`git.sh`) are not bare-command shadows and stay unflagged.
- The command list is deliberately curated to unambiguous core commands;
  extending to broader busybox-style lists risks FPs on legitimate
  plugin tool names.
