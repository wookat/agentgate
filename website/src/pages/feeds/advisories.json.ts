import type { APIRoute } from 'astro';
import { advisories } from '../../lib/advisories';

const SITE = 'https://agentgate.zalize.com';

export const GET: APIRoute = () => {
  const feed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: 'AgentGate MCP Advisories',
    home_page_url: `${SITE}/advisories/`,
    feed_url: `${SITE}/feeds/advisories.json`,
    description: 'Verified security advisories for Model Context Protocol servers and packages.',
    items: advisories.map((a) => ({
      id: a.id,
      url: `${SITE}/advisories/${a.id.toLowerCase()}/`,
      title: `${a.id}: ${a.title}`,
      content_text: a.summary,
      date_published: `${a.timeline.published}T00:00:00Z`,
      tags: [a.type, a.severity, ...a.packages.map((p) => `${p.ecosystem}:${p.name}`)],
    })),
  };
  return new Response(JSON.stringify(feed, null, 2), {
    headers: { 'Content-Type': 'application/feed+json; charset=utf-8' },
  });
};
