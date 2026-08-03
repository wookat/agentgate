---
title: Quick start
description: Scan, lock, and gate your MCP servers in five minutes.
---

:::note
AgentGate is under active development. Commands below reflect the CLI interface specification (see [docs/ROUTES.md](https://github.com/wookat/agentgate/blob/main/docs/ROUTES.md)); the npm package is published by route A once the core engine lands.
:::

## 1. Install

```bash
npm install -g agentgate
# or run without installing
npx agentgate scan
```

Requires Node.js 22+.

## 2. Scan your MCP servers

AgentGate auto-discovers MCP server configurations from common client config paths (Claude Desktop, Claude Code, Cursor, VS Code, Codex, OpenCode):

```bash
agentgate scan
```

Static analysis inspects configs and packages. Add `--live` to also connect to each server over stdio and inspect the *actual* tool surface it exposes:

```bash
agentgate scan --live
```

Each finding is categorized (`tool-poisoning`, `credential-leak`, `overprivileged`, `auth-missing`, `ssrf`, `rce-vectors`, `supply-chain`) and cross-checked against the [advisory database](/advisories/). Output as a terminal table by default, or:

```bash
agentgate scan --format json  > report.json   # for the report viewer
agentgate scan --format sarif > report.sarif  # for GitHub code scanning
```

Drop `report.json` into the [report viewer](/report-viewer/) for a shareable visual report.

## 3. Lock the approved tool surface

Once you've reviewed the scan, pin what your agent is allowed to see:

```bash
agentgate lock
```

This writes [`agentgate.lock`](/docs/spec/lockfile/) — SHA-256 hashes over each server's tool names, descriptions, and input schemas. Commit it:

```bash
git add agentgate.lock && git commit -m "Lock MCP tool surface"
```

## 4. Gate CI on drift

```bash
agentgate ci
```

Exits non-zero if the current tool surface drifts from `agentgate.lock` — a renamed tool, a changed description (prompt-injection vector), a widened input schema. Review the diff, then re-approve deliberate changes with `agentgate lock`.

```yaml
# .github/workflows/agentgate.yml
name: agentgate
on: [push, pull_request]
jobs:
  gate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npx agentgate ci
```

## Next steps

- [CLI reference](/docs/cli/scan/) for all flags.
- [Threat model](/docs/threat-model/) for what each rule category defends against.
- [Advisory API](/docs/spec/advisory-api/) to query the advisory database programmatically.
