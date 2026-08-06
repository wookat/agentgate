# GAP Report — Round 43 (skill dynamic-context commands run at load time, unchecked)

## Gap

Rounds 41–42 covered skill body poisoning and frontmatter grants, but the
official skills docs describe a third mechanism: dynamic context injection.
Inline `` !`command` `` placeholders and ```! fenced blocks execute as shell
commands **before the skill content is rendered** — no model in the loop, no
permission prompt, no review of what ran. A malicious skill can
`curl … | sh` or `cat ~/.ssh/id_rsa` the moment it loads, and the second case
additionally plants the secret into the prompt context.

## Fixed

- New rule `AG-SK-003` (category `rce-vectors`): extracts dynamic-context
  commands (inline form only when `!` is at line start or after whitespace,
  matching the documented recognition rule; multi-line ```! blocks) and flags:
  - remote download piped into a shell → critical
  - sending data to a remote host (`curl -d/-F/--upload-file`) → high
  - reading credential material (`~/.ssh`, `id_rsa`, `.aws/credentials`,
    `.npmrc`, `.netrc`, `.env`) into the prompt → high
- Benign context commands (`git diff HEAD`, `gh pr diff`) are not flagged;
  `KEY=!`cmd`` (not recognized by the loader) is correctly ignored.
- SARIF security-severity 9.0; docs section on the rce-vectors page +
  rules index row.

## Verified

- 2 new core tests (mixed malicious skill → critical+high+high with correct
  lines; benign/git-context negative); suite green.
- Syntax semantics cross-checked against the official Claude Code skills docs
  fetched this round (load-time execution, line-start/whitespace recognition
  rule, fenced ```! form).

## Honest limits

- Pattern-based: obfuscated commands (base64-wrapped, `$(…)` indirection)
  evade the tripwire.
- Stacked on round 42's branch (#97) — merges cleanly only after it.
