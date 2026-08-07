---
title: FAQ
description: Frequently asked questions about AgentGate.
---

## What does AgentGate actually protect me from?

Three concrete failure modes, all with real-world precedent (see the [threat model](/docs/threat-model/)):

1. **Malicious or vulnerable MCP packages** — cross-checked against the [advisory database](/advisories/).
2. **Tool poisoning** — hidden instructions in tool descriptions your agent reads verbatim.
3. **Rug pulls** — a server you approved yesterday silently changing its tool surface today, caught by the [lockfile gate](/docs/cli/diff/).

## Is `agentgate scan` safe to run? Does it execute server code?

The default static scan never executes server code — it only reads configs (and source files for a repo target). `--live` explicitly opts in to launching stdio servers (after a confirmation prompt) and to contacting remote `url` servers over Streamable HTTP/SSE to read their real tool surface; only use it with servers you'd run or call anyway.

## How do I scan a remote server that requires login?

For OAuth-protected hosted servers, run `agentgate auth login <server-name>` once — live scans then pick up the cached tokens automatically. For servers using static tokens, add them under `headers` in the server config. See the [OAuth guide](/docs/guides/remote-oauth/).

## Which MCP clients are supported?

Auto-discovery covers Claude Desktop, Claude Code, Cursor, VS Code, Codex (`config.toml`), OpenCode (`opencode.json`), Windsurf, Cline, Gemini CLI, Kiro, Roo Code, Zed, Continue.dev, Amp, Warp, LM Studio, Trae (project `.trae/mcp.json`), Qoder (`~/.qoder/settings.json`, project `.qoder/settings*.json`), and the generic `.agents/.mcp.json` convention. Any other client works via `--config path/to/config`.

## How is this different from `npm audit`?

`npm audit` checks package versions against a vulnerability DB. AgentGate does that for MCP packages (via the advisory DB) **plus** things no registry audit can see: what tools a server exposes at runtime, whether their descriptions contain injection payloads, and whether any of that changed since you approved it.

## Do I commit `agentgate.lock`?

Yes — it's your reviewed baseline, exactly like a dependency lockfile. Review its diffs in PRs; a changed `descriptionHash` means a tool description changed, which is precisely the rug-pull signal.

## A rule flagged something I believe is fine. What now?

Findings are advisory; the gate threshold is yours to set (`--fail-on`). Use `--server` to scope scans, fix the config pattern the rule points at (usually the cleanest path), or gate at a higher severity. Per-rule remediation guidance: [rule reference](/docs/rules/).

## Does the CLI send my configs anywhere?

No. Scanning is local. The only network calls are the ones you opt into: `--live` connects to *your* servers, and advisory lookups query the public [advisory API](/docs/spec/advisory-api/) with package names/versions only. The [report viewer](/report-viewer/) parses reports entirely in your browser.

## How do I report a new malicious MCP package?

Open a PR adding an advisory JSON file — see [contributing advisories](/docs/advisories/contributing/). Every entry needs authoritative references; we don't accept unverifiable reports.

## Is AgentGate a sandbox or runtime firewall?

No. AgentGate is a *gate*: it audits and pins what your agent is allowed to see, before and between runs. Pair it with OS-level sandboxing and least-privilege server configs for runtime containment.
