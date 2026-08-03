import test from "node:test";
import assert from "node:assert/strict";
import { compare, isAffected } from "../src/semver.mjs";

test("compare basic ordering", () => {
  assert.equal(compare("1.0.0", "1.0.1"), -1);
  assert.equal(compare("1.2.3", "1.2.3"), 0);
  assert.equal(compare("2.0.0", "1.9.9"), 1);
});

test("prerelease sorts before release", () => {
  assert.equal(compare("2.0.0-beta.1", "2.0.0"), -1);
  assert.equal(compare("2.0.0-beta.2", "2.0.0-beta.17"), -1);
  assert.equal(compare("2.0.0-beta.17", "2.0.0-beta.17"), 0);
});

test("unparseable versions return null", () => {
  assert.equal(compare("not-a-version", "1.0.0"), null);
});

test("isAffected with fixed", () => {
  const ranges = [{ introduced: "0.0.5", fixed: "0.1.16" }];
  assert.equal(isAffected("0.1.15", ranges), true);
  assert.equal(isAffected("0.1.16", ranges), false);
  assert.equal(isAffected("0.0.4", ranges), false);
});

test("isAffected with last_affected", () => {
  const ranges = [{ introduced: "1.0.16", last_affected: "1.0.18" }];
  assert.equal(isAffected("1.0.15", ranges), false);
  assert.equal(isAffected("1.0.16", ranges), true);
  assert.equal(isAffected("1.0.18", ranges), true);
  assert.equal(isAffected("1.0.19", ranges), false);
});

test("isAffected with prerelease ranges", () => {
  const ranges = [{ introduced: "2.0.0-beta.1", fixed: "2.0.0-beta.17" }];
  assert.equal(isAffected("2.0.0-beta.16", ranges), true);
  assert.equal(isAffected("2.0.0-beta.17", ranges), false);
});

test("isAffected open-ended range", () => {
  const ranges = [{ introduced: "1.0.0" }];
  assert.equal(isAffected("99.0.0", ranges), true);
  assert.equal(isAffected("0.9.0", ranges), false);
});
