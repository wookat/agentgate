# GAP-ROUND-282 — new-surface check: Roo Code / Kilo Code project slash commands

## What was checked

New-client/new-surface round (last: round 266). Candidates reviewed against
official docs; highest-value uncovered surface: project slash commands.

- Roo Code docs (Features → Slash Commands): project commands live in
  `.roo/commands/*.md` (filename becomes the /command name; optional
  frontmatter `description` / `argument-hint` / `mode`). The `.roo/rules*`
  trees were covered since round 122 but `.roo/commands/` was invisible.
- Kilo Code docs (Customize → Workflows): the newer extension stores project
  slash commands in `.kilo/commands/*.md` (frontmatter `description` /
  `agent` / `model` / `subtask`); the legacy `.kilocode/workflows/*.md`
  location was already covered (round 269).

## Change

`SKILL_FILE` adds `.roo/commands/*.md` and `.kilo/commands/*.md` — the full
AG-SK-001/003 skill-text pipeline now runs on them. Docs (skills guide)
updated. Global `~/.roo/commands` / `~/.config/kilo/commands` are outside the
repo and not scanned (same policy as all global trees).

## Corpus verification

Existing corpora (r248/r258/r265/r266/r268/r269/r275 trees) contain 10 real
repositories with `.roo/commands` or `.kilo/commands` — 114 wild command
files scanned end-to-end with the built CLI: 0 findings, i.e. zero false
positives; no wild true positives yet (fixtures pin the TP path: injection
text in a command file reports AG-SK-001 critical for both clients).

## Boundaries (honest)

- `.roo/commands` accepts only `.md` per docs (rules trees keep md+txt).
- `.kilocode/commands/` is not documented — only `.kilo/commands/` — so it is
  not matched (no guessed formats).
- Kilo's external-symlink command trees (`markdown_source` permission) point
  outside the repo and are not reachable by a repo scan.
