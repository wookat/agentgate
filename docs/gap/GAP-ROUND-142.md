# GAP-ROUND-142 — real-corpus verification of the OpenCode check

Date: 2026-08-07 · Round type: real-corpus verification + fixes

## Method

GitHub code search: ~6,672 `opencode.json` files mention
`permission`+`allow`; ~1,680 `opencode.jsonc` files mention
`permission`. Cloned four real repositories (alumnium-hq/alumnium,
cloudflare/telescope, Kilo-Org/kilocode, rokicool/gsd-opencode) and
scanned with the merged round-141 build.

## Findings on round-141 as merged

- True positives: alumnium's top-level `bash`/`edit`/`webfetch`
  "allow" reported (high + 2 medium); alumnium also sets
  `enableAllProjectMcpServers` in `.claude/settings.json` (round-138
  check hit on an unrelated corpus repo — good sign).
- Correctly clean: kilocode's JSONC granular `edit` deny; gsd-opencode
  (no permission block).
- Two real gaps caught and fixed this round:
  1. `websearch: "allow"` (alumnium) wasn't a risky key even though the
     Claude-side RISKY_GRANTS treats WebSearch as an exfiltration
     channel → added (medium).
  2. cloudflare/telescope puts its permission block under
     `agent.telescope.permission` (per-agent override) — round-141 only
     read the top level → per-agent blocks now scanned, scope shown in
     the message (`agent.telescope.permission.webfetch`).

## Post-fix corpus results

- alumnium: +1 medium (websearch) alongside the round-141 hits.
- telescope: 1 medium (`agent.telescope.permission.webfetch` "allow");
  its heavily-scoped bash rules stay clean.
- kilocode / gsd-opencode: still 0.

## Honest boundaries

- Rule-chain semantics beyond the catch-all are still not simulated
  (unchanged from round-141).
- `skill`, `codesearch`, `doom_loop` etc. are OpenCode permission keys
  we deliberately don't flag — no direct exfiltration/RCE risk.

## Evidence

- Full suite green: core 217, cli 47, config-convert 24.
