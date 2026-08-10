# GAP-ROUND-413 — fresh-corpus verification + AG-SS-001 defensive-validator fix

Date: 2026-08-03. Scanner at main@08ca8e6 (0.67.54) baseline; fix in this PR.

## Corpus

Fresh 140-repo corpus across agent/MCP/plugin/skill/hook/instruction/client
surfaces: 1,629 unique candidates → 871 fresh after historical dedupe
(seen.txt at 2,771 entries) → 140 picked → 140 cloned (2 clone failures
replaced: `netjtl/OrchestraDashboard`, `suimi8/vx-robot` →
`palgroup/simui`, `L4RBIX/zaaz`).

## Scan

700 findings across 60 repos: 10 critical + 148 high + 293 medium + 249 low.
No `PARSE-ERR` records; scan diagnostics only contain expected YAML-tag
parser notices from corpus files using `!ENV`/`!Sub`/`!Ref` custom tags.

## Critical (10/10 manually reviewed — all true positives)

All genuine remote-installer/bootstrap pipe-to-shell execution:

- `Eilodon/KARMA-Eilodon` — CALM installer `curl … install.sh | sh` in
  `.claude/hooks/session-start.sh` (load-time hook) and
  `script/calm-mcp-launcher.sh`.
- `ThomasMichon/copilot-extensions` — dtssh `install-release.sh | sh` in
  both `install-client.sh` and `install-host.sh`.
- `dgabriel/MysteryMixClub` — NodeSource `setup_20.x | bash` (two bootstrap
  scripts) + nvm `install.sh | bash` in `dev-up.sh`.
- `tyler-jewell/herdr-bootstrap` — `herdr.dev/install.sh | sh` (live branch;
  dry-run is a log line in the same file).
- `zlatko-lakisic/agentic-orchestration` — `ollama.com/install.sh | sh`.
- `ahlerjam/academic-research` — `test-pretooluse-blocker.sh` intentionally
  enumerates `curl … | sh` payloads as `must_block` test cases for a
  PreToolUse blocker; hot per the r393/r397 deliberate-payload precedent.

## High

- 144× AG-SK-002 — real unscoped `Bash`/dangerous pre-approved tool grants
  across independent repos (sampled; genuine).
- 1× AG-CL-001 — `bkd-dotcom/umbra-eval` crafted detection corpus with
  real-shaped secrets; intentional eval corpus, correctly reported.
- 3× AG-SS-001 — deep-dived below; 2 were generalized false positives
  (fixed in this PR), 1 stays high correctly:
  `Eilodon/KARMA-Eilodon` `gcp_kms_key_registry.ts` defines a live GCP
  metadata token URL actually fetched by provider code — genuine
  review-worthy surface, stays high.

## Generalized defect fixed (2 independent samples)

AG-SS-001 defensive-context recognition missed:

1. `karthikrshet/Career-Agents` `packages/security/url-validator.ts` —
   defensive allowlist validator (`CLOUD_METADATA_IPS` + `isPrivateIp` +
   `STRICT_ALLOWLIST`); nearby context carries validator identifiers only.
2. `JSONbored/metagraphed` `scripts/check-adversarial-surface.ts` —
   `SSRF_CORPUS` adversarial table with "must never be talked into
   reaching" prose; `\bSSRF\b` missed `SSRF_CORPUS`, `must not` missed
   `must never`.

Fix: `validat`/allowlist identifiers count as blocklist-nearby context;
`SSRF` matches at underscore boundaries; `must (not|never)`.

Head-to-head over all 254 corpora repos containing metadata literals
(main@08ca8e6 vs patched): exactly 3 downgrades, all manually confirmed
defensive (the two targets plus `MFR-Marketing-Resources/my-flowkit-bosmax`
`_resolves_public` per-hop guard, whose "allowlisted fetcher" docstring now
matches) — zero upgrades, zero other drift. Synthetic IMDS-theft fixtures
stay high (regression-pinned in `scanner.test.ts`).

## Medium / low sampling

Sampled per rule; all consistent with rule semantics:

- AG-SK-002 medium (240) — scoped/wildcard-scoped tool grants
  (`"stitch*:*"`, plain `Read/Write/Edit/Bash` lists).
- AG-RC-001 — real `exec(`/`new Function(` call sites and curl-text
  warnings; test-path ones already graded low with test wording.
- AG-SC-001 — genuine mutable marketplace/unpinned-npm plugin sources.
- AG-AM-001 — real unauthenticated remote MCP endpoints (incl. fixture
  paths, correctly quiet).
- AG-CL-001 low — test-path fake secrets with fixture wording.
- AG-SS-001 low — defensive/blocking contexts correctly downgraded.
- AG-TP-001/SK-001 low — boundary zero-width artifacts and fenced quoted
  examples, correct per r345/r409 semantics.

## Routine windows

Release: 0.67.54 published manually per SOP during the GitHub Actions
outage (account-level; Actions still not triggering as of this round) and
closed out — tag v0.67.54 at 08ca8e6, GitHub Release created, site/API/feed
each at 109 advisories, clean-environment npx regression passed.

## Residual (not actionable this round)

- GitHub Actions outage — infrastructure, owner-side billing/quota
  investigation; degraded merge gate in effect (GitGuardian + local checks).
- No other multi-sample defects found; no further singletons recorded.
