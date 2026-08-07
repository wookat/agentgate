---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

The shared auto-executing hook/skill command classifier now models PowerShell download-and-execute idioms: `irm`/`iwr`/`Invoke-RestMethod`/`Invoke-WebRequest` piped to `iex`/`Invoke-Expression`, and the `iex (irm …)` call form, report critical — the same as `curl | sh`. Plain downloads (`iwr … -OutFile`) stay clean. The skill-side curl|sh pattern also no longer spans plain newlines.
