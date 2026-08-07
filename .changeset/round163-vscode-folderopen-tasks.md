---
'mcp-agentgate-core': minor
'mcp-agentgate': minor
---

AG-SK-003 checks VS Code workspace tasks (`.vscode/tasks.json`): `"runOn": "folderOpen"` task commands run automatically when the folder opens in a trusted workspace, so remote-script pipes report critical and data exfiltration / credential reads report high. AG-SK-002 flags `task.allowAutomaticTasks: "on"` in workspace settings (medium) — it removes the one prompt before folderOpen tasks execute. Benign watch/build tasks and run-on-demand tasks stay clean.
