import fs from 'node:fs';
import pc from 'picocolors';
import { ADAPTERS, CLIENT_IDS, ClientId, ConfigParseError, convert } from 'mcp-agentgate-config-convert';

export interface ConfigConvertOptions {
  from: string;
  to: string;
  in?: string;
  out?: string;
}

export function clientChoices(): string[] {
  return [...CLIENT_IDS];
}

export function describeClients(): string {
  return CLIENT_IDS.map((c) => `  ${c.padEnd(16)} (${ADAPTERS[c].defaultPath})`).join('\n');
}

export function runConfigConvert(opts: ConfigConvertOptions): number {
  const content = opts.in ? fs.readFileSync(opts.in, 'utf8') : fs.readFileSync(0, 'utf8');
  try {
    const result = convert(opts.from as ClientId, opts.to as ClientId, content);
    for (const w of result.warnings) console.error(pc.yellow(`warning: ${w}`));
    if (opts.out) {
      fs.writeFileSync(opts.out, result.content);
      console.error(`✔ wrote ${opts.out}`);
    } else {
      process.stdout.write(result.content);
    }
    return 0;
  } catch (err) {
    if (err instanceof ConfigParseError) {
      console.error(pc.red(`error: ${err.message}`));
      return 2;
    }
    throw err;
  }
}
