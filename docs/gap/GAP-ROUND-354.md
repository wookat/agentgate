# GAP-ROUND-354 — concealment-instruction object analysis

## Windows

- Nine-client version window unchanged (Claude Code v2.1.226, Gemini CLI
  v0.54.4, Copilot CLI v1.0.78, OpenCode v1.18.15, Crush v0.88.1, Qwen Code
  v0.21.8, Goose v1.45.0, Codex rust-v0.147.0, Cline npm 3.0.52).
- r353 residual verification: AG-SK-002 highs sampled (skill `allowed-tools:
  Bash` pre-approvals — true positives by rule semantics, 345 hits led by
  gstack-vendored skill packs); AG-RC-001 mediums and AG-TP-001 lows sampled —
  correctly advisory-level.

## Fixed: GAP-353 deferred item — "do not tell the user …" false positives

Deferred in GAP-353 as lexically inseparable; resolved with a corpus-derived
object analysis. Across the r343/r353/r334 corpora, every wild
`do not (tell|mention|inform|reveal|show) the user …` occurrence splits
cleanly by *object*:

- **Concealing the interaction** (real poisoning): "of this data collection",
  "of this security check", "about it", "this list", "what you did",
  "you are/stopped …", or a bare objectless "do not tell the user."
- **Forbidding a specific claim** (prose guidance): "it will deploy", "that no
  file was provided", "the helper's JSON", "a CV with known rendering bugs",
  "they should have", "RCS is self-service".

The pattern now requires a concealment-class object (`about`, `anything`,
`what`, `this/these`, `you`, or sentence-final bare form); the existing
`to <verb>` / quoted-object / until-only exclusions are preserved.

## Head-to-head

- r353 corpus: exactly the 4 TimeWarp aspire-skill criticals removed, 0 added.
- r343 corpus: 3 criticals removed (Splotch release skill "do not tell the
  user they should have", CV_crawl "do not show the user a CV with known
  rendering bugs"), 0 added — all verified benign.
- No other rule output changed in either corpus.

## Regression pinned

- Claim-forbidding prose (three wild forms) stays silent.
- "of this data collection" / "what you did" stay critical.
- Bare "do not tell the user." and quoted/`to <verb>`/until-only forms keep
  their prior behavior (existing tests still green).
