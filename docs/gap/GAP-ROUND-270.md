# GAP-ROUND-270 — Data checkpoint (rounds 261–269)

Date: 2026-08-08. Documentation-only checkpoint round; all numbers below are
measured, not estimated.

## What shipped in this window (9 PRs, all merged)

| Round | PR | What |
| --- | --- | --- |
| 261 | #385 | Advisory MCPA-2026-0060 — mcp-ui-probe path traversal (CVE-2026-19270, last_affected) |
| 262 | #387 | config convert supports crush (Charm) — 20th client |
| 263 | #389 | config convert supports goose (Block) — 21st client |
| 264 | #390 | config convert supports factory, junie, qoder, qwen-code, copilot-cli — convert/discovery gap zeroed |
| 265 | #392 | Wild-corpus sweep of rounds 262–264 converters (210 real configs) + qwen-code `httpUrl` fix |
| 266 | #394 | Cline `.cline/` project tree — skills (AG-SK-001) + auto-executed plugins (AG-RC-001) |
| 267 | #395 | Advisories MCPA-2026-0061..0063 — live OpenCode plugin binary hijack + MCP-named npm malware batch |
| 268 | #397 | Cline surface precision sweep — 69 repos / 2,181 wild SKILL.md, 0 false positives |
| 269 | #398 | Kilo Code client — MCP discovery (project + globalStorage), approval checks, project-tree scanning, convert |

Window highlights: the config-convert catch-up arc (crush → goose → the
final five) closed the convert/discovery gap entirely, then a 210-config
wild sweep caught a real qwen-code remote-notation bug; two brand-new
client project trees (Cline `.cline/`, Kilo Code `.kilocode/`+`.kilo/`)
became visible with immediate wild yield — the Kilo corpus alone surfaced
233 previously invisible findings (11 hardcoded API keys, 10 destructive
auto-approvals, 1 advisory critical); and the advisory sweep found
still-installable npm malware (opencode-optimised-toolings) verified by
unpacking the live 6.2.0 tarball.

## Measured data (2026-08-08)

- Tests: 433 → **442** on main (core 366, cli 47, config-convert 29). All
  suites, lint, typecheck, build green.
- Self-scan (dogfood): 202 source files, 21 findings (15 medium, 6 low),
  **0.80 s** wall clock.
- Advisories: **77** — repo `advisories/MCPA-*.json`, live API
  `/v1/advisories`, and website `/feeds/advisories.json` all agree
  (three-way consistent; count also enforced by the round-255 CI gate).
- Website: https://agentgate.zalize.com returns 200.
- npm last-month downloads: mcp-agentgate **3,124**, mcp-agentgate-core
  3,355, config-convert 451 — the twelfth consecutive flat checkpoint.
  Distribution remains the biggest gap and stays escalated for an owner
  decision.

## Release status

v0.63.0 shipped mid-window (owner published the three packages manually
after the workflow's npm-credential gap; tag 4340221, GitHub Release,
deploys and clean-environment regression all verified). The Release
workflow fix remains an owner-side external item (npm trusted publisher or
`NPM_TOKEN` secret), tracked on the owner's list.

## Carry-over boundaries

- crush OAuth config and goose recipe extensions are not convert sources
  (rounds 262/263).
- Plugin/pseudo-clients without a client-owned config file are not convert
  targets (round 264).
- `.cline/plugins` npm dependencies get no dependency-level advisory check
  yet; global `~/.cline/` and `~/.kilocode`/`~/.kilo` rule trees are outside
  repo scanning per the global-tree policy (rounds 266/269).
- Kilo `autoApprove` classification is inherited from the shared Roo fork
  semantics; no wild usage observed either way (round 269).
- Go/rubygems advisory ecosystems stay deferred until a matching scan
  surface exists (owner decision, round 235).
