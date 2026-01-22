import { AddStockType } from "@/types/types";

export function calcSafetyMargin(obj: AddStockType, anualTargetReturn: number) {
   if (!obj.peRatioAverage) return null;

   const profitPerShare5y = obj.dilutedEps * (1 + obj.growthForecast / 100) ** 5;
   const ratePerStock5y = profitPerShare5y * obj.peRatioAverage;
   const fundamentalValue = ratePerStock5y / (1 + anualTargetReturn / 100) ** 5;
   let safetyMargin = -(obj.rate / fundamentalValue - 1);
   const Fv = fundamentalValue.toFixed(2);
   
   if (safetyMargin < 0) return { safetyMargin: "N/A", Fv };
   
   return { safetyMargin: safetyMargin.toFixed(2), Fv };
}