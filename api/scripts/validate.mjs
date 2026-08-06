// Validates every advisories/*.json against the JSON Schema.
import { readdir, readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const advisoriesDir = join(root, "advisories");

const schema = JSON.parse(
  await readFile(join(advisoriesDir, "schema", "advisory.schema.json"), "utf8")
);
const ajv = new Ajv2020.default({ allErrors: true });
addFormats.default(ajv);
const validate = ajv.compile(schema);

const files = (await readdir(advisoriesDir)).filter((f) => /^MCPA-\d{4}-\d{4}\.json$/.test(f));
let failed = 0;
const seen = new Set();
for (const f of files.sort()) {
  const data = JSON.parse(await readFile(join(advisoriesDir, f), "utf8"));
  const ok = validate(data);
  if (!ok) {
    failed++;
    console.error(`FAIL ${f}:`);
    for (const err of validate.errors) console.error(`  ${err.instancePath} ${err.message}`);
    continue;
  }
  if (data.id !== f.replace(/\.json$/, "")) {
    failed++;
    console.error(`FAIL ${f}: id "${data.id}" does not match filename`);
    continue;
  }
  if (seen.has(data.id)) {
    failed++;
    console.error(`FAIL ${f}: duplicate id "${data.id}"`);
    continue;
  }
  seen.add(data.id);
  console.log(`OK   ${f}`);
}
if (failed) {
  console.error(`${failed} advisory file(s) failed validation`);
  process.exit(1);
}
console.log(`${files.length} advisory file(s) valid`);
