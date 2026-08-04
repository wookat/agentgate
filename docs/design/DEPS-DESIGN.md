# `agentgate deps` — hallucinated-dependency (slopsquatting) detection

One-page design + competitor comparison. Status: **awaiting CEO confirmation**.

## Threat

LLMs hallucinate package names (~19.7% of recommendations per USENIX Security 2025);
attackers pre-register those names on npm/PyPI ("slopsquatting"). A copy-pasted
`npm install` / `pip install` then pulls attacker code.

## Competitors, actually tried (2026-08-04)

All three were installed/built and run against the same fixture project
(npm + PyPI manifests containing one phantom package, one registered
placeholder, one typosquat, plus source files importing phantom packages).

| | slopcop (16★, stale) | phantomdep (0★) | slopwatch (1★, stale) |
|---|---|---|---|
| Stack / install | Node, `npm i -g` works | Rust; **build fails on stock cargo 1.83** (needs edition2024) | Rust; needs pkg-config/libssl to build |
| Existence check (phantom pkg) | ✗ no not-found concept in `scan` | ✓ caught pypi phantom | ✓ `NOT FOUND` |
| Metadata risk scoring | ✓ (downloads/age/versions/repo/postinstall) | ✗ (existence + name shape only) | ✓ best model (weighted signals, thresholds) |
| Typosquat similarity | ✓ (top-10k Levenshtein/Jaro) | claimed, **missed `reqests`** | ✗ (metadata only) |
| Source import scanning | ✗ | claimed in README, **did not detect** `import fancy_ai_toolz` / `require('hallucinated-mcp-kit')` | ✗ |
| npm+PyPI in one run | ✗ (`--npm` or `--pypi` per run) | ✓ | ✓ |
| Output | table + JSON | text + JSON | terminal/**json/sarif** |
| CI gate exit code | only with `--strict` | README claims exit 1, **actually exits 0** | **always exits 0**, no gate |
| PyPI download signal | n/a | n/a | broken (`requests` = 0/week → mis-scored) |
| Maintenance | stopped | inactive | stopped |

Takeaway: each has one good idea (slopcop: signals+similarity; phantomdep:
cross-ecosystem existence; slopwatch: scoring model + SARIF), none delivers a
reliable **gate** (broken exit codes, no source-import scanning, wrong download
stats), and none is maintained. The window is open.

## Decision: subcommand `agentgate deps`, not a separate package

- Ships inside `mcp-agentgate` (bin `agentgate`) — reuses our CLI contract
  (exit codes 0/1/2), table/JSON/SARIF renderers, `--fail-on` gating, GitHub
  Action, pre-commit hook, release pipeline, and docs site. One install covers
  MCP surface + dependency defense — the "Gate family" story.
- A separate package would need its own name (verified available on npm as of
  2026-08-04: `depgate`, `slopgate`, `agentgate-deps` — fallback options if we
  ever split it out), plus duplicated release/docs/Action plumbing, for no user
  benefit today.
- Core logic lands in `mcp-agentgate-core` (`deps/` module) so Route B/C can
  reuse it (website report viewer, advisory cross-checks).

## Scope (v1)

1. **Collect** dependency names from `package.json` (all dep sections),
   `requirements.txt`, `pyproject.toml` ([project.dependencies] +
   optional-dependencies + poetry), and source imports (`import`/`require` in
   .js/.ts/.mjs/.cjs, `import`/`from` in .py — bare specifiers only, stdlib and
   relative imports excluded; reuses `scanRepo`'s walker + `--ignore` globs).
2. **Verify existence** against live registries (npm registry API, PyPI JSON
   API), concurrent with timeout/retry; not-found ⇒ **critical: likely
   hallucinated** finding.
3. **Risk-score existing packages** (0–100) from metadata: weekly downloads,
   package age, version count, repo link, description/license/author presence,
   npm install scripts (`preinstall/install/postinstall`), plus name-similarity
   (damerau-levenshtein vs bundled top-popular-package lists) for typosquats.
4. **Report & gate**: table/`--format json|sarif` (same contract style as
   `scan`), `--fail-on <severity>` with exit 1 on threshold, exit 2 on usage
   errors; `--offline` mode (skip registry, name-shape checks only) so CI
   without egress degrades gracefully.
5. **Integrations**: extend GitHub Action + `.pre-commit-hooks.yaml` with a
   `deps` mode; document in website docs.

**Honest boundaries (docs will state):** heuristics, not proof — a clean result
is not a safety guarantee; registry download stats are laggy for new PyPI
packages; source-import extraction is regex-based, not AST-perfect; scoring is
tuned on public incident data, not a trained model.

## Milestone

Design confirmed → usable `agentgate deps` PR within 1 week (tests ≥80%
coverage in core module, JSON contract snapshots, dogfood in CI).
