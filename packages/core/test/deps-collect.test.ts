import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  collectDependencies,
  extractJsImports,
  extractPyImports,
  normalizeName,
  npmPackageFromSpecifier,
  parseRequirementLine,
} from '../src/deps/collect.js';

describe('npmPackageFromSpecifier', () => {
  it('reduces subpaths and keeps scopes', () => {
    expect(npmPackageFromSpecifier('lodash/merge')).toBe('lodash');
    expect(npmPackageFromSpecifier('@scope/pkg/deep/path')).toBe('@scope/pkg');
  });
  it('rejects relative, absolute, protocol, and builtin specifiers', () => {
    expect(npmPackageFromSpecifier('./local')).toBeUndefined();
    expect(npmPackageFromSpecifier('/abs')).toBeUndefined();
    expect(npmPackageFromSpecifier('#alias')).toBeUndefined();
    expect(npmPackageFromSpecifier('node:fs')).toBeUndefined();
    expect(npmPackageFromSpecifier('fs')).toBeUndefined();
    expect(npmPackageFromSpecifier('path')).toBeUndefined();
  });
});

describe('extractJsImports', () => {
  it('handles import, require, dynamic import, export from', () => {
    const src = [
      "import x from 'alpha';",
      "import { y } from '@sc/beta/sub';",
      "const z = require('gamma');",
      "await import('delta');",
      "export { a } from 'epsilon';",
      "import './relative.js';",
      "import fs from 'node:fs';",
    ].join('\n');
    expect(extractJsImports(src).sort()).toEqual(['@sc/beta', 'alpha', 'delta', 'epsilon', 'gamma']);
  });
});

describe('extractPyImports', () => {
  it('extracts top-level modules and skips stdlib', () => {
    const src = ['import os', 'import requests', 'from flask.helpers import x', 'import numpy.linalg', 'import json, yaml'].join('\n');
    expect(extractPyImports(src).sort()).toEqual(['flask', 'numpy', 'pyyaml', 'requests']);
  });
});

describe('parseRequirementLine', () => {
  it('strips specifiers, extras, comments, and skips options/urls', () => {
    expect(parseRequirementLine('requests>=2.0  # http lib')).toBe('requests');
    expect(parseRequirementLine('uvicorn[standard]==0.30')).toBe('uvicorn');
    expect(parseRequirementLine('-r other.txt')).toBeUndefined();
    expect(parseRequirementLine('https://example.com/pkg.whl')).toBeUndefined();
    expect(parseRequirementLine('# comment only')).toBeUndefined();
  });
});

describe('normalizeName', () => {
  it('normalizes PEP 503 names, leaves npm alone', () => {
    expect(normalizeName('Foo_Bar.baz', 'pypi')).toBe('foo-bar-baz');
    expect(normalizeName('Foo_Bar', 'npm')).toBe('Foo_Bar');
  });
});

