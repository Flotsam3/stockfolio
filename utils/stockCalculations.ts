import { AddStockType } from "@/types/types";

export function calcSafetyMargin(obj: AddStockType, anualTargetReturn: number) {
   if (!obj.peRatioAverage) return null;

   // Parse the individual PE ratios from the string
   const peRatios = obj.peRatio
      .replace(/,/g, ".")
      .split(";")
      .map((str: string) => parseFloat(str.trim()))
      .filter((num: number) => !isNaN(num));

   // Check if ANY PE ratio is negative (indicates negative earnings)
   const hasNegativePE = peRatios.some((pe: number) => pe < 0);
   
   if (hasNegativePE) {
      return { safetyMargin: "N/A", Fv: "N/A" };
   }

   const profitPerShare5y = obj.dilutedEps * (1 + obj.growthForecast / 100) ** 5;
   const ratePerStock5y = profitPerShare5y * obj.peRatioAverage;
   const fundamentalValue = ratePerStock5y / (1 + anualTargetReturn / 100) ** 5;
   const safetyMargin = -(obj.rate / fundamentalValue - 1);
   const Fv = fundamentalValue.toFixed(2);
   
   if (safetyMargin < 0) return { safetyMargin: "N/A", Fv };
   
   return { safetyMargin: safetyMargin.toFixed(2), Fv };
}