---
'mcp-agentgate-core': patch
---

AG-CL-001 precision: sequential-run dummy values (sk-abcdef1234567890…) are skipped as placeholders, secret-shaped strings under an OpenAPI/JSON-Schema `example:` key report low, and Supabase anon-role JWTs (publishable by design) report low with an RLS reminder. Service-role JWTs and real key material stay high.
