"use client";

import Image from "next/image";
import Economics from "@/components/Economics";
import AddStock from "@/components/AddStock";
import WatchListPanel from "@/components/WatchListPanel";
import AddWatchList from "@/components/AddWatchList";
import { StockData } from "@/types/types";
import { useEffect, useState } from "react";
import { EconomicsType } from "@/types/types";
import { getStockPortfolio } from "@/api/dashboard";
import { getAllPortfolios } from "@/api/dashboard";
import { useStockContext } from "@/app/context/StockContext";

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
   const [isLoading, setIsLoading] = useState(false);

   useEffect(() => {
      async function getData() {
         try {
            setIsLoading(true);

            const data = await getStockPortfolio();
            if (!data) {
               setIsLoading(false);
               return console.log("No portfolio yet!");
            }

            setStockData(data);

            const portfolios = await getAllPortfolios();
            setIsLoading(false);
            console.log("fetched portfolios!");

            if (!portfolios) return;

            setPortfolioNames(portfolios);
         } catch (error) {
            console.log(error);
         }
      }
      getData();
   }, []);

   console.log({portfolioNames, stockData});

   return (
      <>
         <div className="relative flex-1 bg-cover bg-center h-[100vh] bg-[url('/images/feature-bg.png')]">
            <section className="absolute top-28 left-5 right-5">
               <Economics
                  economics={economics}
                  setEconomics={setEconomics}
                  targetReturn={targetReturn}
                  activeStock={stockData.name}
                  setStockData={setStockData}
               />
               <div className="hidden md:block">
                  <AddStock setStockData={setStockData} stockData={stockData} />
               </div>
               <AddWatchList
                  portfolioNames={portfolioNames}
                  setPortfolioNames={setPortfolioNames}
                  setStockData={setStockData}
               />
            </section>
            {showAddWatchlist && (
               <div className="absolute top-0 left-0 right-0 flex justify-center items-center md:hidden h-[90vh] bg-white">
                  <span
                     onClick={() => setShowAddWatchlist(false)}
                     className="absolute top-28 right-5 text-2xl cursor-pointer"
                  >
                     x
                  </span>
                  <AddStock setStockData={setStockData} stockData={stockData} />
               </div>
            )}
         </div>
         <div className=" flex flex-col items-center bg-main-dark pb-7">
            {isLoading ? (
               <h2 className="mt-4 text-2xl text-white">Loading data...</h2>
            ) : (
               <>
                  <h2 className="text-center text-white text-3xl pt-8">{stockData.name}</h2>
                  {stockData.watchList[0]?.name !== "" ? (
                     <WatchListPanel
                        watchList={stockData.watchList}
                        stockData={stockData}
                        setStockData={setStockData}
                     />
                  ) : (
                     <h2 className="text-xl text-white">{stockData.active ? "Add your first stock to the watchlist!" : "Add your first Watchlist!"}</h2>
                  )}
               </>
            )}
         </div>
      </>
   );
}
