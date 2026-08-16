# Demo assets

`demo.gif` is the README hero demo: scan → lock → simulated upstream rug-pull →
`agentgate diff` catching the drift. It is recorded from the real CLI (no mockups).

## Regenerating

Requires [asciinema](https://asciinema.org) and [agg](https://github.com/asciinema/agg).

```bash
pnpm install && pnpm build

# stage the demo workspace
mkdir -p ~/demo && cd ~/demo
cp <repo>/docs/assets/demo-mcp.json mcp.json
cp <repo>/docs/assets/demo-notes-server.js notes-server.js
echo '{ "type": "module" }' > package.json
ln -s <repo>/packages/cli/node_modules node_modules   # provides @modelcontextprotocol/sdk + zod
cp <repo>/docs/assets/demo.sh demo.sh

asciinema rec -q --overwrite --cols 145 --rows 38 -c "bash demo.sh" demo.cast
agg --font-size 16 --theme monokai --last-frame-duration 4 demo.cast <repo>/docs/assets/demo.gif
```

The `github` server entry in `demo-mcp.json` uses a deliberately fake
`ghp_demo…` token (not a real credential). The scan step demonstrates the
supply-chain rule (`@latest` + `-y` on the github server); the low-entropy
placeholder token is intentionally not flagged by the credential rule.
