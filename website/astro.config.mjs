// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://agentgate-1ep.pages.dev',
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
          items: [{ label: 'Threat model', slug: 'docs/threat-model' }],
        },
        {
          label: 'Advisory database',
          items: [{ label: 'Browse advisories', link: '/advisories/' }],
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
