# GAP-ROUND-325 — output-style markdown surfaces

## Gap

Claude Code output styles are markdown whose instructions are added to the
system prompt (official output-styles doc). They are repo-carried at two
levels, and neither was text-scanned:

- project level: `.claude/output-styles/*.md` — loaded from every
  `.claude/output-styles/` between the working directory and repo root;
- plugin level: the conventional `output-styles/` component dir under a
  plugin root, plus manifest-declared `outputStyles` paths (replaces the
  default dir; string or array).

A poisoned style file injects directly into the system prompt for anyone who
selects it — same class as skill/command poisoning, previously invisible to
all rules and `lock --skills`.

## Fix

- `SKILL_FILE` matches `.claude/output-styles/*.md` and the marketplace
  layout `plugins/<name>/output-styles/*.md`;
- the manifest-gated plugin component matcher includes `output-styles/`;
- the round-324 manifest declaration parser also reads the `outputStyles`
  field.

## Wild verification

- GitHub code search: ~982 in-repo `.claude/output-styles` markdown files;
  133 plugin.json manifests declare `outputStyles`.
- Cloned 40 wild repos (r325 corpus): 88 output-style markdown files, all
  previously invisible, now scanned — zero findings (all genuine style
  definitions), i.e. zero false positives.
- Regressions pin: poisoned project style critical, poisoned plugin
  `output-styles/` critical, poisoned manifest-declared `outputStyles` dir
  critical, benign style silent, bare `output-styles/` dir without a plugin
  manifest not scanned.

## Boundaries

- User-level (`~/.claude/output-styles`) and managed-policy styles are not
  repo-carried; out of scope.
- `experimental.themes` (JSON color themes) and `workflows/` scripts are
  not markdown instruction surfaces; unchanged.
