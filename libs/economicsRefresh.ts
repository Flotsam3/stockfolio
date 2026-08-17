import "server-only";

import { getCpi, getInflation, getInterest, getUnemployment } from "@/libs/api";
import type { EconomicEntry, EconomicsType } from "@/types/types";

const API_REQUEST_DELAY_MS = 1100;

function delay(ms: number) {
   return new Promise((resolve) => setTimeout(resolve, ms));
}

function getEntries(response: unknown, label: string): EconomicEntry[] {
   if (
      typeof response !== "object" ||
      response === null ||
      !("data" in response) ||
      !Array.isArray(response.data)
   ) {
      throw new Error(`Invalid ${label} data format`);
   }

   return response.data as EconomicEntry[];
}

function normalizeEntry(entry: EconomicEntry, label: string) {
   const value = Number(entry.value);
   const date = new Date(String(entry.date ?? ""));

   if (!Number.isFinite(value) || Number.isNaN(date.getTime())) {
      throw new Error(`Invalid ${label} entry`);
   }

   return { value, date };
}

function firstTwo(entries: EconomicEntry[], label: string) {
   if (entries.length < 2) {
      throw new Error(`${label} data needs at least two entries`);
   }

   return entries.slice(0, 2).map((entry) => normalizeEntry(entry, label));
}

function processCpi(entries: EconomicEntry[]) {
   const data = entries.slice(0, 12);
   if (data.length < 12) {
      throw new Error("CPI data needs at least twelve entries");
   }

   const latest = normalizeEntry(data[0], "CPI");
   const previousMonth = normalizeEntry(data[1], "CPI");
   const previousYear = normalizeEntry(data.at(-1)!, "CPI");

   if (previousMonth.value === 0 || previousYear.value === 0) {
      throw new Error("CPI comparison value cannot be zero");
   }

   return [
      {
         value: ((latest.value - previousMonth.value) / previousMonth.value) * 100,
         date: latest.date,
      },
      {
         value: ((latest.value - previousYear.value) / previousYear.value) * 100,
         date: previousYear.date,
      },
   ];
}

export async function fetchLatestEconomics(): Promise<EconomicsType> {
   const inflationResponse = await getInflation();
   await delay(API_REQUEST_DELAY_MS);

   const cpiResponse = await getCpi();
   await delay(API_REQUEST_DELAY_MS);

   const interestResponse = await getInterest();
   await delay(API_REQUEST_DELAY_MS);

   const unemploymentResponse = await getUnemployment();

   return {
      inflation: firstTwo(getEntries(inflationResponse, "inflation"), "Inflation"),
      cpi: processCpi(getEntries(cpiResponse, "CPI")),
      interest: firstTwo(getEntries(interestResponse, "interest"), "Interest"),
      unemployment: firstTwo(getEntries(unemploymentResponse, "unemployment"), "Unemployment"),
   };
}
