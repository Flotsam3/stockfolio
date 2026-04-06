"use client";

import Economics from "@/components/economics/Economics";
import AddStock from "@/components/stock/AddStock";
import WatchListSection from "./WatchListSection";
import AddWatchList from "@/components/watchlist/AddWatchList";
import { StockData } from "@/types/types";
import { useState, Suspense } from "react";
import { EconomicsType } from "@/types/types";
import { useStockContext } from "@/context/StockContext";
import SafetyOverview from "@/components/stock/SafetyOverview";

export default function DashboardClient() {
   const { stockData, setStockData, showAddWatchlist, setShowAddWatchlist } = useStockContext();

   const [economics, setEconomics] = useState<EconomicsType>({
      inflation: [{ value: 0 }],
      cpi: [{ value: 0 }],
      unemployment: [{ value: 0 }],
      interest: [{ value: 0 }],
   });

   const [portfolioNames, setPortfolioNames] = useState<StockData[]>([]);
   const [targetReturn, setTargetReturn] = useState(12);

   console.log({ portfolioNames, stockData });

   return (
      <>
         <div className="relative flex-1 bg-cover bg-center h-[100vh] bg-[url('/images/feature-bg.png')]">
            <section className="absolute top-28 left-5 right-5">
               <div className="flex justify-center items-start gap-5">
                  {/* Left side */}
                  <div className="flex flex-col gap-5 flex-1">
                     <Economics economics={economics} setEconomics={setEconomics} targetReturn={targetReturn} activeStock={stockData?.name || ""} setStockData={setStockData} />
                     <AddWatchList portfolioNames={portfolioNames} setPortfolioNames={setPortfolioNames} setStockData={setStockData} />
                  </div>

                  {/* Center - Safety Overview */}
                  {stockData?.watchList && stockData.watchList.length > 3 && (
                     <div className="flex justify-center flex-1">
                        <SafetyOverview stockData={stockData} />
                     </div>
                  )}

                  {/* Right side */}
                  <div className="hidden md:block flex-1">
                     <AddStock setStockData={setStockData} stockData={stockData} />
                  </div>
               </div>
            </section>
            {showAddWatchlist && (
               <div className="absolute top-0 left-0 right-0 flex justify-center items-center md:hidden h-[90vh] bg-white">
                  <span onClick={() => setShowAddWatchlist(false)} className="absolute top-28 right-5 text-2xl cursor-pointer">
                     x
                  </span>
                  <AddStock setStockData={setStockData} stockData={stockData} />
               </div>
            )}
         </div>
         <WatchListSection setStockData={setStockData} setPortfolioNames={setPortfolioNames} />
      </>
   );
}
