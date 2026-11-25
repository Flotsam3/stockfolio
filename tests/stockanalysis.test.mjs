import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const root = fileURLToPath(new URL("..", import.meta.url));
const nativeRequire = createRequire(import.meta.url);
const compiled = new Map();
const stockId = "507f1f77bcf86cd799439011";
const portfolioId = "507f1f77bcf86cd799439012";
const today = "2026-11-25";

class TestDate extends Date {
    constructor(...args) {
        super(...(args.length === 0 ? [today + "T20:00:00Z"] : args));
    }
}

function fixture({ provider, session = { user: { id: "owner" } }, savedStock, changedDuringRefresh = false } = {}) {
    const calls = [];
    const writes = [];
    const modules = new Map();
    const model = {
        findOne(filter, projection) {
            assert.equal(filter.userId, "owner");
            assert.deepEqual(JSON.parse(JSON.stringify(projection)), { "watchList.$": 1 });
            return { lean: async () => savedStock ? { watchList: [savedStock] } : null };
        },
        findOneAndUpdate(filter, update, options) {
            assert.equal(filter.userId, "owner");
            assert.equal(options.runValidators, true);
            writes.push({ filter, update });
            const stock = { ...savedStock };
            for (const [key, value] of Object.entries(update.$set ?? {})) {
                stock[key.slice("watchList.$.".length)] = value;
            }
            const updated = changedDuringRefresh ? null : { _id: portfolioId, watchList: [stock] };
            return Object.assign(Promise.resolve(updated), { lean: async () => updated });
        },
    };
    const context = vm.createContext({
        URL, URLSearchParams, Response, AbortSignal, Date: TestDate,
        console: { error: () => {} },
        async fetch(input, options) {
            const url = new URL(input);
            calls.push({ url, options });
            assert.ok(provider, "Unexpected provider request");
            return provider(url);
        },
    });
    function load(file) {
        const resolved = path.resolve(root, file);
        if (modules.has(resolved)) return modules.get(resolved);
        const exports = {};
        modules.set(resolved, exports);
        if (!compiled.has(resolved)) {
            const source = fs.readFileSync(resolved, "utf8");
            compiled.set(resolved, ts.transpileModule(source, {
                compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017, esModuleInterop: true },
            }).outputText);
        }
        const require = (name) => {
            if (name === "server-only") return {};
            if (name === "next-auth") return { getServerSession: async () => session };
            if (name === "@/app/api/auth/[...nextauth]/route") return { authOptions: {} };
            if (name === "@/libs/connectDB") return { connectDB: async () => {} };
            if (name === "@/models/StockPortfolio") return model;
            if (name.startsWith("@/")) return load(name.slice(2) + ".ts");
            if (name.startsWith(".")) return load(path.resolve(path.dirname(resolved), name + ".ts"));
            return nativeRequire(name);
        };
        const execute = vm.runInContext("(function (exports, require) {" + compiled.get(resolved) + "\n})", context);
        execute(exports, require);
        return exports;
    }

    const route = load("app/api/updateWatchlists/route.ts");
    const request = (endpoint, method, body) => new Request("http://localhost/api/" + endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    return {
        calls,
        writes,
        load,
        get: (ticker) => route.GET(new Request("http://localhost/api/updateWatchlists?" + new URLSearchParams({ ticker }))),
        post: () => route.POST(request("updateWatchlists", "POST", { portfolioId, stockId })),
        edit: (payload) => load("app/api/watchlists/route.ts").PATCH(request("watchlists", "PATCH", {
            name: "Watchlist", payload: { _id: stockId, ...payload },
        })),
    };
}

