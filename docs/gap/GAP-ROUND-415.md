# GAP-ROUND-415 — fresh-corpus verification + AG-SS-001 host-classifier fix

Date: 2026-08-03. Scanner at main@a52213d baseline; fix in this PR.

## Corpus

Fresh 140-repo corpus across agent/MCP/plugin/skill/hook/instruction/client
surfaces: 3,004 unique candidates (search window broadened to pushed:>2026-07-26,
4 pages per query) → 1,835 fresh after historical dedupe → 140 picked →
140 cloned (retry loop recovered every initial clone failure; none replaced).

## Scan

699 findings: 7 critical + 194 high + 405 medium + 93 low.
No `PARSE-ERR` records; scan diagnostics only contain expected YAML-tag
parser notices (`!ENV`/`!Sub`/`!Ref`).

## Critical (7/7 manually reviewed — all true positives)

All genuine remote-installer/bootstrap pipe-to-shell execution:

- `AutoFor/dotfiles` `cloud/azure-devbox/bootstrap.sh` — nvm
  `install.sh | bash`.
- `killy990/TrendRadar` + `lijmin/TrendRadar2` `setup-mac.sh` — uv
  `astral.sh/uv/install.sh | sh` (same-lineage forks).
- `levicherrin/dotfiles` `bootstrap.sh` — Determinate Systems nix
  installer `| sh -s -- install --no-confirm`.
- `oimiragieo/tensor-grep` `pyproject.toml` — install command literal
  piping a remote script.
- `supernovae-st/nika` `action/action.yml` — `curl … nika.sh/install.sh | sh`
  in a GitHub Action step; `scripts/release/render-notes.sh` — release
  pipeline heredoc with live command substitution.

## High

- 190× AG-SK-002 — real unscoped `Bash`/`Bash(*)`/OpenCode
  `permission.bash: "allow"` pre-approvals across independent repos
  (120 in one skill-farm repo `nludd25/Auto-claude-code-research-in-sleep`);
  sampled per shape, genuine.
- 1× AG-CL-001 — `vehiclesdb/vehicles` `data/plates/sk.yml:439` — Slovak
  license-plate dataset ids (`sk-standard-district-2006`) colliding with the
  `sk-…` secret shape. Structured-data false positive but a singleton;
  recorded below, not fixed.
- 3× AG-SS-001 — deep-dived below; 1 stays high correctly:
  `mpfaffenberger/code_puppy` `plugins/aws_bedrock/config.py` genuinely
  fetches the IMDS token endpoint (`urllib.request.urlopen`), stays high.

## Generalized defect fixed (2 independent repos)

AG-SS-001 defensive-context recognition missed boolean host-classifier
predicates — code that *compares* the hostname/IP against the metadata
literal instead of fetching it:

1. `MCPJam/inspector` `shared/local-only-mcp.ts` —
   `isUnsafeHostedOutboundHost`: `host === "metadata.google.internal"`
   equality chain returning `true` (deny) — no blocklist wording in the
   window, so it graded high.
2. `AnalystTom/Agent_panel` `apps/server/src/siteFaviconCache.ts`
   (r399/r411 corpora) — `isPublicHttpHost`:
   `if (a === 169 && b === 254) return false; // link-local (incl. cloud
   metadata 169.254.169.254)` — the literal only appears in the
   return-branch comment.

Fix: when the literal's line carries an equality comparison (`===`/`!==`/
`==`/`!=`), has no fetch call (`curl|wget|fetch|request|urlopen|get|open(`
excluded), and a boolean `return true/false` sits in the near window, the
context classifies defensive (low). Exploitation code that dials the
endpoint keeps grading high (regression-pinned in `scanner.test.ts` with a
urllib IMDS-token fixture).

Head-to-head over all 83 corpora repos with historical AG-SS-001 findings
(main@a52213d vs patched, 342 findings each): exactly the 2 target
downgrades — zero upgrades, zero other drift. Full r415 140-repo rescan
diff: exactly the 1 target line.

## Medium / low sampling

Sampled per rule; all consistent with rule semantics:

- AG-SK-002 medium (350) — real `Write`/`WebFetch`/`WebSearch`
  pre-approvals in skill frontmatter.
- AG-RC-001 medium — real `child_process` dynamic-exec call sites and
  curl-text warnings in non-executable files.
- AG-SC-001 medium — genuine unpinned/mutable marketplace plugin sources.
- AG-AM-001 medium — real unauthenticated remote MCP endpoints.
- AG-RC-001 low — commented install one-liners with comment wording.
- AG-TP-001 low — BOM/zero-width boundary artifacts, per r345 semantics.
- AG-SK-001 low — fenced quoted-example injection patterns.

## Residual (not actionable this round — singletons)

- `vehiclesdb/vehicles` `sk.yml` — structured geographic dataset ids match
  the `sk-` secret prefix; one repo, deferred.
- `MCPJam/inspector` `server/routes/shared/conformance.ts:100` — comment
  describing a redirect-to-metadata attack next to guarded-fetch wiring
  stays high; arguably defensive but the guard wording sits outside the
  window; one repo, deferred.
- `supernovae-st/nika` `render-notes.sh` heredoc uses backslash-escaped
  backticks (literal, non-executing) but contains live `$(…)` elsewhere —
  correctly hot; no change.
- GitHub Actions outage continues — degraded merge gate in effect
  (GitGuardian + local build/test/lint/typecheck green, disclosed).
