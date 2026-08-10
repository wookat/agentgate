# GAP-ROUND-399 — fresh-corpus verification (docs)

Date: 2026-08-03. Baseline: main `7e0d924` (post #598, npm latest 0.67.49 — release
closed out: tag v0.67.49 on `2cf07db`, GitHub Release, deploy checks, clean-env
regression all verified this round).

## Corpus

Fresh agent/MCP-ecosystem sweep: 1,633 candidates from seven surface searches,
1,220 unseen after dedupe against all prior corpora, 140 selected (seeded shuffle)
and shallow-cloned. Full scan with the current CLI build: **608 findings —
13 critical / 91 high / 372 medium / 132 low**.

## Critical (13) — all inspected, all correct

- **AG-RC-001 (11)**: real executable install pipelines — `curl … install.sh | sh`
  in an Azure Pipelines step (draugr), dotfiles/setup installers (fmind,
  gear2000, otzslayer, itsablabla fly.io, nightswatchhq, xberg-io wasm-pack,
  ruvnet rustup, repairman29 ×2 mise/Ollama), and a skill script that pipes a
  remote spec into `node` (oaknational `api-specs-context.sh` — remote data fed
  to an interpreter, correctly hot).
- **AG-SK-001 (2)**: deliberately malicious test fixtures (uncloak
  `tests/fixtures/malicious/SKILL.md`, `.cursorrules`) — injection fixtures for a
  scanner, correct under existing semantics (fixture path grading applies where
  the path matches; these are the scanner's own bait corpus).

## High (91) — all inspected

- **AG-SK-002 (89)**: 84 are `allowed-tools: … Bash …` (unscoped) in real skill /
  agent frontmatter (vanguard-frontier 27, chump 15, RuView 9, loopsmith 8,
  lloyd 8, flex 5, lago-front 5, …) — real pre-approval surfaces, true positives.
  Remaining 5: `bypassPermissions` defaults (2), `Bash(*)` allow, OpenCode
  catch-all "allow", OpenCode `agent.build.permission.bash: allow` — all real.
- **AG-CL-001 (1)**: `GOOGLE_FONTS_API_KEY = 'AIza…'` literal in live source
  constants (O_PEN). A real key of real shape committed to source; whether the
  key is referrer-restricted is not knowable statically — keep high. True
  positive under existing semantics.
- **AG-SS-001 (1)**: Agent_panel `siteFaviconCache.ts` — `isPublicHttpHost()`
  allowlist guard; the metadata IP appears only in a trailing comment on a
  `return false` rejection line. It is defensive code, but the function uses
  *positive* naming (`isPublic…`) and no deny-vocabulary appears in any window,
  so the defensive downgrade misses it. **Single sample** this round (the
  structurally identical medialog `isSafeUrl.ts` was already downgraded via its
  header wording) — below the multi-sample bar; deferred, recorded here.
  Candidate signal if a second sample appears: metadata-IP mention confined to a
  comment on a `return false` line inside an `isPublic*/isSafe*`-named predicate.

## Medium/low — sampled per rule

- **AG-SK-002 medium (288)**: sampled — WebFetch/WebSearch/Write/Edit
  pre-approvals in real skill frontmatter (vanguard-frontier bulk); correct.
- **AG-AM-001 (55)**: remote servers without auth headers (`mcp.atlassian.com`,
  vendor plugin `.mcp.json`s) — rule semantics correct (verify-out-of-band wording).
- **AG-RC-001 medium (18)**: real `execSync(`/`spawn(` call sites plus
  cautious-worded non-executable curl|sh text findings; one singleton noted —
  a generated architecture-survey JSON (oaknational `.agent/reports/archive/…​.json`)
  where the "primitive" is an English enumeration ("child_process, spawn, exec,
  fork") inside report prose; single sample, deferred.
- **AG-SC-001 (11)**: unpinned npm plugin/server specs and mutable marketplaces
  (thumbgate, backtest_stock `@latest` + `-y`) — true positives.
- **AG-CL-001 low (35)** / **AG-TP-001 low (18)** / **AG-SS-001 low (24)**:
  sampled — test-path fakes, fixture bait files, defensive/blocklist contexts,
  minified vendored JS; grading correct.

## Head-to-head

No production-code change this round, so historical corpora are unchanged by
construction (verified reasoning; r397/r398 head-to-heads remain the latest
code-change baselines).

## Conclusion

No new generalizable defect met the multi-sample bar. No code change, no
changeset — docs-only round.

## Residual (carried)

- Positive-named allowlist guard (`isPublicHttpHost`) metadata-comment singleton
  (AG-SS-001, Agent_panel) — deferred, see above.
- Generated-report JSON exec-enumeration singleton (AG-RC-001 medium,
  oaknational) — deferred.
- `BANNED_HOSTS` denylist identifier (AG-SS-001) — carried from r397.
