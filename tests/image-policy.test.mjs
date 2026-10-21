import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);
const { matchRemotePattern } = require("next/dist/shared/lib/match-remote-pattern.js");
const exports = {};
const source = fs.readFileSync(new URL("../next.config.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 },
}).outputText;
vm.runInNewContext(compiled, { exports });
const patterns = exports.default.images.remotePatterns;
const allowed = (url) => patterns.some((pattern) => matchRemotePattern(pattern, new URL(url)));

test("image policy retains the country flag URLs used by watchlists and exchanges", () => {
  for (const country of ["us", "gb", "de", "jp"]) {
    assert.equal(allowed(`https://flagcdn.com/w40/${country}.png`), true);
  }
});

test("image policy rejects other hosts, paths, formats and query-bearing URLs", () => {
  for (const url of [
    "http://flagcdn.com/w40/us.png",
    "https://example.com/w40/us.png",
    "https://flagcdn.com/other/us.png",
    "https://flagcdn.com/w40/us.svg",
    "https://flagcdn.com/w40/us.png?url=http://127.0.0.1",
    "https://flagcdn.com/w40/nested/us.png",
  ]) assert.equal(allowed(url), false, url);
});
