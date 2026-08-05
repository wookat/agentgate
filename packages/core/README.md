# mcp-agentgate-core

Engine behind [`mcp-agentgate`](https://www.npmjs.com/package/mcp-agentgate): MCP client config discovery, the scan rule engine, tool-surface lockfile + drift detection, dependency (slopsquatting/malware) checks, and the MCPA advisory database (bundled + live API refresh).

Most users want the CLI:

```bash
npx -y mcp-agentgate scan
```

Use this package directly to embed scanning in your own tooling:

```ts
import { scanServers, matchMcpaAdvisories, fetchLiveMcpaAdvisories } from 'mcp-agentgate-core';
```

Requires Node.js >= 22. Documentation: <https://agentgate.zalize.com> · Source: <https://github.com/wookat/agentgate>
