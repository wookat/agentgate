import test from "node:test";
import assert from "node:assert/strict";
import {
  buildContext,
  isIgnored,
  filterGhsa,
  collectOsvCandidates,
  filterOsvDetail,
  renderReport,
} from "../scripts/watch-lib.mjs";

const advisories = [
  {
    id: "MCPA-2026-0001",
    aliases: ["CVE-2026-1111", "GHSA-aaaa-aaaa-aaaa"],
    packages: [{ ecosystem: "npm", name: "known-pkg" }],
  },
  {
    id: "MCPA-2026-0002",
    aliases: ["MAL-2026-2222"],
    packages: [
      { ecosystem: "pypi", name: "tracked-py" },
      { ecosystem: "nuget", name: "Tracked.Net" },
    ],
  },
];

const ignoreList = {
  ids: ["GHSA-iiii-iiii-iiii", "CVE-2026-9999"],
  packages: ["npm:noisy-pkg"],
};

const ctx = buildContext({ advisories, ignoreList });

test("buildContext collects aliases and registry-visible tracked packages", () => {
  assert.ok(ctx.knownAliases.has("CVE-2026-1111"));
  assert.ok(ctx.knownAliases.has("MAL-2026-2222"));
  assert.deepEqual(
    ctx.trackedPackages.map((p) => `${p.ecosystem}:${p.name}`).sort(),
    ["npm:known-pkg", "pypi:tracked-py"],
  );
});

test("isIgnored matches ids, and packages only when all hit the ignore list", () => {
  assert.equal(isIgnored(ctx, "GHSA-iiii-iiii-iiii"), true);
  assert.equal(isIgnored(ctx, "GHSA-new1-new1-new1"), false);
  assert.equal(isIgnored(ctx, "X", [{ ecosystem: "npm", name: "noisy-pkg" }]), true);
  assert.equal(
    isIgnored(ctx, "X", [
      { ecosystem: "npm", name: "noisy-pkg" },
      { ecosystem: "npm", name: "known-pkg" },
    ]),
    false,
  );
  assert.equal(isIgnored(ctx, "X", []), false);
});

test("filterGhsa keeps only MCP-related, unknown, non-ignored advisories", () => {
  const input = [
    { ghsa_id: "GHSA-new1-new1-new1", cve_id: "CVE-2026-3333", summary: "MCP server RCE", description: "" },
    { ghsa_id: "GHSA-new2-new2-new2", cve_id: null, summary: "SQL injection in blog", description: "no relation" },
    { ghsa_id: "GHSA-aaaa-aaaa-aaaa", cve_id: "CVE-2026-1111", summary: "mcp thing already covered", description: "" },
    { ghsa_id: "GHSA-new3-new3-new3", cve_id: "CVE-2026-1111", summary: "Model Context Protocol dupe by CVE", description: "" },
    { ghsa_id: "GHSA-iiii-iiii-iiii", cve_id: null, summary: "mcp reviewed and ignored", description: "" },
    { ghsa_id: "GHSA-new4-new4-new4", cve_id: "CVE-2026-9999", summary: "mcp ignored by cve", description: "" },
  ];
  assert.deepEqual(filterGhsa(ctx, input).map((a) => a.ghsa_id), ["GHSA-new1-new1-new1"]);
});

test("filterGhsa matches mcp only at word edges", () => {
  const input = [
    { ghsa_id: "GHSA-ffmp-ffmp-ffmp", cve_id: null, summary: "FFmpeg overflow", description: "invoking memcpy() with attacker-controlled data" },
    { ghsa_id: "GHSA-ldus-ldus-ldus", cve_id: null, summary: "LudusMCP command injection", description: "" },
    { ghsa_id: "GHSA-caml-caml-caml", cve_id: null, summary: "MCPServer path traversal", description: "" },
    { ghsa_id: "GHSA-hyph-hyph-hyph", cve_id: null, summary: "mcp-server-foo RCE", description: "" },
  ];
  assert.deepEqual(
    filterGhsa(ctx, input).map((a) => a.ghsa_id),
    ["GHSA-ldus-ldus-ldus", "GHSA-caml-caml-caml", "GHSA-hyph-hyph-hyph"],
  );
});

test("collectOsvCandidates dedupes ids across packages and skips known aliases", () => {
  const results = [
    { vulns: [{ id: "GHSA-xxxx-1" }, { id: "MAL-2026-2222" }] },
    { vulns: [{ id: "GHSA-xxxx-1" }] },
  ];
  const candidates = collectOsvCandidates(ctx, results);
  assert.equal(candidates.length, 1);
  assert.equal(candidates[0].id, "GHSA-xxxx-1");
  assert.equal(candidates[0].pkgs.length, 2);
});

test("filterOsvDetail drops old, ignored, and alias-covered entries", () => {
  const since = Date.parse("2026-08-01");
  const candidate = { id: "GHSA-xxxx-1", pkgs: [ctx.trackedPackages[0]] };
  assert.equal(filterOsvDetail(ctx, candidate, { published: "2026-07-01T00:00:00Z" }, since), null);
  assert.equal(
    filterOsvDetail(ctx, candidate, { published: "2026-08-05T00:00:00Z", aliases: ["CVE-2026-1111"] }, since),
    null,
  );
  assert.equal(
    filterOsvDetail(ctx, candidate, { published: "2026-08-05T00:00:00Z", aliases: ["CVE-2026-9999"] }, since),
    null,
  );
  const hit = filterOsvDetail(ctx, candidate, { published: "2026-08-05T00:00:00Z", aliases: ["CVE-2026-4444"] }, since);
  assert.equal(hit.published, "2026-08-05");
});

test("renderReport is empty when there is nothing to report", () => {
  assert.equal(renderReport({ days: 8, ghsa: { error: null, hits: [] }, osv: { error: null, hits: [] } }), "");
});

test("renderReport includes sections and warnings", () => {
  const report = renderReport({
    days: 8,
    ghsa: { error: null, hits: [{ ghsa_id: "GHSA-new1-new1-new1", cve_id: "CVE-2026-3333", severity: "high", summary: "MCP RCE" }] },
    osv: { error: "OSV querybatch 500", hits: [{ id: "GHSA-xxxx-1", pkgs: [{ ecosystem: "npm", name: "known-pkg" }], published: "2026-08-05" }] },
  });
  assert.match(report, /GHSA advisories mentioning MCP/);
  assert.match(report, /GHSA-new1-new1-new1.*high, CVE-2026-3333/);
  assert.match(report, /`npm:known-pkg` \(published 2026-08-05\)/);
  assert.match(report, /> warning: OSV querybatch 500/);
});
