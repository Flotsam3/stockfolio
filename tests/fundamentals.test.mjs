import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const marker = "SF02_PRIVATE_TEST_MARKER";
const source = fs.readFileSync(new URL("../app/api/fundamentals/route.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 },
}).outputText;

function fixture({ session = { user: { id: "test-user" } }, key = marker, provider } = {}) {
    const exports = {};
    const calls = [];
    const logs = [];
    vm.runInNewContext(compiled, {
        exports, URL, URLSearchParams, Response, AbortSignal,
        process: { env: { ALPHA_VANTAGE_KEY: key } },
        console: { log: (...args) => logs.push(args), error: (...args) => logs.push(args) },
        require(name) {
            if (name === "server-only") return {};
            if (name === "next-auth") return { getServerSession: async () => session };
            if (name === "@/app/api/auth/[...nextauth]/route") return { authOptions: {} };
            throw new Error("Unexpected import: " + name);
        },
        async fetch(url, options) {
            calls.push({ url, options });
            assert.ok(provider, "Unexpected provider request");
            return provider();
        },
    });
    return { get: (query) => exports.GET(new Request("http://localhost/api/fundamentals?" + query)), calls, logs };
}

test("authentication and input validation happen before provider requests", async () => {
    for (const session of [null, { user: {} }]) {
        const f = fixture({ session });
        assert.equal((await f.get("function=INCOME_STATEMENT&symbol=IBM")).status, 401);
        assert.equal(f.calls.length, 0);
    }
    const f = fixture();
    for (const query of [
        "function=INCOME_STATEMENT", "symbol=IBM", "function=UNKNOWN&symbol=IBM",
        "function=CASH_FLOW&symbol=", "function=CASH_FLOW&symbol=" + "A".repeat(33),
        "function=CASH_FLOW&symbol=IBM%26apikey%3Devil", "function=CASH_FLOW&symbol=../IBM",
        "function=CASH_FLOW&symbol=IBM&apikey=evil", "function=CASH_FLOW&symbol=IBM&url=https://evil.test",
        "function=CASH_FLOW&function=BALANCE_SHEET&symbol=IBM", "function=CASH_FLOW&symbol=IBM&symbol=MSFT",
    ]) assert.equal((await f.get(query)).status, 400, query);
    assert.equal(f.calls.length, 0);
    const unconfigured = fixture({ key: "" });
    assert.equal((await unconfigured.get("function=CASH_FLOW&symbol=IBM")).status, 503);
    assert.equal(unconfigured.calls.length, 0);
});

test("four allowed functions retain the UI response shape and use only the server key", async () => {
    for (const [operation, symbol] of [
        ["INCOME_STATEMENT", " ibm "], ["BALANCE_SHEET", "TSCO.LON"],
        ["CASH_FLOW", "BRK-B"], ["TIME_SERIES_MONTHLY_ADJUSTED", "7203.T"],
    ]) {
        const expected = operation === "TIME_SERIES_MONTHLY_ADJUSTED"
            ? { "Monthly Adjusted Time Series": { "2026-09-30": { "4. close": "100" } } }
            : { annualReports: [{ fiscalDateEnding: "2025-12-31" }], quarterlyReports: [] };
        const f = fixture({ provider: () => Response.json({ ...expected, ignoredMetadata: marker }) });
        const response = await f.get(new URLSearchParams({ function: operation, symbol }));
        assert.equal(response.status, 200);
        assert.equal(response.headers.get("Cache-Control"), "private, no-store");
        assert.deepEqual(await response.json(), expected);
        assert.equal(f.calls.length, 1);
        const { url, options } = f.calls[0];
        assert.equal(url.origin + url.pathname, "https://www.alphavantage.co/query");
        assert.deepEqual([...url.searchParams.keys()].sort(), ["apikey", "function", "symbol"]);
        assert.equal(url.searchParams.get("apikey"), marker);
        assert.equal(url.searchParams.get("symbol"), symbol.trim().toUpperCase());
        assert.equal(url.searchParams.get("function"), operation);
        assert.equal(options.cache, "no-store");
        assert.ok(options.signal);
    }
});

test("provider failures and invalid payloads never echo or log credentials", async () => {
    for (const [provider, status] of [
        [() => { throw new Error("https://provider.test/?apikey=" + marker); }, 502],
        [() => new Response(marker, { status: 429 }), 429],
        [() => new Response(marker, { status: 503 }), 502],
        [() => new Response(marker), 502],
        ...["Information", "Note", "Error Message"].map((field) => [() => Response.json({ [field]: marker }), 502]),
        [() => Response.json({ annualReports: [], quarterlyReports: marker }), 502],
    ]) {
        const f = fixture({ provider });
        const response = await f.get("function=INCOME_STATEMENT&symbol=IBM");
        assert.equal(response.status, status);
        assert.ok(!(await response.text()).includes(marker));
        assert.deepEqual(f.logs, []);
    }
});
