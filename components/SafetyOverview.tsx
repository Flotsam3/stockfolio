"use client";

import React from "react";
import { AddStockType, StockData } from "@/types/types";
import { calcSafetyMargin } from "@/utils/stockCalculations";
import Link from "next/link";

export default function SafetyOverview({ stockData }: { stockData: StockData }) {
   if (!stockData?.watchList) {
      return null;
   }

   // Calculate safety margins for all stocks
   const stocksWithSafety = stockData.watchList
      .map((stock) => {
         const safetyData = calcSafetyMargin(stock, stockData.anualTargetReturn);
         return {
            ...stock,
            safetyMargin: safetyData?.safetyMargin || "N/A",
            safetyNumeric: safetyData?.safetyMargin === "N/A" ? -Infinity : parseFloat(safetyData?.safetyMargin || "0"),
         };
      })
      .sort((a, b) => b.safetyNumeric - a.safetyNumeric);

   const top3 = stocksWithSafety.slice(0, 3);
   const bottom3 = stocksWithSafety.slice(-3).reverse();

   const StockRow = ({ stock, index, isTop }: { stock: any; index: number; isTop: boolean }) => (
      <div className="flex justify-between items-center py-2 px-3 hover:bg-gray-50 rounded transition-colors">
         <div className="flex items-center gap-3 flex-1">
            <span className="text-gray-500 font-medium w-6">{isTop ? index + 1 : stocksWithSafety.length - index}</span>
            <Link href={`/details/${stock.ticker}?name=${stock.name}`} className="hover:underline">
               <div>
                  <p className="font-bold text-sm">{stock.ticker}</p>
                  <p className="text-xs text-gray-600 truncate max-w-[150px]">{stock.name}</p>
               </div>
            </Link>
         </div>
         <span
            className={`font-bold text-sm ${
               stock.safetyMargin === "N/A" ? "text-red-500" : "text-green-600"
            }`}
         >
            {stock.safetyMargin === "N/A" ? "N/A" : `${(parseFloat(stock.safetyMargin) * 100).toFixed(0)}%`}
         </span>
      </div>
   );

   return (
      <div className="bg-white rounded-xl p-5 shadow-md w-full max-w-sm">
         <h3 className="text-lg font-bold text-center mb-4 text-gray-800">Safety Overview</h3>
         
         {/* Top 3 */}
         <div className="mb-5">
            <div className="flex items-center gap-2 mb-2">
               <h4 className="font-semibold text-green-600">Top 3 Performers</h4>
            </div>
            <div className="space-y-1">
               {top3.map((stock, index) => (
                  <StockRow key={stock.isin} stock={stock} index={index} isTop={true} />
               ))}
            </div>
         </div>

         {/* Divider */}
         <div className="border-t border-gray-200 my-4"></div>

         {/* Bottom 3 */}
         <div>
            <div className="flex items-center gap-2 mb-2">
               <h4 className="font-semibold text-red-600">Bottom 3 Performers</h4>
            </div>
            <div className="space-y-1">
               {bottom3.map((stock, index) => (
                  <StockRow key={stock.isin} stock={stock} index={index} isTop={false} />
               ))}
            </div>
         </div>
      </div>
   );
}