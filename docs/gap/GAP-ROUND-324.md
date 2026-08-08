# GAP-ROUND-324 — manifest-declared custom component paths

## Advisory window (honest zero)

- Automated watch re-run: no uncovered MCP-related advisories.
- OSV npm/PyPI `all.zip` exports byte-identical to the r315 snapshots (md5
  match), so no MAL diff is possible this window.

## Gap

Claude Code plugin manifests may point `commands`, `agents`, and `skills` at
custom paths (files, directories, or globs, relative to the plugin root;
`skills` also accepts `"."`), per the official plugins reference. Round 319
gated component scanning on the *conventional* `commands/`, `agents/`,
`skills/` directory names, so markdown installed through manifest-declared
custom paths (`./ads/`, `./command/`, `./skill/`, `./packs/*.md`, …) was
invisible to text scanning and `lock --skills`.

Corpus evidence: 25 of the 496 r321 wild plugin repos declare non-conventional
component paths (151 declarations).

## Fix

The scanner now parses each plugin root's manifest `commands`/`agents`/`skills`
fields (string or array; string entries or `{path}` objects), normalizes the
declared paths, and treats markdown reachable through them as installed
skill/command/agent content — files match exactly, directories by prefix,
`*`/`?` patterns via the existing glob conversion. Paths that escape the
plugin root (absolute or `..`) are ignored. Applies to both `scanRepo` and
`collectSkillFiles` (so declared components are also lockable).

## Wild verification

Re-scanned the 25 declaring repos against released 0.67.6:

- ~250 previously invisible markdown files now scanned (e.g.
  `santimattius_structured-coroutines` 16→75 files, `echoVic_boss-skill`
  324→361, `shipengqi_skills` 98→151);
- 35 previously invisible findings, all sampled genuine: unscoped
  `Bash`/`Write`/`Edit` allowed-tools grants in manifest-declared command/skill
  markdown (echoVic_boss-skill 20, Hainrixz_claude-ads 12, ClaudeForge 5,
  vojtaholik_claude-tools 2, apexscaleai 1 hidden-tag low);
- full 496-repo critical sweep: 24 criticals, all previously known (the
  32→24 drop is the round-323 concealment precision fix); zero new criticals,
  zero new false positives attributed to this surface.

## Boundaries

- Other manifest component fields (`hooks`, `mcpServers`, `lspServers`,
  `outputStyles`) already have their own handling or are non-markdown.
- Marketplace-entry `source`-root skill replacement semantics not modeled;
  the declared paths are scanned additively.
