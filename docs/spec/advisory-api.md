# AgentGate Advisory API — Specification

Version: v1
Owner: Route B (platform & docs)
Consumers: `agentgate` CLI (`scan` cross-checks discovered servers against this API), website advisory pages, third parties.

Base URL: `https://agentgate-advisory-api.<account>.workers.dev` (custom domain later). All responses are JSON, UTF-8, CORS-enabled (`Access-Control-Allow-Origin: *`), cached 5 minutes.

The advisory objects returned are exactly the files in [`advisories/`](../../advisories/), validated against [`advisories/schema/advisory.schema.json`](../../advisories/schema/advisory.schema.json). The database is bundled into the Worker at deploy time — no cold-start data fetch.

## Endpoints

### `GET /v1`

Service metadata: `{ name, version, advisory_count, generated_at, endpoints, docs }`.

### `GET /v1/advisories`

List all advisories. Optional filters (combined with AND):

| Param | Values |
|---|---|
| `severity` | `critical` \| `high` \| `medium` \| `low` |
| `type` | any schema `type` value (e.g. `rce-vectors`, `malicious-package`) |
| `ecosystem` | `npm` \| `pypi` \| `nuget` \| `other` |

Response: `{ "count": n, "advisories": [Advisory] }`

### `GET /v1/advisories/{id}`

Fetch one advisory by ID (`MCPA-YYYY-NNNN`). 404 with `{ "error": { "status", "message" } }` when unknown.

### `GET /v1/query?name={pkg}&version={ver}&ecosystem={eco}`

Find advisories affecting a package. `name` required (case-insensitive exact match, e.g. `@azure/mcp`); `version` and `ecosystem` optional.

- Without `version`: returns every advisory mentioning the package.
- With `version`: returns only advisories whose SemVer ranges (`introduced` / `fixed` / `last_affected`, OSV semantics) cover that version. Unparseable versions never match (fail-open on the CLI side is the caller's choice).

Response: `{ "name", "version", "ecosystem", "advisories": [Advisory] }`

### `POST /v1/query`

Batch form for the CLI (one round trip per scan). Max 100 queries.

```json
{ "queries": [ { "name": "mcp-remote", "version": "0.1.10", "ecosystem": "npm" } ] }
```

Response: `{ "results": [ <same shape as GET /v1/query> ] }`

## Errors

Non-2xx responses use `{ "error": { "status": <int>, "message": <string> } }`.

## Versioning & change policy

- Breaking changes bump the path version (`/v2/...`); `/v1` stays available ≥6 months after.
- Advisory schema changes are PR'd to `advisories/schema/advisory.schema.json` with route A/C tagged (cross-route interface, per docs/ROUTES.md).

## CLI integration notes (route A)

Suggested flow in `agentgate scan`:
1. Collect `{name, version, ecosystem}` for each configured MCP server package.
2. `POST /v1/query` with all of them.
3. Report matches as findings with category = advisory `type`, severity = advisory `severity`, and link `references[0].url`.
4. Network failure → degrade gracefully (warn, continue scan; offline mode may bundle `advisories/` from a repo checkout).
