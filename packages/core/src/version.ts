import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

/** Version of mcp-agentgate-core, read from its own package.json. */
export const CORE_VERSION = (
  JSON.parse(
    fs.readFileSync(path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '../package.json'), 'utf8'),
  ) as { version: string }
).version;
