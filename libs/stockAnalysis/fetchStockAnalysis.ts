import "server-only";
import { JSDOM } from "jsdom";
import { convertAmountsToUsd } from "@/libs/exchangeRates";
import type { GrowthForecast, SourceAmount, StockAnalysisData, StockRefreshIssue } from "@/types/stockAnalysis";
import { parseStockTicker } from "@/utils/stockTicker";
import {
   parseDilutedEps,
   parseDividends,
   parseForecastTarget,
   parseGrowthForecast,
   parseOverview,
   parsePeRatios,
} from "./parsers";

const origin = "https://stockanalysis.com";
type Listing = NonNullable<ReturnType<typeof parseStockTicker>>;
type ErrorCode = StockRefreshIssue["code"] | "INVALID_TICKER" | "LISTING_NOT_FOUND";

export class StockAnalysisError extends Error {
   constructor(readonly code: ErrorCode, message: string, readonly status: number) {
      super(message);
   }
}

async function readHtml(url: string | URL, label: string, listing?: Listing, headers?: HeadersInit) {
   const signal = AbortSignal.timeout(7_000);
   try {
      const response = await fetch(url, { cache: "no-store", signal, headers });
      if (response.status === 404) {
         if (listing) throw new StockAnalysisError("LISTING_NOT_FOUND", `Stock Analysis could not find ${listing.ticker}.`, 404);
         throw new StockAnalysisError("MISSING_DATA", `The ${label} page is unavailable.`, 422);
      }
      if (!response.ok) {
         throw new StockAnalysisError("HTTP_ERROR", `Could not load ${label} (HTTP ${response.status}).`, 502);
      }
      if (response.redirected) {
         const expected = new URL(url);
         const actual = new URL(response.url);
         if (actual.origin !== expected.origin || actual.pathname.toLowerCase() !== expected.pathname.toLowerCase()) {
            throw new StockAnalysisError("PARSE_ERROR", `The ${label} request returned a different page.`, 502);
         }
      }
      return await response.text();
   } catch (error) {
      if (error instanceof StockAnalysisError) throw error;
      if (signal.aborted) throw new StockAnalysisError("TIMEOUT", `The ${label} request timed out.`, 504);
      throw new StockAnalysisError("HTTP_ERROR", `Could not load ${label}.`, 502);
   }
}

async function readStockPage<T>(stock: Listing, subpath: string, label: string, parse: (main: HTMLElement) => T): Promise<T> {
   const html = await readHtml(origin + stock.path + subpath, label, subpath ? undefined : stock);
   const { window } = new JSDOM(html);
   try {
      const main = window.document.querySelector("main");
      const heading = main?.querySelector("h1")?.textContent?.trim();
      const title = window.document.title.toUpperCase();
      if (!main || !heading || !title.includes(`(${stock.ticker})`) && !heading.toUpperCase().endsWith(`(${stock.ticker})`)) {
         throw new StockAnalysisError("PARSE_ERROR", `Could not recognize the listing on ${label}.`, 502);
      }
      return parse(main);
   } finally {
      window.close();
   }
}

async function readFinvizGrowth(symbol: string) {
   const url = new URL("https://finviz.com/quote.ashx");
   url.search = new URLSearchParams({ t: symbol, p: "d" }).toString();
   const html = await readHtml(url, "Finviz growth forecast", undefined, {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
   });
   const { window } = new JSDOM(html);
   try {
      return parseGrowthForecast(window.document, "EPS next 5Y");
   } finally {
      window.close();
   }
}

