import type { AddStockType } from "@/types/types";
import { parseStockTicker } from "./stockTicker";

export function readSavedPeRatios(peRatio: string) {
   return peRatio.split(";").flatMap(value => {
      const text = value.trim().replace(",", ".");
      const number = Number(text);
      return text && Number.isFinite(number) ? [number] : [];
   });
}

export function averagePeRatios(values: number[]) {
   if (values.length === 0) return null;
   return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2));
}

export function getStockPriceUsd(stock: AddStockType) {
   const listing = parseStockTicker(stock.ticker);
   const legacyUsPrice = listing && !listing.exchange;
   return stock.quoteOriginal || legacyUsPrice ? stock.rate ?? null : null;
}

export function getStockEpsUsd(stock: AddStockType) {
   return stock.epsOriginal ? stock.dilutedEps ?? null : null;
}

export function getStockGrowthForecast(stock: AddStockType) {
   // Older forms used a zero placeholder for an empty forecast.
   return stock.growthForecast === 0 && !stock.growthForecastSource ? null : stock.growthForecast ?? null;
}

export function calcSafetyMargin(stock: AddStockType, anualTargetReturn: number) {
   const price = getStockPriceUsd(stock);
   const eps = getStockEpsUsd(stock);
   const growth = getStockGrowthForecast(stock);
   const pe = stock.peRatioAverage;
   if (price === null || price <= 0 || eps === null || eps <= 0 || growth === null || growth <= -100 ||
      !pe || pe <= 0 || anualTargetReturn <= -100 || readSavedPeRatios(stock.peRatio ?? "").some(value => value < 0)) {
      return { safetyMargin: "N/A", Fv: "N/A" };
   }

   const profitPerShare5y = eps * (1 + growth / 100) ** 5;
   const fundamentalValue = profitPerShare5y * pe / (1 + anualTargetReturn / 100) ** 5;
   if (!Number.isFinite(fundamentalValue) || fundamentalValue <= 0) return { safetyMargin: "N/A", Fv: "N/A" };
   const safetyMargin = -(price / fundamentalValue - 1);
   const Fv = fundamentalValue.toFixed(2);
   
   if (safetyMargin < 0) return { safetyMargin: "N/A", Fv };
   
   return { safetyMargin: safetyMargin.toFixed(2), Fv };
}
