# GAP-ROUND-141 — OpenCode permission config

Date: 2026-08-07 · Round type: overprivilege coverage (OpenCode)

## Source (official)

OpenCode permissions docs (https://opencode.ai/docs/permissions/):
`opencode.json` has a `permission` config where each rule resolves to
"allow" / "ask" / "deny"; `"permission": "allow"` sets every tool at
once; per-tool object syntax supports granular wildcard rules with the
last matching rule winning.

## Gap

OpenCode's project `opencode.json` was already discovered for MCP
servers (round-88-era coverage), but a checked-in `permission` block
pre-approving tools for everyone opening the project — the direct
analogue of Claude's `permissions.allow` / `bypassPermissions` covered
in rounds 134–138 — was not inspected. `opencode.jsonc` was not walked
at all (`.jsonc` wasn't a source extension).

## What shipped

- AG-SK-002 checks `opencode.json` / `opencode.jsonc`:
  - catch-all `"permission": "allow"` or `"*": "allow"` → high;
  - per-tool `bash` (high) / `edit` / `write` / `webfetch` (medium)
    whose string value or object catch-all is "allow".
- Granular rules (`"git *": "allow"` under `"*": "ask"`) report nothing.
- `.jsonc` added to source extensions (parseJsonc already tolerates
  comments).

## Honest boundaries

- Last-match-wins evaluation is not fully modeled: we flag only when
  the tool's catch-all is "allow", so `{"*": "allow", "rm *": "deny"}`
  under `bash` is flagged (correct — everything except rm is allowed)
  but complex rule chains aren't simulated.
- Global `~/.config/opencode/opencode.json` is outside the project
  tree — not scanned (same boundary as Claude user settings).
- `--auto` mode is a CLI flag, not a config — out of scope.

## Evidence

- Full suite green: core 216, cli 47, config-convert 24.
- Self-scan unchanged (17 findings).
