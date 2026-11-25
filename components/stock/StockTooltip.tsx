import type { AddStockType } from "@/types/types";
import { getStockEpsUsd, getStockGrowthForecast, getStockPriceUsd } from "@/utils/stockCalculations";
import { describeStockAmount, formatUsd } from "@/utils/stockMoney";

interface StockTooltipProps {
   stock: AddStockType;
}

export function StockMarketDetails({ stock }: StockTooltipProps) {
   const price = getStockPriceUsd(stock);
   const eps = getStockEpsUsd(stock);
   const growth = getStockGrowthForecast(stock);
   const priceSource = describeStockAmount(stock.quoteOriginal, price === null ? stock.rate : undefined);
   const epsSource = describeStockAmount(stock.epsOriginal, eps === null ? stock.dilutedEps : undefined);
   const amounts = [
      { label: "Analyst target", value: stock.analystTarget, percent: stock.upside },
      { label: "Annual dividend", value: stock.annualDividend, percent: stock.dividendYield },
      { label: "Last paid dividend", value: stock.lastPaidDividend },
   ];
   const growthSource = {
      manual: "manual",
      stockanalysis: "Stock Analysis",
      finviz: "Finviz",
   };

   return (
      <dl className="mb-2 space-y-1 text-xs">
         {priceSource && <div><dt className="font-medium">Source price</dt><dd>{priceSource}</dd></div>}
         {epsSource && <div><dt className="font-medium">Source diluted EPS</dt><dd>{epsSource}</dd></div>}
         {amounts.map(({ label, value, percent }) => value && (
            <div key={label}>
               <dt className="font-medium">{label}</dt>
               <dd>{formatUsd(value.usd)}{percent != null && ` · ${percent}%`}</dd>
               <dd className="text-gray-500">{describeStockAmount(value)}</dd>
            </div>
         ))}
         {growth !== null && (
            <div>
               <dt className="font-medium">5-year EPS growth</dt>
               <dd>{growth}% · {stock.growthForecastSource ? growthSource[stock.growthForecastSource] : "saved value, source unverified"}</dd>
            </div>
         )}
      </dl>
   );
}

export default function StockTooltip({ stock }: StockTooltipProps) {
   const price = getStockPriceUsd(stock);
   const target = stock.targetPrice;

   return (
      <div
         id={`tooltip-${stock._id ?? stock.ticker}`}
         style={{ display: "none" }}
         className="absolute left-6 top-0 z-50 bg-white text-gray-800 border border-gray-300 rounded shadow-lg p-2 text-xs w-64 max-w-xs"
      >
         {stock.createdAt && (
            <div className="mb-1 text-xs text-gray-500">
               Created: {new Date(stock.createdAt).toLocaleString()}
            </div>
         )}
         {stock.lastDataRefresh && (
            <div className="mb-2 text-xs text-gray-500">
               Last refresh: {new Date(stock.lastDataRefresh).toLocaleString()}
            </div>
         )}
         {target != null && target > 0 && (
            <div className="mb-2 text-xs font-semibold text-blue-600">
               Personal target {formatUsd(target)}
               {price !== null && (
                  <span className={`ml-2 ${price >= target ? "text-green-600" : "text-red-600"}`}>
                     ({price >= target ? "Reached" : `${((target - price) / target * 100).toFixed(1)}% below`})
                  </span>
               )}
            </div>
         )}
         <StockMarketDetails stock={stock} />
         <div>{stock.info || <span className="italic text-gray-400">No info</span>}</div>
      </div>
   );
}
