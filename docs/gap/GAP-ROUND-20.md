# GAP-ROUND-20 — live advisory API consumption

Round type: feature (closes the "DB freshness = CLI release cadence"
structural gap open since round 11).

## Gap

The MCPA advisory database only shipped bundled into the CLI, so users on an
older release missed every advisory published after it — the gap reports
since round 11 listed "curated DB freshness limited by CLI release cadence"
as a structural limitation. The advisory API Worker is now deployed and
serving the full database (round 19), but nothing consumed it.

## Fix

`agentgate scan` now fetches `/v1/advisories` from the advisory API (5s cap,
same `--timeout` budget as other network checks) and merges the records over
the bundled copy by id — live wins, bundled fills gaps. Malformed records
are dropped. On any failure (offline, HTTP error, timeout) the scan degrades
to a single warning and continues on the bundled database, so offline
behavior is unchanged. `AGENTGATE_ADVISORY_API` overrides the endpoint.

Verified: online, a `uvx openai-mcp` config scans with no extra warning and
reports AG-SC-003 critical (API merge active); with the network blocked
(`unshare -rn`) the same scan reports the same finding from bundled data plus
one "advisory API unreachable" warning. Merge/override/malformed-record
handling is covered by unit tests.

## Remaining known gaps

- The advisory API serves full records; the CLI only consumes the fields it
  matches on (id/title/type/severity/packages).
- `deps` (AG-DP rules) still uses OSV only — MCPA consumption there is not
  planned (the DB targets MCP servers, not general dependencies).
