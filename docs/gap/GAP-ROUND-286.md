# GAP-ROUND-286 — advisory sweep (GHSA/OSV window since round 281)

Round type: routine advisory intake (previous sweep: round 281).

## Sweep

- GHSA vulnerability window: `api/scripts/watch.mjs` — no uncovered MCP-related
  advisories.
- Malware namespace window: ossf/malicious-packages entries modified since
  2026-08-01 — 2,599 records, 65 MCP/agent-named candidates triaged one by one.

## Inducted (83 → 87), all verified by unpacking the latest npm tarball

- **MCPA-2026-0070 / anthropic-setup (critical, all versions, STILL LIVE
  1.0.1)** — base64-concealed eval writes `~/.claude/settings.json` with
  `ANTHROPIC_BASE_URL=https://sugarball.vercel.app` + the supplied API key, so
  all Claude Code traffic (key + prompts/responses) flows through the
  attacker's deployment. Directly attacks a config surface we scan.
- **MCPA-2026-0071 / remote-claude-daemon (critical, all versions, STILL LIVE
  0.6.8)** — outbound WebSocket relay drives the local `claude` binary with
  `--dangerously-skip-permissions` on remote-supplied prompts plus full
  synthesized desktop input via nut-js. 0.6.8 verified: same pipeline, relay
  moved from remote-claude-relay.fly.dev to wss://relay.teleportus.ai.
- **MCPA-2026-0072 / claude-token-tracker-mcp (critical, 1.0.0)** — poser MCP
  token-tracking server; silentHarvest at module load reads Claude configs,
  shell histories, and KEY/TOKEN/SECRET/ANTHROPIC/OPENAI/CLAUDE/DEEPSEEK env
  vars and uploads to litterbox.catbox.moe. npm replaced it with a
  security-holder release; precise version recorded.
- **MCPA-2026-0073 / @guangnao/claude-cli (high, all versions, STILL LIVE
  1.0.17)** — hub endpoint concealed behind a one-off base64+XOR decoder,
  enabled by default (README claims opt-in); remote hub jobs are relayed
  through the installer's local API key. 1.0.17 verified: decoder + default-on
  hub still present.

## Rejected (documented, not inducted)

- **install-email-research campaign (~14 MCP-named npm packages**: chaos-mcp,
  gtm-mcp-auth, hit-mcp, iwomm-mcp, kip-mcp-http, pm-claude-skills-mcp,
  sap-mcp-facilitator, sap-mcp-config, smart-npv-mcp, maximumsats-mcp,
  mcp-server-boilerplate, refbase-mcp, routerbase-mcp, …) — consent-gated
  email/hostname collection to one Zapier webhook, no credential theft, all
  already replaced by npm security-holder releases. Below the induction bar.
- code-analyzer-mcp, @copilot-mcp/apex, mcp-audit-sync-internal — already
  removed from npm (self-labeled RCE PoC / hollow dropper lure / dependency
  confusion); OSV live check (AG-SC-002) covers historical references.
- claude-code-timer — scanner explicitly found no malicious behavior.
- ~40 generic agent-named trojans and dependency-confusion internal names
  (wormgpt-cli, gpt-terminal-cli, chatcc-agent, vanexa/wagni/whalent families,
  @servicetitan/anvil2-mcp, …) — not on our scan surface; OSV real-time check
  is the backstop, per the round-267/271/281 bar.

## Verification

- 87 files pass `api/scripts/validate.mjs` schema validation.
- End-to-end: a config referencing the four packages yields AG-SC-003
  critical/high hits for all four (plus AG-SC-002 OSV corroboration).
- Advisory-count CI gate updated (83 → 87 on the comparison page).

## Note for the external reporting list

anthropic-setup, remote-claude-daemon, and @guangnao/claude-cli are still
installable on npm — candidates for the same npm-security report batch as the
four packages already on the list.
