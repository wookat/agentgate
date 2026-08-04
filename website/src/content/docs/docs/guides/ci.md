---
title: CI integration
description: Gate MCP drift and findings in GitHub Actions, GitLab CI, CircleCI, Jenkins, and Azure Pipelines.
---

Add [`agentgate ci`](/docs/cli/ci/) to your pipeline so a rug-pulled tool description or a severe finding fails the build before your agent ever sees it.

Prerequisites in the repo being gated:

1. A committed [`agentgate.lock`](/docs/spec/lockfile/) (run `agentgate lock` locally and review it in a PR).
2. An MCP config the runner can read — pass it explicitly with `--config` for reproducible CI runs.

:::note
The `agentgate` npm release is being prepared. Until it lands, the recipes below build the CLI from source; once published, replace the build step with `npx <published-package> ci …`. The [GitHub Action](#github-actions) already wraps this for you.
:::

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

To surface scan findings in GitHub code scanning, set `sarif-file: agentgate.sarif` on the action and add:

```yaml
      - uses: github/codeql-action/upload-sarif@v3
        if: always()
        with:
          sarif_file: agentgate.sarif
```

## GitLab CI

```yaml
mcp-gate:
  image: node:22
  before_script:
    - corepack enable
    - git clone --depth 1 https://github.com/wookat/agentgate.git /tmp/agentgate
    - cd /tmp/agentgate && pnpm install --frozen-lockfile && pnpm build && cd -
  script:
    - node /tmp/agentgate/packages/cli/dist/index.js ci --config .mcp.json --fail-on high
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
          name: Build agentgate
          command: |
            corepack enable
            git clone --depth 1 https://github.com/wookat/agentgate.git /tmp/agentgate
            cd /tmp/agentgate && pnpm install --frozen-lockfile && pnpm build
      - run:
          name: MCP gate
          command: node /tmp/agentgate/packages/cli/dist/index.js ci --config .mcp.json --fail-on high
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
        sh '''
          corepack enable
          git clone --depth 1 https://github.com/wookat/agentgate.git /tmp/agentgate
          cd /tmp/agentgate && pnpm install --frozen-lockfile && pnpm build
          cd "$WORKSPACE"
          node /tmp/agentgate/packages/cli/dist/index.js ci --config .mcp.json --fail-on high
        '''
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
  - script: |
      corepack enable
      git clone --depth 1 https://github.com/wookat/agentgate.git /tmp/agentgate
      cd /tmp/agentgate && pnpm install --frozen-lockfile && pnpm build
    displayName: Build agentgate
  - script: node /tmp/agentgate/packages/cli/dist/index.js ci --config .mcp.json --fail-on high
    displayName: MCP gate
```

## Tips

- **Pin the config**: auto-discovery looks at the *runner's* home directory — in CI, always pass `--config` pointing at a config committed to the repo.
- **Choose the threshold deliberately**: `--fail-on high` (default) blocks on high/critical findings; use `--fail-on medium` once your baseline is clean.
- **Stdio servers run in CI**: `ci`/`diff`/`lock` connect to stdio servers to read their live tool surface, so the runner needs any runtimes those servers require (e.g. `uv` for Python servers). Restrict with `--server` if only some servers matter.
- **Exit code 2 means the gate itself broke** (missing lockfile, unreachable server) — treat it as a failure, don't mask it.
