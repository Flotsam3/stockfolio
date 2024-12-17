"use client"

import Image from "next/image";
import Economics from "../components/Economics";
import AddStock from "../components/AddStock";
import WatchListPanel from "../components/watchListPanel";
import AddWatchList from "@/components/AddWatchList";
import { useEffect, useState } from "react";
import { EconomicsType } from "@/types/types";
import { getStockPortfolio } from "@/api/dashboard";
import { getAllPortfolios } from "@/api/dashboard";
import { useStockContext } from "./context/StockContext";

export default function Home() {
  const {stockData, setStockData} = useStockContext();

  const [economics, setEconomics] = useState<EconomicsType>({
    inflation: [{value:0}],
    cpi: [{value:0}],
    unemployment: [{value:0}],
    interest: [{value:0}]
  });

  const [portfolioNames, setPortfolioNames] = useState<{name:string}[]>([]);
  const [targetReturn, setTargetReturn] = useState(12);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(()=>{
    async function getData(){
      try {
        const activeWatchList = localStorage.getItem("watchList");
        if (!activeWatchList) return console.log("No watchlist yet!");

        setIsLoading(true);
        const data = await getStockPortfolio(activeWatchList);
        if (!data) {
          setIsLoading(false);
          return console.log("No portfolio yet!")
        };

        console.log({data});
        setStockData(data);
        const portfolios = await getAllPortfolios();
        setIsLoading(false);
        if (!portfolios) return;

        setPortfolioNames(portfolios);
      } catch (error) {
        console.log(error);
      }
    }
    getData();
  },[])

  return (
    <>
      <div className="relative flex-1 bg-cover bg-center h-[calc(100vh-85px)] bg-[url('/images/feature-bg.png')]" >
        <section className="absolute top-10 left-5 right-5">
          <Economics economics={economics} setEconomics={setEconomics} targetReturn={targetReturn} activeStock={stockData.name} setStockData={setStockData}/>
          <AddStock setStockData={setStockData} stockData={stockData}/>
          <AddWatchList portfolioNames={portfolioNames} setPortfolioNames={setPortfolioNames} stockDataName={stockData.name} setStockData={setStockData}/>
        </section>
      </div>
      <div className=" flex flex-col items-center bg-main-dark pb-7">
          {isLoading ? (
            <h2 className="text-2xl">Loading data...</h2>
          ) : <>
            <h2 className="text-center text-white text-3xl pt-8">{stockData.name}</h2>
            {stockData.watchList[0]?.name !== "" ? <WatchListPanel watchList={stockData.watchList} stockData={stockData} setStockData={setStockData}/> : <h2 className="text-xl text-white">Add your first stock to the watchlist!</h2>}
          </>}
      </div>
    </>
  );
}
