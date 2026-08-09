---
'mcp-agentgate-core': patch
---

Other CI systems' pipeline configs (`.gitlab-ci.yml`, `.circleci/config.yml`, `azure-pipelines*.yml`, `.buildkite/*.yml`, `.travis.yml`, `bitbucket-pipelines.yml`, `.drone.yml`, `appveyor.yml`, `cloudbuild.yaml`) are no longer source-scanned — build automation is not MCP server source, matching the existing `.github/workflows` exemption.
