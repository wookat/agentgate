---
'mcp-agentgate': patch
'mcp-agentgate-core': patch
---

Round 2 benchmark (vs mcp-scan / Snyk Agent Scan, microsoft/vscode as the real-world subject):

- `scan --live` now lists the stdio commands it is about to start and asks for confirmation; non-interactive sessions must pass `--yes` (nothing is started otherwise)
- a static scan that skips stdio servers warns that their live tool surface was not inspected instead of reporting a clean bill
- rule recall: third-person tool descriptions ("Executes arbitrary shell commands") are now matched by the RCE, overprivileged and SSRF rules
- rule precision on real repos (vscode: 478 → 89 findings): `.exec(` is no longer a code-execution primitive, a bare `child_process` mention needs a nearby exec/spawn call, `curl|sh` in non-executable files is medium, and emoji ZWJ/flag/Nerd-Font/BOM characters are no longer "hidden instructions" (zero-width → low, Trojan-Source bidi → high, now with codepoint and line)
- `deps` collapses a fully unreachable registry into one warning instead of one finding per package
