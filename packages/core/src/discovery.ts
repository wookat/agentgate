import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import YAML from 'yaml';
import { McpServerConfig } from './types.js';

export interface ClientConfigLocation {
  client: string;
  path: string;
  format:
    | 'mcpServers-json'
    | 'vscode-mcp-json'
    | 'codex-toml'
    | 'opencode-json'
    | 'zed-settings-json'
    | 'continue-yaml'
    | 'amp-settings-json'
    | 'skill-mcp-json'
    | 'skill-frontmatter-yaml'
    | 'agent-frontmatter-yaml'
    | 'copilot-mcp-json'
    | 'marketplace-json'
    | 'goose-yaml'
    | 'goose-recipe-yaml'
    | 'crush-json';
}

/**
 * Well-known MCP client config locations, relative to a home directory.
 * Covers Claude (Desktop + Code), Cursor, VS Code, Codex, OpenCode,
 * Windsurf, Cline, Gemini CLI, Kiro, Roo Code, Kilo Code, Zed, Continue.dev, Amp,
 * Warp, LM Studio, Qoder, and Amazon Q Developer (plus the generic
 * `.agents/.mcp.json` convention); project-level discovery also covers
 * Trae (`.trae/mcp.json`), Qoder (`.qoder/settings.json`,
 * `.qoder/settings.local.json`), and Amazon Q (`.amazonq/mcp.json`,
 * `.amazonq/default.json`).
 */