export async function fetchStockAnalysis(ticker: string): Promise<StockAnalysisData> {
   const listing = parseStockTicker(ticker);
   if (!listing) {
      throw new StockAnalysisError("INVALID_TICKER", "Enter a ticker such as NVDA or CPH:JYSK.", 400);
   }
   const stock = listing;

   const overview = await readStockPage(stock, "", "the Stock Analysis overview", parseOverview);
   if (!overview.quote) {
      if (overview.priceText !== undefined && /^(?:N\/A|[-–—])?$/i.test(overview.priceText)) {
         throw new StockAnalysisError("MISSING_DATA", "The listing has no usable quote.", 422);
      }
      throw new StockAnalysisError("PARSE_ERROR", "Could not read the price on the Stock Analysis overview.", 502);
   }

   const issues: StockRefreshIssue[] = [];
   async function optional<T>(read: () => Promise<T>, fallback: T) {
      try {
         return await read();
      } catch (error) {
         if (!(error instanceof StockAnalysisError) || error.code === "INVALID_TICKER" || error.code === "LISTING_NOT_FOUND") throw error;
         issues.push({ code: error.code, message: error.message });
         return fallback;
      }
   }

   async function readGrowth(): Promise<GrowthForecast | null> {
      if (!stock.exchange) {
         // Keep the existing Finviz source for the identical US listing.
         const percent = await optional(() => readFinvizGrowth(stock.symbol), null);
         if (percent !== null) return { percent, source: "finviz" };
      }
      const percent = await optional(() => readStockPage(stock, "statistics/", "Stock Analysis statistics",
         main => parseGrowthForecast(main, "EPS Growth Forecast (5Y)")), null);
      return percent === null ? null : { percent, source: "stockanalysis" };
   }

   async function readEps() {
      const eps = await optional(() => readStockPage(stock, "financials/income-statement/", "the income statement", parseDilutedEps), null);
      if (eps || !overview.links.has("Financials")) return eps;
      return optional(() => readStockPage(stock, "financials/", "the financial overview", parseDilutedEps), null);
   }

   const today = new Date().toISOString().slice(0, 10);
   const [peRatios, eps, growthForecast, target, dividends] = await Promise.all([
      optional(() => readStockPage(stock, "financials/ratios/", "historical P/E ratios", parsePeRatios), []),
      readEps(),
      readGrowth(),
      overview.target.value || !overview.links.has("Forecast")
         ? overview.target
         : optional(() => readStockPage(stock, "forecast/", "the analyst forecast",
            main => parseForecastTarget(main, overview.priceCurrency, overview.quoteDate)), overview.target),
      overview.links.has("Dividends")
         ? optional(() => readStockPage(stock, "dividend/", "the dividend page",
            main => parseDividends(main, overview.baseCurrency, overview.quoteDate, today)), null)
         : null,
   ]);

   const currentDate = overview.quoteDate && overview.quoteDate < today ? overview.quoteDate : today;
   const lastPaidDividend = dividends?.lastPaid ?? null;
   const series = [
      { original: overview.quote, on: currentDate, label: "stock price" },
      { original: eps, on: currentDate, label: "diluted EPS" },
      { original: target.value, on: currentDate, label: "analyst price target" },
      { original: dividends?.annual ?? overview.dividend.value, on: currentDate, label: "annual dividend" },
      { original: lastPaidDividend, on: lastPaidDividend?.asOf ?? currentDate, label: "last paid dividend" },
   ] satisfies { original: SourceAmount | null; on: string; label: string }[];
   const [quote, dilutedEps, analystTarget, annualDividend, paidDividend] = await convertAmountsToUsd(series, today);
   if (!quote) throw new StockAnalysisError("PARSE_ERROR", "Could not prepare the stock price.", 502);

   const unconverted = [quote, dilutedEps, analystTarget, annualDividend, paidDividend].flatMap((amount, index) => {
      if (!amount || amount.usd !== null) return [];
      const label = series[index].label;
      return amount.currency ? [`${label} (${amount.currency})`] : [`${label} (source currency unknown)`];
   });
   if (unconverted.length > 0) {
      issues.push({ code: "FX_UNAVAILABLE", message: `USD conversion unavailable for ${unconverted.join(", ")}.` });
   }
   if (peRatios.length < 5) issues.push({ code: "MISSING_DATA", message: "Fewer than five annual P/E ratios are available." });
   if (eps === null) issues.push({ code: "MISSING_DATA", message: "Stock Analysis did not provide diluted EPS (TTM)." });
   if (growthForecast === null) issues.push({ code: "MISSING_DATA", message: "A five-year EPS growth forecast is unavailable from the data sources." });

   return {
      ticker: stock.ticker,
      quote,
      eps: dilutedEps,
      peRatios,
      growthForecast,
      analystTarget,
      upside: target.percent,
      annualDividend,
      dividendYield: dividends?.yieldPercent ?? overview.dividend.percent,
      lastPaidDividend: paidDividend,
      issues,
   };
}
