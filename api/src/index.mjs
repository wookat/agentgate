import data from "./data.json" with { type: "json" };
import { isAffected } from "./semver.mjs";

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "content-type",
  "cache-control": "public, max-age=300",
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body, null, 2), { status, headers: JSON_HEADERS });
}

function error(status, message) {
  return json({ error: { status, message } }, status);
}

function matchPackage(advisory, ecosystem, name, version) {
  return advisory.packages.some((p) => {
    if (ecosystem && p.ecosystem !== ecosystem) return false;
    if (p.name.toLowerCase() !== name.toLowerCase()) return false;
    if (version === undefined) return true;
    return isAffected(version, p.ranges);
  });
}

function queryOne(body) {
  const { name, version, ecosystem } = body;
  if (!name) return { error: "missing required field: name" };
  const advisories = data.advisories.filter((a) =>
    matchPackage(a, ecosystem, name, version || undefined)
  );
  return { name, version: version ?? null, ecosystem: ecosystem ?? null, advisories };
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: JSON_HEADERS });
    }

    if (path === "/" || path === "/v1") {
      return json({
        name: "AgentGate Advisory API",
        version: "v1",
        advisory_count: data.count,
        generated_at: data.generated_at,
        endpoints: [
          "GET /v1/advisories",
          "GET /v1/advisories/{id}",
          "GET /v1/query?name={pkg}&version={ver}&ecosystem={eco}",
          "POST /v1/query  {\"queries\":[{\"name\",\"version\",\"ecosystem\"}]}",
        ],
        docs: "https://github.com/wookat/agentgate/blob/main/docs/spec/advisory-api.md",
      });
    }

    if (path === "/v1/advisories" && request.method === "GET") {
      const allowed = new Set(["severity", "type", "ecosystem"]);
      const unknown = [...url.searchParams.keys()].filter((k) => !allowed.has(k));
      if (unknown.length > 0) {
        return error(
          400,
          `unknown query parameter(s): ${unknown.join(", ")} — supported: severity, type, ecosystem; to match a package use GET /v1/query?name={pkg}`
        );
      }
      let items = data.advisories;
      const severity = url.searchParams.get("severity");
      const type = url.searchParams.get("type");
      const ecosystem = url.searchParams.get("ecosystem");
      if (severity) items = items.filter((a) => a.severity === severity);
      if (type) items = items.filter((a) => a.type === type);
      if (ecosystem) items = items.filter((a) => a.packages.some((p) => p.ecosystem === ecosystem));
      return json({ count: items.length, advisories: items });
    }

    const idMatch = /^\/v1\/advisories\/(MCPA-\d{4}-\d{4})$/.exec(path);
    if (idMatch && request.method === "GET") {
      const advisory = data.advisories.find((a) => a.id === idMatch[1]);
      return advisory ? json(advisory) : error(404, `advisory ${idMatch[1]} not found`);
    }

    if (path === "/v1/query" && request.method === "GET") {
      const name = url.searchParams.get("name");
      if (!name) return error(400, "missing required query parameter: name");
      const result = queryOne({
        name,
        version: url.searchParams.get("version") || undefined,
        ecosystem: url.searchParams.get("ecosystem") || undefined,
      });
      return json(result);
    }

    if (path === "/v1/query" && request.method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        return error(400, "invalid JSON body");
      }
      const queries = Array.isArray(body?.queries) ? body.queries : null;
      if (!queries) return error(400, 'body must be {"queries": [{"name", "version?", "ecosystem?"}]}');
      if (queries.length > 100) return error(400, "at most 100 queries per request");
      const results = queries.map((q) => queryOne(q || {}));
      const bad = results.find((r) => r.error);
      if (bad) return error(400, bad.error);
      return json({ results });
    }

    return error(404, "not found");
  },
};
