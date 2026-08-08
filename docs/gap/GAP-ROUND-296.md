# GAP-ROUND-296 — AG-DP-007 covers PyPI PEP 508 direct references

## Gap

Round 294 closed the mutable-remote-specifier gap for npm `package.json`
dependencies but explicitly left the PyPI side as a boundary: PEP 508 direct
references (`name @ <url>`) were silently dropped by `parseRequirementLine`
(any line containing `://` returned `undefined`), so `agentgate deps` emitted
zero findings for git- or archive-URL Python requirements — the same mutable
shapes AG-DP-007 flags on npm.

## Real corpus evidence

15,039 requirement lines across the existing corpora (`requirements*.txt` +
`pyproject.toml`, node_modules excluded) contain 6 direct-URL requirements:

| Shape | Count | Example | Expected |
| --- | --- | --- | --- |
| Branch-addressed archive zip | 1 | `tweety-ns @ https://github.com/mahrtayyab/tweety/archive/main.zip` | high |
| Tag-pinned git (in `[dependency-groups]`) | 1 | `mkdocs-click-zoom @ git+https://…@v0.2.0` | medium (tags can move) |
| Full-commit-SHA git | 4 | `atroposlib @ git+https://…@c20c8525…` | exempt |

## Fix

- `directUrlRequirement()` extracts `name @ <url>` (comments and `;` env
  markers stripped) from `requirements*.txt` lines and `pyproject.toml`
  `project.dependencies` / `project.optional-dependencies` /
  PEP 735 `[dependency-groups]` entries. The corpus tag-pinned example lives
  in `[dependency-groups]`, which was previously not parsed at all — plain
  registry names declared there are now registry-verified too.
- These flow into the round-294 `remoteSpecs` channel with
  `ecosystem: 'pypi'`; `RemoteDepSpec` gained an `ecosystem` field and
  finding targets are now `pypi:<name>` / `npm:<name>` accordingly.
- Same policy as round 294 (reused classifier, no duplication): unpinned git
  ref → medium, non-registry archive URL → high, 40-char commit SHA exempt,
  offline-capable.
- Direct-URL names are added to the declared set so imports of those modules
  are not flagged as undeclared (AG-DP-001).

End-to-end on the corpus: the `tweety` archive zip reports high, the `v0.2.0`
tag reports medium, all four SHA-pinned requirements stay silent.

## Boundaries

- Poetry's table-form git dependencies (`{ git = "…", branch = "…" }` in
  `tool.poetry.dependencies`) are not parsed as remote specs yet — corpus
  showed zero occurrences; name-only declaration behavior unchanged.
- `-e`/`--editable` and bare-URL requirement lines (no `name @` prefix) remain
  skipped: there is no distribution name to report against.
