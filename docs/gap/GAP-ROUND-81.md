# GAP-ROUND-81 — skill scanning covers Continue.dev workspace rules

Date: 2026-08-07

## Gap (real evidence)

Round-78/79 added Continue.dev MCP config discovery + convert, but its
instruction surface stayed unscanned: per the official rules deep-dive
(docs.continue.dev/customize/deep-dives/rules), every `.continue/rules/*.md`
file is joined verbatim into the model's system message — exactly the
injection surface AG-SK rules exist for. A poisoned rule file scanned clean.

## Fix

- `SKILL_FILE` now matches `.continue/rules/**/*.md`; `.continue` added to
  the hidden agent-config trees the repo walker descends into.
- Same regex feeds `lock --skills`, so Continue rules are pinned and
  drift-gated too.
- Continue prompts (`.continue/prompts`) NOT added: the official convention
  could not be verified from the docs today — recorded honestly instead of
  guessing.

## Verification

- Unit test: injected rule file reports AG-SK-001 critical; benign
  pirate-rule file (the docs' own example) reports nothing.
- Real-world FP sweep: continuedev/continue's own workspace has 24 real
  `.continue/rules/*.md` files — all scanned (verified via `scannedFiles`),
  zero false positives.
- Suite: core 173 passed; lint + typecheck green.

## Still open (honest)

- `.continue/prompts` / prompt files: add once the official convention is
  verifiable.
- Global `~/.continue/rules` (if it exists) is out of repo-scan scope by
  design; discovery only handles MCP configs.
