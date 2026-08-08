import fs from 'node:fs';
import pc from 'picocolors';
import { knownConfigLocations, projectConfigLocations } from 'mcp-agentgate-core';
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

/** The source client's config file at its default location (project first, then user-level), if it exists. */
export function defaultConfigPath(client: string, cwd = process.cwd()): string | undefined {
  // Discovery files both Kilo surfaces under the `kilocode` client id; the convert
  // adapters split them by schema — `kilo` reads kilo.json(c) (OpenCode schema),
  // `kilocode` reads the mcpServers-style mcp.json / mcp_settings.json files.
  const matches = (l: { client: string; format: string }): boolean => {
    if (client === 'kilo') return l.client === 'kilocode' && l.format === 'opencode-json';
    if (client === 'kilocode') return l.client === 'kilocode' && l.format !== 'opencode-json';
    return l.client === client;
  };
  const candidates = [...projectConfigLocations(cwd), ...knownConfigLocations()].filter(matches);
  return candidates.find((l) => fs.existsSync(l.path))?.path;
}

export function runConfigConvert(opts: ConfigConvertOptions): number {
  let inFile = opts.in;
  if (inFile === undefined && process.stdin.isTTY) {
    inFile = defaultConfigPath(opts.from);
    if (inFile === undefined) {
      console.error(
        pc.red(`error: no ${opts.from} config found at its default location — pass --in <file> or pipe the config on stdin`),
      );
      return 2;
    }
    console.error(`reading ${inFile}`);
  }
  const content = inFile ? fs.readFileSync(inFile, 'utf8') : fs.readFileSync(0, 'utf8');
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
