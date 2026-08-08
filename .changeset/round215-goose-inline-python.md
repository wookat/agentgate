---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

Goose recipe `inline_python` extensions (code executed via uvx for everyone who runs the recipe) are classified for dangerous idioms (AG-SK-003): shell download-and-execute strings, `exec`/`eval` of downloaded or base64-decoded content (critical), secret exfiltration via `requests.post(os.environ…)`, and credential-file reads (high).
