# GAP-ROUND-247 — AG-SK-002 checks OpenCode agent frontmatter permissions

Date: 2026-08-08.

## Scope pivot (recorded honestly)

The round started as a follow-up to round 246: classify Roo Code custom-mode
`groups` declarations. Verified against the official docs and dropped: Roo
`groups` are **capability toolsets**, not approvals — tool execution is still
gated by Roo's separate auto-approve settings (whose risky project-level form,
`.roo/mcp.json` `alwaysAllow`, has been covered since round 145). Flagging
`groups: ["command"]` would be pure noise: 6 of the 8 round-246 corpus
`.roomodes` files grant the command group legitimately. No check added.

## What shipped instead

OpenCode agent markdown files (`.opencode/agents/*.md`, official docs:
opencode.ai/docs/agents) carry a YAML-frontmatter `permission` block where
`"allow"` means *run without approval* for anyone using the checked-in agent.
AG-SK-002 now evaluates it with the same semantics as the existing
`opencode.json(c)` permission checks (shared `opencodeAllowsAll` +
`OPENCODE_RISKY_KEYS`):

- catch-all `permission: "*": allow` → high;
- `bash: allow` (or `bash: {"*": allow}`) → high;
- `edit` / `write` / `webfetch` / `websearch` allow → medium;
- granular globs (`"git status*": allow`) and `deny`/`ask` → no finding.

## Corpus verification

6 real `.opencode/agents` repos cloned and scanned:

- True positives: brolit-shell (8 agents with `bash: allow`, 20 findings),
  DaisyCode (15), Multi-Agent-Setup (7) — all unrestricted allows, previously
  invisible.
- Correctly quiet: devpilot-agents (git-scoped bash globs + `task: deny`),
  opencode-video-content (`"*": deny`), osvauld — 0 findings. **0 false
  positives.**

## Boundaries

- Global agents (`~/.config/opencode/agents/`) are outside repo scans, same
  policy as other global trees.
- The deprecated `tools:` frontmatter map is not classified (officially
  superseded by `permission`); candidates if wild noise appears.

## Checks

Full workspace validation green; self-scan baseline unchanged.
