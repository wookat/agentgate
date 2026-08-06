import test from "node:test";
import assert from "node:assert/strict";
import worker from "../src/index.mjs";

const BASE = "https://api.example";

async function get(path) {
  const res = await worker.fetch(new Request(`${BASE}${path}`));
  return { status: res.status, body: await res.json() };
}

test("/v1/advisories rejects unknown query parameters", async () => {
  const { status, body } = await get("/v1/advisories?package=mcp-remote");
  assert.equal(status, 400);
  assert.match(body.error.message, /unknown query parameter/);
  assert.match(body.error.message, /\/v1\/query\?name=/);
});

test("/v1/advisories supports the documented filters", async () => {
  const all = await get("/v1/advisories");
  assert.equal(all.status, 200);
  const filtered = await get("/v1/advisories?severity=critical&ecosystem=npm");
  assert.equal(filtered.status, 200);
  assert.ok(filtered.body.count <= all.body.count);
});
