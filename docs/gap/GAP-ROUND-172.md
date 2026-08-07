# GAP-ROUND-172 — Kiro agent hook askAgent prompt injection scanning

Date: 2026-08-08 · Round type: coverage (instruction-surface poisoning)

## Surface

Round-171 GAP candidate: `.kiro.hook` `then.type: "askAgent"` prompts
were unanalyzed. The prompt is injected into the agent automatically on
IDE events (fileEdited/promptSubmit/preToolUse …) for anyone who opens
the project — the same trust model as skill/steering files, where
AG-SK-001 already scans for poisoning. The majority of the 4,656
`.kiro.hook` files on GitHub use askAgent (only 563 mention runCommand).

## Change

AG-SK-001 gains a `checkSource` for `.kiro/hooks/*.kiro.hook`: enabled
askAgent prompts are checked for hidden/invisible Unicode and the shared
INJECTION_PATTERNS (instruction override, concealment, cross-tool
coercion, exfiltration, poisoning markers) — matches report critical.
Disabled hooks and runCommand actions (covered by AG-SK-003 since
round 171) are untouched.

## Real corpus (7 repos with .kiro.hook files)

EcoPaste, kiro-learn, promptz, matrix-core, EGC, workstation-config
(aws-command-guard: a real defensive askAgent prompt with
APPROVED/BLOCKED wording), ks-ai-coding-kit — 0 findings, all correctly
clean. True positives covered by unit fixture (instruction override +
concealment in an enabled fileEdited hook → 2 critical).

## Honest boundaries

- No fenced-code downgrade for hook prompts (JSON strings have no
  markdown structure; plain pattern match applies).
- Multi-sentence paraphrased injections can evade the shared patterns,
  same as for skills — hidden-Unicode check still applies.

## Evidence

- Full suite green: core 245, cli 47, config-convert 24.
- Self-scan: 155 files, 17 findings (13 medium, 4 low) unchanged.
