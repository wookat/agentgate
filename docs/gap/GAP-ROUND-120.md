# GAP-ROUND-120 — data checkpoint (rounds 111–119)

Date: 2026-08-07 · Round type: data checkpoint (every 10 rounds)

## Shipped since round 110

- 9 feature/fix PRs merged: #190 (OAuth store hardening), #191 (auth docs),
  #192 (headers-shadow warning), #194 (AG-CL-001 placeholder FP), #195
  (LM Studio), #197 (LM Studio .cache path), #199 (Trae MCP config), #201
  (Trae rules scanning), #202 (Qoder discovery — in flight at writing).
- 3 npm releases: 0.23.1, 0.24.0 (config-convert 0.7.0), 0.24.1; 0.25.0
  version PR (#200) green at writing. Tags/Releases v0.23.1–v0.24.1 with
  clean-environment regressions each.
- Client coverage 15→18 named clients (LM Studio, Trae, Qoder) — all from
  official docs; undocumented paths (Trae global GUI, Cherry Studio, Qoder
  SharedClientCache) deliberately excluded.
- Instruction-surface coverage: Trae `.trae/rules/*.md` + legacy
  `project_rules.md`/`user_rules.md` now scanned and lockable.

## Data (verified today)

- Advisories: 31 in repo = 31 in live API = 31 in feed; advisory watch:
  zero uncovered MCP-related advisories.
- False positives: rounds 114 placeholder fix keeps mcp-agent at 0
  findings; hono/fastapi/httpx remain 0 from earlier rounds.
- Performance: self-scan 154 files / 17 findings in 0.20s (same
  hardware-class baseline as round 110's 0.21s).
- npm 30-day downloads: mcp-agentgate 3,124 (was 1,668 at round 100),
  core 1,751, config-convert 200. Honest caveat: the registry shows the
  entire 3,124 concentrated on Aug 4–6 (248/1,420/1,456) with zeros
  before — this window coincides with our own release/regression/CI
  activity and npm's stats lag, so organic adoption cannot be inferred
  from it.
- Competitors: thynkQ mcp-scan 2.0.2 (unchanged since round 101 re-test,
  still no remote connection), socket 1.1.154; no new MCP-scanning
  entrants observed.

## Biggest open gaps (unchanged priority)

1. Distribution/adoption: Marketplace listing + launch publicity remain
   the top lever (escalated at round 100; awaiting boss decision).
2. Real-provider OAuth e2e still needs a human-registered OAuth app
   (--client-id) — protocol paths covered by local fixtures.
3. includeTools globs beyond `*` (round 95 note) — no real-world demand
   observed yet; keeping as-is.
