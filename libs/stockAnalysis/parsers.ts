import { DateTime } from "luxon";
import type { SourceAmount } from "@/types/stockAnalysis";

const priceSelector = "div.text-4xl.font-bold.transition-colors.duration-300";
const currencySymbols: Partial<Record<string, string>> = {
   "US$": "USD",
   "HK$": "HKD",
   "CA$": "CAD",
   "A$": "AUD",
   "NZ$": "NZD",
   "S$": "SGD",
   "£": "GBP",
   "€": "EUR",
   p: "GBX",
};

export function parseNumber(input: string | undefined): number | null {
   const value = input?.trim().replace(/^−/, "-");
   if (!value || !/^[+-]?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(value)) return null;
   const number = Number(value.replace(/,/g, ""));
   return Number.isFinite(number) ? number : null;
}

function parsePercent(input: string | undefined) {
   const text = input?.trim();
   return text?.endsWith("%") ? parseNumber(text.slice(0, -1)) : null;
}

export function parseDay(text: string | null | undefined): string | null {
   const iso = text?.match(/\b\d{4}-\d{2}-\d{2}\b/)?.[0];
   if (iso) return DateTime.fromISO(iso).toISODate();
   const day = text?.match(/\b[A-Z][a-z]{2} \d{1,2}, \d{4}\b/)?.[0];
   return day ? DateTime.fromFormat(day, "MMM d, yyyy", { locale: "en-US" }).toISODate() : null;
}

function currencyCode(unit: string | undefined) {
   if (unit === "GBp") return "GBX";
   return unit?.toUpperCase() ?? null;
}

function readCurrency(unit: string | undefined, context: string | null) {
   if (!unit) return context;
   if (/^(?:[A-Z]{3}|GBp)$/.test(unit)) return currencyCode(unit);
   if (context) {
      const currencyPart = new Intl.NumberFormat("en-US", {
         style: "currency",
         currency: context,
         currencyDisplay: "narrowSymbol",
      }).formatToParts(0).find(part => part.type === "currency");
      if (currencyPart?.value === unit) return context;
   }
   return currencySymbols[unit] ?? null;
}

function readAmount(text: string | undefined, localCurrency: string | null, asOf: string | null): SourceAmount | null {
   if (!text) return null;
   const parts = /^([A-Z]{3}|GBp|US\$|HK\$|CA\$|A\$|NZ\$|S\$|kr|[£€¥$])?\s*([+−-]?[\d,.]+)\s*([A-Z]{3}|GBp|p|¢|kr)?$/.exec(text.trim());
   if (!parts) return null;
   const [, prefix, value, suffix] = parts;
   const amount = parseNumber(value);
   if (amount === null) return null;

   const currency = readCurrency(suffix ?? prefix, localCurrency);
   return { amount, currency, asOf, source: "stockanalysis" };
}

function findRow(area: ParentNode, labels: readonly string[]) {
   return Array.from(area.querySelectorAll("tr")).find(row => labels.includes(row.cells[0]?.textContent?.trim() ?? ""));
}

function readValueAndPercent(text: string | undefined, currency: string | null, asOf: string | null) {
   const match = /^(.+?)(?:\s*\(([^()]*)\))?$/.exec(text?.trim() ?? "");
   return { value: readAmount(match?.[1], currency, asOf), percent: parsePercent(match?.[2]) };
}

export function parseOverview(main: HTMLElement) {
   const heading = main.querySelector("h1");
   const marketDescription = heading?.nextElementSibling?.textContent ?? "";
   const baseCurrency = currencyCode(
      marketDescription.match(/\bCurrency is\s+([A-Za-z]{3})\b/)?.[1] ??
      marketDescription.match(/·\s*([A-Z]{3})\s*(?:·|$)/)?.[1],
   );
   const priceCurrency = currencyCode(marketDescription.match(/\bPrice in\s+([A-Za-z]{3})\b/)?.[1]) ?? baseCurrency;
   const price = main.querySelector(priceSelector) ?? main.querySelector("div.block.font-semibold.leading-5.text-faded");
   const quoteDate = parseDay(price?.parentElement?.textContent);
   const priceText = price?.textContent?.trim();
   const quote = readAmount(priceText, priceCurrency, quoteDate);
   const target = readValueAndPercent(findRow(main, ["Price Target"])?.cells[1]?.textContent ?? undefined, priceCurrency, quoteDate);
   const dividend = readValueAndPercent(findRow(main, ["Dividend"])?.cells[1]?.textContent ?? undefined, baseCurrency, quoteDate);
   const links = new Set(Array.from(main.querySelectorAll("nav a"), link => link.textContent?.trim()));
   return { quote, priceText, baseCurrency, priceCurrency, quoteDate, target, dividend, links };
}

