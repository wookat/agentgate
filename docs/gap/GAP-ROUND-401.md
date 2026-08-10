# GAP-ROUND-401 — fresh-corpus precision: relative-url marketplace sources

Round 401 is a fresh-corpus round: 140 previously-unseen repos (1,690 candidates
from 24 agent-surface queries → 1,110 after dedupe against 1,530 seen repos →
140 picked, 139 cloned + 1 substitute), scanned with main @ #600 (0.67.49+r400)
and every critical/high finding verified against the source.

## Corpus scan

350 findings across 139 repos: 9 critical, 90 high (88 AG-SK-002 + 2 AG-SS-001),
181 medium, 70 low.

### Criticals — all verified individually

| Repo | Finding | Verdict |
| --- | --- | --- |
| Cliftonz_jarvy ×2 | AG-RC-001 curl\|sh (jarvy.toml uv bootstrap, bootstrap.sh installer) | true positive — real install pipelines |
| OpenShift-Fleet_rehor | AG-RC-001 curl\|sh (nvm install.sh) | true positive |
| hrdle_hrdle | AG-RC-001 curl\|sh (install.sh herdr) | true positive |
| liza-mas_liza | AG-RC-001 curl\|sh (.goreleaser.yaml release-notes install block) | true positive — fenced bash install command in release template |
| tensorleap_skills | AG-RC-001 curl\|sh (preflight.sh self-update, piped to sh and exec'd) | true positive |
| ysluckly_TrendRadar | AG-RC-001 curl\|sh (setup-mac.sh uv install) | true positive |
| liza-mas_liza | AG-SK-001 `<System>` tag in feynman skill | rule-semantics-correct: skill opens with a `<System>` role tag — indistinguishable statically from role hijack; singleton (all other corpus `<System>`/`<system>` hits are inside fenced blocks and already low) |
| cosmix_loom | AG-SK-001 hidden Unicode U+2068 (FSI) in i18n skill | **wild FP, singleton** — the skill documents Unicode bidi isolates and shows FSI/PDI literally inside an inline code span (`` `⁨…⁩` ``). Trojan-class chars stay critical by design; an inline-code-span carve-out has exactly one wild sample (corpus-wide grep for FSI/PDI in md found only this repo plus one non-skill-surface prose repo), so deferred under the multi-sample gate. |

### Highs

- 88 AG-SK-002: verified by sample across the 9 repos — real unscoped `Bash`
  pre-approvals in skill frontmatter (30 in cosmix_loom alone). Rule-correct.
- AG-SS-001 Cliftonz_jarvy user-data.sh: live IMDS read (`curl 169.254.169.254/…/RunnerToken`)
  — true positive.
- AG-SS-001 LegalQuants_lq-ai config.py: **wild FP, effectively singleton** —
  `DEFAULT_WEB_FETCH_FILTER_LIST = ['!169.254.169.254', …]`: `!`-negated entries
  are deny semantics (blocked hosts). The only other wild `!`-negated metadata
  entry (SocialGouv_iterion `ModeDenylist` test) already reports nothing. One
  live sample at high does not meet the modification gate; deferred.

### Fixed this round — relative-url marketplace sources (3 wild samples)

`{"source": "url", "url": "./"}` object-form marketplace plugin sources were
flagged AG-SC-001 "mutable source (./)" — but a schemeless relative url is
repo-local content shipped with the catalog, the same trust boundary as the
string-form local path `./plugins/x` (which is already exempt). Wild samples:

- r401 `Lhy723_melody-harness` (`.agents/plugins/marketplace.json`, `"url": "./"`)
- r393 `FleetManifestAdmin_fleetmanifest-test-corpus` (same shape)
- r395 `JFWaskin_superpowers-safe` (same shape)

Fix: `isMutableMarketplaceSource` returns false for url-form sources whose url
has no scheme and no protocol-relative `//` prefix. Remote-scheme urls
(`https://…`) remain flagged (regression pinned alongside `./` and `../` forms).

Head-to-head (old npx 0.67.49 vs new build): the three sample repos lose exactly
the one relative-url finding each; the full 139-repo r401 corpus re-scan diff is
exactly that one line. Zero other drift.

### Medium/low residual sampling

- AG-RC-001 medium: real `exec`/`child_process` call sites and installer-hint
  string literals (registry `installCommand`, i18n hint strings, self-upgrade
  command construction) — all rule-semantics-correct at medium. One JSON
  `$comment` with backtick-quoted `` `curl | bash` `` prose (hrdle identity.json)
  noted as a possible future inline-code-prose extension; singleton, deferred.
- AG-AM-001 medium: remote servers without auth headers — correct.
- AG-CL-001/TP-001/SS-001 low: test-path dummies, BOM/ZWSP artifacts, defensive
  SSRF guard code — all correctly quiet.

## Verification

- 530 core + 60 cli + 30 convert tests green; lint/typecheck green.
- Failing-first test: relative-url and parent-relative url sources exempt,
  remote-scheme url source still flagged (hit count 2 → 3 with the new
  remote-url entry, relative forms absent).

## Deferred singletons (watch list)

- FSI/PDI trojan chars inside inline code spans in i18n-documentation skills (cosmix_loom).
- `!`-negated metadata entries in filter/deny list literals (LegalQuants_lq-ai).
- `<System>` persona tag opening a skill body (liza-mas_liza).
- JSON string prose with backtick-quoted curl|bash (hrdle_hrdle identity.json).

## Advisory windows

Not re-run this round — r400 (same day) verified all three windows clean and
production consistency (API/feed/repo each 109). Next routine round re-checks.