const listings = [
    { ticker: "NVDA", base: "/stocks/nvda/", header: "NASDAQ: NVDA · Real-Time Price · USD", price: "150.25", currency: "USD", report: "USD", usd: 150.25, epsUsd: 2 },
    { ticker: "SAN", base: "/stocks/san/", header: "NYSE: SAN · Real-Time Price · USD", price: "11.50", currency: "USD", report: "EUR", usd: 11.5, epsUsd: 2.4 },
    { ticker: "BME:SAN", base: "/quote/bme/SAN/", header: "Spain · Delayed Price · Currency is EUR", price: "10.50", currency: "EUR", report: "EUR", usd: 12.6, epsUsd: 2.4 },
    { ticker: "CPH:JYSK", base: "/quote/cph/JYSK/", header: "Denmark · Delayed Price · Currency is DKK", price: "1,050.00", currency: "DKK", report: "DKK", usd: 168, epsUsd: 0.32 },
    { ticker: "LON:HSBA", base: "/quote/lon/HSBA/", header: "United Kingdom · Delayed Price · Currency is GBP · Price in GBX", price: "1,200.00", currency: "GBX", report: "USD", usd: 18, epsUsd: 2 },
];

function marketPage(ticker, body) {
    return `<!DOCTYPE html><title>Issuer (${ticker})</title><main>${body}</main>`;
}

function stockProvider(stock, override) {
    return (url) => {
        const response = override?.(url);
        if (response) return response;
        if (url.hostname === "finviz.com") {
            assert.equal(url.searchParams.get("t"), stock.ticker);
            return new Response("<table><tr><td>Index</td><td>S&P</td><td>EPS next 5Y</td><td>15%</td></tr></table>");
        }
        if (url.hostname === "www.ecb.europa.eu") {
            return new Response(`<Envelope xmlns="http://www.ecb.int/vocabulary/2002-08-01/eurofxref"><Cube>
                <Cube time="2026-11-23"><Cube currency="USD" rate="1.25"/><Cube currency="GBP" rate="1"/></Cube>
                <Cube time="2026-11-20"><Cube currency="USD" rate="1.20"/><Cube currency="DKK" rate="7.5"/><Cube currency="GBP" rate="0.80"/></Cube>
                <Cube time="2026-10-15"><Cube currency="USD" rate="1.10"/><Cube currency="GBP" rate="0.88"/></Cube>
            </Cube></Envelope>`);
        }
        if (url.hostname === "data-api.ecb.europa.eu") {
            assert.equal(url.searchParams.get("startPeriod"), "2025-12-20");
            assert.equal(url.searchParams.get("endPeriod"), "2026-12-31");
            return new Response("CURRENCY,TIME_PERIOD,OBS_VALUE\nUSD,2026-03-20,1.05\nDKK,2026-03-20,7.5\nUSD,2026-03-23,1.35\nDKK,2026-03-23,7.5");
        }

        assert.equal(url.hostname, "stockanalysis.com");
        assert.ok(url.pathname.startsWith(stock.base), url.pathname);
        const section = url.pathname.slice(stock.base.length);
        if (!section) {
            const target = stock.currency === "GBX" ? "" : "<tr><td>Price Target</td><td>160 (+12%)</td></tr>";
            const dividend = stock.currency === "DKK" ? "25.00" : stock.currency === "GBX" ? "0.56" : "1.00";
            return new Response(marketPage(stock.ticker, `
                <h1>Issuer (${stock.ticker})</h1><div>${stock.header}</div>
                <div><div class="text-4xl font-bold transition-colors duration-300 inline-block">${stock.price}</div>
                    <div>Nov 22, 2026, 5:00 PM CET</div></div>
                <nav><a href="${stock.base}financials/">Financials</a><a href="${stock.base}forecast/">Forecast</a>
                    <a href="${stock.base}dividend/">Dividends</a></nav>
                <table>${target}<tr><td>Dividend</td><td>${dividend} (2.34%)</td></tr></table>
            `));
        }
        if (section === "financials/ratios/") {
            return new Response(marketPage(stock.ticker, `<h1>Ratios and Metrics</h1><table>
                <thead><tr><th>Fiscal Year</th><th>Current</th><th>FY 2025</th><th>FY 2024</th><th>FY 2023</th><th>FY 2022</th><th>FY 2021</th></tr></thead>
                <tbody><tr><td>Forward PE Ratio</td><td>20</td><td>50</td></tr>
                <tr><td>PE Ratio</td><td>30</td><td>9.9</td><td>6.2</td><td>5.4</td><td>8.0</td><td>7.6</td></tr></tbody>
            </table>`));
        }
        if (section === "financials/income-statement/") {
            return new Response(marketPage(stock.ticker, `<h1>Income Statement</h1>
                <div>Financials in millions ${stock.report}. Fiscal year is January - December.</div>
                <table><thead><tr><th>Fiscal Year</th><th title="Trailing twelve month period ending Sep 30, 2026">TTM</th><th>FY 2025</th></tr></thead>
                <tbody><tr><td>EPS (Basic)</td><td>2.12</td></tr><tr><td>EPS (Diluted)</td><td>2.00</td><td>1.75</td></tr></tbody></table>`));
        }
        if (section === "statistics/") {
            const forecast = stock.ticker === "LON:HSBA" ? ["5Y", "0%"] : ["3Y", "8.52%"];
            return new Response(marketPage(stock.ticker, `<h1>Statistics</h1><table>
                <tr><td>EPS Growth Forecast (${forecast[0]})</td><td>${forecast[1]}</td></tr></table>`));
        }
        if (section === "forecast/") {
            return new Response(marketPage(stock.ticker, "<h1>Stock Forecast</h1><div>Price Target: <span>1,500p (+25%)</span></div>"));
        }
        if (section === "dividend/") {
            const rows = stock.currency === "GBX"
                ? '<p>Issuer has an annual dividend of £0.56 per share, with a yield of 4.6%.</p><table><thead><tr><th>Ex-Dividend Date</th><th>Cash Amount</th><th>Record Date</th><th>Pay Date</th></tr></thead><tbody><tr><td>Nov 5, 2026</td><td>£0.08</td><td>Nov 6, 2026</td><td>Dec 17, 2026</td></tr><tr><td>Sep 5, 2026</td><td>£0.08</td><td>Sep 6, 2026</td><td>Oct 15, 2026</td></tr></tbody></table>'
                : stock.currency === "DKK"
                    ? '<p>Issuer has an annual dividend of 25 DKK per share, with a yield of 2.34%.</p><table><thead><tr><th>Cash Amount</th><th>Pay Date</th></tr></thead><tbody><tr><td>25.00</td><td>Mar 22, 2026</td></tr></tbody></table>'
                    : "";
            return new Response(marketPage(stock.ticker, "<h1>Dividend Information</h1>" + rows));
        }
        assert.fail("Unexpected Stock Analysis path: " + url.pathname);
    };
}

