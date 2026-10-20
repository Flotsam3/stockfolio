import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import test from "node:test";
import { isReleaseMetadataOnly } from "../scripts/vercel-ignore-build.mjs";

function fixture({ subject = "chore(release): 1.2.0 [skip ci]", parents = "a".repeat(40),
  files = ["CHANGELOG.md", "package.json", "package-lock.json"],
  changePackage = () => {}, changeLock = () => {} } = {}) {
  const previousPackage = { name: "stockfolio", private: true, version: "1.1.0", dependencies: { next: "16.3.3" } };
  const previousLock = { name: "stockfolio", version: "1.1.0", lockfileVersion: 3,
    packages: { "": { name: "stockfolio", version: "1.1.0", dependencies: { next: "16.3.3" } },
      "node_modules/next": { version: "16.3.3", integrity: "original-integrity" } } };
  const nextPackage = structuredClone(previousPackage);
  const nextLock = structuredClone(previousLock);
  nextPackage.version = nextLock.version = nextLock.packages[""].version = "1.2.0";
  changePackage(nextPackage);
  changeLock(nextLock);
  const results = new Map([
    ["show -s --format=%s HEAD", subject],
    ["show -s --format=%P HEAD", parents],
    ["diff --name-only --no-renames -z HEAD^ HEAD", files.join("\0") + "\0"],
    ["show HEAD^:package.json", JSON.stringify(previousPackage)],
    ["show HEAD:package.json", JSON.stringify(nextPackage)],
    ["show HEAD^:package-lock.json", JSON.stringify(previousLock)],
    ["show HEAD:package-lock.json", JSON.stringify(nextLock)],
  ]);
  return (args) => {
    const key = args.join(" ");
    assert.ok(results.has(key), `Unexpected Git command: ${key}`);
    return results.get(key);
  };
}

test("Vercel skips only a pure version and changelog release commit", () => {
  assert.equal(isReleaseMetadataOnly(fixture()), true);
});

test("normal commits and messages without the exact release marker keep building", () => {
  for (const subject of ["feat: add export", "chore(release): 1.2.0", "chore(release): 1.2.0 [skip ci] extra", "chore(release): 01.2.0 [skip ci]"]) {
    assert.equal(isReleaseMetadataOnly(fixture({ subject })), false, subject);
  }
});

test("release-looking commits containing application or configuration changes keep building", () => {
  for (const extraFile of ["app/page.tsx", "vercel.json", "scripts/vercel-ignore-build.mjs"]) {
    assert.equal(isReleaseMetadataOnly(fixture({ files: ["CHANGELOG.md", "package.json", "package-lock.json", extraFile] })), false);
  }
  assert.equal(isReleaseMetadataOnly(fixture({ files: ["CHANGELOG.md"] })), false);
});

test("dependency, script and lockfile integrity changes keep building even in a release-looking commit", () => {
  assert.equal(isReleaseMetadataOnly(fixture({ changePackage: (p) => { p.dependencies.next = "17.0.0"; } })), false);
  assert.equal(isReleaseMetadataOnly(fixture({ changePackage: (p) => { p.scripts = { build: "different build" }; } })), false);
  assert.equal(isReleaseMetadataOnly(fixture({ changeLock: (p) => { p.packages["node_modules/next"].integrity = "changed-integrity"; } })), false);
});

test("mismatched package or lockfile versions keep building", () => {
  assert.equal(isReleaseMetadataOnly(fixture({ changePackage: (p) => { p.version = "1.3.0"; } })), false);
  assert.equal(isReleaseMetadataOnly(fixture({ changeLock: (p) => { p.packages[""].version = "1.1.0"; } })), false);
});

test("merge commits, shallow roots and unavailable or malformed Git data keep building", () => {
  assert.equal(isReleaseMetadataOnly(fixture({ parents: "a b" })), false);
  assert.equal(isReleaseMetadataOnly(fixture({ parents: "" })), false);
  assert.equal(isReleaseMetadataOnly(() => { throw new Error("missing parent"); }), false);
  const git = fixture();
  assert.equal(isReleaseMetadataOnly((args) => args.includes("HEAD:package.json") ? "malformed" : git(args)), false);
});

test("the configured Vercel CLI command lets the actual normal HEAD build", () => {
  const config = JSON.parse(fs.readFileSync(new URL("../vercel.json", import.meta.url), "utf8"));
  assert.equal(config.ignoreCommand, "node scripts/vercel-ignore-build.mjs");
  // This real checkout has no generated release commit. No fixture commits/tags are needed.
  const subject = execFileSync("git", ["show", "-s", "--format=%s", "HEAD"], { encoding: "utf8" });
  if (/^chore\(release\):/.test(subject)) return;
  const result = spawnSync(process.execPath, ["scripts/vercel-ignore-build.mjs"], { encoding: "utf8" });
  assert.equal(result.status, 1, result.stderr);
  assert.match(result.stdout, /Continue build/);
});