describe('collectDependencies', () => {
  let dir: string;
  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'agentgate-deps-'));
  });
  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('collects manifests, pyproject, and undeclared source imports', () => {
    fs.writeFileSync(
      path.join(dir, 'package.json'),
      JSON.stringify({
        dependencies: { express: '^4.0.0', local: 'file:../local', ws: 'workspace:*' },
        devDependencies: { vitest: '^1.0.0' },
      }),
    );
    fs.writeFileSync(path.join(dir, 'requirements.txt'), 'requests>=2.0\n-r base.txt\n');
    fs.writeFileSync(
      path.join(dir, 'pyproject.toml'),
      ['[project]', 'dependencies = ["flask>=2", "python"]', '[project.optional-dependencies]', 'dev = ["pytest"]', '[tool.poetry.dependencies]', 'numpy = "^1.0"'].join('\n'),
    );
    fs.writeFileSync(path.join(dir, 'app.js'), "const a = require('express'); const b = require('phantom-pkg');\n");
    fs.writeFileSync(path.join(dir, 'app.py'), 'import requests\nimport phantom_module\n');
    fs.mkdirSync(path.join(dir, 'node_modules', 'x'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'node_modules', 'x', 'index.js'), "require('should-not-appear');\n");

    const { refs } = collectDependencies(dir);
    const keys = refs.map((r) => `${r.ecosystem}:${r.name}:${r.origin}`).sort();
    expect(keys).toEqual(
      [
        'npm:express:manifest',
        'npm:phantom-pkg:import',
        'npm:vitest:manifest',
        'pypi:flask:manifest',
        'pypi:numpy:manifest',
        'pypi:phantom_module:import',
        'pypi:pytest:manifest',
        'pypi:requests:manifest',
      ].sort(),
    );
    // file:/workspace: specifiers and stdlib/declared imports excluded
    expect(refs.find((r) => r.name === 'local')).toBeUndefined();
    expect(refs.find((r) => r.name === 'ws')).toBeUndefined();
  });

  it('treats deno.json(c) import-map keys as declared, not npm imports', () => {
    fs.writeFileSync(
      path.join(dir, 'deno.jsonc'),
      '{\n  // std from jsr\n  "imports": {\n    "@std/assert": "jsr:@std/assert@^1.0.3",\n    "hono/jsx/jsx-runtime": "../src/jsx/jsx-runtime.ts",\n  },\n}\n',
    );
    fs.writeFileSync(path.join(dir, 'a.test.ts'), "import { assertEquals } from '@std/assert';\nimport { jsx } from 'hono/jsx/jsx-runtime';\nimport x from 'undeclared-pkg';\n");
    const { refs } = collectDependencies(dir);
    const names = refs.map((r) => r.name);
    expect(names).toEqual(['undeclared-pkg']);
  });

  it('maps well-known Python import names to their PyPI distributions', () => {
    fs.writeFileSync(path.join(dir, 'pyproject.toml'), '[project]\ndependencies = ["pyyaml >=5.3.1", "gitpython >=3.1"]\n');
    fs.writeFileSync(path.join(dir, 'tool.py'), 'import yaml\nimport git\nimport annotationlib\nimport phantom_module\n');
    const { refs } = collectDependencies(dir);
    const imports = refs.filter((r) => r.origin === 'import').map((r) => r.name);
    expect(imports).toEqual(['phantom_module']);
  });

  it('treats directories containing Python files as local namespace packages', () => {
    fs.mkdirSync(path.join(dir, 'docs_src', 'tutorial'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'docs_src', 'tutorial', 'app.py'), 'x = 1\n');
    fs.writeFileSync(path.join(dir, 'test_it.py'), 'from docs_src.tutorial import app\n');
    const { refs } = collectDependencies(dir);
    expect(refs.find((r) => r.name === 'docs_src')).toBeUndefined();
  });

  it('respects ignore globs and --no-imports', () => {
    fs.mkdirSync(path.join(dir, 'vendor'));
    fs.writeFileSync(path.join(dir, 'vendor', 'requirements.txt'), 'vendored-pkg\n');
    fs.writeFileSync(path.join(dir, 'app.js'), "require('imported-pkg');\n");
    const { refs } = collectDependencies(dir, { ignore: ['vendor/**'], includeImports: false });
    expect(refs).toEqual([]);
  });

  it('tolerates malformed manifests and reports them as warnings', () => {
    fs.writeFileSync(path.join(dir, 'package.json'), '{not json');
    fs.writeFileSync(path.join(dir, 'pyproject.toml'), '[[[broken');
    const { refs, warnings } = collectDependencies(dir);
    expect(refs).toEqual([]);
    expect(warnings.some((w) => w.includes('package.json') && w.includes('unparseable JSON'))).toBe(true);
    expect(warnings.some((w) => w.includes('pyproject.toml') && w.includes('unparseable TOML'))).toBe(true);
  });

  it('does not report first-party Python modules present in the tree', () => {
    fs.mkdirSync(path.join(dir, 'src', 'myapp'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'src', 'myapp', '__init__.py'), '');
    fs.writeFileSync(path.join(dir, 'utilmod.py'), '');
    fs.writeFileSync(path.join(dir, 'main.py'), ['import myapp', 'import utilmod', 'import realdep', ''].join('\n'));
    const { refs } = collectDependencies(dir);
    expect(refs.map((r) => r.name)).toEqual(['realdep']);
  });

  it('ignores imports inside Python docstrings/strings and comments', () => {
    fs.writeFileSync(
      path.join(dir, 'doc.py'),
      '"""Example:\n    import yourapplication\n"""\nx = "import strpkg"\n# import commented\nimport realpkg\n',
    );
    const { refs } = collectDependencies(dir);
    expect(refs.map((r) => r.name)).toEqual(['realpkg']);
  });

  it('ignores imports inside JS comments', () => {
    fs.writeFileSync(path.join(dir, 'c.js'), "/* const x = require('blockpkg'); */\n// import y from 'linepkg';\nrequire('realjs');\n");
    const { refs } = collectDependencies(dir);
    expect(refs.map((r) => r.name)).toEqual(['realjs']);
  });
});

