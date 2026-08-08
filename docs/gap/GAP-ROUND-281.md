# GAP-ROUND-281 — advisory sweep (last: round 276)

## Windows

- GHSA vulnerability window (watch script, last 8 days): 2 uncovered
  candidates.
- OSV malware namespace window (ossf/malicious-packages, published
  2026-08-03..08-08): 2,165 entries, 33 MCP/agent-named candidates triaged.

## Ingested (81 → 83)

- **MCPA-2026-0068 — mcp-pdf-vision 1.1.0 command injection
  (CVE-2026-19279, low/5.3).** Verified by unpacking both npm tarballs:
  1.1.0 interpolates pdfPath/sessionId into a `pdftoppm` string run through
  `child_process` exec (a `"` in pdfPath escapes the quoting); 1.0.0 has no
  exec-based extraction, so introduced=1.1.0. Maintainer unresponsive, no
  fix → last_affected per round-245 policy. End-to-end: 1.1.0 hits AG-SC-003.
- **MCPA-2026-0069 — opencode-engos-ai (critical, still on npm at
  1.21.8).** Tarball verified: postinstall resolves
  `opencode-engos-<platform>-<arch>` to whatever 'latest' the attacker has
  published, installs it, and symlinks the binary into
  /usr/local/bin/innexarcode and /usr/bin/innexarcode — attacker-updatable
  binary drop with system-path persistence, same campaign shape as
  MCPA-2026-0061. OSV MAL-2026-12405 (amazon-inspector). End-to-end:
  AG-SC-003 critical.

## Rejected (honest)

- GHSA-wgq9-x672-9734 (slidev-builder-mcp command injection): GitHub-only,
  not on npm/PyPI — same mapping bar as rounds 261/267; added to
  watch-ignore with rationale.
- ~30 malware-window entries: dependency-confusion internal names
  (@or-sdk/*, @servicetitan/anvil2-mcp, fa-mcp-sdk, mcp-audit-sync-internal
  — fa-mcp-sdk unpacked to confirm it is a leaked internal SDK, not a
  user-facing MCP server) and generic Claude/agent-named trojans
  (anthropic-setup, @cliphijack/santaclaude, @guangnao/claude-cli,
  remote-claude-daemon, chatcc-agent et al.) — not scan-surface packages;
  OSV live checks cover them. llm-interceptor / agenttunnels /
  opencode-optimised-toolings / devplatform-react-mcp /
  agenthub-multiagent-mcp already ingested in rounds 267/271.

## Validation

83 files schema-valid, bundled data.ts rebuilt, comparison count 81→83
(CI gate green), full test/lint/typecheck/build green.
