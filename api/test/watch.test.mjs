import test from "node:test";
import assert from "node:assert/strict";
import {
  buildContext,
  isIgnored,
  filterGhsa,
  filterMalware,
  draftFromGhsa,
  collectOsvCandidates,
  filterOsvDetail,
  renderReport,
} from "../scripts/watch-lib.mjs";

const advisories = [
  {
    id: "MCPA-2026-0001",
    aliases: ["CVE-2026-1111", "GHSA-aaaa-aaaa-aaaa"],
    packages: [{ ecosystem: "npm", name: "known-pkg", ranges: [{ introduced: "0" }] }],
  },
  {
    id: "MCPA-2026-0002",
    aliases: ["MAL-2026-2222"],
    packages: [
      { ecosystem: "pypi", name: "tracked-py" },
      { ecosystem: "nuget", name: "Tracked.Net" },
    ],
  },
  {
    id: "MCPA-2026-0003",
    aliases: ["GHSA-bbbb-bbbb-bbbb"],
    packages: [
      {
        ecosystem: "npm",
        name: "bounded-agent",
        ranges: [{ introduced: "0.1.0", last_affected: "0.2.0" }],
      },
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
    ["npm:bounded-agent", "npm:known-pkg", "pypi:tracked-py"],
  );
  assert.ok(ctx.openEndedTracked.has("npm:known-pkg"));
  assert.ok(!ctx.openEndedTracked.has("npm:bounded-agent"));
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

test("filterMalware keeps only vocabulary-named npm/pypi packages not already covered", () => {
  const mk = (ghsa_id, name, ecosystem = "npm", extra = {}) => ({
    ghsa_id,
    cve_id: null,
    summary: "malware",
    description: "",
    vulnerabilities: [{ package: { ecosystem, name } }],
    ...extra,
  });
  const input = [
    mk("GHSA-mal1-mal1-mal1", "evil-claude-agent"),
    mk("GHSA-mal2-mal2-mal2", "@scope/mcp-helper"),
    mk("GHSA-mal3-mal3-mal3", "useragent-parser"),
    mk("GHSA-mal4-mal4-mal4", "generic-trojan"),
    mk("GHSA-mal5-mal5-mal5", "known-pkg"),
    mk("GHSA-mal6-mal6-mal6", "noisy-pkg"),
    mk("GHSA-mal7-mal7-mal7", "evil-copilot", "rubygems"),
    { ghsa_id: "GHSA-mal8-mal8-mal8", cve_id: null, summary: "steals Model Context Protocol configs", description: "", vulnerabilities: [{ package: { ecosystem: "pip", name: "plainname" } }] },
    mk("GHSA-aaaa-aaaa-aaaa", "another-agent"),
    // Tracked channel whose MCPA record is version-bounded: a fresh malware
    // id on that channel may be a new campaign and must stay visible.
    mk("GHSA-mal9-mal9-mal9", "bounded-agent"),
  ];
  assert.deepEqual(
    filterMalware(ctx, input).map((h) => h.advisory.ghsa_id),
    ["GHSA-mal1-mal1-mal1", "GHSA-mal2-mal2-mal2", "GHSA-mal8-mal8-mal8", "GHSA-mal9-mal9-mal9"],
  );
  const pypiHit = filterMalware(ctx, input).find((h) => h.advisory.ghsa_id === "GHSA-mal8-mal8-mal8");
  assert.deepEqual(pypiHit.pkgs, [{ ecosystem: "pypi", name: "plainname" }]);
});

test("renderReport includes the malware section and its triage commands", () => {
  const report = renderReport({
    days: 8,
    ghsa: { error: null, hits: [] },
    osv: { error: null, hits: [] },
    malware: {
      error: null,
      hits: [
        {
          advisory: { ghsa_id: "GHSA-mal1-mal1-mal1", summary: "evil-claude-agent is malware" },
          pkgs: [{ ecosystem: "npm", name: "evil-claude-agent" }],
        },
      ],
    },
  });
  assert.match(report, /GHSA malware advisories in the agent\/MCP name vocabulary/);
  assert.match(report, /`npm:evil-claude-agent` — evil-claude-agent is malware/);
  assert.match(report, /node api\/scripts\/watch\.mjs --draft GHSA-mal1-mal1-mal1/);
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
  assert.match(report, /### Triage/);
  assert.match(report, /node api\/scripts\/watch\.mjs --draft GHSA-new1-new1-new1/);
  assert.match(report, /api\/advisories\/watch-ignore\.json/);
});

test("renderReport carries triage commands for GHSA-mirrored OSV hits", () => {
  const report = renderReport({
    days: 8,
    ghsa: { error: null, hits: [] },
    osv: { error: null, hits: [{ id: "GHSA-xxxx-1", pkgs: [{ ecosystem: "npm", name: "known-pkg" }], published: "2026-08-05" }] },
  });
  assert.match(report, /### Triage/);
  assert.match(report, /node api\/scripts\/watch\.mjs --draft GHSA-xxxx-1/);
});

test("renderReport omits the triage section when no hit has a GHSA id", () => {
  const report = renderReport({
    days: 8,
    ghsa: { error: null, hits: [] },
    osv: { error: null, hits: [{ id: "PYSEC-2026-1", pkgs: [{ ecosystem: "pypi", name: "known-pkg" }], published: "2026-08-05" }] },
  });
  assert.doesNotMatch(report, /### Triage/);
});

test("draftFromGhsa prefills an MCPA skeleton from a GHSA detail payload", () => {
  const detail = {
    ghsa_id: "GHSA-6j8j-xrrf-px36",
    cve_id: "CVE-2026-19046",
    html_url: "https://github.com/advisories/GHSA-6j8j-xrrf-px36",
    summary: "LudusMCP path traversal via guide_name",
    description: "A path traversal in ludus_environment_guides_search allows reading files outside the guides directory.",
    severity: "low",
    published: "2026-08-06T10:00:00Z",
    cvss: { vector_string: "CVSS:3.1/AV:L/AC:L/PR:L/UI:N/S:U/C:L/I:N/A:N", score: 3.3 },
    cwes: [{ cwe_id: "CWE-22" }],
    source_code_location: "https://github.com/NocteDefensor/LudusMCP",
    vulnerabilities: [
      { package: { ecosystem: "npm", name: "ludus-mcp" }, vulnerable_version_range: "<= 1.0.24", last_patched_version: null },
    ],
  };
  const draft = draftFromGhsa(detail, "MCPA-2026-0018");
  assert.equal(draft.id, "MCPA-2026-0018");
  assert.equal(draft.type, "path-traversal");
  assert.equal(draft.severity, "low");
  assert.deepEqual(draft.aliases, ["CVE-2026-19046", "GHSA-6j8j-xrrf-px36"]);
  assert.deepEqual(draft.packages, [
    { ecosystem: "npm", name: "ludus-mcp", ranges: [{ introduced: "0", last_affected: "1.0.24" }] },
  ]);
  assert.equal(draft.cvss.score, 3.3);
  assert.deepEqual(draft.cwe, ["CWE-22"]);
  assert.equal(draft.timeline.published, "2026-08-06");
  assert.equal(draft.references.length, 3);
});

test("draftFromGhsa marks unknowns as FIXME and maps moderate to medium", () => {
  const draft = draftFromGhsa(
    { ghsa_id: "GHSA-zzzz-zzzz-zzzz", severity: "moderate", summary: "Weird MCP bug", vulnerabilities: [] },
    "MCPA-2026-0019",
  );
  assert.equal(draft.severity, "medium");
  assert.equal(draft.type, "FIXME-type");
  assert.equal(draft.packages[0].ecosystem, "FIXME");
  assert.equal(draft.timeline.published, "FIXME");
});

test("watch-ignore.json: every rationale key is an active ignore entry", async () => {
  const fs = await import("node:fs");
  const ignore = JSON.parse(fs.readFileSync(new URL("../../advisories/watch-ignore.json", import.meta.url), "utf8"));
  const active = new Set([...ignore.ids, ...ignore.packages]);
  const orphans = Object.keys(ignore.rationale).filter((k) => !active.has(k));
  assert.deepEqual(orphans, []);
});

test("watch-ignore.json: every ignore entry has a rationale", async () => {
  const fs = await import("node:fs");
  const ignore = JSON.parse(fs.readFileSync(new URL("../../advisories/watch-ignore.json", import.meta.url), "utf8"));
  const missing = [...ignore.ids, ...ignore.packages].filter((k) => !(k in ignore.rationale));
  assert.deepEqual(missing, []);
});
