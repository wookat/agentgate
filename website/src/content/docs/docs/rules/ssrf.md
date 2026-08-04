---
title: "AG-SS-001 · ssrf"
description: Cloud-metadata endpoints and unrestricted URL-fetching tools.
---

Detects server-side request forgery vectors: references to cloud metadata endpoints and tools that fetch caller-supplied URLs without restrictions.

## What it checks

**Config** (static): server URL, args, or env referencing a cloud metadata endpoint — `169.254.169.254`, `metadata.google.internal`, `metadata.azure.com`, `100.100.100.200` (`critical`, likely credential theft).

**Tool surface** (`--live`):

- Tool text referencing a metadata endpoint (`critical`).
- Tools that accept a caller-controlled URL parameter (`url`, `uri`, `endpoint`, `webhook_url`, …) and fetch/download/crawl it, with no documented private-network restrictions (`medium`).
- Descriptions referencing private IP ranges (`low`).

**Source scan**: metadata-endpoint references in repo files (`high`).

## Why it matters

An agent-driven fetch tool is an SSRF primitive by construction: the "attacker-controlled URL" is anything the model can be talked into requesting. In cloud environments one request to the metadata service yields live credentials.

## Fixing findings

- Block metadata endpoints and private ranges in the fetching server itself, and say so in the tool description (documented allowlists/denylists suppress the `medium` finding).
- Run URL-fetching servers in an egress-restricted network context.