export function knownConfigLocations(homeDir = os.homedir(), platform = process.platform): ClientConfigLocation[] {
  const locations: ClientConfigLocation[] = [];
  const push = (client: string, p: string, format: ClientConfigLocation['format'] = 'mcpServers-json') =>
    locations.push({ client, path: p, format });

  // Claude Desktop
  if (platform === 'darwin') {
    push('claude-desktop', path.join(homeDir, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json'));
  } else if (platform === 'win32') {
    const appData = process.env.APPDATA ?? path.join(homeDir, 'AppData', 'Roaming');
    push('claude-desktop', path.join(appData, 'Claude', 'claude_desktop_config.json'));
  } else {
    push('claude-desktop', path.join(homeDir, '.config', 'Claude', 'claude_desktop_config.json'));
  }
  // Claude Code
  push('claude-code', path.join(homeDir, '.claude.json'));
  // Cursor
  push('cursor', path.join(homeDir, '.cursor', 'mcp.json'));
  // VS Code (user-level MCP config)
  if (platform === 'darwin') {
    push('vscode', path.join(homeDir, 'Library', 'Application Support', 'Code', 'User', 'mcp.json'), 'vscode-mcp-json');
  } else if (platform === 'win32') {
    const appData = process.env.APPDATA ?? path.join(homeDir, 'AppData', 'Roaming');
    push('vscode', path.join(appData, 'Code', 'User', 'mcp.json'), 'vscode-mcp-json');
  } else {
    push('vscode', path.join(homeDir, '.config', 'Code', 'User', 'mcp.json'), 'vscode-mcp-json');
  }
  // Codex CLI
  push('codex', path.join(homeDir, '.codex', 'config.toml'), 'codex-toml');
  // OpenCode
  push('opencode', path.join(homeDir, '.config', 'opencode', 'opencode.json'), 'opencode-json');
  // Windsurf (Cascade) — global config only
  push('windsurf', path.join(homeDir, '.codeium', 'windsurf', 'mcp_config.json'));
  push('windsurf', path.join(homeDir, '.codeium', 'mcp_config.json'));
  // Cline (VS Code extension, own settings file under globalStorage)
  const clineRel = path.join('globalStorage', 'saoudrizwan.claude-dev', 'settings', 'cline_mcp_settings.json');
  if (platform === 'darwin') {
    push('cline', path.join(homeDir, 'Library', 'Application Support', 'Code', 'User', clineRel));
  } else if (platform === 'win32') {
    const appData = process.env.APPDATA ?? path.join(homeDir, 'AppData', 'Roaming');
    push('cline', path.join(appData, 'Code', 'User', clineRel));
  } else {
    push('cline', path.join(homeDir, '.config', 'Code', 'User', clineRel));
  }
  // Gemini CLI — mcpServers key inside settings.json
  push('gemini-cli', path.join(homeDir, '.gemini', 'settings.json'));
  // Qwen Code — Gemini CLI fork, mcpServers key inside settings.json
  push('qwen-code', path.join(homeDir, '.qwen', 'settings.json'));
  // Gemini CLI extensions — each installed extension's manifest carries an optional mcpServers map
  locations.push(...geminiExtensionLocations(path.join(homeDir, '.gemini', 'extensions')));
  // Qwen Code extensions — same layout under ~/.qwen/extensions
  locations.push(...qwenExtensionLocations(path.join(homeDir, '.qwen', 'extensions')));
  // Kiro — user-level mcp.json, standard mcpServers format
  push('kiro', path.join(homeDir, '.kiro', 'settings', 'mcp.json'));
  // Roo Code (VS Code extension, own settings file under globalStorage)
  const rooRel = path.join('globalStorage', 'rooveterinaryinc.roo-cline', 'settings', 'mcp_settings.json');
  if (platform === 'darwin') {
    push('roo-code', path.join(homeDir, 'Library', 'Application Support', 'Code', 'User', rooRel));
  } else if (platform === 'win32') {
    const appData = process.env.APPDATA ?? path.join(homeDir, 'AppData', 'Roaming');
    push('roo-code', path.join(appData, 'Code', 'User', rooRel));
  } else {
    push('roo-code', path.join(homeDir, '.config', 'Code', 'User', rooRel));
  }
  // Kilo Code (VS Code extension, own settings file under globalStorage)
  const kiloRel = path.join('globalStorage', 'kilocode.kilo-code', 'settings', 'mcp_settings.json');
  if (platform === 'darwin') {
    push('kilocode', path.join(homeDir, 'Library', 'Application Support', 'Code', 'User', kiloRel));
  } else if (platform === 'win32') {
    const appData = process.env.APPDATA ?? path.join(homeDir, 'AppData', 'Roaming');
    push('kilocode', path.join(appData, 'Code', 'User', kiloRel));
  } else {
    push('kilocode', path.join(homeDir, '.config', 'Code', 'User', kiloRel));
  }
  // Continue.dev — mcpServers list inside config.yaml
  push('continue', path.join(homeDir, '.continue', 'config.yaml'), 'continue-yaml');
  // Amp (Sourcegraph) — `amp.mcpServers` key inside user settings
  push('amp', path.join(homeDir, '.config', 'amp', 'settings.json'), 'amp-settings-json');
  // Warp — file-based MCP servers, standard `mcpServers` map
  push('warp', path.join(homeDir, '.warp', '.mcp.json'));
  // LM Studio — Cursor-style mcp.json; the documented path is ~/.lmstudio,
  // but current builds write ~/.cache/lm-studio on macOS and Windows too
  push('lmstudio', path.join(homeDir, '.lmstudio', 'mcp.json'));
  push('lmstudio', path.join(homeDir, '.cache', 'lm-studio', 'mcp.json'));
  // Qoder — user-level settings.json with an `mcpServers` map
  push('qoder', path.join(homeDir, '.qoder', 'settings.json'));
  // Amazon Q Developer — global mcp.json plus the IDE agent default.json
  // (both carry a top-level `mcpServers` map)
  push('amazonq', path.join(homeDir, '.aws', 'amazonq', 'mcp.json'));
  push('amazonq', path.join(homeDir, '.aws', 'amazonq', 'default.json'));
  // Amazon Q CLI named custom agents (global) — per-agent JSON with `mcpServers`
  locations.push(...amazonqAgentLocations(path.join(homeDir, '.aws', 'amazonq', 'cli-agents')));
  // GitHub Copilot CLI — `copilot mcp add` / `/mcp add` write the user config here
  push('copilot-cli', path.join(homeDir, '.copilot', 'mcp-config.json'));
  // JetBrains Junie — global MCP config shared by the IDE plugin and Junie CLI
  push('junie', path.join(homeDir, '.junie', 'mcp', 'mcp.json'));
  // Factory Droid — user-level MCP servers (`droid mcp add` / registry writes here)
  push('factory', path.join(homeDir, '.factory', 'mcp.json'));
  // Goose (Block) — stdio/remote MCP extensions inside the user config.yaml
  if (platform === 'win32') {
    const appData = process.env.APPDATA ?? path.join(homeDir, 'AppData', 'Roaming');
    push('goose', path.join(appData, 'Block', 'goose', 'config', 'config.yaml'), 'goose-yaml');
  } else {
    push('goose', path.join(homeDir, '.config', 'goose', 'config.yaml'), 'goose-yaml');
  }
  // Crush (Charm) — legacy JSON config with an `mcp` server map (crushrc is the
  // Bash-based successor and is not parsed here); ~/.config/crush on every OS
  push('crush', path.join(homeDir, '.config', 'crush', 'crush.json'), 'crush-json');
  // Generic "other agents" convention (read by Warp and others)
  push('agents', path.join(homeDir, '.agents', '.mcp.json'));
  // Google Antigravity — global MCP config shared by Antigravity 2.0/IDE/CLI
  push('antigravity', path.join(homeDir, '.gemini', 'config', 'mcp_config.json'));
  locations.push(...skillServerLocations(path.join(homeDir, '.config', 'amp', 'skills'), 'amp-skill'));
  // Zed — context_servers key inside settings.json (JSONC)
  if (platform === 'win32') {
    const appData = process.env.APPDATA ?? path.join(homeDir, 'AppData', 'Roaming');
    push('zed', path.join(appData, 'Zed', 'settings.json'), 'zed-settings-json');
  } else {
    push('zed', path.join(homeDir, '.config', 'zed', 'settings.json'), 'zed-settings-json');
  }

  return locations;
}

/** Project-level config locations relative to a project directory. */
export function projectConfigLocations(projectDir: string): ClientConfigLocation[] {
  return [
    { client: 'cursor', path: path.join(projectDir, '.cursor', 'mcp.json'), format: 'mcpServers-json' },
    { client: 'vscode', path: path.join(projectDir, '.vscode', 'mcp.json'), format: 'vscode-mcp-json' },
    { client: 'claude-code', path: path.join(projectDir, '.mcp.json'), format: 'mcpServers-json' },
    { client: 'opencode', path: path.join(projectDir, 'opencode.json'), format: 'opencode-json' },
    { client: 'gemini-cli', path: path.join(projectDir, '.gemini', 'settings.json'), format: 'mcpServers-json' },
    { client: 'gemini-extension', path: path.join(projectDir, 'gemini-extension.json'), format: 'mcpServers-json' },
    { client: 'qwen-code', path: path.join(projectDir, '.qwen', 'settings.json'), format: 'mcpServers-json' },
    { client: 'qwen-extension', path: path.join(projectDir, 'qwen-extension.json'), format: 'mcpServers-json' },
    { client: 'kiro', path: path.join(projectDir, '.kiro', 'settings', 'mcp.json'), format: 'mcpServers-json' },
    { client: 'roo-code', path: path.join(projectDir, '.roo', 'mcp.json'), format: 'mcpServers-json' },
    // Kilo Code — project MCP config in `.kilocode/mcp.json` plus the newer `.kilo/mcp.json` (higher precedence)
    { client: 'kilocode', path: path.join(projectDir, '.kilocode', 'mcp.json'), format: 'mcpServers-json' },
    { client: 'kilocode', path: path.join(projectDir, '.kilo', 'mcp.json'), format: 'mcpServers-json' },
    // Kilo CLI (OpenCode fork) — project `kilo.json(c)` uses the OpenCode config schema (`mcp` block)
    { client: 'kilocode', path: path.join(projectDir, 'kilo.json'), format: 'opencode-json' },
    { client: 'kilocode', path: path.join(projectDir, 'kilo.jsonc'), format: 'opencode-json' },
    { client: 'amp', path: path.join(projectDir, '.amp', 'settings.json'), format: 'amp-settings-json' },
    { client: 'warp', path: path.join(projectDir, '.warp', '.mcp.json'), format: 'mcpServers-json' },
    { client: 'trae', path: path.join(projectDir, '.trae', 'mcp.json'), format: 'mcpServers-json' },
    { client: 'junie', path: path.join(projectDir, '.junie', 'mcp', 'mcp.json'), format: 'mcpServers-json' },
    { client: 'factory', path: path.join(projectDir, '.factory', 'mcp.json'), format: 'mcpServers-json' },
    { client: 'qoder', path: path.join(projectDir, '.qoder', 'settings.json'), format: 'mcpServers-json' },
    { client: 'qoder', path: path.join(projectDir, '.qoder', 'settings.local.json'), format: 'mcpServers-json' },
    { client: 'amazonq', path: path.join(projectDir, '.amazonq', 'mcp.json'), format: 'mcpServers-json' },
    { client: 'amazonq', path: path.join(projectDir, '.amazonq', 'default.json'), format: 'mcpServers-json' },
    ...amazonqAgentLocations(path.join(projectDir, '.amazonq', 'cli-agents')),
    { client: 'agents', path: path.join(projectDir, '.agents', '.mcp.json'), format: 'mcpServers-json' },
    // Google Antigravity — workspace MCP config (`.agents/mcp_config.json`; remote servers use `serverUrl`)
    { client: 'antigravity', path: path.join(projectDir, '.agents', 'mcp_config.json'), format: 'mcpServers-json' },
    { client: 'unknown', path: path.join(projectDir, 'mcp.json'), format: 'mcpServers-json' },
    ...continueWorkspaceLocations(projectDir),
    { client: 'crush', path: path.join(projectDir, '.crush.json'), format: 'crush-json' },
    { client: 'crush', path: path.join(projectDir, 'crush.json'), format: 'crush-json' },
    // Goose recipes generated into the project root (`goose recipe` / Desktop export);
    // their `extensions` list starts for everyone who runs the recipe
    ...gooseRecipeLocations(projectDir),
    { client: 'copilot-cli', path: path.join(projectDir, '.github', 'mcp.json'), format: 'copilot-mcp-json' },
    ...copilotAgentServerLocations(path.join(projectDir, '.github', 'agents')),
    ...skillServerLocations(path.join(projectDir, '.agents', 'skills'), 'skill'),
    ...skillServerLocations(path.join(projectDir, '.claude', 'skills'), 'skill'),
    ...pluginServerLocations(projectDir),
  ];
}

/**
 * Goose recipe files (`recipe.yaml`/`recipe.json`) at the project root or nested in a
 * recipe-library layout (`<dir>/recipe.yaml`, any depth): running a recipe starts its
 * `extensions` for everyone, so each recipe file — and every subrecipe referenced from
 * its `sub_recipes[].path` — gets extension discovery. The generic-filename false-positive
 * risk is handled by `parseGooseRecipeYaml`'s recipe-shape gate. Subrecipe paths resolve
 * relative to the recipe's directory (goose's own resolution); references outside the
 * project are skipped. Subrecipes cannot nest further sub_recipes (documented), so no
 * recursion beyond one hop.
 */
function gooseRecipeLocations(projectDir: string): ClientConfigLocation[] {
  const out: ClientConfigLocation[] = [];
  const seen = new Set<string>();
  const add = (p: string) => {
    if (!seen.has(p)) {
      seen.add(p);
      out.push({ client: 'goose', path: p, format: 'goose-recipe-yaml' });
    }
  };
  const projectRoot = path.resolve(projectDir);
  const visit = (recipePath: string) => {
    add(recipePath);
    let doc: unknown;
    try {
      doc = YAML.parse(fs.readFileSync(recipePath, 'utf8'));
    } catch {
      return;
    }
    if (typeof doc !== 'object' || doc === null) return;
    const recipe = doc as Record<string, unknown>;
    if (typeof recipe.title !== 'string' || typeof recipe.description !== 'string') return;
    if (typeof recipe.instructions !== 'string' && typeof recipe.prompt !== 'string') return;
    if (!Array.isArray(recipe.sub_recipes)) return;
    for (const subRaw of recipe.sub_recipes) {
      if (typeof subRaw !== 'object' || subRaw === null) continue;
      const ref = (subRaw as Record<string, unknown>).path;
      if (typeof ref !== 'string') continue;
      const resolved = path.resolve(path.dirname(recipePath), ref);
      if (!resolved.startsWith(projectRoot + path.sep)) continue;
      if (seen.has(resolved) || !fs.existsSync(resolved)) continue;
      add(resolved);
    }
  };
  const walk = (dir: string, depth: number) => {
    for (const name of ['recipe.yaml', 'recipe.json']) {
      const p = path.join(dir, name);
      if (depth === 0 || fs.existsSync(p)) visit(p);
    }
    if (depth >= 4) return;
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries.filter((e) => e.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
      if (PLUGIN_SEARCH_SKIP.has(entry.name) || entry.name.startsWith('.')) continue;
      walk(path.join(dir, entry.name), depth + 1);
    }
  };
  walk(projectDir, 0);
  return out;
}

/** Directory names never descended into while looking for plugin roots. */
const PLUGIN_SEARCH_SKIP = new Set(['node_modules', '.git', 'dist', 'build', 'coverage', '.venv', 'venv', '__pycache__', '.next']);

/** Plugin metadata dirs marking a plugin/marketplace root (Claude Code, Copilot CLI, Factory Droid, and Codex conventions). */
const PLUGIN_META_DIRS = new Set(['.claude-plugin', '.plugin', '.factory-plugin', '.codex-plugin', '.cursor-plugin', '.goose-plugin']);

/**
 * MCP servers bundled by Claude Code / Copilot CLI plugins: a plugin root is any directory
 * carrying `.claude-plugin/plugin.json` (or `.plugin/`, `.github/plugin/`), and its sibling `.mcp.json` starts
 * automatically for everyone who enables the plugin. Nested roots matter for
 * marketplace repos hosting many plugins; the project root's own `.mcp.json`
 * is already covered by the claude-code location.
 */
function pluginServerLocations(projectDir: string, depth = 0): ClientConfigLocation[] {
  if (depth > 4) return [];
  const out: ClientConfigLocation[] = [];
  // The Open Plugin Spec's first lookup is a bare plugin.json at the plugin root (the
  // project root or a marketplace's plugins/<name>/ dir). The filename is too generic to
  // treat as a plugin root outright, so only its own mcpServers declaration is acted on.
  if (depth === 0) {
    const bare = path.join(projectDir, 'plugin.json');
    if (fs.existsSync(bare)) out.push(...pluginManifestServerLocations(projectDir, bare));
  }
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(projectDir, { withFileTypes: true });
  } catch {
    return [];
  }
  for (const entry of entries.filter((e) => e.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
    if (PLUGIN_SEARCH_SKIP.has(entry.name) || (entry.name.startsWith('.') && !PLUGIN_META_DIRS.has(entry.name) && entry.name !== '.github' && entry.name !== '.agents')) continue;
    // Copilot CLI nests its plugin metadata under `.github/plugin/`; Codex keeps its repo marketplace under `.agents/plugins/`.
    const dir = entry.name === '.github' ? path.join(projectDir, entry.name, 'plugin') : entry.name === '.agents' ? path.join(projectDir, entry.name, 'plugins') : path.join(projectDir, entry.name);
    if ((entry.name === '.github' || entry.name === '.agents') && !fs.existsSync(dir)) continue;
    const isPluginMeta = PLUGIN_META_DIRS.has(entry.name) || entry.name === '.github' || entry.name === '.agents';
    if (isPluginMeta && fs.existsSync(path.join(dir, 'marketplace.json'))) {
      // Marketplace entries can define plugins entirely inline (strict: false), including mcpServers.
      out.push({ client: 'claude-plugin', path: path.join(dir, 'marketplace.json'), format: 'marketplace-json' });
      out.push(...marketplaceEntryServerLocations(projectDir, path.join(dir, 'marketplace.json')));
    }
    // Codex also reads an API-curated catalog next to the repo marketplace.
    if (entry.name === '.agents' && fs.existsSync(path.join(dir, 'api_marketplace.json'))) {
      out.push({ client: 'claude-plugin', path: path.join(dir, 'api_marketplace.json'), format: 'marketplace-json' });
      out.push(...marketplaceEntryServerLocations(projectDir, path.join(dir, 'api_marketplace.json')));
    }
    if (isPluginMeta && fs.existsSync(path.join(dir, 'plugin.json'))) {
      if (depth > 0) {
        const mcpJson = path.join(projectDir, '.mcp.json');
        if (fs.existsSync(mcpJson)) out.push({ client: 'claude-plugin', path: mcpJson, format: 'mcpServers-json' });
      }
      if (entry.name === '.factory-plugin') {
        // Factory Droid plugins bundle MCP servers in a bare `mcp.json` at the plugin root.
        const factoryMcp = path.join(projectDir, 'mcp.json');
        if (fs.existsSync(factoryMcp)) out.push({ client: 'factory-plugin', path: factoryMcp, format: 'mcpServers-json' });
      }
      out.push(...pluginManifestServerLocations(projectDir, path.join(dir, 'plugin.json')));
      continue;
    }
    const bare = path.join(dir, 'plugin.json');
    if (fs.existsSync(bare)) {
      const locs = pluginManifestServerLocations(dir, bare);
      if (locs.length > 0) {
        out.push(...locs);
        continue;
      }
    }
    out.push(...pluginServerLocations(dir, depth + 1));
  }
  if (depth > 0) return out;
  const seen = new Set<string>();
  return out.filter((l) => !seen.has(l.path) && seen.add(l.path));
}

/**
 * Marketplace entries with a local `source` act as fallback plugin manifests
 * (Codex): an entry-level `mcpServers` path (or path list) resolves against
 * the entry's source root, and the referenced document holds the server config.
 * Inline entry `mcpServers` objects are handled by the marketplace-json format.
 */
function marketplaceEntryServerLocations(catalogRoot: string, catalogPath: string): ClientConfigLocation[] {
  let doc: { plugins?: unknown };
  try {
    doc = JSON.parse(fs.readFileSync(catalogPath, 'utf8')) as { plugins?: unknown };
  } catch {
    return [];
  }
  if (!Array.isArray(doc.plugins)) return [];
  const out: ClientConfigLocation[] = [];
  for (const entry of doc.plugins) {
    if (typeof entry !== 'object' || entry === null) continue;
    const rawSource = (entry as { source?: unknown }).source;
    const src =
      typeof rawSource === 'string' && !rawSource.includes('://')
        ? rawSource
        : typeof rawSource === 'object' && rawSource !== null && (rawSource as { source?: unknown }).source === 'local' && typeof (rawSource as { path?: unknown }).path === 'string'
          ? ((rawSource as { path: string }).path)
          : null;
    if (src === null || src.startsWith('/') || src.split('/').includes('..')) continue;
    const sourceRoot = path.resolve(catalogRoot, src);
    if (!sourceRoot.startsWith(path.resolve(catalogRoot))) continue;
    const field = (entry as { mcpServers?: unknown }).mcpServers;
    for (const ref of typeof field === 'string' ? [field] : Array.isArray(field) ? field : []) {
      if (typeof ref !== 'string') continue;
      const resolved = path.resolve(sourceRoot, ref);
      if (resolved.startsWith(path.resolve(sourceRoot)) && fs.existsSync(resolved)) {
        out.push({ client: 'claude-plugin', path: resolved, format: 'mcpServers-json' });
      }
    }
  }
  return out;
}

/**
 * A plugin manifest's `mcpServers` field may be inline config (an object),
 * one or more config paths relative to the plugin root, or the Open Plugin
 * Spec's `{ paths: [...], exclusive: bool }` component form (goose): each
 * referenced document holds the server config, and unless `exclusive` the
 * plugin root's `.mcp.json` is read too.
 */
function pluginManifestServerLocations(pluginRoot: string, manifestPath: string): ClientConfigLocation[] {
  let manifest: Record<string, unknown>;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as Record<string, unknown>;
  } catch {
    return [];
  }
  let field = manifest?.mcpServers;
  let componentPaths = false;
  if (typeof field === 'object' && field !== null && !Array.isArray(field) && Array.isArray((field as Record<string, unknown>).paths)) {
    componentPaths = true;
    field = (field as Record<string, unknown>).paths;
  }
  if (typeof field === 'object' && field !== null && !Array.isArray(field)) {
    return [{ client: 'claude-plugin', path: manifestPath, format: 'mcpServers-json' }];
  }
  const out: ClientConfigLocation[] = [];
  if (componentPaths) {
    const rootMcp = path.join(pluginRoot, '.mcp.json');
    const exclusive = (manifest.mcpServers as Record<string, unknown>).exclusive === true;
    if (!exclusive && fs.existsSync(rootMcp)) out.push({ client: 'claude-plugin', path: rootMcp, format: 'mcpServers-json' });
  }
  for (const ref of typeof field === 'string' ? [field] : Array.isArray(field) ? field : []) {
    if (typeof ref !== 'string') continue;
    const resolved = path.resolve(pluginRoot, ref.replace(/^\$\{(CLAUDE|DROID)_PLUGIN_ROOT\}\/?/, ''));
    if (resolved.startsWith(path.resolve(pluginRoot)) && fs.existsSync(resolved)) {
      out.push({ client: 'claude-plugin', path: resolved, format: 'mcpServers-json' });
    }
  }
  return out;
}

/**
 * MCP servers defined by agent skills: each skill directory may carry a
 * sibling `mcp.json` (bare name → entry map) or an `mcpServers` field in its
 * `SKILL.md` frontmatter. When both exist the frontmatter wins (Amp ignores
 * the sibling `mcp.json` in that case).
 */
function skillServerLocations(skillsRoot: string, client: string): ClientConfigLocation[] {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(skillsRoot, { withFileTypes: true });
  } catch {
    return [];
  }
  const out: ClientConfigLocation[] = [];
  for (const entry of entries.filter((e) => e.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
    const dir = path.join(skillsRoot, entry.name);
    const skillMd = path.join(dir, 'SKILL.md');
    const mcpJson = path.join(dir, 'mcp.json');
    if (fs.existsSync(skillMd) && frontmatterHasMcpServers(skillMd)) {
      out.push({ client, path: skillMd, format: 'skill-frontmatter-yaml' });
    } else if (fs.existsSync(mcpJson)) {
      out.push({ client, path: mcpJson, format: 'skill-mcp-json' });
    }
  }
  return out;
}

/**
 * Copilot custom agents (`.github/agents/*.md`): agent profiles can carry an
 * `mcp-servers` frontmatter map — those servers start for anyone who runs the
 * agent (Copilot CLI / cloud agent), so they get the full config rule set.
 */
function copilotAgentServerLocations(agentsDir: string): ClientConfigLocation[] {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(agentsDir, { withFileTypes: true });
  } catch {
    return [];
  }
  return entries
    .filter((e) => e.isFile() && /\.md$/i.test(e.name))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((e) => path.join(agentsDir, e.name))
    .filter((p) => {
      try {
        const fm = extractFrontmatter(fs.readFileSync(p, 'utf8'));
        return typeof fm?.['mcp-servers'] === 'object' && fm['mcp-servers'] !== null;
      } catch {
        return false;
      }
    })
    .map((p) => ({ client: 'copilot-agent', path: p, format: 'agent-frontmatter-yaml' as const }));
}

