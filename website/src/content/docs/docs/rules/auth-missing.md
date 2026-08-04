---
title: "AG-AM-001 · auth-missing"
description: Remote MCP servers without authentication or over plain HTTP.
---

Detects remote MCP servers configured without authentication or over unencrypted transport. Only applies to servers with a `url` (localhost is exempt).

## What it checks

**Config** (static):

- Remote server over plain `http://` (`high`) — traffic, including any tokens, is unencrypted.
- Remote server with no `Authorization`/API-key header and no inline credential (`medium`) — verify the endpoint enforces auth (e.g. OAuth) out of band.
- Credentials passed in the URL query string (`medium`) — query strings end up in logs and proxies; prefer an `Authorization` header.
- Unparseable URL (`low`).

## Why it matters

An unauthenticated MCP endpoint is an open tool surface: anyone who can reach it can enumerate and invoke your tools, and MITM on plain HTTP can rewrite tool descriptions in transit — turning the transport itself into a poisoning vector.

## Fixing findings

- Use `https://` for every non-local server.
- Configure an `Authorization` header (env-referenced, not hardcoded — see [AG-CL-001](/docs/rules/credential-leak/)).
- If the endpoint uses OAuth flows the config can't express, confirm they're enforced and suppress by design review.
