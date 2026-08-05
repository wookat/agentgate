# GAP-ROUND-4 — Production benchmark loop, round 4 (repo-scan signal-to-noise)

Date: 2026-08-05. Small, single-issue round closing the last P1 from rounds 2–3:
`AG-RC-001 medium` volume on large non-MCP repositories.

## The gap

Reference point: osv-scanner and npm audit only report what is in scope for
their domain (dependency vulnerabilities); they do not lint your application
code. Our repo scan reported **every** dynamic code-execution primitive
(`eval(`, `new Function(`, `child_process` exec/spawn) in any file — on
microsoft/vscode that meant 67 `medium` findings that are technically true
("this file uses a dynamic exec primitive") but are ordinary engineering in a
code editor, drowning the 22 findings a security reviewer should read.

## The fix

Dynamic-exec primitives matter to an *MCP* scanner where model-controlled input
can reach them. `AG-RC-001` now reports them only in files that are part of an
MCP server (matching `modelcontextprotocol`, `FastMCP`, `McpServer`,
`mcp_server`, `mcpServers`). Non-MCP application code is out of scope — stated
in the rule docs rather than silently assumed. `curl|sh` detection is
unchanged (it is a launch vector regardless of MCP context).

## Measured result (microsoft/vscode, 13,639 files)

| | round 1 | round 2/3 | round 4 |
|---|---|---|---|
| findings | 478 | 89 | **27** |
| `AG-RC-001 medium` | 433 | 67 | **5** |
| wall time | 1.46 s | 1.5 s | 1.6 s |

The 5 survivors are genuinely reviewable: 4 documented `curl|sh` strings in
chat-tool risk-assessment code and **one real catch** —
`test/mcp/src/automationTools/terminal.ts` (vscode's own MCP automation
tooling) using `new Function(...)`. Exactly the file class this rule exists for.

Regression: 146 tests green; the malicious-fixture live scan and the
express/flask `deps` results are unaffected.

## Still open (round 5+ candidates)

1. Advisory feed for known-bad MCP servers/packages.
2. macOS/Windows verification.
3. `AG-CL-001` on secret-*filter* test fixtures (10 highs on vscode are strings
   inside redaction tests — arguably correct to flag, but worth a look).
