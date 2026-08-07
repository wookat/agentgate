---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

AG-SK-002 flags Cursor CLI `permissions.allow` tokens that pre-approve `Read`/`Write` on secret-shaped paths (`.env`, `.pem`, `.key`, `.p12`/`.pfx`, secrets, credentials, `id_rsa`) as medium — pre-approved credential access. Scoped code-path tokens stay clean and `permissions.deny` still takes precedence.
