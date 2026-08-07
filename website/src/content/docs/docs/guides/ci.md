---
title: CI integration
description: Gate MCP drift and findings in GitHub Actions, GitLab CI, CircleCI, Jenkins, and Azure Pipelines.
---

Add [`agentgate ci`](/docs/cli/ci/) to your pipeline so a rug-pulled tool description or a severe finding fails the build before your agent ever sees it.

Prerequisites in the repo being gated:

1. A committed [`agentgate.lock`](/docs/spec/lockfile/) (run `agentgate lock` locally and review it in a PR).
2. An MCP config the runner can read — pass it explicitly with `--config` for reproducible CI runs.

AgentGate is published on npm as [`mcp-agentgate`](https://www.npmjs.com/package/mcp-agentgate) (the installed command is still `agentgate`), so every recipe below is a one-liner with `npx mcp-agentgate`.

## GitHub Actions

Using the bundled composite action:

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
          args: --config .mcp.json --fail-on high
          lockfile: agentgate.lock
```

Findings surface **inline on the PR diff automatically**: under GitHub
Actions, `ci`, `scan`, and `deps` emit one
[workflow-command annotation](/docs/cli/ci/#github-actions-annotations) per
finding (`critical`/`high` as errors, `medium` as warnings, `low`/`info` as
notices) — no extra permissions or upload steps needed.

To additionally surface scan findings in GitHub code scanning, add a `command: scan` step with `sarif-file: agentgate.sarif` (SARIF output is scan-only) and upload it:

```yaml
      - uses: wookat/agentgate/packages/action@main
        with:
          command: scan
          sarif-file: agentgate.sarif
      - uses: github/codeql-action/upload-sarif@v3
        if: always()
        with:
          sarif_file: agentgate.sarif
```

## GitLab CI

```yaml
mcp-gate:
  image: node:22
  script:
    - npx mcp-agentgate ci --config .mcp.json --fail-on high
```

## CircleCI

```yaml
version: 2.1
jobs:
  mcp-gate:
    docker:
      - image: cimg/node:22.17
    steps:
      - checkout
      - run:
          name: MCP gate
          command: npx mcp-agentgate ci --config .mcp.json --fail-on high
workflows:
  gate:
    jobs: [mcp-gate]
```

## Jenkins

```groovy
pipeline {
  agent { docker { image 'node:22' } }
  stages {
    stage('MCP gate') {
      steps {
        sh 'npx mcp-agentgate ci --config .mcp.json --fail-on high'
      }
    }
  }
}
```

## Azure Pipelines

```yaml
pool:
  vmImage: ubuntu-latest
steps:
  - task: UseNode@1
    inputs:
      version: 22.x
  - script: npx mcp-agentgate ci --config .mcp.json --fail-on high
    displayName: MCP gate
```

## Tips

- **Pin the config**: auto-discovery looks at the *runner's* home directory — in CI, always pass `--config` pointing at a config committed to the repo.
- **Choose the threshold deliberately**: `--fail-on high` (default) blocks on high/critical findings; use `--fail-on medium` once your baseline is clean.
- **Servers are contacted in CI**: `ci`/`diff`/`lock` connect to stdio servers (the runner needs any runtimes they require, e.g. `uv` for Python servers) and to remote `url` servers over Streamable HTTP/SSE (the runner needs network access and any auth `headers`). Restrict with `--server` if only some servers matter.
- **Exit code 2 means the gate itself broke** (missing lockfile, unreachable server) — treat it as a failure, don't mask it.
