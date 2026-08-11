# GAP-ROUND-425 — fresh-corpus verification (honest no-defect round)

Date: 2026-08-03. Scanner: local build of `main@a5bcd62` (post-0.67.57).

## Corpus

Fresh 140-repo corpus (`/home/ubuntu/corpora/r425`), built from 24 agent-surface
GitHub search queries (`pushed:>2026-07-29`, non-fork, ≤200 MB):

- candidates: 2,737 → unseen after dedupe vs `seen.txt`: 1,538 → picked: 140
- clone failures: 0 (one full re-clone after a disk-space incident; only old
  historical corpus clone trees were deleted to recover space)

## Scan results

639 findings across 140 repos (8 critical / 157 high / 327 medium / 147 low);
108 lines of scan warnings (yaml python-tag stringification + `--live` hints),
zero parse failures.

## Critical triage (all 8 inspected by hand — all true positives)

- Real install pipelines (kept critical): `23name-git_tr02` uv installer,
  `Dicklesworthstone_mcp_agent_mail_rust` rustup nightly,
  `ViseronSystem_trinnity-viseron-system` NodeSource setup_24.x piped to root
  bash, `achalp_hermetic` ollama.ai install.sh, `agentscope-ai_QwenPaw` uv,
  `brainwhocodes_branchlight-repo` bun.sh, `jason-weddington_agent-gtd-dispatch`
  uv via runuser.
- `plocemourasouza_osforge` `skills/offensive-ai-security/SKILL.md:91` — a
  red-team methodology skill whose body instructs crafting
  "ignore previous instructions" injection prompts (unfenced list prose, not a
  quoted code block). Deliberate offensive skill content stays hot per
  r393/r397/r407/r417/r423 precedent.

## High triage

- 150 of 157 highs are AG-SK-002: real unscoped `Bash`/`bash` allowed-tools
  pre-approvals (104 + 16 skill frontmatter grants across mattkist_aSeaOfDreams,
  affaan-m_ECC, osforge, OnMyAgent, keel, basecoat, etc.) plus real OpenCode
  `permission.bash: "allow"` agent grants (cooneycw_claude-power-pack ×6,
  amurshak_hephaestus ×4). Rule semantics correct.
- 4 AG-SS-001 highs inspected:
  - `brainwhocodes_branchlight-repo` (×3): a real IMDSv2/GCE credential client
    in an AI-provider library (`aws-credentials.ts` live IMDS token fetch,
    `google-auth.ts` metadata-server ADC source) — live metadata credential
    acquisition stays high per KARMA/xbill9/code_puppy precedent. The third hit
    (`proxy.ts:8`, doc comment above the `isLocalOrMetadataHost` boolean
    classifier) is a borderline defensive-comment shape but same-repo — not an
    independent second sample; deferred.
  - `dbwls99706_deadends.dev` gcp-metadata-server-timeout canon: an
    error-signature knowledge-base JSON whose `regex` field matches metadata
    timeout messages. Sibling canons with SSRF vocabulary already grade low;
    this one lacks attack wording in-window. Singleton — deferred.
- 2 AG-CL-001 highs inspected: `ChromeDevTools_chrome-devtools-mcp` real
  (intentionally public, per code comment) Google CrUX `AIza…` API key literal,
  and `brainwhocodes_branchlight-repo` embedded `CLAUDE_TRACE_DEBUG_KEY` PEM
  private key — both real credential-shaped literals, correct.
- 1 AG-SK-003 high: `osforge` prisma-expert skill runs a load-time `!\`…\``
  command that greps `.env` for `DATABASE_URL` (presence check only, value not
  echoed). Load-time `.env` access in a dynamic-context command is the exact
  surface the rule covers; presence-only variant recorded as a singleton
  severity-nuance deferral.

## Medium/low sampling

- AG-SK-002 mediums (267): scoped-but-broad grants — correct.
- AG-RC-001 mediums (46): real execSync/child_process/eval literals and
  curl|sh text in non-executable files — correct.
- AG-SC-001 mediums (12): real `@latest` unpinned MCP servers
  (Tristan578_project-forge ×5) and mutable marketplace plugin sources
  (rampstackco) — correct.
- AG-AM-001 mediums (2): real unauthenticated remote MCP endpoints
  (memory.vertiso.ai, mcp.e2llm.com) — correct.
- Low AG-SS-001 (42): defensive guards, test paths, detection-tool sources —
  r413/r415 wording present, correct.
- Low AG-CL-001 (32): test/fixture-path secret shapes — correct quiet grading.
- Low AG-TP-001 (25): BOM/ZWSP/line-separator artifacts in tests and generated
  files — correct.
- Low AG-SK-001 (10): fenced quoted injection examples — correct.

## Outcome

No two-repo generalizable defect found. No code change, no changeset.
Deferred singletons recorded: deadends.dev error-signature canon (SS-001),
branchlight proxy.ts defensive doc comment (SS-001, same-repo),
osforge presence-only `.env` check (SK-003), plus prior rounds' deferrals
(medusa `_BIDI_`, Infrawrench validator, oxbshw bidi-isolate constants,
AbrahamOO placeholder token, kai-kou docstring example).

## Gate

GitHub Actions outage ongoing — ordinary CI did not run. GitGuardian + local
lint green (docs-only change).
