"use client";
import { EconomicsType } from "@/types/types";
import React, { useEffect, useState, Dispatch, SetStateAction } from "react";
import { updateAnualTargetReturn } from "@/api/dashboard";
import { StockData } from "@/types/types";
import { getStockPortfolio } from "@/api/dashboard";
import { prepareEconomics } from "./EconomicsHelper";
import toast, { Toaster } from "react-hot-toast";

const notify = () =>
   toast("Could not update economics data!", {
      style: {
         backgroundColor: "#facc15",
      },
   });

export default function Economics({
   economics,
   setEconomics,
   targetReturn,
   activeStock,
   setStockData,
}: {
   economics: EconomicsType;
   setEconomics: Dispatch<SetStateAction<EconomicsType>>;
   targetReturn: number;
   activeStock: string;
   setStockData: Dispatch<SetStateAction<StockData>>;
}) {
   const [input, setInput] = useState(targetReturn);

   useEffect(() => {
      const run = async () => {
         try {
            if (activeStock) {
               const response: any = await prepareEconomics(setEconomics);
               if (String(response).includes("Error")) notify();
            }
         } catch (error) {
            console.error(error);
         }
      };
      run();
   }, [activeStock]);

   async function handleInput() {
      await updateAnualTargetReturn(activeStock, input);
      const data = await getStockPortfolio();
      setStockData(data);
   }

   function prepareTitle(dbDate_1: Date, dbDate_2: Date) {
      const date_1 = new Date(dbDate_1);
      const date_2 = new Date(dbDate_2);

      const options: Intl.DateTimeFormatOptions = {
         year: "numeric",
         month: "numeric",
      };

      const localDate_1 = date_1.toLocaleDateString("de-DE", options);
      const localDate_2 = date_2.toLocaleDateString("de-DE", options);
      return `${localDate_1} (${localDate_2})`;
   }

   return (
      <div>
         <div className="bg-white w-52 rounded-md pl-5 pr-5 pb-10 flex-col gap-2">
            <p className="font-bold mb-5">US Key Economics</p>
            <div className="text-white text-sm">
               <p className="bg-gray-950 rounded-t-2xl pl-3">{`Inflation ${
                  economics?.inflation[0]?.date?.toString()?.slice(2, 4) ?? ""
               }/${economics?.inflation[1]?.date?.toString()?.slice(2, 4) ?? ""}`}</p>
               <p className="text-center bg-gray-950 rounded-b-2xl pb-4">
                  {typeof economics.inflation[0].value === "number" &&
                     economics.inflation[0]?.value?.toFixed(1)}{" "}
                  (
                  {typeof economics.inflation[1]?.value === "number" &&
                     economics.inflation[1]?.value?.toFixed(1)}
                  )
               </p>
            </div>
            <div
               className="text-sm"
               title={
                  economics.cpi[0].date &&
                  economics.cpi[1].date &&
                  prepareTitle(economics.cpi[0].date, economics.cpi[1].date)
               }
            >
               <p className="bg-yellow-400 rounded-t-2xl -mt-3 pl-3">Consumer Price Index</p>
               <p className="text-center bg-yellow-400 rounded-b-2xl pb-4">
                  {typeof economics.cpi[0].value === "number" && economics.cpi[0].value?.toFixed(2)}{" "}
                  (
                  {typeof economics.cpi[1]?.value === "number" &&
                     economics.cpi[1]?.value?.toFixed(2)}
                  )
               </p>
            </div>
            <div
               className="text-sm"
               title={
                  economics.unemployment[0].date &&
                  economics.unemployment[1].date &&
                  prepareTitle(economics.unemployment[0].date, economics.unemployment[1].date)
               }
            >
               <p className="bg-gray-100 rounded-t-2xl -mt-3 pl-3">Unemployment Rate</p>
               <p className="text-center bg-gray-100 rounded-b-2xl pb-4">
                  {typeof economics.unemployment[0]?.value === "number" &&
                     economics.unemployment[0]?.value?.toFixed(1)}{" "}
                  (
                  {typeof economics.unemployment[1]?.value === "number" &&
                     economics.unemployment[1]?.value?.toFixed(1)}
                  )
               </p>
            </div>
            <div
               className="text-white text-sm"
               title={
                  economics.interest[0].date &&
                  economics.interest[1].date &&
                  prepareTitle(economics.interest[0].date, economics.interest[1].date)
               }
            >
               <p className="bg-gray-700 rounded-t-2xl -mt-3 pl-3">Interest Rate</p>
               <p className="text-center bg-gray-700 rounded-b-2xl pb-2">
                  {typeof economics.interest[0]?.value === "number" &&
                     economics.interest[0]?.value?.toFixed(1)}{" "}
                  (
                  {typeof economics.interest[1]?.value === "number" &&
                     economics.interest[1].value?.toFixed(1)}
                  )
               </p>
            </div>
         </div>
         <div className="flex flex-col items-center w-52 bg-[#161616] text-white mt-8 p-5">
            <label className="flex flex-col text-sm">
               Anual Target Return
               <input
                  onChange={(evt) => setInput(+evt.target.value)}
                  value={input}
                  type="number"
                  className="rounded-sm p-1 mt-2 bg-[#212224] text-white outline-none text-center"
               />
            </label>
            <button
               onClick={handleInput}
               className="bg-yellow-400 py-1 px-4 mt-3 rounded-sm text-main-dark font-bold text-sm hover:bg-white"
            >
               Change
            </button>
         </div>
         <Toaster></Toaster>
      </div>
   );
}
