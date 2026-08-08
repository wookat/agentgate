# GAP-ROUND-244 — advisory sweep: Flowise post-sunset batch + OpenHands resolver injection

Date: 2026-08-08. Routine advisory sweep (last: round 238). GHSA window
2026-08-01..08-08 reviewed; 4 new package-mapped entries added (69 → 73).

## New entries

- **MCPA-2026-0056** (high, npm `flowise` ≤3.1.4): unauthenticated OAuth2
  credential refresh via prefix-based auth-whitelist bypass
  (CVE-2026-70636) — a bypass of the earlier CVE-2026-41273 fix.
- **MCPA-2026-0057** (high, CVSS 9.9, npm `flowise` ≤3.1.4): OpenAI
  Assistants IDOR — arbitrary credential UUIDs expose cross-workspace
  credentials, files, and vector stores (CVE-2026-67622).
- **MCPA-2026-0058** (high, npm `flowise` ≤3.1.4): document store
  upsert/refresh endpoints missing authorization (CVE-2026-67621).
- **MCPA-2026-0059** (medium, pypi `openhands-ai` ≤0.62.0): command
  injection in the resolver's `initialize_repo` (CVE-2026-19022); vendor
  deleted the issue report, affected file removed by the 1.x restructure —
  recorded honestly as `last_affected: 0.62.0`.

Material context: **Flowise announced its sunset** (flowiseai.com/sunset) —
these three have **no fixed release**; 3.1.4 (latest) remains affected, so
the entries use `last_affected: 3.1.4`, unlike the fixed-in-3.1.3/3.1.4
batches of rounds 228/238.

## Already covered / not entered

- NocteDefensor LudusMCP GHSA-grhp/6j8j/5ccg republications are our existing
  MCPA-2026-0015/0016/0017 (aliases already present).
- VulDB low-severity agent-app batch (mercury-agent, hermes-agent, NanoClaw,
  LobsterAI, CowAgent, super-agent-party, MetaGPT ×3, godot-mcp, mcp-api,
  ssh-mcp-server, la-forge-mcp, poco-agent, ironclaw, LettaBot): no GHSA
  package mappings and mostly not discoverable through supported scan
  surfaces; deferred per the standing scope decision. Candidates with real
  registry packages can be picked up once upstream confirms.
- WordPress AI-plugin batch (AI Engine, FormGent, TranslatePress, …): not a
  scan surface.

## Verification

- `api npm run validate`: 73/73 schema-valid; api tests green.
- Core bundle rebuilt (73 entries); end-to-end: `flowise@3.1.4` hits
  0056+0057+0058; `openhands-ai@0.62.0` hits 0059; `openhands-ai@1.7.0`
  clean.
- Full workspace checks green; self-scan baseline unchanged.
