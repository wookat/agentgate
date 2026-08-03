# AgentGate MCP Advisory Database

A public, structured database of security advisories affecting MCP (Model Context Protocol) servers, clients, and tooling. Every entry is a single JSON file validated against [`schema/advisory.schema.json`](schema/advisory.schema.json).

Query it programmatically via the AgentGate Advisory API (see [`docs/spec/advisory-api.md`](../docs/spec/advisory-api.md)), or let `agentgate scan` cross-check your MCP servers automatically.

## Entry format

- **ID**: `MCPA-YYYY-NNNN` (year of publication + sequence).
- **type**: aligned with AgentGate scan rule categories (`tool-poisoning`, `credential-leak`, `overprivileged`, `auth-missing`, `ssrf`, `rce-vectors`, `supply-chain`, `path-traversal`, `malicious-package`).
- **packages[].ranges**: SemVer events (`introduced` / `fixed` / `last_affected`), OSV-style.
- **references**: every advisory must cite authoritative sources (NVD/GHSA/OSV/vendor advisories or reputable research reports). No entry is accepted without verifiable references.

## Contributing

1. Copy an existing advisory as a template; pick the next free ID.
2. Verify every claim against the cited sources — do not paraphrase severity or version ranges from memory.
3. Run `node api/scripts/validate.mjs` to validate against the schema.
4. Open a PR. Maintainers re-verify sources before merging.