function frontmatterHasMcpServers(skillMdPath: string): boolean {
  try {
    const fm = extractFrontmatter(fs.readFileSync(skillMdPath, 'utf8'));
    return typeof fm?.mcpServers === 'object' && fm.mcpServers !== null;
  } catch {
    return false;
  }
}

function extractFrontmatter(raw: string): Record<string, unknown> | undefined {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---(\r?\n|$)/);
  if (!m) return undefined;
  const doc = YAML.parse(m[1]!) as unknown;
  return typeof doc === 'object' && doc !== null ? (doc as Record<string, unknown>) : undefined;
}

/** Amazon Q CLI named custom agents: every `cli-agents/*.json` agent file (top-level `mcpServers` map). */
function amazonqAgentLocations(agentsDir: string): ClientConfigLocation[] {
  let entries: string[];
  try {
    entries = fs.readdirSync(agentsDir);
  } catch {
    return [];
  }
  return entries
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((f) => ({ client: 'amazonq', path: path.join(agentsDir, f), format: 'mcpServers-json' as const }));
}

/**
 * Gemini CLI extensions: every `<extensionsDir>/<name>/gemini-extension.json`
 * manifest — its `mcpServers` map starts automatically for anyone with the
 * extension installed.
 */
function geminiExtensionLocations(extensionsDir: string): ClientConfigLocation[] {
  return installedExtensionLocations(extensionsDir, 'gemini-extension', 'gemini-extension.json');
}

