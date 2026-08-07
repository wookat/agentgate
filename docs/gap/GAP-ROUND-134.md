# GAP-ROUND-134 — Claude Code settings permissions (.claude/settings.json)

Date: 2026-08-07 · Round type: overprivilege coverage

## Source (official)

Claude Code settings docs (https://code.claude.com/docs/en/settings):

- Project settings live in `.claude/settings.json` (team-shared, checked
  in) and `.claude/settings.local.json` (personal overrides).
- `permissions.allow` pre-approves tool patterns, e.g.
  `"Bash(npm run lint)"`, `"Bash(npm run test *)"`, `"Read(~/.zshrc)"`.
- Settings hot-reload — a checked-in allow entry takes effect for every
  collaborator without a restart.

## Gap

AG-SK-002 flagged dangerous unscoped `allowed-tools` grants in skill
frontmatter, but a checked-in `.claude/settings.json` granting a bare
`Bash` (or `bypassPermissions` mode) pre-approves the same capability
for everyone opening the project and was not inspected — the files were
walked (`.claude` is an agent dot-dir, `.json` is a source extension)
but no rule looked at `permissions`.

## What shipped

- AG-SK-002 `checkSource` parses `.claude/settings(.local).json`:
  `permissions.allow` entries run through the existing RISKY_GRANTS
  table (bare/star `Bash` high; unscoped `Write`/`Edit`,
  `WebFetch`/`WebSearch` medium), and
  `permissions.defaultMode: "bypassPermissions"` reports high.
- Scoped grants (`Bash(npm run lint)`, `Read(~/.zshrc)`) and deny lists
  report nothing; malformed JSON is skipped (AG-RB-001 covers that).
- Rules doc updated (overprivileged page).

## Honest boundaries

- Managed/user-level settings (`managed-settings.json`,
  `~/.claude/settings.json`) are outside the project tree — not scanned.
- `permissions.additionalDirectories` and `deny`-list quality are not
  assessed — candidate follow-up if real corpora show risky patterns.

## Evidence

- Full suite green: core 212, cli 47, config-convert 24.
- Routine sweep: advisory watch zero uncovered; mcp-scan 2.0.2 /
  socket 1.1.155 (patch bump only, no MCP/skill surface change).
