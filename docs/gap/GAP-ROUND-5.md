# GAP-ROUND-5 — Production benchmark loop, round 5 (secret findings in test trees)

Date: 2026-08-05. Single-issue round, closing the last review item from round 4.

## The gap

Reference point: dedicated secret scanners (GitGuardian, gitleaks) classify
matches in test/fixture paths separately, because redaction tests *deliberately*
contain secret-shaped strings. Our `AG-CL-001` reported every match at `high`:
on microsoft/vscode, 9 of the 10 highs were fake keys inside secret-*filter*
tests (`secretFilter.spec.ts`, `terminalEnvironment.test.ts`, self-signed-cert
fixtures) — exactly the files where such strings are supposed to exist.

## The fix

Secret-shaped strings in test/fixture/example/docs paths (or `*.test.*` /
`*.spec.*` files) are still reported — a real key pasted into a test is still a
leak — but at `low` with an explicit "likely a deliberate fake; confirm"
message. Non-test paths stay `high`.

## Measured result (microsoft/vscode)

```
before: AG-CL-001 high × 10
after:  AG-CL-001 high × 1   (src/vs/platform/agentHost/node/sshRemoteAgentHostService.ts
                              — a PRIVATE KEY marker in shipping code: genuinely worth review)
        AG-CL-001 low  × 9   (all in redaction/cert test fixtures)
```

Full-repo scan is now **27 findings, 6 above `low`** — every one reviewable.
146 tests green; no other rule affected.

## Still open (round 6+ candidates)

1. Advisory feed for known-bad MCP servers/packages.
2. macOS/Windows verification.
