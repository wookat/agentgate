---
title: "AG-RC-001 · rce-vectors"
description: Shell-wrapped launches, curl|sh patterns, and arbitrary code-execution tools.
---

Detects remote-code-execution vectors in how servers are launched and what their tools can execute.

## What it checks

**Config** (static):

- Servers launched through a shell (`sh -c`, `cmd /c`, PowerShell) (`medium`) — inline shell strings are an injection-prone launch vector.
- Launch commands piping a remote download into an interpreter — the `curl … | sh` pattern (`critical`).

**Tool surface** (`--live`): tools that execute arbitrary commands/code. `high` with no documented sandboxing; `low` if the description claims a sandbox/isolated environment (verify the claim).

**Source scan**:

- `curl|sh` patterns in repo files: `critical` in files that are actually executed (shell scripts, Dockerfiles, CI YAML, `package.json`), `medium` elsewhere (usually documentation or prompt text — confirm it is never executed).
- Dynamic code-execution primitives — `eval(`, `new Function(`, `child_process`/`execSync` shell spawns (`medium`) — review how inputs reach them. Reported only in files that are part of an MCP server (referencing `modelcontextprotocol`, `FastMCP`, `McpServer`, …): that is where model-controlled input can reach them. Dynamic execution in ordinary application code is out of scope for this scanner.

## Why it matters

An exec-capable tool gives every upstream influence on your agent (poisoned descriptions, injected page content) a direct path to code execution on your machine. CVE-2025-6514 (mcp-remote) showed the launch path itself can be the RCE.

## Fixing findings

- Launch servers directly (binary + args array), not via `sh -c` one-liners.
- Never pipe remote scripts into interpreters — download, review, pin, then run.
- Prefer sandboxed/containerized exec tools, and gate them behind [`agentgate lock`](/docs/cli/lock/) so their surface can't silently grow.
