# GAP Report — Round 63 (FP sweep of the new Cursor rule surface)

## Sweep (real data, 2026-08-07)

PatrickJS/awesome-cursorrules ships 257 real-world Cursor rule files
(`rules/*.mdc`). Copied into a `.cursor/rules/` fixture tree and scanned
with the round-61 build:

- 257 files scanned, **1 AG-SK-001 critical**:
  `flutter-riverpod-cursorrules-prompt-file.mdc` uses
  `<instructions>{{instructions}}</instructions>` — a template placeholder
  wrapper, flagged as "hidden instruction tag".
- cline/prompts (36 files) and awesome-windsurf: still 0 findings.

## Analysis

FP rate 1/257 (0.4%), but the class is structural: skill/rule files *are*
instructions, so a bare `<instructions>` or `<important>` tag there is
ordinary prompt-template structure — unlike in a tool description, where the
same tag hides directives from a UI. `<system>`/`<secret>`/`<hidden>` have
no such legitimate use in either context.

## Fix

In AG-SK-001 (skill context only), `<instructions>`/`<important>` matches are
reported at `low` with an explanatory message. Match selection prefers a
non-structural, non-code-block match so a `<secret>` tag later in the file
still reports `critical`. AG-TP-001 (tool descriptions) is unchanged.

## Verified

- Re-ran the 257-file sweep post-fix: the flutter finding is `low`, no
  criticals remain; malicious fixtures unchanged.
- Full checks green: build, lint, typecheck, 159 core + 36 cli + 12 convert;
  website build green.
