# GAP-ROUND-368 — fresh corpus (140 repos) critical sweep: four FP classes fixed

Date: 2026-08-04

## Routine windows

- GitHub code search still degraded (0 items on path-scoped queries) — corpus built
  via repository search instead (recently-pushed MCP/agent-surface repos, deduped
  against r343–r367 corpora; 140 cloned).

## Corpus sweep (599 findings; 8 critical + all 51 high hand-verified)

All 51 highs were AG-SK-002 `allowed-tools: Bash` pre-approvals / `bypassPermissions`
— rule-semantics true positives. Of 8 criticals, 4 true (real curl|sh installers),
4 were new FP classes, each fixed narrowly:

1. **Usage-banner heredocs** (`cat <<USAGE … curl|sh … USAGE`): unquoted heredoc
   bodies are now masked when they are pure data — no command substitution, no
   shebang, not redirected to a file, and not fed to an interpreter. Rendered-script
   generators (`cat <<PRE` with `#!/usr/bin/env bash` body, `cat > x.sh <<EOF`,
   `sh <<EOF`) stay live — an early over-broad version masked two real
   tailscale-installer criticals in r363 (gcp-*-serve.sh startup-script renderers)
   and was tightened until r363 went back to zero diff.
2. **Inline-program pipes** (`curl … | node -e '…'` / `| python -c "…"`): the
   interpreter runs a local fixed program with the download on stdin as data
   (npm version-lookup / CDP polling idiom). `| bash -` still matches.
3. **yaml/toml fixtures under test paths**: "executable" only by extension
   heuristic; under `tests/fixtures/` they are checked-in test data → graded low
   with the r366 fixture wording.
4. **Usage metavariables** (AG-SK-001): `scaffold <system> — …` in a subcommand
   list matched "hidden instruction tag". A tag directly after a command word with
   no closing tag anywhere in the file is template notation (graded like other
   template lines); block-form `<system>\n…\n</system>` stays critical.

## Head-to-head (six corpora vs main)

r343/r353/r359/r363: byte-identical. r356: exactly 3 verified-FP criticals removed
(usage heredocs + `curl | python -c` poller), 1 residual header-comment medium.
r368: exactly the 4 verified FP criticals above removed/downgraded. No other changes.

Full suite green; patch changeset added.
