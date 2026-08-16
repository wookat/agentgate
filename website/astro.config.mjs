// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://agentgate.zalize.com',
  redirects: {
    '/docs': '/docs/introduction/',
  },
  integrations: [
    starlight({
      title: 'AgentGate',
      description:
        'Scan, lock, and gate your MCP servers — npm audit + lockfile + CI drift gate for the MCP era.',
      logo: {
        src: './src/assets/logo.svg',
        alt: 'AgentGate',
      },
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/wookat/agentgate',
        },
      ],
      customCss: ['./src/styles/global.css'],
      components: {
        Head: './src/components/Head.astro',
      },
      editLink: {
        baseUrl: 'https://github.com/wookat/agentgate/edit/main/website/',
      },
      sidebar: [
        {
          label: 'Getting started',
          items: [
            { label: 'Introduction', slug: 'docs/introduction' },
            { label: 'Quick start', slug: 'docs/quick-start' },
          ],
        },
        {
          label: 'CLI reference',
          items: [
            { label: 'agentgate scan', slug: 'docs/cli/scan' },
            { label: 'agentgate lock', slug: 'docs/cli/lock' },
            { label: 'agentgate diff', slug: 'docs/cli/diff' },
            { label: 'agentgate ci', slug: 'docs/cli/ci' },
            { label: 'agentgate deps', slug: 'docs/cli/deps' },
            { label: 'agentgate advisory', slug: 'docs/cli/advisory' },
            { label: 'agentgate auth', slug: 'docs/cli/auth' },
            { label: 'agentgate config convert', slug: 'docs/cli/config-convert' },
          ],
        },
        {
          label: 'Rule reference',
          items: [
            { label: 'Overview', slug: 'docs/rules' },
            { label: 'AG-TP-001 tool-poisoning', slug: 'docs/rules/tool-poisoning' },
            { label: 'AG-CL-001 credential-leak', slug: 'docs/rules/credential-leak' },
            { label: 'AG-OP-001 overprivileged', slug: 'docs/rules/overprivileged' },
            { label: 'AG-AM-001 auth-missing', slug: 'docs/rules/auth-missing' },
            { label: 'AG-SS-001 ssrf', slug: 'docs/rules/ssrf' },
            { label: 'AG-RC-001 rce-vectors', slug: 'docs/rules/rce-vectors' },
            { label: 'AG-SC-001 supply-chain', slug: 'docs/rules/supply-chain' },
          ],
          collapsed: true,
        },
        {
          label: 'Guides',
          items: [
            { label: 'CI integration', slug: 'docs/guides/ci' },
            { label: 'Scanning agent skills', slug: 'docs/guides/skills' },
            { label: 'OAuth for remote servers', slug: 'docs/guides/remote-oauth' },
            { label: 'FAQ', slug: 'docs/guides/faq' },
            { label: 'Troubleshooting', slug: 'docs/guides/troubleshooting' },
          ],
        },
        {
          label: 'Specifications',
          items: [
            { label: 'Lockfile (agentgate.lock)', slug: 'docs/spec/lockfile' },
            { label: 'Scan output (JSON)', slug: 'docs/spec/scan-output' },
            { label: 'Advisory schema', slug: 'docs/spec/advisory-schema' },
            { label: 'Advisory API', slug: 'docs/spec/advisory-api' },
          ],
        },
        {
          label: 'Security',
          items: [
            { label: 'Threat model', slug: 'docs/threat-model' },
            { label: 'How AgentGate compares', slug: 'docs/comparison' },
            { label: 'vs Snyk Agent Scan', link: '/compare/snyk/' },
            { label: 'vs Cisco scanners', link: '/compare/cisco/' },
          ],
        },
        {
          label: 'Advisory database',
          items: [
            { label: 'Browse advisories', link: '/advisories/' },
            { label: 'Contributing advisories', slug: 'docs/advisories/contributing' },
          ],
        },
        {
          label: 'Tools',
          items: [{ label: 'Report viewer', link: '/report-viewer/' }],
        },
      ],
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});
