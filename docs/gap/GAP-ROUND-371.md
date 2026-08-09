# GAP-ROUND-371 — fresh-corpus precision: deny-list data, multi-line data strings, compound example keys, demo JWTs, guard-wrapper SSRF context

Date: 2026-08-04

## Routine windows

- Advisory watch (authenticated): zero uncovered. OSV npm/PyPI export ETags
  unchanged vs the r369 snapshot.
- Nine-client version window: unchanged.
- v0.67.29 release closed out this round (npm verified, tag at 65e8932,
  GitHub Release, deploy verification 104/104, clean-env regression 9/9).

## Fresh corpus

GitHub code search was intermittently unavailable (503 "too many shards
unavailable"); corpus built via repository-search fallback across the agent
surfaces (skills allowed-tools, .claude/hooks, .mcp.json, .cursor/mcp.json,
AGENTS.md curl, opencode.json, settings permissions, goose recipes,
marketplace.json, .github/agents, GEMINI.md, .factory), deduplicated against
all prior corpora: **140 fresh repos**, 977 medium / 713 high / 239 low /
17 critical findings scanned with the r369-equivalent build.

## Hand-verified FP classes fixed (all with source inspection)

1. **AG-RC-001: deny/block-list entries in data files and source** —
   `blacklist: ["curl * | sh", …]` in a skill's security.yaml (10 findings,
   nvfivem_pattern8) is a defensive control list, not a pipeline. Data-format
   files (yaml/toml/json) whose match sits under a deny/block/blacklist key
   now grade low with deny-list wording; the deny-list key parser also
   accepts unquoted keys (`deny: [...]` in permission.js).
2. **AG-RC-001: multi-line data strings in shell scripts** — a new
   `maskMultilineDataStrings` pass masks multi-line quoted strings that open
   as data (a `VAR='…'` assignment or a plain command argument like
   `fail "…"`): test-suite payload assignments (buldee test-agent-hooks.sh)
   and installer fallback error text quoting its own one-liner
   (entroly scripts/install.sh L143 — the live install there is
   `sh -c "$INSTALL_CMD"` with pip/pipx, no curl|sh pipeline). Interpreter/
   eval/ssh/sudo/xargs openers stay live; bodies opening with curl/wget stay
   live; command substitution in the body stays live. Live installer
   pipelines re-verified critical: zhonghao web/install.sh
   (`curl -fsSL "$URL" | bash -s -- "$@"`), skillguard known-bad hook.
3. **AG-CL-001: compound example keys** — `"bad_example": "api_key = \"sk-…\""`
   in a linter rule KB (agnix ×2): the example-key check now sees markers
   after `_`/`-` (`bad_example:`, `"good-example":`).
4. **AG-CL-001: self-describing demo JWTs** — JWTs whose decoded payload
   names itself demo/test/example (`"name":"demo agent"`, agent402 ×3) grade
   low with confirm wording; opaque payloads stay high (regression pinned).
5. **AG-SS-001: safe-fetch guard wrappers and exclusion guidance** — a
   `safeFetch(…)`-style wrapper invocation near the metadata literal is the
   guard itself (works for non-English comments, pulsefeed mcp/index.ts);
   "without excluding the cloud metadata endpoint" review guidance
   (vanguard metadata.json) now matches the defensive-context word list.
   Bare metadata fetches stay high (regression pinned).

## Kept as true positives (inspected)

- All 5 remaining r371 criticals: live curl|bash installers (zhonghao,
  seanhogg e2e, skillguard known-bad), dangerous-hook test fixture (agnix),
  action.yml live install step (dimitrigeelen).
- juyterman1000_entroly documented curl|sh forms → low (comment wording).
- semgrep planted-defect SSRF fixture
  (echo6bravo scripts/semgrep-rules/py-ssrf-url-from-scanned-data.py) stays
  high: it self-describes as a deliberately vulnerable fixture but sits
  outside any test/fixture path convention — honest deferral, revisit if the
  class recurs.
- akbar-dzikri remote-URL OpenCode instruction, mcp-mermaid advisory match:
  correct.
- AG-SK-002 high volume (703) sampled: rule-semantic true positives
  (`allowed-tools: Bash` pre-approvals).

## Head-to-head (seven corpora)

- r343/r353/r356/r368: byte-identical finding sets.
- r359: 1 change — permission.js `deny:` list medium→low (verified defensive).
- r363: 1 change — entroly fallback-error-text critical→low (the r363 GAP's
  deferred item, now verified: the quoted one-liner is error-message text).
- r371: exactly the 17 hand-verified FP changes above (10 deny-list yaml
  criticals→low, 2 fixture/prose criticals removed, 5 CL/SS highs→low),
  zero other drift.

## Validation

Full suite green (556 tests), lint/typecheck clean, coverage gate holds.