function closeTo(actual, expected) {
    assert.ok(typeof actual === "number" && Math.abs(actual - expected) < 1e-9, `Expected ${expected}, received ${actual}`);
}

for (const listing of listings) {
    test(`Stock Analysis refresh parses and converts ${listing.ticker}`, async () => {
        const f = fixture({ provider: stockProvider(listing) });
        const response = await f.get("  " + listing.ticker.toLowerCase() + "  ");
        assert.equal(response.status, 200);
        const stock = await response.json();
        assert.equal(stock.ticker, listing.ticker);
        assert.equal(f.calls[0].url.pathname, listing.base);
        assert.equal(stock.quote.currency, listing.currency);
        assert.equal(stock.quote.asOf, "2026-11-22");
        closeTo(stock.quote.usd, listing.usd);
        assert.equal(stock.eps.currency, listing.report);
        assert.equal(stock.eps.asOf, "2026-09-30");
        closeTo(stock.eps.usd, listing.epsUsd);
        assert.deepEqual(stock.peRatios, [9.9, 6.2, 5.4, 8, 7.6]);
        assert.equal(f.calls.filter(({ url }) => url.hostname === "finviz.com").length, listing.base.startsWith("/stocks/") ? 1 : 0);
        assert.equal(f.calls.filter(({ url }) => url.hostname === "www.ecb.europa.eu").length, listing.ticker === "NVDA" ? 0 : 1);

        if (listing.currency === "USD") {
            assert.equal(stock.quote.fx, null);
            assert.deepEqual(stock.growthForecast, { percent: 15, source: "finviz" });
        } else {
            assert.equal(stock.quote.fx.date, "2026-11-20");
        }
        if (listing.ticker === "CPH:JYSK") {
            assert.equal(stock.quote.amount, 1050);
            assert.equal(stock.growthForecast, null);
            assert.ok(stock.issues.some(issue => issue.code === "MISSING_DATA"));
            assert.equal(stock.dividendYield, 2.34);
            closeTo(stock.annualDividend.usd, 4);
            closeTo(stock.lastPaidDividend.usd, 3.5);
            assert.equal(stock.lastPaidDividend.fx.date, "2026-03-20");
        }
        if (listing.ticker === "LON:HSBA") {
            assert.equal(stock.analystTarget.currency, "GBX");
            closeTo(stock.analystTarget.usd, 22.5);
            assert.equal(stock.upside, 25);
            assert.equal(stock.annualDividend.currency, "GBP");
            assert.equal(stock.dividendYield, 4.6);
            closeTo(stock.annualDividend.usd, 0.84);
            closeTo(stock.lastPaidDividend.usd, 0.1);
            assert.equal(stock.lastPaidDividend.asOf, "2026-10-15");
            assert.equal(stock.growthForecast.percent, 0);
        }
    });
}

