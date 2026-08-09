# GAP-ROUND-346 — AG-CL-001 AWS documentation example keys & secret-scanner configs

## False-positive class (r343 corpus, 150 repos)

Manual triage of the remaining AG-CL-001 findings surfaced two inert classes reported
as leaked secrets:

- **AWS documentation example credentials** — AWS reserves keys ending in the literal
  `EXAMPLE` for docs (`AKIAIOSFODNN7EXAMPLE`, secret `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`).
  Wild uses: ransomware canary/honeypot skill scripts writing fake `AWS_Access_Keys.csv`
  bait (2 repos × 2 files, **high**), a docs data file embedding a sample `.env`
  (`serviceDocsData.js:841`, **high**), and two test fixtures (low).
  The `example` word-boundary check in `isPlaceholder` missed them because `7EXAMPLE`
  has no boundary before the word.
- **Secret-scanner configs** — `.gitleaks.toml` quoting `sk-...`/password patterns as
  its scan *rules* (`.gitleaks.toml:77`, **high**). The file exists to describe secrets,
  not to hold them.

## Fix

- `isPlaceholder` also treats values ending in `EXAMPLE`/`EXAMPLEKEY` as placeholders
  (applies to env/header/arg checks and source scan alike).
- `checkSource` skips secret-scanner config files (`.gitleaks.toml`/`gitleaks.toml`,
  `.secrets.baseline`).

## Corpus head-to-head (150 repos, main vs fix)

- 8 findings removed (6 high + 2 low), each manually verified as an
  `AKIAIOSFODNN7EXAMPLE`-family key or the gitleaks config; zero added; all other
  rules byte-identical.
- True positive pinned: a real-shaped `AKIA…` key stays high (regression test).

## Boundary

Sequential dummy values like `sk-abcdef1234567890abcdef` outside scanner configs
still report (26zl crypto-audit sample, `process.py:282`): "contains a keyboard
sequence" is not a safe placeholder signal for arbitrary real keys, so it stays.

## Validation

`pnpm build` / `pnpm test` / `pnpm lint` / `pnpm typecheck` / `git diff --check` /
`node api/scripts/validate.mjs` / `node scripts/check-advisory-count.mjs` /
`node scripts/check-client-lists.mjs` all green.
