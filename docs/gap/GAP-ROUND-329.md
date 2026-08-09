# GAP-ROUND-329 — marketplace-entry declared plugin components

## Context

Rounds 319/324/325 gated plugin component markdown (skills / commands /
agents / output-styles, plus manifest-declared custom paths) on a plugin
manifest (`.claude-plugin/plugin.json` et al.) at the plugin root. Round 326/327
gated plugin `bin/` the same way.

Official Claude Code marketplace semantics
(code.claude.com/docs/en/plugin-marketplaces) add a second, manifest-less
install path we did not model:

- A `marketplace.json` entry with a **local `source`** (`"./plugins/x"`, `"."`)
  installs that directory as a plugin.
- The **entry itself** may declare component paths (`skills`, `commands`,
  `agents`, `outputStyles`) relative to its source root — same shapes as
  `plugin.json` (file / dir / glob).
- With **`strict: false`** the marketplace entry is the plugin's *entire*
  definition: the source directory needs **no `plugin.json` at all** (if one
  exists and declares components, the plugin fails to load).

So a curated/strict:false layout — poisoned markdown reachable only through the
marketplace entry's declared paths, with no plugin manifest anywhere — was
invisible to text scanning and `lock --skills`.

## Fix

`scanRepo` / `collectSkillFiles` now treat a local marketplace-entry source
root like a plugin root:

- catalog dirs consulted: `.claude-plugin/`, `.github/plugin/`,
  `.factory-plugin/`, `.cursor-plugin/` (`marketplace.json`);
- entries with a local `source` (no scheme, no `..`, not absolute) gate the
  conventional component dirs and `bin/` under that source root;
- entry-level `skills`/`commands`/`agents`/`outputStyles` declarations are
  parsed with the same resolver as `plugin.json` declarations (round 324) and
  merged with any manifest declarations for the same root.

Remote sources (`https://…`, GitHub object form) are ignored — nothing to scan
in-repo. Marketplace-root `source: "./"` skills-replacement semantics remain
additive-scan (same accepted boundary as GAP-324).

## Wild-corpus evidence (r321 + r328, 544 repos)

- 368 marketplace catalogs, **423 local-source plugin entries**;
- **89 entries have no `plugin.json` at their source root** (incl. genuine
  `strict: false` curated entries: modelscope-skills, HappyHackingSpace/skills,
  postiz-agent, jamesyorke/worktree-agent-skill, …);
- honest measured delta: **zero** — full head-to-head vs current main across
  all 360 catalog-bearing repos shows identical scanned-file and finding
  counts. Every wild manifest-less entry's markdown happens to also be
  reachable via existing conventions (`SKILL.md` matches anywhere; declared
  dirs sit under `skills/` at a root that also carries a `plugin.json`).
- The closed hole is therefore the *layout the docs explicitly support but the
  wild corpus does not yet use*: curated non-conventional component paths under
  a manifest-less source root. Regression tests pin the true-positive
  (strict:false entry, `skills: ["./packs"]`, no plugin.json → critical), the
  conventional-dir gate via marketplace source root, the remote-source ignore,
  and the generic-markdown negative.

## Boundaries kept

- Generic `commands/`/`agents/`/`bin/` trees without a manifest **or** a
  marketplace entry stay unscanned.
- Only local sources gate; URL/object sources never mark in-repo roots.
- `..`/absolute source paths are ignored (no out-of-root gating).
