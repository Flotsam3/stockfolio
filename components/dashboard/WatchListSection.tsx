// components/dashboard/WatchListSection.tsx
"use client";

import { useEffect, useState, Dispatch, SetStateAction } from "react";
import WatchListPanel from "@/components/watchlist/WatchListPanel";
import { getStockPortfolio, getAllPortfolios } from "@/services/dashboard";
import { StockData } from "@/types/types";
import { useStockContext } from "@/context/StockContext";

interface Props {
  setStockData: Dispatch<SetStateAction<StockData>>;
  setPortfolioNames: Dispatch<SetStateAction<StockData[]>>;
}

export default function WatchListSection({ setStockData, setPortfolioNames }: Props) {
  const { stockData } = useStockContext();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function getData() {
      try {
        const [portfolioData, portfolios] = await Promise.all([
          getStockPortfolio(),
          getAllPortfolios()
        ]);

        if (portfolioData) {
          setStockData(portfolioData);
        }

        if (portfolios) {
          setPortfolioNames(portfolios);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    getData();
  }, [setStockData, setPortfolioNames]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center bg-main-dark pb-7">
        <h2 className="mt-4 text-2xl text-white">Loading data...</h2>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center bg-main-dark pb-7">
      <h2 className="text-center text-white text-3xl pt-8">
        {stockData?.name || ""}
      </h2>
      
      {(() => {
        const firstWatchName = stockData?.watchList?.[0]?.name ?? "";
        return firstWatchName !== "" ? (
          <WatchListPanel 
            watchList={stockData.watchList} 
            stockData={stockData} 
            setStockData={setStockData} 
          />
        ) : (
          <h2 className="text-xl text-white">
            {stockData?.active 
              ? "Add your first stock to the watchlist!" 
              : "Add your first Watchlist!"}
          </h2>
        );
      })()}
    </div>
  );
}