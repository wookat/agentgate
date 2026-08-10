# GAP-ROUND-391 — fresh-corpus precision round

Date: 2026-08-10. Baseline: main @ 885c8d9 (#585, v0.67.45 published).

## Corpus

Fresh 140-repo corpus built from seven agent/MCP surface repository searches
(`/home/ubuntu/corpora/r391/build.sh`): 1,756 candidates → 1,457 unseen after
dedup against all prior rounds (`seen.txt`) → 140 selected
(deterministic `shuf --random-source`). All 140 cloned and scanned with the
current CLI (`scan -f json --fail-on never`).

Totals: 31 critical / 78 high / 84 medium / 182 low (375).

## Manual verification

All 31 criticals plus all AG-CL-001, AG-SS-001, and AG-TP-001 highs were read
in source; medium/low sampled per rule class.

True positives kept (verified in source, unchanged):

- Real installers/bootstrap pipelines stay critical:
  `Corporationakht/LocalCodeCli scripts/install.sh` (uv installer),
  `TechMireSolutions/mms scripts/production/bootstrap-ubuntu-vps.sh` (nvm),
  `astosweb/my-services-marketplace deploy/lib/common.sh` (NodeSource),
  `rickylabs/netscript .openhands/setup.sh` (deno), `argszero/emrg install.sh`,
  `zainaqdas/opengate install.sh`, `DammianMiller/universal-agent-protocol`
  setup + startup plugin, and 13 real Ansible/k3s scripts in
  `ai-workspace-infra/playbooks`.
- `mohanish3/AgentPreflightSec demo/poisoned/install.sh` — deliberately
  malicious sample stays critical.
- `gastownhall/beads .goreleaser.yml` and `github/awesome-copilot
  website/data/tools.yml` — real user-facing install one-liners stay reported.
- `Valynt/ValueOS scripts/spot-interruption-handler.sh` — live IMDS
  metadata probe stays AG-SS-001 high.
- `aiconduit/ai-conduit-pipeline conduit_core.py` — real-shaped `sk-…` and
  `AIza…` default literals stay AG-CL-001 high.

## Defects found and fixed (3 classes)

1. **AG-RC-001 detection-rule TOML expectations and backtick-quoted prose.**
   `seven-hills-software/skillwright-scanner` ships its own curl|sh detection
   rule as TOML with `should_match = "curl … | bash"` test expectations —
   reported critical because the `=` (TOML) key form wasn't recognized as a
   pattern/expectation field. The deny/pattern key check now accepts `=`
   separators and should_match/must_not_match keys. Separately,
   `beetroot-salad/cyber-response-agent` generated incident narratives and its
   `playground-v2/attacks/catalog.yaml` quote pipelines inside backtick
   inline-code spans of yaml block scalars (4 criticals) — no runner backticks
   its own commands, so a match wholly inside a backtick span in a yaml/toml
   data file now grades as text (medium). Bare block-scalar commands
   (workflows, goreleaser) stay critical (regressions pinned).
2. **AG-SS-001 deny-named domain config and guard wording.**
   `Timeflys2018/zeyi` declares `denied_domains` /
   `"deniedDomains": ["169.254.169.254"]` sandbox network denylists and
   `sattyamjjain/agent-airlock policy_presets.py` documents an IPv6-range
   guard for the metadata CVE — all reported high. The defensive word set now
   includes bare `deny/denied/denies` tokens, lowercase camelCase
   `denied*/deny*/dangerous*` identifiers, and `guard*` wording; `evals/`
   trees grade quietly like `tests/`. Bare metadata probes stay high
   (regression pinned).
3. **AG-CL-001 nosec-marked fakes and the canonical jwt.io token.**
   `sattyamjjain/agent-airlock negotiation_bench.py` marks its fixture secret
   `# nosec … fake fixture secret … not a real credential` on the same line —
   reported high. A same-line nosec/fake-fixture suppression comment now
   grades low. The canonical jwt.io debugger token (payload
   `sub 1234567890` / `name "John Doe"`, quoted in
   `benchmark_sanitizer.py` and countless docs) now counts as a demo JWT.
   Unmarked real-shaped values stay high (regression pinned).

## Head-to-head (18 corpora, ~2,230 repos)

Baseline rebuilt from origin/main (885c8d9). Changes are exactly the
fixed classes above: skillwright TOML critical→low, 4 beetroot backtick-prose
criticals→medium, zeyi/agent-airlock/beetroot-evals AG-SS-001 highs→low,
agent-airlock AG-CL-001 highs→low. Zero drift in the seventeen historical
corpora; all r391 true-positive criticals retained.

## Routine windows

- Authenticated advisory watch: zero uncovered MCP-related advisories.
- OSV npm ETag changed (`68bc6946…` → `caca3572…`); full MAL diff: exactly
  1 entry (`MAL-2026-13684`, `@ssgw/icon`) — already examined in r389,
  not MCP/agent-related. PyPI ETag changed but full MAL diff is empty.
- Production API/feed both serve 109 advisories, consistent with the repo.

## Residual gaps

- `beetroot-salad/cyber-response-agent` seed-3 prediction yaml quotes a
  pipeline inside a single-quoted `cmdline: '…'` value of a prose hint (not
  backticked) — still critical; single instance, left as-is.
- `Valynt/ValueOS red-team-canary-tokens.ts` intentional canary
  `AKIACANARYTEST123456` stays high — a "canary" wording heuristic has one
  example, deferred.
- AG-SK-002/AG-CL-001 high volume elsewhere is rule-semantic (real broad tool
  grants, real secret-shaped defaults); sampled, no defect.
