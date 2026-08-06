# GAP-ROUND-70 — data checkpoint (rounds 61–69)

Date: 2026-08-06. Every number below is from a real command run on this date;
nothing is estimated.

## Shipped since the round-60 checkpoint

- PRs merged: #126 (Windsurf/Cline/Cursor skill trees), #128 (Gemini TOML),
  #129 (structural-tag FP fix), #130 (MCPA-2026-0015), #131 (table path
  wrapping), #132 (lockfile v2 / `lock --skills`), #133 (GitHub Action flag
  fix + smoke test). Open pending CI: #134 (README v2 catch-up), #135 (drift
  annotations).
- Releases: v0.14.0 (mcp-agentgate + core), tag + GitHub Release + clean-env
  regression done.
- Advisory DB: 28 → 29 (MCPA-2026-0015, LudusMCP CVE-2026-19045); watch
  sweeps this window: zero uncovered reports.

## New capability class: instruction-surface locking

Rounds 66–69 closed the loop scan→lock→gate for skill files. Real-scale
measurement on `davila7/claude-code-templates` (shallow clone, 2026-08-06;
896 `SKILL.md` + other instruction files = **958 files pinned**):

- `lock --skills .`: 0.23 s wall (excl. node startup ~0.1 s), lockfile 175 KB.
- `diff --skills .` clean: 0.23 s; after editing one skill: exactly one
  `skill-changed` entry naming the file. No false drift across 958 files.

## Quality finds this window (all real, all fixed)

- GitHub Action shipped broken flags (`--lock`/`--sarif` — never valid CLI
  options); default `command: ci` failed 100%. Fixed + action-smoke CI job
  (#133). Signal: nobody external had reported it → adoption still weak.
- README/messaging drift after v2 (#134); drift entries never annotated on
  PR diffs (#135); `<instructions>` template FP on 257 real Cursor rule
  files (#129).

## Adoption (upper bounds, own CI included)

- npm 30-day downloads (2026-07-07 → 2026-08-06): mcp-agentgate 1,668;
  mcp-agentgate-core 1,751. Flat vs round-60 — still no organic signal.

## Environment note

GitHub suffered a major Actions outage today ("Partial System Outage");
workflows queued 1–3 h. #132/#133 were merged on locally-verified green
suites; queued CI runs will backfill on recovery.

## Standing gaps

- 0.15.0 version PR blocked on the Release workflow queue.
- Marketplace publishing of the action deferred (needs root action.yml or
  dedicated repo).
- Cloudflare repo secrets absent → manual deploys; npm trusted publisher
  not configured.
- Organic adoption weak; distribution (Marketplace listing, launch posts)
  remains the biggest non-code gap.
