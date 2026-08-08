# GAP-ROUND-246 — scan Roo Code project custom modes (.roomodes)

Date: 2026-08-08. New instruction surface, verified against the official Roo
Code docs (docs.roocode.com "Customizing Modes"): project custom modes live
in a `.roomodes` file (YAML preferred, legacy JSON) at the project root; each
mode's `roleDefinition` is **placed at the beginning of the system prompt**
and `customInstructions` is appended — a poisoned mode shipped in a repo (or
imported from a marketplace/shared export) injects straight into every
request in that mode.

## What shipped

- `SKILL_FILE` matcher extension: `.roomodes` files are now scanned by
  AG-SK-001 (prompt-injection/poisoning patterns, hidden Unicode) wherever
  they appear in the tree. `.roomodes` was previously invisible — as an
  extensionless file it was skipped by the source-extension gate and matched
  no skill pattern.
- Focused tests: poisoned `customInstructions` (true positive) and a benign
  mode file (0 findings).

## Corpus verification

8 real `.roomodes` repos cloned and scanned (RooFlow, RooCode-Tips-Tricks,
Anubis-MCP, gorush, aerleon, BetterBags, Roo-Code-Docs, cursed-repo — the
intentionally adversarial "config zoo"): all `.roomodes` files scanned
(incl. RooFlow's nested `config/.roomodes`), **0 false positives**.

## Boundaries recorded honestly

- Global custom modes (`settings/custom_modes.yaml`) live outside the repo —
  not part of repo scans, same policy as other global skill trees.
- `groups` tool/file-permission declarations and `rulesFiles` embedded rule
  content are not structurally classified this round (mode-specific rule
  *directories* `.roo/rules-<slug>/` were already covered since round 122);
  a `groups`-based AG-SK-002 check is a follow-up candidate.

## Checks

Full workspace validation green; self-scan baseline unchanged.
