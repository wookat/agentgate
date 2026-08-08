---
'mcp-agentgate-core': patch
'mcp-agentgate': patch
---

Advisory database 91 → 95: four in-the-wild npm packages that hijack local coding agents — `mangomind-agent` (rewrites the workspace OpenCode config to route model traffic through the author's endpoint, executes relay-supplied commands), `aclade-agent` (polls a hardcoded server for shell tasks, self-updates), `agenthub-ai` (autostart service driving the Claude Agent SDK from a hardcoded relay), and `claude-remote-agent` 0.1.0–0.2.0 (hardcoded default relay remote-driving a local Claude PTY session).
