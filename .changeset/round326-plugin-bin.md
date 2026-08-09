---
'mcp-agentgate-core': patch
'mcp-agentgate': patch
---

Plugin `bin/` executables are now scanned (manifest-gated, any extension, binary blobs skipped): files under a plugin root's `bin/` join the Bash tool's PATH while the plugin is enabled, so AG-RC-001 treats extensionless bin scripts as executable — live `curl|sh` reports critical and dynamic code-execution primitives report medium with a plugin-bin label.