test("authentication and malformed ticker checks precede provider calls", async () => {
    const unauthenticated = fixture({ session: null });
    assert.equal((await unauthenticated.get("NVDA")).status, 401);
    assert.equal((await unauthenticated.post()).status, 401);

    const f = fixture();
    for (const ticker of ["", " /SAN", "BME:", "BME:SAN:TEST", "LON/HSBA", "A?b=x"]) {
        const response = await f.get(ticker);
        assert.equal(response.status, 400, ticker);
        assert.equal((await response.json()).code, "INVALID_TICKER");
    }
    assert.equal(f.calls.length, 0);
});

test("missing listings, HTTP failures, and parse errors have distinct codes", async () => {
    for (const [provider, status, code] of [
        [() => new Response("<main>Page Not Found - 404</main>", { status: 404 }), 404, "LISTING_NOT_FOUND"],
        [() => new Response("", { status: 429 }), 502, "HTTP_ERROR"],
        [() => new Response("<main><h1>Not the requested listing</h1></main>"), 502, "PARSE_ERROR"],
        [() => new Response(marketPage("NVDA", '<h1>Issuer (NVDA)</h1><div class="text-4xl font-bold transition-colors duration-300">Unexpected text</div>')), 502, "PARSE_ERROR"],
        [() => new Response(marketPage("NVDA", '<h1>Issuer (NVDA)</h1><div class="text-4xl font-bold transition-colors duration-300">—</div>')), 422, "MISSING_DATA"],
    ]) {
        const f = fixture({ provider });
        const response = await f.get("NVDA");
        assert.equal(response.status, status);
        assert.equal((await response.json()).code, code);
    }
});

test("missing FX and optional pages preserve the source amount and dimensionless metrics", async () => {
    const listing = listings.find(item => item.ticker === "CPH:JYSK");
    const f = fixture({ provider: stockProvider(listing, url => {
        if (url.hostname === "www.ecb.europa.eu") return new Response("", { status: 503 });
        if (url.pathname.endsWith("/income-statement/")) return new Response("", { status: 404 });
        if (url.pathname.endsWith("/financials/")) return new Response(marketPage(listing.ticker, "<h1>Financials</h1>"));
    }) });
    const response = await f.get(listing.ticker);
    assert.equal(response.status, 200);
    const data = await response.json();
    assert.equal(data.quote.amount, 1050);
    assert.equal(data.quote.currency, "DKK");
    assert.equal(data.quote.usd, null);
    assert.equal(data.quote.fx, null);
    assert.equal(data.eps, null);
    assert.equal(data.dividendYield, 2.34);
    assert.deepEqual(data.peRatios, [9.9, 6.2, 5.4, 8, 7.6]);
    assert.ok(data.issues.some(issue => issue.code === "FX_UNAVAILABLE"));
    assert.ok(data.issues.some(issue => issue.code === "MISSING_DATA"));
});

