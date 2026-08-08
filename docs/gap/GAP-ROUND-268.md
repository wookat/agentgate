# GAP-ROUND-268 — Wild-corpus precision sweep of the Cline `.cline/` surface (round 266)

Date: 2026-08-03. Precision sweep round (docs only, no code changes needed).

## Corpus

GitHub code search `path:.cline/skills filename:SKILL.md` (~10k hits) plus
`path:.cline/plugins` (still 0 hits — plugin store remains pre-adoption).
Cloned 69 real repositories containing 2,181 wild `SKILL.md` files under
`.cline/skills/`, scanned each repo with the round-266 build
(`agentgate scan -f json --fail-on never`), and reviewed every `.cline/*`
finding by hand.

## Results — 53 findings across 10 of 69 repos, 0 false positives

| Rule / severity | Count | Verdict |
|---|---|---|
| AG-SK-002 high (unrestricted `Bash` via allowed-tools) | 10 | all real grants in skill frontmatter |
| AG-SK-002 medium (Write 16 / WebFetch 9 / Edit 5 / WebSearch 1) | 31 | all real grants |
| AG-SK-001 critical (hidden U+200D×3, codymaster) | 1 | true positive from round 266, stable |
| AG-SK-001 low (injection patterns inside fenced code blocks) | 3 | correct designed downgrade (round 55) — security-guidance skills quoting attack phrases |
| AG-RC-001 critical (curl\|sh in executable skill scripts) | 2 | true positives: `ensure-glab.sh` pipes the GitLab CLI install script into `sh`; `api-specs-context.sh` pipes a remote spec into `node -e` |
| AG-RC-001 medium (curl\|bash usage-comment in scripts) | 2 | correct designed downgrade (round 199) — commented usage documentation |
| AG-SS-001 low | 2 | correct designed downgrades: defensive-context metadata endpoint (round 169), network-policy manifest (round 131) |
| AG-CL-001 low | 2 | correct test-path quiet reports (round 5) |

59 of 69 repos produced zero `.cline` findings — thousands of benign skills
scan clean. Every non-quiet finding is a genuine repo-carried grant or
executable download-and-run; every quiet/low finding hit a deliberate
prior-round downgrade exactly as designed.

## Boundaries (unchanged)

- `.cline/plugins/` still has no wild corpus; the surface remains covered by
  round-266 fixtures only.
- AG-SK-002 `allowed-tools` frontmatter findings report the declared grant in
  the file; whether a given host honors that key is client-dependent — the
  declaration itself is the supply-chain signal, same policy as all skill
  trees.

## Validation

No production changes this round; the round-266 build was exercised against
the corpus above. Nothing to re-run beyond the round-266 suite (green on PR
#394).
