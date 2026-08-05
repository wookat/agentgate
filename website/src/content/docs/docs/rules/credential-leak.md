---
title: "AG-CL-001 · credential-leak"
description: Hardcoded credentials in configs and tools soliciting secrets.
---

Detects hardcoded credentials in MCP client configs and tools that solicit secrets through the model context.

## What it checks

**Config** (static):

- Secret-named `env` vars (`API_KEY`, `TOKEN`, `PASSWORD`, …) with values that look like real secrets (`high`). Recognized formats include OpenAI/Anthropic keys, GitHub tokens, Slack tokens, AWS access key IDs, Google API keys, private-key blocks, JWTs, and long opaque strings. Placeholders (`${ENV_VAR}`, `<your-key>`, `changeme`) are ignored.
- Hardcoded credentials in HTTP `headers` (e.g. `Authorization: Bearer <real token>`) (`high`).
- Secrets passed as command-line `args` — visible in process listings (`high`).

**Tool surface** (`--live`): tools whose input schema or description solicits credentials ("paste your API key…") are flagged at `medium` — secrets entered there flow through model context and may be logged or exfiltrated.

**Source scan**: hardcoded secret patterns in repo files (`high`). In test/fixture/example paths (or `*.test.*` / `*.spec.*` files) the severity is `low` with a "likely a deliberate fake; confirm" note — redaction tests deliberately contain secret-shaped strings, but a real key pasted into a test is still a leak.

## Fixing findings

- Replace literal values with environment references (`${MY_TOKEN}`) or use your OS keychain.
- Move header tokens into env-var references your client expands at launch.
- Rotate any credential that was committed or pasted into a config.