/**
 * Qwen Code extensions mirror Gemini CLI extensions: every
 * `<extensionsDir>/<name>/qwen-extension.json` manifest — its `mcpServers`
 * map starts automatically for anyone with the extension installed.
 */
function qwenExtensionLocations(extensionsDir: string): ClientConfigLocation[] {
  return installedExtensionLocations(extensionsDir, 'qwen-extension', 'qwen-extension.json');
}

function installedExtensionLocations(extensionsDir: string, client: string, manifest: string): ClientConfigLocation[] {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(extensionsDir, { withFileTypes: true });
  } catch {
    return [];
  }
  return entries
    .filter((e) => e.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((e) => ({ client, path: path.join(extensionsDir, e.name, manifest), format: 'mcpServers-json' as const }));
}

/** Continue.dev workspace MCP blocks: every `.continue/mcpServers/*.yaml` file. */
function continueWorkspaceLocations(projectDir: string): ClientConfigLocation[] {
  const dir = path.join(projectDir, '.continue', 'mcpServers');
  let entries: string[];
  try {
    entries = fs.readdirSync(dir);
  } catch {
    return [];
  }
  return entries
    .filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'))
    .sort()
    .map((f) => ({ client: 'continue', path: path.join(dir, f), format: 'continue-yaml' as const }));
}

