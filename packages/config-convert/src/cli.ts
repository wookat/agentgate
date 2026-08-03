#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import process from "node:process";
import { convert } from "./index.js";
import { ADAPTERS } from "./clients.js";
import { CLIENT_IDS, ClientId, ConfigParseError } from "./model.js";

const USAGE = `Usage: agentgate-config-convert --from <client> --to <client> [--in <file>] [--out <file>]

Convert MCP server configuration between client formats.

Clients:
${CLIENT_IDS.map((c) => `  ${c.padEnd(16)} (${ADAPTERS[c].defaultPath})`).join("\n")}

Options:
  --from <client>   Source client format (required)
  --to <client>     Target client format (required)
  --in <file>       Input file (default: stdin)
  --out <file>      Output file (default: stdout)
  -h, --help        Show this help

Warnings about lossy conversions are printed to stderr; exit code is 0 unless
parsing fails.`;

function fail(msg: string): never {
  process.stderr.write(`error: ${msg}\n\n${USAGE}\n`);
  process.exit(2);
}

function main(): void {
  const args = process.argv.slice(2);
  let from: string | undefined;
  let to: string | undefined;
  let input: string | undefined;
  let output: string | undefined;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "-h" || a === "--help") {
      process.stdout.write(USAGE + "\n");
      return;
    } else if (a === "--from") from = args[++i];
    else if (a === "--to") to = args[++i];
    else if (a === "--in") input = args[++i];
    else if (a === "--out") output = args[++i];
    else fail(`unknown argument: ${a}`);
  }
  if (!from || !to) fail("--from and --to are required");
  if (!CLIENT_IDS.includes(from as ClientId)) fail(`unknown client: ${from}`);
  if (!CLIENT_IDS.includes(to as ClientId)) fail(`unknown client: ${to}`);

  const content = readFileSync(input ?? 0, "utf8");
  try {
    const result = convert(from as ClientId, to as ClientId, content);
    for (const w of result.warnings) process.stderr.write(`warning: ${w}\n`);
    if (output) writeFileSync(output, result.content);
    else process.stdout.write(result.content);
  } catch (e) {
    if (e instanceof ConfigParseError) {
      process.stderr.write(`error: ${e.message}\n`);
      process.exit(1);
    }
    throw e;
  }
}

main();
