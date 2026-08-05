# GAP-ROUND-13 — competitor re-check + `agentgate config convert` lands in the CLI

Round type: maintenance. Subjects: latest competitor state; a README promise the
CLI hadn't kept.

## Competitor re-check (2026-08-05, actual runs)

- `uvx mcp-scan@latest` → prints *"The 'mcp-scan' package has been renamed to
  'snyk-agent-scan'"* and runs **Snyk Agent Scan v0.5.16** — the same version we
  benchmarked in rounds 2–3. Behavior unchanged: per-server consent prompts
  (same UX we adopted in round 2), requires `SNYK_TOKEN` for any analysis, and
  notes that results for declined servers may come from Snyk's cloud from
  *other people's* scans. Our structural position (fully local, no token, no
  cloud) is unchanged.
- No new mcp-scan/PyPI release since our last benchmark (`mcp-scan` on PyPI
  stops at 0.4.3; the rename moved releases to `snyk-agent-scan`).

Conclusion: no new competitor capability to chase this round; the gap worth
closing was one of our own promises.

## Gap: README documented `agentgate config convert` as future work (P1)

Both READMEs said config conversion was "merging into the CLI as
`agentgate config convert`" — for five releases. Users of the main CLI had to
discover and install a second package.

**Fix**: `agentgate config convert --from <client> --to <client> [--in] [--out]`
now ships in `mcp-agentgate`, reusing `mcp-agentgate-config-convert` as a
workspace dependency (single engine, no fork). Standalone package stays
published for scripting. Docs: new website page + READMEs updated to the new
invocation.

Validation: cursor→codex TOML and cursor→vscode conversions verified from the
built CLI; invalid input exits `2` with a readable error; unknown clients are
rejected by commander choices. 3 new e2e tests (cli: 25 total).

## Remaining known gaps

- Advisory API worker still not deployed (route B backlog) — `scan` uses the
  bundled DB (round 11), which is only as fresh as the release.
- `config convert` does not auto-discover the source file from the client's
  default path yet; `--in`/`--out` are explicit.