test("a partial refresh saves the original and USD price and preserves manual data", async () => {
    const listing = listings.find(item => item.ticker === "CPH:JYSK");
    const savedStock = {
        _id: stockId, ticker: "cph:jysk", updatedAt: "2026-11-24T12:00:00Z",
        growthForecast: 4, growthForecastSource: "manual", info: "My notes", targetPrice: 150, owned: true,
    };
    const f = fixture({ provider: stockProvider(listing), savedStock });
    const response = await f.post();
    assert.equal(response.status, 200);
    const { stock } = await response.json();
    assert.equal(stock.ticker, "CPH:JYSK");
    assert.equal(stock.rate, 168);
    assert.equal(stock.quoteOriginal.amount, 1050);
    assert.equal(stock.quoteOriginal.currency, "DKK");
    assert.equal(stock.quoteOriginal.fx.date, "2026-11-20");
    assert.equal(stock.growthForecast, 4);
    assert.equal(stock.growthForecastSource, "manual");
    assert.equal(stock.targetPrice, 150);
    assert.equal(stock.info, "My notes");
    assert.equal(stock.owned, true);
    assert.equal(f.writes.length, 1);
    assert.equal(f.writes[0].filter.watchList.$elemMatch.updatedAt, savedStock.updatedAt);

    const conflict = fixture({ provider: stockProvider(listing), savedStock, changedDuringRefresh: true });
    assert.equal((await conflict.post()).status, 409);
});

test("manual edits set provenance only for the fields actually changed", async () => {
    const f = fixture({ savedStock: { _id: stockId, ticker: "LON:HSBA" } });
    assert.equal((await f.edit({ info: "Notes", targetPrice: 12.5 })).status, 200);
    assert.deepEqual(JSON.parse(JSON.stringify(f.writes[0].update.$set)), {
        "watchList.$.info": "Notes",
        "watchList.$.targetPrice": 12.5,
    });
    assert.equal((await f.edit({ dilutedEps: 0.8, growthForecast: 0 })).status, 200);
    const fields = f.writes[1].update.$set;
    assert.equal(fields["watchList.$.epsOriginal"].currency, "USD");
    assert.equal(fields["watchList.$.epsOriginal"].source, "manual");
    assert.equal(fields["watchList.$.growthForecastSource"], "manual");
});

test("the valuation uses verified USD fields and accepts an explicit zero growth forecast", () => {
    const { calcSafetyMargin, getStockPriceUsd, getStockEpsUsd } = fixture().load("utils/stockCalculations.ts");
    const legacy = { ticker: "CPH:JYSK", rate: 100, dilutedEps: 5, growthForecast: 0, peRatio: "20;20", peRatioAverage: 20 };
    assert.equal(getStockPriceUsd(legacy), null);
    assert.equal(getStockPriceUsd({ ...legacy, ticker: "NVDA" }), 100);
    assert.equal(getStockEpsUsd(legacy), null);
    assert.equal(calcSafetyMargin(legacy, 10).Fv, "N/A");
    const verified = {
        ...legacy,
        quoteOriginal: { currency: "DKK" },
        epsOriginal: { currency: "DKK" },
        rate: 10,
        dilutedEps: 1.5,
        growthForecastSource: "manual",
    };
    assert.equal(calcSafetyMargin(verified, 10).Fv, "18.63");
    assert.equal(calcSafetyMargin({ ...verified, rate: null }, 10).Fv, "N/A");
});
