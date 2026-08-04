# Security Policy

## Supported versions

| Version | Supported |
| ------- | --------- |
| 0.x (latest minor) | ✅ |

Only the latest published release line receives security fixes.

## Reporting a vulnerability

Please report vulnerabilities privately — do **not** open a public issue.

- Preferred: [GitHub private vulnerability reporting](https://github.com/wookat/agentgate/security/advisories/new)
- We aim to acknowledge reports within **48 hours** and provide a fix or
  mitigation plan within **7 days** for high/critical issues.

Please include a proof of concept, affected versions, and impact assessment
where possible. We will credit reporters in the advisory unless you prefer
otherwise.

## Scope

- `agentgate` (CLI) and `@agentgate/core` npm packages
- The GitHub Actions workflows in this repository

False negatives in the scanning rules (a threat we should detect but do not)
are welcome as regular issues; false positives too. Bypass techniques that
defeat the lockfile drift gate are treated as vulnerabilities.

## Supply-chain posture

- All GitHub Actions are pinned to full commit SHAs.
- Dependencies are locked via `pnpm-lock.yaml` and installed with
  `--frozen-lockfile` in CI.
- Releases are published from CI with npm provenance.
- AgentGate scans itself in CI (`dogfood` job).
