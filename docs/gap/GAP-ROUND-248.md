# GAP-ROUND-248 — Precision sweep of the rounds 246/247 surfaces (docs)

Date: 2026-08-08. No code changes — wild-corpus verification round.

## Corpus

GitHub code search for `filename:.roomodes` and `path:.opencode/agents extension:md`
(top results by hit count), 36 real repositories cloned and scanned with the
current main (`#365` + `#366` merged), on top of the 8 + 6 repos already
verified in rounds 246/247.

## Results

### `.roomodes` (AG-SK-001, round 246)

- All `.roomodes` files matched and scanned (including large mode packs:
  RooArmy 10 files, Custom-Modes-Roo-Code, super-roo, rooroo, sparc2,
  costrict, AliFullStack).
- Findings: 2 × **low** structural `<instructions>`-tag notes (costrict,
  AliFullStack) — the same deliberate quiet-low behavior as every other skill
  file with prompt-template tags. **0 medium+ findings, 0 false positives.**

### `.opencode/agents/*.md` (AG-SK-002, round 247)

- 259 findings (126 high, 133 medium) across 10 repos — all verified
  unrestricted `bash`/`edit`/`write`/`webfetch`/`websearch` allows, including
  the nested-map form `bash: {"*": allow}` (ct-transcriber-macos ships a
  109-agent vendored pack with `edit: allow` + `bash: "*": allow` per agent —
  211 findings, all real).
- Correctly quiet: repos using `ask`/`deny`, scoped globs
  (`"git status*": allow`), or agents without permission blocks
  (quest, RooArmy, lies.exposed, Synaptic-Mesh, medsci-agent, …).

## Boundaries observed in the wild (recorded, not flagged)

- A non-official `permissions:` (plural) frontmatter key with `edit: ask` /
  `bash: deny` values (rust-self-learning-memory) — not part of the OpenCode
  schema; ignoring it is conservative in both directions.
- The deprecated `tools:` boolean map (`edit: true`) — officially superseded
  by `permission`; still uncommon enough to defer (same call as round 247).

## Operational note

Corpus work now lives under `~/corpora/` — `/tmp` is a 3.9 GB tmpfs and
filled up mid-round; old round corpora were purged.

## Verdict

No fixes needed: both new surfaces hold **0 false positives** at wild-corpus
scale, and the OpenCode agent check surfaces large real-world unrestricted
grants that were previously invisible.
