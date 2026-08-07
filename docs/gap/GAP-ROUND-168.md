# GAP-ROUND-168 — Claude Code plugin marketplaces in checked-in settings

Date: 2026-08-08 · Round type: coverage (supply chain)

## Surface (official docs verified)

Claude Code plugin marketplaces (docs.claude.com/en/docs/claude-code/plugin-marketplaces):
`.claude/settings.json` can declare `extraKnownMarketplaces` and pre-enable
plugins via `enabledPlugins`; team members are "automatically prompted to
install your marketplace when they trust the project folder". Plugins ship
hooks, MCP servers, and skills. Docs state marketplace git sources support
`ref` (branch/tag) but not `sha` (plugin sources inside marketplace.json
support both), so a branch-ref marketplace catalog is mutable upstream.
GitHub code search: 5,104 `settings.json` files mention `extraKnownMarketplaces`.

## Change

AG-SC-001 `checkSource` on `.claude/settings.json`: each `enabledPlugins`
entry set to `true` whose marketplace source is git-based (`github`/`git`/
`url`) with no `sha` and no release-style `ref` (`v1.2.3`, `2.3.0`) reports
medium, naming the plugin, marketplace, and source. Local `directory`/`file`
sources, pinned sources, `false` entries, and unknown marketplaces are clean.

## Real corpus (5 repos)

- nrwl/nx-console — `nx@nx-claude-plugins` from `nrwl/nx-ai-agents-config#experimental`: 1 medium (true positive: branch ref).
- ever-co/ever-teams — same marketplace, no ref (default branch): 1 medium.
- Quenty/NevermoreEngine — self-hosted marketplace, no ref: 3 medium (root + two templates). By the standard applied to OpenCode plugins, mutable-by-construction; noted as a borderline case since the marketplace repo is the scanned repo itself.
- instructure/canvas-ios — ref `2.3.0` (release-style): clean as designed.
- DataDog/dd-trace-dotnet — marketplace declared but no `enabledPlugins`: clean as designed.

## Honest boundaries

- Release-style tags are git tags — technically movable; accepted to keep
  flagship-repo noise near zero (same trade-off as version-ref git plugins).
- Self-referential marketplaces (repo hosting its own catalog) are not
  special-cased; static scan cannot know the scanned repo's identity.
- Plugin-level `sha` pins live in the marketplace's marketplace.json
  (a different repo); not fetched. Checked-in `.claude-plugin/marketplace.json`
  source pinning is a candidate follow-up.

## Evidence

- Full suite green: core 242, cli 47, config-convert 24.
- Self-scan: 155 files, 17 findings (13 medium, 4 low) unchanged.
