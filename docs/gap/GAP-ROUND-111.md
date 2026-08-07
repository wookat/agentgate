# GAP-ROUND-111 — v0.23.0 close-out + OAuth store hardening

Date: 2026-08-07 · Round type: release close-out + hardening

## Release close-out (0.23.0)

- v0.23.0 tag + GitHub Release; website redeployed (remote-oauth guide +
  comparison OAuth row live in production).
- Comparison version fix: OAuth row said "since 0.22.0" but 0.22.0 was never
  published to npm — both OAuth minors shipped as 0.23.0 (#189).
- Clean-env regression (npx 0.23.0, fresh cache, isolated
  `AGENTGATE_CONFIG_DIR`): no-credential `scan --live` prints the
  `auth login` hint; with cached tokens `lock` pins the remote surface
  (whoami) against the Bearer-gated fixture; `auth status`/`logout` work.

## Hardening shipped this round

- `readStore()` rejects non-object JSON (corrupted file, array, `null`) and
  returns an empty store instead of letting a bad shape flow into
  status/login/live-scan paths.
- `writeStore()` re-chmods to `0600` on every write — `writeFileSync`'s
  `mode` only applies on file creation, so a store loosened externally
  (e.g. `chmod 644`) stayed loose across logins before this.
- Tests: corrupted/array store treated as empty; permissions re-tightened
  after an external chmod.

## Routine sweep (real checks, this round)

- advisory watch: no uncovered MCP-related advisories.
- Competitors unchanged: thynkQ mcp-scan 2.0.2, socket CLI 1.1.154,
  snyk-agent-scan 0.5.16.

## Remaining gaps

- Real-provider OAuth e2e still needs a human pre-registered OAuth app
  (`--client-id`) — resource ask stands with the boss.
- Concurrent CLI processes can still race on oauth.json (last write wins);
  acceptable for a per-user CLI, revisit only if real reports appear.