describe('collectDependencies remote specs', () => {
  let dir: string;
  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'agentgate-deps-remote-'));
  });
  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('records git and archive-URL specifiers as remoteSpecs (still declared, never registry-verified)', () => {
    fs.writeFileSync(
      path.join(dir, 'package.json'),
      JSON.stringify({
        dependencies: {
          branchdep: 'github:acme/branchdep#main',
          tarball: 'https://cdn.example.com/tarball-1.0.0.tgz',
          pinned: 'git+https://github.com/acme/pinned.git#aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
          express: '^4.0.0',
          local: 'file:../local',
        },
      }),
    );
    const { refs, remoteSpecs } = collectDependencies(dir, { includeImports: false });
    expect(refs.map((r) => r.name)).toEqual(['express']);
    expect(remoteSpecs.map((s) => `${s.name}:${s.spec}`).sort()).toEqual([
      'branchdep:github:acme/branchdep#main',
      'pinned:git+https://github.com/acme/pinned.git#aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      'tarball:https://cdn.example.com/tarball-1.0.0.tgz',
    ]);
    expect(remoteSpecs[0]!.context).toBe('dependencies');
  });

  it('records PEP 508 direct-URL requirements as remoteSpecs (requirements.txt + pyproject)', () => {
    fs.writeFileSync(
      path.join(dir, 'requirements.txt'),
      ['requests>=2.0', 'tweety-ns @ https://github.com/acme/tweety/archive/main.zip', '# comment', ''].join('\n'),
    );
    fs.writeFileSync(
      path.join(dir, 'pyproject.toml'),
      [
        '[project]',
        'name = "demo"',
        'dependencies = [',
        '  "flask>=2.0",',
        '  "tinker @ git+https://github.com/acme/tinker.git@aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",',
        ']',
        '[project.optional-dependencies]',
        'bench = ["yc-bench @ git+https://github.com/acme/yc-bench.git@main ; python_version >= \'3.12\'"]',
        '[dependency-groups]',
        'docs = ["mkdocs>=1.0", "mkdocs-click-zoom @ git+https://github.com/acme/mkdocs-click-zoom.git@v0.2.0"]',
        '',
      ].join('\n'),
    );
    const { refs, remoteSpecs } = collectDependencies(dir, { includeImports: false });
    expect(refs.map((r) => r.name).sort()).toEqual(['flask', 'mkdocs', 'requests']);
    expect(remoteSpecs.map((s) => `${s.ecosystem}:${s.name}:${s.spec}`).sort()).toEqual([
      'pypi:mkdocs-click-zoom:git+https://github.com/acme/mkdocs-click-zoom.git@v0.2.0',
      'pypi:tinker:git+https://github.com/acme/tinker.git@aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      'pypi:tweety-ns:https://github.com/acme/tweety/archive/main.zip',
      'pypi:yc-bench:git+https://github.com/acme/yc-bench.git@main',
    ]);
    expect(remoteSpecs.find((s) => s.name === 'yc-bench')!.context).toBe('project.optional-dependencies.bench');
  });

  it('records remote overrides/resolutions redirections as remoteSpecs', () => {
    fs.writeFileSync(
      path.join(dir, 'package.json'),
      JSON.stringify({
        name: 'app',
        dependencies: { express: '^4.0.0' },
        overrides: {
          'left-pad': 'git+https://github.com/acme/left-pad.git#main',
          express: { 'body-parser': 'https://evil.example.com/body-parser-1.0.0.tgz' },
          semver: '^7.5.4',
        },
        resolutions: {
          '**/@scope/pkg@^1': 'git+https://github.com/acme/pkg.git',
          'registry-tarball': 'https://registry.npmjs.org/registry-tarball/-/registry-tarball-1.0.0.tgz',
        },
        pnpm: { overrides: { 'parent>child': 'github:acme/child' } },
      }),
    );
    const { refs, remoteSpecs } = collectDependencies(dir, { includeImports: false });
    expect(refs.map((r) => r.name)).toEqual(['express']);
    expect(remoteSpecs.map((s) => `${s.context}:${s.name}:${s.spec}`).sort()).toEqual([
      'overrides:body-parser:https://evil.example.com/body-parser-1.0.0.tgz',
      'overrides:left-pad:git+https://github.com/acme/left-pad.git#main',
      'pnpm.overrides:child:github:acme/child',
      'resolutions:@scope/pkg:git+https://github.com/acme/pkg.git',
      'resolutions:registry-tarball:https://registry.npmjs.org/registry-tarball/-/registry-tarball-1.0.0.tgz',
    ]);
  });

  it('records undeclared remote lockfile resolutions as remoteSpecs', () => {
    fs.writeFileSync(
      path.join(dir, 'package.json'),
      JSON.stringify({
        name: 'app',
        dependencies: { declared: 'git+https://github.com/acme/declared.git#main' },
      }),
    );
    fs.writeFileSync(
      path.join(dir, 'package-lock.json'),
      JSON.stringify({
        lockfileVersion: 3,
        packages: {
          '': { name: 'app' },
          'node_modules/declared': { resolved: 'git+https://github.com/acme/declared.git#main' },
          'node_modules/prism-media': { resolved: 'https://codeload.github.com/acme/prism-media/tar.gz/main' },
          'node_modules/left-pad': { resolved: 'https://registry.npmjs.org/left-pad/-/left-pad-1.3.0.tgz' },
          'node_modules/mirror-dep': { resolved: 'https://registry.npmmirror.com/mirror-dep/-/mirror-dep-1.0.0.tgz' },
        },
      }),
    );
    fs.writeFileSync(
      path.join(dir, 'yarn.lock'),
      [
        'difflib@^0.2.4:',
        '  version "0.2.4"',
        '  resolved "https://codeload.github.com/acme/difflib.js/tar.gz/32e8e38c7fcd935241b9baab6ba9c30bb4c47f7e"',
        '',
        'lodash@^4.17.21:',
        '  version "4.17.21"',
        '  resolved "https://registry.yarnpkg.com/lodash/-/lodash-4.17.21.tgz#679591c564c3bffaae8454cf0b3df370c3d6911c"',
      ].join('\n'),
    );
    const { remoteSpecs } = collectDependencies(dir, { includeImports: false });
    // declared appears once (manifest); registry/mirror tarballs excluded; the
    // sha-pinned yarn resolution is collected but exempted at scoring time
    expect(remoteSpecs.map((s) => `${s.context}:${s.name}`).sort()).toEqual([
      'dependencies:declared',
      'lockfile resolved:difflib',
      'lockfile resolved:prism-media',
    ]);
  });

  it('records remote pnpm-lock.yaml resolutions as remoteSpecs', () => {
    fs.writeFileSync(
      path.join(dir, 'pnpm-lock.yaml'),
      [
        "lockfileVersion: '9.0'",
        '',
        'packages:',
        '',
        "  'ags@https://codeload.github.com/aylur/ags/tar.gz/main':",
        '    resolution: {integrity: sha512-x, tarball: https://codeload.github.com/aylur/ags/tar.gz/main}',
        '',
        "  '@adguard/assistant@git+https://bitbucket.org/team/assistant.git#semver:v4.3.70':",
        '    resolution: {commit: not-a-sha-ref, repo: git@bitbucket.org:team/assistant.git, type: git}',
        '',
        '  lodash@4.17.21:',
        '    resolution: {integrity: sha512-y, tarball: https://registry.npmmirror.com/lodash/-/lodash-4.17.21.tgz}',
        '',
        '  asynckit@0.4.0:',
        '    resolution: {integrity: sha512-z, tarball: https://registry.nlark.com/asynckit/download/asynckit-0.4.0.tgz}',
        '',
        "  '@primer/octicons@https://codeload.github.com/primer/octicons/tar.gz/77ef6b225b3e7f30f210e10c45dd00b364a9973b(encoding@0.1.13)(eslint-config-prettier@10.1.8(eslint@8.57.1))':",
        '    resolution: {integrity: sha512-v, tarball: https://codeload.github.com/primer/octicons/tar.gz/77ef6b225b3e7f30f210e10c45dd00b364a9973b}',
        '',
        '  https://example.com/evil.tgz:',
        '    resolution: {integrity: sha512-w, tarball: https://example.com/evil.tgz}',
        '    name: evil-dep',
        '    version: 1.0.0',
      ].join('\n'),
    );
    const { remoteSpecs } = collectDependencies(dir, { includeImports: false });
    // registry-path tarballs (mirror `/-/` and cnpm `/download/`) exempt; the
    // mutable codeload/git/plain-tarball resolutions are collected
    expect(remoteSpecs.map((s) => `${s.name}:${s.spec}`).sort()).toEqual([
      '@adguard/assistant:git+https://bitbucket.org/team/assistant.git#semver:v4.3.70',
      // nested peer-suffix parens stripped from the key — the clean 40-hex
      // commit tarball spec is exempted downstream by the scoring pass
      '@primer/octicons:https://codeload.github.com/primer/octicons/tar.gz/77ef6b225b3e7f30f210e10c45dd00b364a9973b',
      'ags:https://codeload.github.com/aylur/ags/tar.gz/main',
      'evil-dep:https://example.com/evil.tgz',
    ]);
  });

  it('records uv source overrides ([tool.uv.sources]) as remoteSpecs', () => {
    fs.writeFileSync(
      path.join(dir, 'pyproject.toml'),
      [
        '[project]',
        'name = "app"',
        'dependencies = ["requests>=2", "s2wrapper", "Flash_Attn", "pinned-dep", "local-dep"]',
        '',
        '[tool.uv.sources]',
        's2wrapper = { git = "https://github.com/acme/scaling_on_scales.git" }',
        'flash-attn = { url = "https://github.com/acme/prebuilt/releases/download/v1/flash_attn-2.5.6-cp311-linux_x86_64.whl" }',
        'pinned-dep = { git = "https://github.com/acme/pinned.git", rev = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" }',
        'local-dep = { path = "../local" }',
        'undeclared = { git = "https://github.com/acme/undeclared.git" }',
      ].join('\n'),
    );
    const { refs, remoteSpecs } = collectDependencies(dir, { includeImports: false });
    expect(refs.map((r) => r.name).sort()).toEqual(['local-dep', 'requests']);
    expect(remoteSpecs.map((s) => `${s.name}:${s.spec}`).sort()).toEqual([
      'Flash_Attn:https://github.com/acme/prebuilt/releases/download/v1/flash_attn-2.5.6-cp311-linux_x86_64.whl',
      'pinned-dep:git+https://github.com/acme/pinned.git@aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      's2wrapper:git+https://github.com/acme/scaling_on_scales.git',
    ]);
    expect(remoteSpecs.find((s) => s.name === 's2wrapper')!.context).toBe('tool.uv.sources (project.dependencies)');
  });

  it('records Poetry table-form git/url dependencies as remoteSpecs', () => {
    fs.writeFileSync(
      path.join(dir, 'pyproject.toml'),
      [
        '[tool.poetry.dependencies]',
        'python = "^3.11"',
        'requests = "^2.0"',
        'karateclub = { git = "https://github.com/acme/karateclub.git", branch = "master" }',
        'pinned = { git = "https://github.com/acme/pinned.git", rev = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" }',
        'tagged = { git = "https://github.com/acme/tagged.git", tag = "v0.9.0" }',
        'torch = { url = "https://download.example.org/whl/torch-1.12.1-cp310-linux_x86_64.whl" }',
        'local = { path = "../local" }',
        '',
        '[tool.poetry.group.dev.dependencies]',
        'pearl = { git = "https://github.com/acme/pearl.git" }',
        'pytest = "^8.0"',
      ].join('\n'),
    );
    const { refs, remoteSpecs } = collectDependencies(dir, { includeImports: false });
    expect(refs.map((r) => r.name).sort()).toEqual(['local', 'pytest', 'requests']);
    expect(remoteSpecs.map((s) => `${s.name}:${s.spec}`).sort()).toEqual([
      'karateclub:git+https://github.com/acme/karateclub.git@master',
      'pearl:git+https://github.com/acme/pearl.git',
      'pinned:git+https://github.com/acme/pinned.git@aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      'tagged:git+https://github.com/acme/tagged.git@v0.9.0',
      'torch:https://download.example.org/whl/torch-1.12.1-cp310-linux_x86_64.whl',
    ]);
    expect(remoteSpecs.find((s) => s.name === 'pearl')!.context).toBe('tool.poetry.group.dev.dependencies');
  });

  it('handles extras, editable/egg, and bare-URL requirement forms', () => {
    fs.writeFileSync(
      path.join(dir, 'requirements.txt'),
      [
        'unsloth[colab-new] @ git+https://github.com/acme/unsloth.git',
        '-e https://github.com/acme/pushbullet.py/archive/master.zip#egg=pushbullet.py',
        'https://github.com/kpu/kenlm/archive/master.zip',
        'git+https://github.com/acme/open_lm.git',
        'https://download.example.org/whl/torch-2.0.1+cu118-cp310-none-linux_x86_64.whl',
        '--index-url https://pypi.org/simple',
        '',
      ].join('\n'),
    );
    const { remoteSpecs } = collectDependencies(dir, { includeImports: false });
    expect(remoteSpecs.map((s) => `${s.name}:${s.spec}`).sort()).toEqual([
      'kenlm:https://github.com/kpu/kenlm/archive/master.zip',
      'open_lm:git+https://github.com/acme/open_lm.git',
      'pushbullet.py:https://github.com/acme/pushbullet.py/archive/master.zip#egg=pushbullet.py',
      'unsloth:git+https://github.com/acme/unsloth.git',
    ]);
  });
});