/**
 * Discover existing config files among the known locations. The same file can be
 * reachable through several conventions (a project-root `.mcp.json` is both the
 * claude-code location and a plugin manifest's path ref); only the first hit is
 * kept so its servers are not scanned and reported twice.
 */
export function discoverConfigFiles(opts: { homeDir?: string; projectDir?: string; platform?: NodeJS.Platform } = {}): ClientConfigLocation[] {
  const candidates = [
    ...knownConfigLocations(opts.homeDir, opts.platform),
    ...(opts.projectDir ? projectConfigLocations(opts.projectDir) : []),
  ];
  const seen = new Set<string>();
  return candidates.filter((c) => fs.existsSync(c.path) && !seen.has(c.path) && seen.add(c.path));
}

/** Parse a client config file into normalized MCP server entries. */
export function parseConfigFile(location: ClientConfigLocation): McpServerConfig[] {
  const raw = fs.readFileSync(location.path, 'utf8');
  switch (location.format) {
    case 'codex-toml':
      return parseCodexToml(raw, location);
    case 'vscode-mcp-json':
      return parseVsCodeJson(raw, location);
    case 'opencode-json':
      return parseOpenCodeJson(raw, location);
    case 'zed-settings-json':
      return parseZedSettingsJson(raw, location);
    case 'continue-yaml':
      return parseContinueYaml(raw, location);
    case 'amp-settings-json':
      return parseAmpSettingsJson(raw, location);
    case 'skill-mcp-json':
      return parseSkillMcpJson(raw, location);
    case 'marketplace-json':
      return parseMarketplaceJson(raw, location);
    case 'skill-frontmatter-yaml':
      return parseSkillFrontmatter(raw, location);
    case 'agent-frontmatter-yaml':
      return parseAgentFrontmatter(raw, location);
    case 'copilot-mcp-json':
      return parseCopilotMcpJson(raw, location);
    case 'goose-yaml':
      return parseGooseYaml(raw, location);
    case 'goose-recipe-yaml':
      return parseGooseRecipeYaml(raw, location);
    case 'crush-json':
      return parseCrushJson(raw, location);
    default:
      return parseMcpServersJson(raw, location);
  }
}

