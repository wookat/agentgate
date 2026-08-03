---
title: Advisory schema
description: The structured JSON format of the AgentGate MCP advisory database.
---

Every advisory in the [database](/advisories/) is one JSON file in [`advisories/`](https://github.com/wookat/agentgate/tree/main/advisories), validated against [`advisories/schema/advisory.schema.json`](https://github.com/wookat/agentgate/blob/main/advisories/schema/advisory.schema.json) (JSON Schema 2020-12).

## Shape

```json
{
  "id": "MCPA-2025-0001",
  "title": "mcp-remote OS command injection via untrusted MCP server (CVE-2025-6514)",
  "summary": "One-paragraph plain-language summary.",
  "details": "Extended technical details (Markdown allowed).",
  "type": "rce-vectors",
  "severity": "critical",
  "cvss": { "score": 9.6, "vector": "CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:H/I:H/A:H" },
  "aliases": ["CVE-2025-6514", "GHSA-6xpm-ggf7-wc3p"],
  "cwe": ["CWE-78"],
  "packages": [
    {
      "ecosystem": "npm",
      "name": "mcp-remote",
      "ranges": [{ "introduced": "0.0.5", "fixed": "0.1.16" }]
    }
  ],
  "references": [{ "type": "advisory", "url": "https://nvd.nist.gov/vuln/detail/CVE-2025-6514" }],
  "timeline": { "published": "2025-07-09" },
  "credits": ["Or Peles (JFrog Security Research)"]
}
```

## Key rules

- **ID**: `MCPA-YYYY-NNNN`, must match the filename.
- **type**: shares the enum with scan rule categories, plus `path-traversal` and `malicious-package`.
- **packages[].ranges**: OSV-style SemVer events. Each range has `introduced` plus either `fixed` (half-open: affected while `introduced ≤ v < fixed`) or `last_affected` (closed: `introduced ≤ v ≤ last_affected`); with neither, everything from `introduced` onward is affected.
- **references**: at least one; every advisory must cite authoritative sources (NVD/GHSA/OSV/vendor advisory or reputable research). Entries without verifiable references are rejected.

## Contributing an advisory

See [`advisories/README.md`](https://github.com/wookat/agentgate/blob/main/advisories/README.md). Validation runs via `node api/scripts/validate.mjs` and in CI.
