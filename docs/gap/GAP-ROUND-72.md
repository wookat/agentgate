# GAP-ROUND-72 — new competitor on the `mcp-scan` npm name (thynkQ) tested; comparison pages lagged

Date: 2026-08-06

## How the gap was found (real evidence)

Routine competitor version check surfaced `mcp-scan@2.0.2` on npm — not the
Invariant/Snyk tool (that is pip `snyk-agent-scan`), but an unrelated product
by thynkQ that took over the npm name (first published 2026-03). Our
comparison pages did not cover it despite it being the closest UX overlap
with our static scan (offline, no account, multi-client config discovery).

## Real head-to-head (2026-08-06, shared fixture)

Fixture: `.mcp.json` with an exposed `sk-proj-…`-style env key, two unpinned
`npx -y` servers (one `ludus-mcp@1.0.24`), plus a poisoned
`.claude/skills/deploy/SKILL.md` (`<system>` exfil instruction).

thynkQ mcp-scan 2.0.2 (`npx -y mcp-scan scan`):

- Caught: exposed env secret (critical), unpinned/unscoped packages (high).
  Fast (19–27 ms).
- Missed: skill file scanned not at all — zero findings for the poisoned
  SKILL.md; no advisory knowledge — `ludus-mcp@1.0.24` (3 public CVEs, all
  in MCPA) reported only generic "unverified source".
- Accuracy issues observed: fake OpenAI-style key labeled "Cloudflare API
  Token"; version spec `ludus-mcp@1.0.24` flagged as network
  "exfiltration-vector"; one env secret fanned out into four boilerplate
  PII-compliance findings.
- Its `diff` compares two scan *reports*; no tool-surface lockfile, so a
  description rug-pull that doesn't change findings passes.

AgentGate (same fixture): 10 findings — AG-CL-001 high for the key,
AG-SK-001 2×critical for the skill file, AG-SC-003 3 advisory matches for
ludus-mcp (0015/0016/0017), AG-SC-001 unpinned findings.

## Fix (this round)

- `docs/COMPARISON.md`: new verified section for thynkQ mcp-scan.
- Website comparison page: "Last verified" line updated, advisory count
  29 → 31, new section on the npm-name situation and real-run results.

Docs-only; no changeset.

## Remaining gaps

- thynkQ's SBOM/compliance/TUI/marketplace features are breadth we don't
  match (and don't currently plan to); noted honestly.
- GitHub Actions still degraded; 0.15.0 version PR pending.
