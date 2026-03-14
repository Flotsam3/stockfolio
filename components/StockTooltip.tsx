import React from "react";
import { AddStockType } from "@/types/types";

interface StockTooltipProps {
   stock: AddStockType;
}

export default function StockTooltip({ stock }: StockTooltipProps) {
   return (
      <div
         id={`tooltip-${stock.isin}`}
         style={{ display: "none" }}
         className="absolute left-6 top-0 z-50 bg-white text-gray-800 border border-gray-300 rounded shadow-lg p-2 text-xs w-64 max-w-xs"
      >
         {/* CreatedAt */}
         {stock.createdAt && (
            <div className="mb-1 text-xs text-gray-500">
               Created: {new Date(stock.createdAt).toLocaleString()}
            </div>
         )}
         
         {/* LastDataRefresh */}
         {stock.lastDataRefresh && (
            <div className="mb-2 text-xs text-gray-500">
               Last Refresh: {new Date(stock.lastDataRefresh).toLocaleString()}
            </div>
         )}
         
         {/* Target Price */}
         {stock.targetPrice && stock.targetPrice > 0 && (
            <div className="mb-2 text-xs font-semibold text-blue-600">
               Target Price: ${stock.targetPrice}
               {stock.rate && (
                  <span className={`ml-2 ${stock.rate >= stock.targetPrice ? 'text-green-600' : 'text-red-600'}`}>
                     ({stock.rate >= stock.targetPrice 
                        ? '✓ Reached' 
                        : `${((stock.targetPrice - stock.rate) / stock.targetPrice * 100).toFixed(1)}% below`
                     })
                  </span>
               )}
            </div>
         )}
         
         {/* Info content */}
         <div>
            {stock.info ? (
               stock.info
            ) : (
               <span className="italic text-gray-400">
                  No info
               </span>
            )}
         </div>
      </div>
   );
}