export function parsePeRatios(main: HTMLElement) {
   const row = findRow(main, ["PE Ratio", "P/E Ratio"]);
   const periods = row?.closest("table")?.tHead?.rows[0]?.cells;
   if (!row || !periods) return [];

   const years = Array.from(periods).flatMap((cell, index) => {
      const year = /^(?:FY\s+)?(\d{4})$/.exec(cell.textContent?.trim() ?? "")?.[1];
      return year ? [{ year: Number(year), index }] : [];
   }).sort((a, b) => b.year - a.year).slice(0, 5);
   return years.flatMap(({ index }) => {
      const value = parseNumber(row.cells[index]?.textContent ?? undefined);
      return value === null ? [] : [value];
   });
}

export function parseDilutedEps(main: HTMLElement): SourceAmount | null {
   const row = findRow(main, ["EPS (Diluted)", "Earnings Per Share (Diluted)", "Diluted EPS"]);
   const table = row?.closest("table");
   const headings = table?.tHead?.rows[0]?.cells;
   const index = headings ? Array.from(headings).findIndex(cell => cell.textContent?.trim() === "TTM") : -1;
   if (!row || index < 1) return null;

   const declaration = main.textContent?.match(/\bFinancials in\s+(?:(?:thousands|millions|billions|trillions)\s+)?([A-Z]{3})\b/);
   const period = table?.tHead?.rows[1]?.cells[index];
   const date = parseDay(headings?.[index]?.getAttribute("title")) ?? parseDay(period?.id) ?? parseDay(period?.textContent);
   return readAmount(row.cells[index]?.textContent?.trim(), currencyCode(declaration?.[1]), date);
}

export function parseGrowthForecast(area: ParentNode, label: string) {
   const cell = Array.from(area.querySelectorAll("td, th")).find(el => el.textContent?.trim() === label);
   return parsePercent(cell?.nextElementSibling?.textContent ?? undefined);
}

export function parseForecastTarget(main: HTMLElement, unit: string | null, asOf: string | null) {
   const block = Array.from(main.querySelectorAll("div, p")).find(el => {
      const text = el.textContent?.trim() ?? "";
      return text.startsWith("Price Target:") && text.length < 80 && el.childElementCount <= 1;
   });
   return readValueAndPercent(block?.textContent?.replace(/^\s*Price Target:\s*/, ""), unit, asOf);
}

export function parseDividends(main: HTMLElement, currency: string | null, quoteDate: string | null, today: string) {
   const summary = Array.from(main.querySelectorAll("p"), paragraph => paragraph.textContent ?? "")
      .map(text => text.match(/annual dividend of\s+(.+?)\s+per share,\s+with a yield of\s+([+−-]?[\d.,]+%)/i))
      .find(Boolean);
   const annual = readAmount(summary?.[1], currency, quoteDate);
   const yieldPercent = parsePercent(summary?.[2]);
   let lastPaid: SourceAmount | null = null;

   for (const table of main.querySelectorAll("table")) {
      const headers = Array.from(table.tHead?.rows[0]?.cells ?? [], cell => cell.textContent?.trim());
      const paymentIndex = headers.indexOf("Pay Date");
      const amountIndex = headers.indexOf("Cash Amount");
      if (paymentIndex < 0 || amountIndex < 0) continue;

      for (const row of table.tBodies[0]?.rows ?? []) {
         const date = parseDay(row.cells[paymentIndex]?.textContent);
         if (!date || date > today || lastPaid?.asOf && date <= lastPaid.asOf) continue;
         const payment = readAmount(row.cells[amountIndex]?.textContent?.trim(), annual?.currency ?? currency, date);
         if (payment) lastPaid = payment;
      }
   }
   return { annual, yieldPercent, lastPaid };
}
