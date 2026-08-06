# GAP Report — Round 26 (CLI UX walk + SARIF polish + performance numbers)

First round of the continuous 100-round iteration mode: real usage walk of the CLI,
SARIF consumer-quality follow-ups from round 25's honest-limits list, and fresh
performance numbers on real repositories.

## 1. CLI UX walk — findings

- `--help` output for the root command and every subcommand is clear (choices listed,
  defaults shown, exit-code semantics documented in docs).
- **P1 fixed — silent clean bill when nothing was scanned**: `agentgate scan` in a
  directory with no discoverable MCP configs printed `Scanned 0 server(s) across
  0 file(s)` + `✔ No findings.` and exit 0 — indistinguishable at a glance from a real
  clean result (and easy to misread in CI logs). Now emits a warning on stderr:
  `nothing was scanned: no MCP client configs were discovered — pass a config file or
  directory, or use --config`. Exit code stays 0 (nothing failed); JSON report carries
  the warning too.
- `deps` on a lockfile-less clone of express reports AG-DP-006 high "please verify"
  for `debug` — correct honest behavior (can't resolve the installed version without
  node_modules or a lockfile).

## 2. SARIF polish (round-25 honest-limits follow-up)

- **Per-rule `security-severity`**: was a static 8.0 for all 17 rules, which put every
  rule in GitHub code scanning's "high" filter bucket. Now each rule carries a curated
  default reflecting its typical highest-severity finding (AG-TP-001/SC-002/SC-003/
  DP-006 → 9.5 … AG-DP-005 → 4.0). Result-level values were already accurate.
- **`partialFingerprints`**: results now carry a stable `agentgateFindingKey/v1`
  (sha256 of ruleId + relative URI + target + message, truncated to 128 bits), so SARIF
  consumers can track findings across runs even when line numbers shift.

## 3. Performance numbers (this box: Linux, Node 22)

| Command | Target | Time |
| --- | --- | --- |
| `agentgate scan .` | microsoft/TypeScript checkout (652 MB, depth-1) | 1.5 s, 10 findings |
| `agentgate deps` | expressjs/express checkout | 1.8 s (46 refs / 142 files) |

Scan stays interactive-fast because repo scans only visit MCP-relevant files.
No performance gap versus osv-scanner (~2 s on express package-lock) at these sizes.

## 4. Competitor / advisory delta since round 25

Checked earlier today (round 25): socket 1.1.153, snyk-agent-scan 0.5.16,
osv-scanner v2.4.0 — no movement; GHSA MCP-relevant sweep clean apart from the
already-covered Flowise bypass; MCPA-2025-0014 shipped in 0.7.0.

## Honest limits

- Per-rule security-severity defaults are curated, not computed from rule code; they
  can drift if a rule's scoring changes (kept alongside the rule table in `sarif.ts`).
- The zero-scan warning does not change the exit code; teams that want hard failure
  on "nothing scanned" should check the JSON report's `scannedServers`/`scannedFiles`.
