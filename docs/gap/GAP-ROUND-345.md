# GAP-ROUND-345 — AG-SK-001 hidden-unicode severity grading

## Windows (clean)

- Authenticated GHSA/malware watch: **no uncovered MCP-related advisories**.
- OSV export ETags unchanged vs r344 (npm `e31fe9a...`, PyPI `c18a1fd...`) — no MAL diff to triage.
- Client versions: all nine unchanged (Claude Code 2.1.226, Codex 0.147.0, Gemini CLI 0.54.4, Copilot 1.0.78, opencode 1.18.15, Crush 0.88.1, Qwen Code 0.21.8, cline 3.0.52, goose v1.45.0).

## False-positive class (r343 corpus, 150 repos)

26 of the 35 AG-SK-001 criticals in the corpus were hidden-unicode reports where the
character is a **lone zero-width space / BOM / LRM at a word boundary** — copy-paste
artifacts from web content, not concealment:

- `hig-foundations/references/icons.md:102` (17 copies across repos) — `\u200b\u200bAlign Left| ![icon](...apple.com...)` — ZWSPs copied from Apple docs tables.
- `react19-use.md:166` — `\u200b// After:` (line-start ZWSP).
- `powershell-standards.md:48` — `'\ufeff#' is not recognized as the name of a cmdlet` — an error message quoting a BOM literal.
- `detecting-indirect-prompt-injection/SKILL.md:111` — `ZERO_WIDTH = dict.fromkeys(map(ord, "..."))` — defensive sanitizer code sample.
- `translation-style.md:70` — U+200E (LRM) in bilingual prose.

All were **critical** ("skills are executed as agent instructions").

## Fix

`tool-poisoning.ts` exports `isTrojanHidden` (bidi overrides/isolates U+202A–202E,
U+2066–2069, tag characters ≥ U+E0000; same grading `AG-TP-001.checkSource` already
used) and `hidesInWord` (`\w[zero-width]+\w` — a zero-width wedged inside a word
splits keywords to dodge pattern matching, e.g. `ig\u200bnore previous instructions`).
`AG-SK-001.checkSkill` now reports critical only when the character is Trojan-grade
or the file contains an intra-word zero-width; otherwise low with a
copy-paste-artifact message.

## Corpus head-to-head (150 repos, main vs fix)

- 26 findings critical → low, each manually spot-checked as a boundary artifact.
- Zero findings removed; zero other rules changed (AG-TP/RC/SK-002/CL/SS byte-identical).
- True positives pinned by regression tests: bidi override in SKILL.md stays critical
  (existing test), intra-word ZWSP keyword-split stays critical (new test), boundary
  ZWSP artifact reports low (new test).

## Boundary

Copilot-extension descriptions, goose recipe fields, and Kiro hook prompts keep the
unconditional critical: they are injected surfaces where any hidden character is
anomalous, and the wild corpus shows no artifact noise there.

## Validation

`pnpm build` / `pnpm test` / `pnpm lint` / `pnpm typecheck` / `git diff --check` /
`node api/scripts/validate.mjs` / `node scripts/check-advisory-count.mjs` /
`node scripts/check-client-lists.mjs` all green.
