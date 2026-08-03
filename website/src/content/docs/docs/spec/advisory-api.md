---
title: Advisory API
description: Query the MCP advisory database by package and version.
---

The advisory database is served by a Cloudflare Worker. Base URL:

```
https://agentgate-advisory-api.wookat520.workers.dev
```

All responses are JSON, CORS-enabled (`Access-Control-Allow-Origin: *`), cached for 5 minutes. The database is bundled into the Worker at deploy time. Canonical spec: [`docs/spec/advisory-api.md`](https://github.com/wookat/agentgate/blob/main/docs/spec/advisory-api.md).

## Endpoints

### `GET /v1`

Service metadata: advisory count, generation timestamp, endpoint list.

### `GET /v1/advisories`

List advisories. Optional AND-combined filters: `severity` (`critical|high|medium|low`), `type` (schema type values), `ecosystem` (`npm|pypi|nuget|other`).

```bash
curl 'https://agentgate-advisory-api.wookat520.workers.dev/v1/advisories?severity=critical'
```

### `GET /v1/advisories/{id}`

One advisory by ID:

```bash
curl 'https://agentgate-advisory-api.wookat520.workers.dev/v1/advisories/MCPA-2025-0001'
```

### `GET /v1/query`

Advisories affecting a package (optionally at a specific version):

```bash
curl 'https://agentgate-advisory-api.wookat520.workers.dev/v1/query?name=mcp-remote&version=0.1.10&ecosystem=npm'
```

With `version`, only advisories whose SemVer ranges cover that version are returned; without it, every advisory mentioning the package.

### `POST /v1/query`

Batch form (max 100 queries) — what `agentgate scan` uses, one round trip per scan:

```bash
curl -X POST 'https://agentgate-advisory-api.wookat520.workers.dev/v1/query' \
  -H 'content-type: application/json' \
  -d '{"queries":[{"name":"mcp-remote","version":"0.1.10","ecosystem":"npm"}]}'
```

## Errors

Non-2xx responses: `{ "error": { "status": <int>, "message": <string> } }`.

## Versioning

Breaking changes bump the path version (`/v2/…`); `/v1` remains available for at least 6 months afterward.
