import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

export const CLI_VERSION = (
  JSON.parse(
    fs.readFileSync(path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '../package.json'), 'utf8'),
  ) as { version: string }
).version;