function toStringRecord(value: unknown): Record<string, string> | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return undefined;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(value)) out[k] = String(v);
  return out;
}

function normalizeEntry(name: string, entry: Record<string, unknown>, location: ClientConfigLocation): McpServerConfig {
  return {
    name,
    command: typeof entry.command === 'string' ? entry.command : undefined,
    args: Array.isArray(entry.args) ? entry.args.map(String) : undefined,
    env: toStringRecord(entry.env),
    url: typeof entry.url === 'string' ? entry.url : typeof entry.serverUrl === 'string' ? entry.serverUrl : undefined,
    headers: toStringRecord(entry.headers),
    includeTools: Array.isArray(entry.includeTools) ? entry.includeTools.map(String) : undefined,
    transport: typeof entry.type === 'string' ? entry.type : typeof entry.transport === 'string' ? entry.transport : undefined,
    source: location.path,
    client: location.client,
  };
}

function collectServers(map: unknown, location: ClientConfigLocation): McpServerConfig[] {
  if (typeof map !== 'object' || map === null) return [];
  const out: McpServerConfig[] = [];
  for (const [name, entry] of Object.entries(map)) {
    if (typeof entry === 'object' && entry !== null) {
      out.push(normalizeEntry(name, entry as Record<string, unknown>, location));
    }
  }
  return out;
}

/** Claude Desktop / Cursor / generic `{ "mcpServers": { ... } }` format. Also handles Claude Code `~/.claude.json` (top-level + per-project). */
export function parseMcpServersJson(raw: string, location: ClientConfigLocation): McpServerConfig[] {
  const json = JSON.parse(raw) as Record<string, unknown>;
  const out = collectServers(json.mcpServers, location);
  // Claude Code stores per-project servers under `projects.<path>.mcpServers`
  if (typeof json.projects === 'object' && json.projects !== null) {
    for (const project of Object.values(json.projects as Record<string, unknown>)) {
      if (typeof project === 'object' && project !== null) {
        out.push(...collectServers((project as Record<string, unknown>).mcpServers, location));
      }
    }
  }
  return out;
}

/** Copilot CLI project MCP config (`.github/mcp.json`): an `mcpServers` wrapper or a bare top-level server map. */
export function parseCopilotMcpJson(raw: string, location: ClientConfigLocation): McpServerConfig[] {
  const json = JSON.parse(raw) as Record<string, unknown>;
  if (typeof json.mcpServers === 'object' && json.mcpServers !== null) return collectServers(json.mcpServers, location);
  const bare: Record<string, unknown> = {};
  for (const [name, entry] of Object.entries(json)) {
    if (typeof entry === 'object' && entry !== null && !Array.isArray(entry) && ('command' in entry || 'url' in entry || 'type' in entry)) {
      bare[name] = entry;
    }
  }
  return collectServers(bare, location);
}

/** VS Code `mcp.json`: `{ "servers": { ... } }` (also accepts `mcpServers`). */
export function parseVsCodeJson(raw: string, location: ClientConfigLocation): McpServerConfig[] {
  const json = JSON.parse(raw) as Record<string, unknown>;
  return [...collectServers(json.servers, location), ...collectServers(json.mcpServers, location)];
}

