# GAP-ROUND-375 — fresh-corpus precision: pattern-table keys, module pipes, plugin-bin comments, URL slugs, wrapped placeholders, guard declarations

Date: 2026-08-03
Method: fresh 138-repo corpus (seven agent-surface GitHub searches, deduplicated
against all prior corpora), full scan with the built CLI, every critical plus
every AG-CL/SS/TP-001 high manually verified against the original source.

## Corpus

- 140 fresh repos selected, 138 cloned and scanned (2 dropped for size, disk
  recovered mid-round by pruning historical corpus checkouts).
- Aggregate before fixes: 31 critical / 839 high / 938 medium / 244 low (2052).
- High breakdown: 825 AG-SK-002 (sampled — rule-semantics true positives, e.g.
  an agent store shipping hundreds of `permission.bash: allow` frontmatters),
  12 AG-SS-001, 1 AG-CL-001, 1 AG-TP-001.

## Verified true positives (kept, spot list)

- Real `curl|sh` installer pipelines in executable scripts:
  `1jehuang_jcode/scripts/build_linux_compat.sh`, `ID-Robots_clawbox/install*.sh`,
  `LiberiFatali_agent-kit/setup.sh`, `PapaKoftes_Layla/install/bootstrap.sh`,
  `BaranziniLab_biorouter/scripts/*.sh`, multiple `POWERFULMOVES_PMOVES.AI`
  provisioning scripts, `RudrenduPaul_skillguard/examples/known-bad-skill/hooks/install.sh`
  (a deliberately malicious example skill — exactly what the rule exists for).
- `POWERFULMOVES_PMOVES.AI/pmoves/configs/tac_trees/node-hermes-agent.tac.yaml`:
  an agent task tree instructing a real remote-installer `curl | bash` — kept
  critical (agent-executed instruction surface).
- Live IMDS reads (`BaranziniLab_biorouter/scripts/setup-headless-ubuntu.sh`
  metadata_public_ip(), `RoboFinSystems_robosystems` userdata/cloudformation
  IMDSv2 fetches) — kept high: genuine metadata requests, infrastructure or not.
- `data/processed/N1uBtkbzSXc.json:452` U+202D in scraped YouTube transcript
  data — kept high: a real bidi override is present; the "possible … confirm"
  wording is doing its job on imported data.

## False-positive classes fixed (each verified in source, regression pinned)

1. **AG-RC-001 pattern-table keys** — `matches:`/`not_matches:` entries in a
   security-policy yaml (`biorouter baseline.policy.yaml` deny-rule test
   vectors) are pattern tables the engine tests against, never commands. Added
   to the deny/block-list key set → low with deny-list wording.
2. **AG-RC-001 local module pipes** — `curl … | python -m json.tool`
   (`PMOVES provider-activation.runbook.yaml`) pipes the download into a local
   module as stdin data, same as the existing `-c`/`-e` exclusion → no match.
3. **AG-RC-001 plugin-bin comment grading** — a commented `curl|sh` in an
   extensionless plugin `bin/` executable (`PedroAVJ_loadout
   plugins/sentry/bin/install-sentry-cli` quoting the upstream installer it
   deliberately avoids) hit the generic "non-executable file" medium because
   the comment-only branch only recognized extension-matched executables →
   now low with comment wording.
4. **AG-CL-001 URL path slugs** — `…/vasteras-sk-fk-match-prediction-…`
   (`Eitanvinokur… data/mined_state.json`) matches the `\bsk-` prefix after a
   hyphen inside a URL path; a hyphen/slash-joined URL continuation is a slug,
   not key material → skipped. A `?key=sk-…` query value still reports.
5. **AG-SK-001 wrapped template placeholders** — `<system>` on its own line
   inside a placeholder-heavy prose block with no closing tag anywhere
   (`CatCorner22_Claude_Skills_2 …/your-environment.md`) is the existing
   template notation wrapped across lines → low. Closed `<system>…</system>`
   blocks stay critical (regression pinned).
6. **AG-SK-001 relative-clause concealment** — "buttons that do not tell the
   user what will happen" (`Intense-Visions_harness-engineering`
   ux-microcopy SKILL.md, 4 files) describes a subject's behavior, not an
   instruction; a `that/which/who` lookbehind excludes it. Direct "Do not tell
   the user what you did" stays critical (regression pinned).
7. **AG-SS-001 defensive-context gaps** — three shapes of genuinely defensive
   code reported high:
   `Graphify-Labs_graphify/graphify/llm.py` `_ollama_host_is_link_local_or_metadata`
   (guard-declaration regex missed the `_is_` underscore boundary and the
   `link_local` name), `AgentSwarms-fyi_agentswarms ssrfGuard.server.ts`
   ("ALWAYS refused" — `refuse` didn't match its inflections), and
   `Arikazei_context-mode-app` bundles (redirect-walk comment naming
   `ssrfGuard` at a camelCase boundary). All → low defensive wording; bare
   metadata probes stay high (regressions pinned).

## Head-to-head (seven corpora, base = merged main, new = this branch)

r343, r359, r368, r371, r373: byte-identical. r356: exactly 1 change (the same
PMOVES runbook module-pipe, repo present in both corpora). r375: exactly the 10
manually verified findings above changed; zero other drift.

## Production deployment consistency

`/v1/advisories` → 106; `https://agentgate.zalize.com/feeds/advisories.json`
`.items` → 106. The 104-item feed observed mid-round was the pre-#552 deploy
still propagating; both channels now agree with the bundled database.

## Validation

Full suite green (build, 502+ tests incl. 12 new round-375 regressions, lint,
typecheck, `git diff --check`); core coverage 94.03%/85.95%.
