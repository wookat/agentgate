# GAP-ROUND-429 — fresh-corpus verification (honest no-defect round)

Date: 2026-08-03. Scanner: `main@3d1d0e2` (0.67.58).

## Corpus

Fresh 140-repo corpus across the seven agent-surface query families
(`/home/ubuntu/corpora/r429`): 2,760 candidates → 1,495 unseen after dedupe
against the historical `seen.txt` → 140 picked, 0 clone failures. Scan:
395 findings (6 critical / 66 high / 127 medium / 196 low), zero parse
failures (warnings were repo-content diagnostics + 15 legitimate
"nothing was scanned" repos with no agent surface).

## Critical triage (all 6 inspected in source)

- 5 real remote install pipelines: `astral.sh/uv` installer (tg-cli
  install.sh), `claude.ai/install.sh` curl|bash ×2 (agent-fleet container
  entrypoint, prep-marketing bootstrap.sh), `ollama.com/install.sh` inside
  an executed LLM-server recipe `install:` block (kdeps), and
  `railway.com/install.sh | sh` (railwayapp_cli agents.sh). All true
  positives — executable install surfaces.
- 1 concealment-instruction hit kept hot: `kakehashi-inc_agent_cli_devkit`
  `AGENTS.md` embeds the GPT-5 prompting-guide `<self_reflection>` block
  whose "do not show this to the user" is a live concealment instruction in
  an active instruction file. Semantically a correct hit (the file does
  instruct the agent to hide content from the user); widely copied
  boilerplate, but no second corpus sample — recorded as a slow-burn
  observation, not generalized.

## High triage

- 55 AG-SK-002: real unscoped `Bash`/`Edit`/`Write` allowed-tools and
  permission grants (theokit-sdk 34, claude-workspace 17, plus opencode
  `permission.bash: allow` and Claude settings `permissions.allow: Bash`).
  Verified samples all genuine unrestricted pre-approvals. Correct.
- 6 AG-SS-001: chrismatteson CFN `compute.yaml` UserData performs a live
  IMDSv2 token fetch + metadata reads in provisioned-instance bootstrap —
  true positive, kept. poojakira mcp-security-gateway-monitor (5) is an
  MCP-security red-team/benchmark repo with intentional
  `169.254.169.254/latest/meta-data/iam/security-credentials/` payloads
  under `src/` and `benchmark/` — intentional adversarial fixtures kept hot
  per r393/r407/r417 precedent.
- 4 AG-CL-001: azmartone `land-power-app.js` has a real-shaped `AIza…`
  Google API key hardcoded in frontend (author-annotated
  `// secretscan:allow`) — true positive, kept. Two singletons deferred
  (below).
- 1 AG-TP-001: Atlansdaddy `breakers.js` — a security-education payload
  table with a live U+202E bidi-override inside a quoted "Trojan Source"
  example payload. Live hidden char in ordinary JS source; educational
  intent, single repo — kept, recorded as slow-burn.

## Singletons deferred (each 1 repo, below the two-repo bar)

- Atlansdaddy `masking.js`: comment-line backtick examples
  `sk-proj-REPLACE_THIS_BEFORE_RUNNING_LOCALLY` /
  `xoxb-REPLACE-ME-WITH-A-REAL-BOT-TOKEN` flagged high — the placeholder
  word list does not include "replace"; historical corpus grep found no
  second firing sample (existing REPLACE_ME values are short or in
  .example files that don't fire).
- azmartone `check_no_leaked_credentials.py`: a fake `ghp_…` token in the
  secret-checker's own self-test vector list flagged high — filename
  carries no test/selfcheck delimiter covered by r381.

## Medium/low sampling by rule

- AG-SK-002 medium (79): real scoped-but-broad grants (WebSearch, Edit,
  Write pre-approvals). Correct.
- AG-SC-001 (21): real mutable marketplace/plugin sources. Correct.
- AG-RC-001 medium/low: catalog-text curl|sh graded quiet in
  non-executable files; comment-line mentions low. Correct.
- AG-TP-001 low (113): 96 are U+200B in jafshare_GithubTrending scraped
  trending-data JSON — data files, graded low as designed. Correct.
- AG-SS-001 low: defensive/blocking contexts (transport.js probe guard,
  webResearch.ts) graded low per r347/r413/r415. Correct.
- AG-SK-001 low: fenced/inside-example injection patterns. Correct.

## Outcome

No two-repo generalizable defect. No code change, no changeset. Three new
singleton slow-burns recorded (REPLACE-valued placeholder comments,
self-test vectors in checker scripts, security-education bidi payload
tables) plus the GPT-5 boilerplate concealment observation.

## Gate

GitHub Actions outage ongoing — ordinary CI did not run. GitGuardian +
local lint green (docs-only change).
