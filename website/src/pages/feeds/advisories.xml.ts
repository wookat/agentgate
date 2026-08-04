import type { APIRoute } from 'astro';
import { advisories } from '../../lib/advisories';

const SITE = 'https://agentgate.zalize.com';

function esc(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export const GET: APIRoute = () => {
  const items = advisories
    .map((a) => {
      const url = `${SITE}/advisories/${a.id.toLowerCase()}/`;
      const pubDate = new Date(`${a.timeline.published}T00:00:00Z`).toUTCString();
      return `    <item>
      <title>${esc(`${a.id}: ${a.title}`)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <category>${esc(a.type)}</category>
      <category>${esc(a.severity)}</category>
      <description>${esc(a.summary)}</description>
    </item>`;
    })
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>AgentGate MCP Advisories</title>
    <link>${SITE}/advisories/</link>
    <atom:link href="${SITE}/feeds/advisories.xml" rel="self" type="application/rss+xml" />
    <description>Verified security advisories for Model Context Protocol servers and packages.</description>
    <language>en</language>
${items}
  </channel>
</rss>
`;
  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
};
