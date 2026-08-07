---
title: Quick start
description: Scan, lock, and gate your MCP servers in five minutes.
---

## Requirements

- Node.js **22+**

## Install

AgentGate is published on npm as [`mcp-agentgate`](https://www.npmjs.com/package/mcp-agentgate); the installed command is `agentgate`:

```bash
npm i -g mcp-agentgate    # installs the `agentgate` command
# or run it without installing:
npx mcp-agentgate scan
```

## 1. Scan

Audit every MCP server your clients (Claude Desktop, Claude Code, Cursor, VS Code, Codex, OpenCode, Windsurf, Cline, Gemini CLI, Kiro, Roo Code, Zed, Continue.dev, Amp, Warp, LM Studio) are configured to run — config paths are discovered automatically:

```bash
agentgate scan                 # static config analysis, terminal table
agentgate scan --live          # also connect to servers (stdio + remote) and audit their live tool surface
```

For OAuth-protected hosted servers, [log in once](/docs/guides/remote-oauth/) with `agentgate auth login <server-name>` — live scans pick up the cached tokens automatically.

Machine-readable output:

```bash
agentgate scan --format json -o report.json     # open it in the report viewer
agentgate scan --format sarif -o report.sarif   # for GitHub code scanning
```

Drop `report.json` into the [report viewer](/report-viewer/) for a visual, filterable report.

You can also scan an MCP server repo for source-level issues:

```bash
agentgate scan path/to/repo
```

## 2. Lock

Pin the tool surface your agent sees — every tool's name, description, and input schema — into `agentgate.lock`:

```bash
agentgate lock
git add agentgate.lock
```

Commit the lockfile. It is your reviewed, approved baseline (format: [lockfile spec](/docs/spec/lockfile/)).

## 3. Gate

Fail the build when anything drifts from the baseline or a severe finding appears:

```bash
agentgate diff                 # exit 1 + human-readable diff on any drift
agentgate ci --fail-on high    # drift OR high-severity findings → non-zero exit
```

GitHub Actions:

```yaml
name: mcp-gate
on: [push, pull_request]
jobs:
  gate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: wookat/agentgate/packages/action@main
        with:
          command: ci
          args: --fail-on high
```

Recipes for GitLab CI, CircleCI, Jenkins, and Azure Pipelines: [CI integration guide](/docs/guides/ci/).

## Next steps

- [CLI reference](/docs/cli/scan/) — every command and flag.
- [Rule reference](/docs/rules/) — what each scan rule detects.
- [Threat model](/docs/threat-model/) — what AgentGate defends against, with real incidents.
- [Advisory database](/advisories/) — known-bad MCP packages, cross-checked on every scan.
