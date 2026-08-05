#!/usr/bin/env node
import { Command, Option } from 'commander';
import { SEVERITIES } from 'mcp-agentgate-core';
import { runScan } from './commands/scan.js';
import { runLock } from './commands/lock.js';
import { runDiff } from './commands/diff.js';
import { runCi } from './commands/ci.js';
import { runDeps } from './commands/deps.js';
import { clientChoices, describeClients, runConfigConvert } from './commands/config.js';
import { setDebug } from './debug.js';
import { CLI_VERSION } from './version.js';

const program = new Command();

program
  .name('agentgate')
  .description('Scan, lock, and gate your MCP servers — npm audit + lockfile + CI drift gate for the MCP era')
  .version(CLI_VERSION)
  .option('--debug', 'print diagnostic details to stderr')
  .hook('preAction', (thisCommand) => {
    setDebug(Boolean(thisCommand.opts().debug));
  });

const configOption = new Option('-c, --config <file>', 'explicit MCP client config file (skips auto-discovery)');
const serverOption = new Option('-s, --server <names...>', 'restrict to specific server names');
const timeoutOption = new Option('-t, --timeout <ms>', 'per-server connect timeout for live operations').default('15000');

program
  .command('scan')
  .description('Scan MCP servers: static config/repo analysis, plus live tool-surface analysis with --live')
  .argument('[target]', 'directory (repo scan + project configs) or config file; default: auto-discover client configs')
  .option('--live', 'connect to stdio servers and analyze their live tool surface')
  .option('-y, --yes', 'with --live, start the configured stdio servers without asking for confirmation')
  .addOption(configOption)
  .addOption(serverOption)
  .addOption(new Option('-f, --format <format>', 'output format').choices(['table', 'json', 'sarif']).default('table'))
  .option('-o, --output <file>', 'write the report to a file instead of stdout')
  .addOption(new Option('--fail-on <severity>', 'exit non-zero when findings reach this severity').choices([...SEVERITIES]))
  .option('--ignore <globs...>', 'glob patterns (relative to the scan root) to exclude from repo scans')
  .addOption(timeoutOption)
  .action(async (target, opts) => {
    process.exitCode = await runScan(target, opts);
  });

program
  .command('lock')
  .description('Connect to configured MCP servers and pin their tool surface into agentgate.lock')
  .addOption(configOption)
  .addOption(serverOption)
  .option('-o, --out <file>', 'lockfile path', 'agentgate.lock')
  .addOption(timeoutOption)
  .action(async (opts) => {
    process.exitCode = await runLock(opts);
  });

program
  .command('diff')
  .description('Compare the current tool surface against agentgate.lock; exit 1 on drift')
  .addOption(configOption)
  .addOption(serverOption)
  .option('-l, --lockfile <file>', 'lockfile path', 'agentgate.lock')
  .option('--json', 'output the drift report as JSON')
  .addOption(timeoutOption)
  .action(async (opts) => {
    process.exitCode = await runDiff(opts);
  });

program
  .command('ci')
  .description('CI gate: fail on tool-surface drift or on static findings at/above --fail-on severity')
  .addOption(configOption)
  .addOption(serverOption)
  .option('-l, --lockfile <file>', 'lockfile path', 'agentgate.lock')
  .addOption(new Option('--fail-on <severity>', 'severity gate for static findings').choices([...SEVERITIES]).default('high'))
  .addOption(timeoutOption)
  .action(async (opts) => {
    process.exitCode = await runCi(opts);
  });

program
  .command('deps')
  .description('Detect hallucinated (slopsquatted) and typosquatted dependencies across npm and PyPI')
  .argument('[target]', 'project directory to scan; default: current directory')
  .addOption(new Option('-f, --format <format>', 'output format').choices(['table', 'json', 'sarif']).default('table'))
  .option('-o, --output <file>', 'write the report to a file instead of stdout')
  .addOption(new Option('--fail-on <severity>', 'exit non-zero when findings reach this severity').choices([...SEVERITIES]))
  .option('--ignore <globs...>', 'glob patterns (relative to the scan root) to exclude')
  .option('--offline', 'skip registry lookups; only run name-shape (typosquat) checks')
  .option('--no-imports', 'skip source import extraction; check manifests only')
  .addOption(new Option('-t, --timeout <ms>', 'per-request registry timeout').default('10000'))
  .addOption(new Option('--concurrency <n>', 'max concurrent registry lookups').default('8'))
  .action(async (target, opts) => {
    process.exitCode = await runDeps(target, opts);
  });

const configCmd = program.command('config').description('MCP client configuration utilities');
configCmd
  .command('convert')
  .description('Convert MCP server configuration between client formats')
  .addOption(new Option('--from <client>', 'source client format').choices(clientChoices()).makeOptionMandatory())
  .addOption(new Option('--to <client>', 'target client format').choices(clientChoices()).makeOptionMandatory())
  .option('--in <file>', "input file (default: the source client's config at its default location, or stdin when piped)")
  .option('--out <file>', 'output file (default: stdout)')
  .addHelpText('after', `\nClients:\n${describeClients()}`)
  .action((opts) => {
    process.exitCode = runConfigConvert(opts);
  });

program.parseAsync().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 2;
});
