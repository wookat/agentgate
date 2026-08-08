# GAP-ROUND-319 — standalone plugin repos: root `commands/` and `agents/` markdown

## Context

Round 318 covered `.goose-plugin/` manifests. Remaining component gap: a *standalone*
plugin repository (the repo itself is the plugin — `.claude-plugin/plugin.json` or a
sibling plugin metadata dir at the root) carries its slash commands and subagents as
`commands/*.md` and `agents/*.md` at the plugin root. Those install for everyone who
installs the plugin and become model context / command prompts. Our skill matcher only
covered the marketplace layout (`plugins/<name>/(skills|commands|agents)/*.md`), so
standalone plugin repos' command/agent markdown was never skill-scanned or lockable.

## Change

`scanRepo()`/`collectSkillFiles()` now treat markdown under a `skills/`, `commands/`,
or `agents/` directory as skill content **only when the containing directory carries a
plugin manifest** (`.claude-plugin|.plugin|.factory-plugin|.codex-plugin|.cursor-plugin|.goose-plugin`
`/plugin.json`) — gated so generic docs trees named `commands/` or `agents/` are not
misread as agent instructions. Works at any depth (nested plugin dirs), cached per root.

## Evidence

- Upstream: Claude Code plugin layout (commands/agents at plugin root; same convention
  read by goose Open Plugins `COMPONENT_MARKERS = ["hooks/hooks.json", "commands", "agents", ".mcp.json"]`).
- Wild: GitHub reports 21,248 in-repo `.claude-plugin/plugin.json` files. Cloned 6
  standalone plugin repos (DataDog/pup, 0xnyn/canary, Owl-Listener/designpowers,
  anombyte93/prd-taskmaster, alirezarezvani/ClaudeForge, AvdLee/Xcode-Build-Optimization-Agent-Skill):
  67 previously invisible root command/agent markdown files now scanned
  (DataDog/pup alone: 58; verified 0 with the released 0.67.3), with **zero findings** —
  a clean corpus, no false positives.
- Regressions: poisoned `commands/deploy.md` with a manifest → AG-SK-001 critical;
  benign agent file silent; same poisoned file without a manifest → not scanned.

## Boundaries

- Bare root `plugin.json` alone does not gate (too generic a filename; round-208
  precedent) — only dot-dir manifests mark a plugin root.
- Non-markdown command/agent assets are unaffected; hooks/hooks.json and `.mcp.json`
  components were already covered.