/** OpenCode `opencode.json` (and Kilo CLI `kilo.json(c)`, same schema, JSONC allowed): `{ "mcp": { name: { type, command: [...], environment, url, headers } } }`. */
export function parseOpenCodeJson(raw: string, location: ClientConfigLocation): McpServerConfig[] {
  const json = JSON.parse(stripJsonComments(raw)) as Record<string, unknown>;
  const map = json.mcp;
  if (typeof map !== 'object' || map === null) return [];
  const out: McpServerConfig[] = [];
  for (const [name, entryRaw] of Object.entries(map)) {
    if (typeof entryRaw !== 'object' || entryRaw === null) continue;
    const entry = entryRaw as Record<string, unknown>;
    const cmd = Array.isArray(entry.command) ? entry.command.map(String) : undefined;
    out.push({
      name,
      command: cmd?.[0],
      args: cmd?.slice(1),
      env: toStringRecord(entry.environment) ?? toStringRecord(entry.env),
      url: typeof entry.url === 'string' ? entry.url : undefined,
      headers: toStringRecord(entry.headers),
      transport: typeof entry.type === 'string' ? entry.type : undefined,
      source: location.path,
      client: location.client,
    });
  }
  return out;
}

/** Continue.dev `config.yaml` / `.continue/mcpServers/*.yaml`: `mcpServers` is a list of `{ name, command, args, env, url, type }`. */
export function parseContinueYaml(raw: string, location: ClientConfigLocation): McpServerConfig[] {
  const doc = YAML.parse(raw) as Record<string, unknown> | null;
  if (typeof doc !== 'object' || doc === null || !Array.isArray(doc.mcpServers)) return [];
  const out: McpServerConfig[] = [];
  for (const entryRaw of doc.mcpServers) {
    if (typeof entryRaw !== 'object' || entryRaw === null) continue;
    const entry = entryRaw as Record<string, unknown>;
    const name = typeof entry.name === 'string' ? entry.name : undefined;
    if (!name) continue;
    out.push(normalizeEntry(name, entry, location));
  }
  return out;
}

/**
 * Goose `config.yaml`: `extensions` is a map of `{ type, cmd, args, envs, uri, headers, enabled }`.
 * Only `stdio` and remote (`streamable_http`/`sse`) extensions are MCP servers;
 * `builtin`/`platform`/`frontend`/`inline_python` types are goose-internal and skipped.
 */
export function parseGooseYaml(raw: string, location: ClientConfigLocation): McpServerConfig[] {
  const doc = YAML.parse(raw) as Record<string, unknown> | null;
  if (typeof doc !== 'object' || doc === null || typeof doc.extensions !== 'object' || doc.extensions === null) return [];
  const out: McpServerConfig[] = [];
  for (const [name, entryRaw] of Object.entries(doc.extensions)) {
    if (typeof entryRaw !== 'object' || entryRaw === null) continue;
    const entry = entryRaw as Record<string, unknown>;
    const type = typeof entry.type === 'string' ? entry.type : undefined;
    if (type !== 'stdio' && type !== 'streamable_http' && type !== 'sse') continue;
    out.push({
      name,
      command: typeof entry.cmd === 'string' ? entry.cmd : undefined,
      args: Array.isArray(entry.args) ? entry.args.map(String) : undefined,
      env: toStringRecord(entry.envs) ?? toStringRecord(entry.env),
      url: typeof entry.uri === 'string' ? entry.uri : undefined,
      headers: toStringRecord(entry.headers),
      transport: type,
      source: location.path,
      client: location.client,
    });
  }
  return out;
}

/**
 * Goose recipe (`recipe.yaml`/`recipe.json`, YAML parses both): `extensions` is an
 * array of the same `{ type, name, cmd, args, envs, uri, headers }` entries as
 * config.yaml, started automatically for everyone who runs the recipe. Gated on
 * the documented recipe shape (title + description + instructions|prompt) since
 * the filename alone is generic.
 */
export function parseGooseRecipeYaml(raw: string, location: ClientConfigLocation): McpServerConfig[] {
  const doc = YAML.parse(raw) as Record<string, unknown> | null;
  if (typeof doc !== 'object' || doc === null) return [];
  if (typeof doc.title !== 'string' || typeof doc.description !== 'string') return [];
  if (typeof doc.instructions !== 'string' && typeof doc.prompt !== 'string') return [];
  if (!Array.isArray(doc.extensions)) return [];
  const out: McpServerConfig[] = [];
  for (const entryRaw of doc.extensions) {
    if (typeof entryRaw !== 'object' || entryRaw === null) continue;
    const entry = entryRaw as Record<string, unknown>;
    const type = typeof entry.type === 'string' ? entry.type : undefined;
    if (type !== 'stdio' && type !== 'streamable_http' && type !== 'sse') continue;
    if (typeof entry.name !== 'string') continue;
    out.push({
      name: entry.name,
      command: typeof entry.cmd === 'string' ? entry.cmd : undefined,
      args: Array.isArray(entry.args) ? entry.args.map(String) : undefined,
      env: toStringRecord(entry.envs) ?? toStringRecord(entry.env),
      url: typeof entry.uri === 'string' ? entry.uri : undefined,
      headers: toStringRecord(entry.headers),
      transport: type,
      source: location.path,
      client: location.client,
    });
  }
  return out;
}

/** Amp `settings.json` (user `~/.config/amp/settings.json` or workspace `.amp/settings.json`): `{ "amp.mcpServers": { ... } }` — standard entry shape. */
export function parseAmpSettingsJson(raw: string, location: ClientConfigLocation): McpServerConfig[] {
  const json = JSON.parse(raw) as Record<string, unknown>;
  return collectServers(json['amp.mcpServers'], location);
}

/** Skill sibling `mcp.json`: a bare `{ "<name>": { command|url, ... } }` map. */
export function parseSkillMcpJson(raw: string, location: ClientConfigLocation): McpServerConfig[] {
  return collectServers(JSON.parse(raw), location);
}

/** Marketplace catalog (`.claude-plugin/marketplace.json`): inline `mcpServers` on plugin entries. */
export function parseMarketplaceJson(raw: string, location: ClientConfigLocation): McpServerConfig[] {
  const json = JSON.parse(raw) as { plugins?: unknown };
  if (!Array.isArray(json.plugins)) return [];
  return json.plugins.flatMap((entry) => collectServers((entry as { mcpServers?: unknown })?.mcpServers, location));
}

