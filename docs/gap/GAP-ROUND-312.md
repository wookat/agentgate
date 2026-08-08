# GAP-ROUND-312 — Copilot CLI extension description text is a model-context surface

## Window checks (honest)

- New-surface window: Claude Code 2.1.226 / Codex 0.147.0 / Gemini CLI 0.54.4 / Copilot CLI 1.0.78 / opencode 1.18.15 unchanged since round 308's check. Crush latest (v0.88.1 / npm 0.88.1) release notes: MCP timeout reduction, MCP OAuth in server-client mode, `crushrc` primary over `crush.json` — `crushrc` and `crush.json` surfaces already covered (rounds 225–229); no new repo-carried surface. goose latest v1.45.0 (2026-07-29) release notes reviewed: "allow disabling built-in skills", ACP/uniffi/provider work — no new repo-carried surface (config.yaml, .goosehints, recipes/subrecipes already covered, rounds 213–222).
- So this round collects the boundary explicitly deferred by GAP-ROUND-305: static extraction of the extension `joinSession({tools, ...})` surface.

## Gap

Round 305 made Copilot CLI extension files (`.github/extensions/<name>/extension.{mjs,cjs,js}`, plugin-shipped `com.github.copilot/extensions/`) a startup exec surface for AG-RC-001. But extensions also register tools and canvases whose `description` strings are injected into the model's context — the same channel as an MCP tool description. A poisoned description ("ignore previous instructions…", hidden Unicode) is invisible to AG-RC-001 because it contains no exec primitive: an extension can be *code-benign* and *text-poisoned*.

Corpus evidence the surface is real: in the round-305 corpus, 146 real extension files match the surface path, 65 of them register `description:` string literals — 525 literals total that were previously never text-scanned.

## Fix

`AG-SK-001.checkSource` now handles files matching `COPILOT_EXTENSION_FILE` (constant moved to skill-poisoning.ts, re-exported from rce-vectors.ts to avoid an import cycle):

- `extractDescriptionLiterals(content)` pulls string literals assigned to `description:` keys ('…', "…", and interpolation-free template literals; `${…}` templates are skipped — content not statically known).
- Each literal is checked for hidden/invisible Unicode and the existing `INJECTION_PATTERNS`; hits are critical, with the line of the literal.

## Evidence

- Regression test (`packages/core/test/scanner.test.ts`): poisoned + benign descriptions in one extension → exactly one critical AG-SK-001 at the poisoned literal's line.
- Wild corpus sweep: all 55 round-305 repos rescanned; 525 description literals across 146 extension files scanned, **0 false positives**.
- Full suite: 479 Vitest tests green; build/lint/typecheck green; self-scan unchanged.

## Boundaries (not done, recorded honestly)

- Descriptions built by concatenation, variables, or `${}` interpolation are not extracted (not statically known).
- `name:`/`instructions:` fields and canvas HTML content are not text-scanned; no corpus evidence yet that they carry instruction text verbatim.
- The `description:` key match is not scoped to `joinSession` call arguments — any description literal in an extension file is scanned. Acceptable: the file *is* the surface, and the corpus shows zero FP.
