// Bundles advisories/*.json into src/data.json for the Worker.
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const advisoriesDir = join(root, "advisories");

const files = (await readdir(advisoriesDir)).filter((f) => f.endsWith(".json"));
const advisories = [];
for (const f of files.sort()) {
  advisories.push(JSON.parse(await readFile(join(advisoriesDir, f), "utf8")));
}
const out = {
  generated_at: new Date().toISOString(),
  count: advisories.length,
  advisories,
};
await writeFile(join(root, "api", "src", "data.json"), JSON.stringify(out, null, 2));
console.log(`Bundled ${advisories.length} advisories into api/src/data.json`);