/** `SKILL.md` frontmatter `mcpServers` map — same entry shape as `mcp.json`. */
export function parseSkillFrontmatter(raw: string, location: ClientConfigLocation): McpServerConfig[] {
  return collectServers(extractFrontmatter(raw)?.mcpServers, location);
}

/** Copilot agent profile frontmatter `mcp-servers` map — YAML form of the repo MCP JSON config (stdio→local type). */
export function parseAgentFrontmatter(raw: string, location: ClientConfigLocation): McpServerConfig[] {
  return collectServers(extractFrontmatter(raw)?.['mcp-servers'], location);
}

/** Zed `settings.json`: `{ "context_servers": { ... } }` — same entry shape as mcpServers, JSONC allowed. */
export function parseZedSettingsJson(raw: string, location: ClientConfigLocation): McpServerConfig[] {
  const json = JSON.parse(stripJsonComments(raw)) as Record<string, unknown>;
  return collectServers(json.context_servers, location);
}

/** Crush (Charm) legacy JSON config (`crush.json` / `.crush.json`, JSONC): `mcp` maps name → { type, command, args, env, url, headers }. */
export function parseCrushJson(raw: string, location: ClientConfigLocation): McpServerConfig[] {
  const json = JSON.parse(stripJsonComments(raw)) as Record<string, unknown>;
  return collectServers(json.mcp, location);
}

/** Remove `//` and `/* *\/` comments plus trailing commas (outside strings) so JSONC settings parse. */
function stripJsonComments(raw: string): string {
  let out = '';
  let inString = false;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i]!;
    if (inString) {
      out += ch;
      if (ch === '\\') {
        out += raw[++i] ?? '';
      } else if (ch === '"') {
        inString = false;
      }
    } else if (ch === '"') {
      inString = true;
      out += ch;
    } else if (ch === '/' && raw[i + 1] === '/') {
      while (i < raw.length && raw[i] !== '\n') i++;
      out += '\n';
    } else if (ch === '/' && raw[i + 1] === '*') {
      i += 2;
      while (i < raw.length && !(raw[i] === '*' && raw[i + 1] === '/')) i++;
      i++;
    } else {
      out += ch;
    }
  }
  return out.replace(/,(\s*[}\]])/g, '$1');
}

/**
 * Codex CLI `config.toml`: `[mcp_servers.<name>]` tables with `command`, `args`, `env`, `url`.
 * Minimal TOML subset parser — enough for the flat key/value + array shapes Codex uses.
 */
export function parseCodexToml(raw: string, location: ClientConfigLocation): McpServerConfig[] {
  const servers = new Map<string, Record<string, unknown>>();
  let current: Record<string, unknown> | undefined;
  let currentEnv: Record<string, string> | undefined;

  for (const lineRaw of raw.split(/\r?\n/)) {
    const line = lineRaw.trim();
    if (line === '' || line.startsWith('#')) continue;
    const tableMatch = line.match(/^\[(.+)\]$/);
    if (tableMatch) {
      const table = tableMatch[1]!.trim();
      const serverMatch = table.match(/^mcp_servers\.(?:"([^"]+)"|([A-Za-z0-9_-]+))(?:\.(env))?$/);
      if (serverMatch) {
        const name = serverMatch[1] ?? serverMatch[2]!;
        if (!servers.has(name)) servers.set(name, {});
        current = servers.get(name)!;
        if (serverMatch[3] === 'env') {
          currentEnv = (current.env as Record<string, string> | undefined) ?? {};
          current.env = currentEnv;
        } else {
          currentEnv = undefined;
        }
      } else {
        current = undefined;
        currentEnv = undefined;
      }
      continue;
    }
    if (!current) continue;
    const kv = line.match(/^([A-Za-z0-9_-]+)\s*=\s*(.+)$/);
    if (!kv) continue;
    const key = kv[1]!;
    const value = parseTomlValue(kv[2]!);
    if (currentEnv) {
      currentEnv[key] = String(value);
    } else if (key === 'env' && typeof value === 'object' && value !== null) {
      current.env = value;
    } else {
      current[key] = value;
    }
  }

  const out: McpServerConfig[] = [];
  for (const [name, entry] of servers) {
    out.push(normalizeEntry(name, entry, location));
  }
  return out;
}

function parseTomlValue(raw: string): unknown {
  const s = raw.trim();
  if (s.startsWith('[')) {
    const inner = s.replace(/^\[/, '').replace(/\]\s*(#.*)?$/, '');
    return inner
      .split(',')
      .map((p) => p.trim())
      .filter((p) => p !== '')
      .map((p) => parseTomlValue(p));
  }
  if (s.startsWith('{')) {
    const inner = s.replace(/^\{/, '').replace(/\}\s*(#.*)?$/, '');
    const out: Record<string, string> = {};
    for (const pair of inner.split(',')) {
      const m = pair.match(/^\s*([A-Za-z0-9_-]+)\s*=\s*(.+?)\s*$/);
      if (m) out[m[1]!] = String(parseTomlValue(m[2]!));
    }
    return out;
  }
  if (s.startsWith('"') || s.startsWith("'")) {
    return s.slice(1, -1);
  }
  const noComment = s.replace(/\s+#.*$/, '');
  if (noComment === 'true') return true;
  if (noComment === 'false') return false;
  const num = Number(noComment);
  return Number.isNaN(num) ? noComment : num;
}

/** Discover and parse all MCP server entries visible to known clients. */
export function discoverServers(opts: { homeDir?: string; projectDir?: string; platform?: NodeJS.Platform } = {}): {
  servers: McpServerConfig[];
  files: string[];
  errors: { file: string; error: string }[];
} {
  const files = discoverConfigFiles(opts);
  const servers: McpServerConfig[] = [];
  const errors: { file: string; error: string }[] = [];
  for (const file of files) {
    try {
      servers.push(...parseConfigFile(file));
    } catch (err) {
      errors.push({ file: file.path, error: err instanceof Error ? err.message : String(err) });
    }
  }
  return { servers, files: files.map((f) => f.path), errors };
}
