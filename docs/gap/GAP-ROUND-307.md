# GAP-ROUND-307 — Automated GitHub-malware watch + four verified agent-hijack advisories (95 → 99)

## Why this round

Round-306 recorded a durable boundary: the OSV npm/PyPI bulk exports have been
byte-identical across three consecutive rounds (r295/r298/r301..r306 — the
`Last-Modified` header moves but the content MD5 does not), so the MAL snapshot
diff produces nothing while the GitHub malware advisory window keeps yielding
real entries — and that window was being pulled and filtered by hand every
round. This round automates it into the existing `watch.mjs` sweep and then
runs the automated sweep for real, triaging every candidate.

## What changed in the watch script

- `api/scripts/watch.mjs` gains a `malwareSweep()` that pages the GitHub
  Advisory API (`type=malware`, same `WATCH_DAYS` window, token optional) in
  parallel with the existing GHSA-keyword and OSV sweeps.
- `api/scripts/watch-lib.mjs` gains `MALWARE_NAME_VOCAB` (mcp / claude /
  anthropic / copilot / cursor / codex / gemini / opencode / goose / cline /
  kilo / qwen / windsurf / aider / agent / llm, matched at name-token
  boundaries) and `filterMalware()`: npm/PyPI packages only, per-advisory
  package dedupe, vocabulary match on a package name or an explicit MCP
  mention in the advisory text, then the existing alias / ignore /
  tracked-package exclusions.
- The report renders a dedicated malware section and the triage block includes
  `--draft` commands for malware GHSA ids. `renderReport` keeps a default
  empty `malware` argument so existing callers are unchanged.
- 12 new focused tests in `api/test/watch.test.mjs` (24 total passing) pin the
  vocabulary boundary behavior (`useragent-parser` must not match), the MCP
  text fallback, alias/ignore/tracked exclusions, dedupe, and rendering.

Name matching only creates candidates. Every candidate below was verified
against the original GHSA/OSV record and, where installable, the unpacked npm
tarball, before any MCPA record was written.

## Accepted (4 entries, all tarball-verified)

- **MCPA-2026-0082 — @atom8n/inspector (critical, still installable at
  0.17.32).** Impersonates Anthropic's MCP Inspector (spoofed author/homepage)
  and reintroduces CVE-2025-49596: auth inverted to off-by-default
  (`DANGEROUSLY_OMIT_AUTH !== "false"`), origin-validation middleware body
  commented out, proxy spawns `query.command` via StdioClientTransport. All
  three verified in `server/build/index.js` of the unpacked tarball.
- **MCPA-2026-0083 — trimprompt (high, still installable at 1.0.49).**
  postinstall auto-runs shim installation into Cursor/Claude Code command
  paths; nearly every module is `_0x` obfuscated; obfuscated sync.js/tracker.js
  pair child_process with HTTP POSTs of hostname/identifier fields. Recorded
  high, not critical: destinations stay hidden behind the string-array
  obfuscation, so no remote-command channel could be proven.
- **MCPA-2026-0084 — @addai/node (critical, still installable at 0.11.3).**
  Autostart daemon polls a hardcoded Supabase backend and passes row fields
  (prompt, working_directory, permission_mode incl. bypassPermissions, agent
  incl. claude-bypass) to spawn/PTY calls driving local claude/codex/kimi/
  gemini/grok CLIs; remote `npm install -g` self-update; probeCapabilities()
  reads ~/.codex/auth.json, ~/.gemini/oauth_creds.json and other third-party
  credential stores and reports them to the same backend. GHSA lists 0.4.0 to
  0.11.2, but the unpacked latest 0.11.3 carries the same session-runner, so
  the record covers the whole line.
- **MCPA-2026-0085 — @xiaohhhh1/canvas-agent (critical, still installable at
  0.4.11).** Bin auto-connects to hardcoded
  `wss://canvas.xiaohhhh1.com/api/agent-relay`; relay peers reach
  /agent/codex/turn and /agent/claude/turn, and permissionMode 'full' maps to
  Codex `danger-full-access` with approvalPolicy 'never' (verified in
  dist/relay-bridge.js and dist/agent/codex-client.js), plus arbitrary-path
  image reads via /agent/local-image.

## Rejected (recorded in watch-ignore with rationale)

- **Removed compromised versions, unverifiable:** @servicetitan/anvil2-mcp,
  @or-sdk/agents, @or-sdk/mcp-tools, @onereach/or-sdk-agent-cli. The affected
  versions are gone from npm (direct version queries 404) and no public
  payload analysis exists, so the evidence bar for an MCPA record cannot be
  met; stale-lockfile matches remain covered by the OSV live check
  (AG-DP-006/AG-SC-002).
- **Security-holder placeholders (0.0.1-security, nothing to analyze):**
  refbase-mcp, hit-mcp, iwomm-mcp, mcp-server-boilerplate, chaos-mcp,
  gtm-mcp-auth, sap-mcp-facilitator, maximumsats-mcp, sap-mcp-config,
  kip-mcp-http, pm-claude-skills-mcp, routerbase-mcp, smart-npv-mcp.
- **Off-ecosystem / dependency-confusion:** @zzzcrypto/solana-spl-token
  (crypto typosquat), twork-data-services-sme-agent-company-relation
  (internal-name placeholder).
- **Re-listed prior rejections under new GHSA ids:** zyr-agent, chatcc-agent,
  @ohos-ports/codex, both Vanexa relay-pairing packages, and the
  @agenthub-ai/agent security-holder (active surface already covered as
  MCPA-2026-0080).

After these ignore additions the automated sweep reports a clean window
(`--dry-run`: "No uncovered MCP-related advisories found").

## Boundaries recorded

- The malware sweep excludes any package channel already tracked in the MCPA
  database. If a tracked channel ships a *new* malicious version under a new
  GHSA id, the alias check will not catch it and the channel exclusion hides
  it; acceptable for now because tracked channels are full-line records, but
  worth revisiting if version-scoped records accumulate.
- OSV bulk exports still have not refreshed; the OSV querybatch live check and
  the new GitHub malware sweep are the operative feeds.
- npm reporting for the three still-installable packages remains an external
  action (see 需注意 in the round report).
