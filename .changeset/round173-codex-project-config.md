---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

AG-SK-002 checks Codex project-scoped config overrides (`.codex/config.toml`, loaded for anyone who trusts the project): `sandbox_mode = "danger-full-access"` and `default_permissions = ":danger-full-access"` report high (no filesystem/network sandbox), `approval_policy = "never"` and `sandbox_workspace_write.network_access = true` report medium. Safe modes (`read-only`/`workspace-write`, interactive approval policies) are not flagged.
