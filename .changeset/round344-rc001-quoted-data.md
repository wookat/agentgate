---
'mcp-agentgate-core': patch
---

AG-RC-001 curl|sh precision: quoted string literals that are plain data — commit-message examples, test-case labels, printed installation hints — no longer report critical findings. Strings fed to an interpreter (`bash -c '...'`, `eval`, command substitution) or whose content starts with the downloader itself stay live, and echoed/printf hint strings are masked in every file that embeds shell commands (e.g. a pre-commit YAML `bash -c "... || echo 'install: curl ... | bash'"`).
