# GAP-ROUND-231 — competitor re-check (real runs, 2026-08-08)

Round type: competitor re-test (last full re-check round-101/138; comparison page last verified 2026-08-07).

## What was re-run (real commands, this machine)

- **osv-scanner v2.5.0** (released 2026-08-07 — version drift from v2.4.0 on the page): fresh binary, run on a fixture repo containing `.mcp.json` (exposed secret + unpinned npx server), a poisoned `SKILL.md`, and a `package.json` depending on `ludus-mcp@1.0.24`. Result: "No package sources found" — it does not read MCP configs or skill files at all without a lockfile; package-focused claim holds. SARIF output only materializes with package results.
- **thynkQ mcp-scan 2.0.2 (npm)**: re-run on the same fixture — still finds the config-level issues (7 findings) but zero skill/instruction findings for the poisoned `SKILL.md`; claim re-verified and re-dated.
- **socket CLI**: version drift 1.1.154 → 1.1.155 (verified via real `npx @socketsecurity/cli --version`); behavior claims unchanged.
- **snyk-agent-scan** (PyPI): still 0.5.16 — no drift; token-gated claims left dated as verified 2026-08-06.
- **AgentGate** on the same fixture: 7 findings (1 critical, 2 high, 3 medium, 1 low) — skill poisoning (AG-SK-001), credential leak ×2, unpinned + `-y` supply chain, and MCPA advisory hits ×2.

## Page updates

- `Last verified` line → 2026-08-08, socket 1.1.155, osv-scanner v2.5.0.
- Advisory count 31 → **41** (stale since the round-217/223/228 sweeps).
- thynkQ skill-scanning gap re-dated 2026-08-08.

## Honest boundaries

- snyk-agent-scan token-gated features remain unverifiable without an account; cells stay "unknown — unverifiable without a token" rather than guessed.
- osv-scanner remote/MCP claims verified only on the Linux amd64 binary.
