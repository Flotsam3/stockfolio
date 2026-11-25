import "server-only";
import { JSDOM } from "jsdom";
import { DateTime } from "luxon";
import type { AmountInUsd, ExchangeRate, SourceAmount } from "@/types/stockAnalysis";

type RateTable = Map<string, Map<string, number>>;

type Conversion = {
   original: SourceAmount | null;
   on: string;
};

const recentRatesUrl = "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist-90d.xml";
const historicalRatesUrl = "https://data-api.ecb.europa.eu/service/data/EXR/D..EUR.SP00.A";

function addRate(table: RateTable, day: string, currency: string, value: string) {
   const rate = Number(value);
   if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !/^[A-Z]{3}$/.test(currency) || !Number.isFinite(rate) || rate <= 0) return;
   let rates = table.get(day);
   if (!rates) {
      rates = new Map();
      table.set(day, rates);
   }
   rates.set(currency, rate);
}

function parseXml(text: string): RateTable {
   const table: RateTable = new Map();
   const { window } = new JSDOM(text, { contentType: "text/xml" });
   try {
      for (const day of window.document.querySelectorAll("Cube[time]")) {
         for (const rate of day.querySelectorAll("Cube[currency][rate]")) {
            addRate(table, day.getAttribute("time") ?? "", rate.getAttribute("currency") ?? "", rate.getAttribute("rate") ?? "");
         }
      }
      return table;
   } finally {
      window.close();
   }
}

function parseCsv(text: string): RateTable {
   const table: RateTable = new Map();
   const [firstLine, ...lines] = text.trim().split(/\r?\n/);
   const headers = firstLine.split(",");
   const currencyIndex = headers.indexOf("CURRENCY");
   const dateIndex = headers.indexOf("TIME_PERIOD");
   const valueIndex = headers.indexOf("OBS_VALUE");
   if ([currencyIndex, dateIndex, valueIndex].includes(-1)) return table;
   for (const line of lines) {
      const values = line.split(",");
      addRate(table, values[dateIndex] ?? "", values[currencyIndex] ?? "", values[valueIndex] ?? "");
   }
   return table;
}

async function loadRates(url: string, parse: (text: string) => RateTable, revalidate: number): Promise<RateTable> {
   try {
      const response = await fetch(url, { next: { revalidate }, signal: AbortSignal.timeout(7_000) });
      if (response.ok) return parse(await response.text());
   } catch {
      // Market data can still be saved in its original currency.
   }
   return new Map();
}

function loadHistoricalRates(year: string) {
   const url = new URL(historicalRatesUrl);
   // Include the preceding December so early January can use the last published rate.
   url.search = new URLSearchParams({
      startPeriod: `${Number(year) - 1}-12-20`,
      endPeriod: `${year}-12-31`,
      detail: "dataonly",
      format: "csvdata",
   }).toString();
   return loadRates(url.toString(), parseCsv, 86_400);
}

function daysBefore(day: string, days: number) {
   return DateTime.fromISO(day, { zone: "utc" }).minus({ days }).toISODate() ?? day;
}

function findRate(table: RateTable | undefined, currency: string, on: string): ExchangeRate | null {
   if (!table) return null;

   const base = currency === "GBX" ? "GBP" : currency;
   const firstDay = daysBefore(on, 7);
   const dates = Array.from(table.keys()).filter(day => day <= on && day >= firstDay).sort().reverse();
   for (const date of dates) {
      // Both legs of the EUR cross rate must come from the same publication date.
      const rates = table.get(date);
      const usdPerEuro = rates?.get("USD");
      const unitsPerEuro = base === "EUR" ? 1 : rates?.get(base);
      if (!usdPerEuro || !unitsPerEuro) continue;
      const usdPerUnit = (usdPerEuro / unitsPerEuro) / (currency === "GBX" ? 100 : 1);
      return { usdPerUnit, date, source: "ECB" };
   }
   return null;
}

export async function convertAmountsToUsd(requests: Conversion[], today: string): Promise<(AmountInUsd | null)[]> {
   const recentCutoff = daysBefore(today, 80);
   const tableKey = (on: string) => on >= recentCutoff ? "recent" : on.slice(0, 4);
   const keys = new Set(requests.flatMap(({ original, on }) =>
      original?.currency && original.currency !== "USD" && on <= today ? [tableKey(on)] : [],
   ));

   const tables = new Map(await Promise.all(Array.from(keys, async key => {
      const rates = key === "recent"
         ? await loadRates(recentRatesUrl, parseXml, 3_600)
         : await loadHistoricalRates(key);
      return [key, rates] as const;
   })));

   return requests.map(({ original, on }) => {
      if (!original) return null;
      const { currency, amount } = original;
      const fx = currency && currency !== "USD" && on <= today ? findRate(tables.get(tableKey(on)), currency, on) : null;
      const usd = currency === "USD" ? amount : fx ? amount * fx.usdPerUnit : null;
      return { ...original, usd, fx };
   });
}
