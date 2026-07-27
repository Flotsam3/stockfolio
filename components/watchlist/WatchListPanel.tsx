"use client";

import React, { useState, Dispatch, SetStateAction } from "react";
import { AddStockType } from "@/types/types";
import { StockData } from "@/types/types";
import { updateWatchList } from "@/services/dashboard";
import { getStockPortfolio } from "@/services/dashboard";
import { deleteOneWatchList } from "@/services/dashboard";
import Link from "next/link";
import { fetchPERatios } from "@/services/stockanalysis";
import { calcSafetyMargin } from "@/utils/stockCalculations";
import { Star, Lightbulb } from "lucide-react";
import StockTooltip from "@/components/stock/StockTooltip";
import Image from "next/image";
import "./WatchListPanel.css";

export default function WatchListPanel({ watchList, stockData, setStockData }: { watchList: AddStockType[]; stockData: StockData; setStockData: Dispatch<SetStateAction<StockData>> }) {
   const [edit, setEdit] = useState<boolean | string>(false);
   const [input, setInput] = useState<AddStockType>({
      name: "",
      ticker: "",
      isin: "",
      country: "",
      rate: 0,
      dilutedEps: 0,
      growthForecast: 0,
      peRatio: "",
   });
   const [infoModal, setInfoModal] = useState<string | false>(false);
   const [infoText, setInfoText] = useState<string>("");
   const [targetPrice, setTargetPrice] = useState<number>(0);
   const [loadingId, setLoadingId] = useState<string | null>(null);

   async function handleEdit(obj: AddStockType) {
      if (edit) {
         await updateWatchList(input, stockData.name);
         setEdit(false);

         const updateData = await getStockPortfolio();
         if (updateData && updateData._id) setStockData(updateData);
      } else {
         setEdit(obj.isin);
         setInput(obj);
      }
   }

   async function handleDelete(id: string | undefined) {
      if (!id) return;
      await deleteOneWatchList(stockData.name, id);

      const updateData = await getStockPortfolio();
      if (updateData && updateData._id) setStockData(updateData);
   }

   function handleOpenInfoModal(obj: AddStockType) {
      setInfoText(obj.info || "");
      setTargetPrice(obj.targetPrice || 0);
      setInfoModal(obj.isin);
   }

   async function handleSaveInfo(obj: AddStockType) {
      try {
         await updateWatchList({ ...obj, info: infoText, targetPrice: targetPrice }, stockData.name);
         setInfoModal(false);
         const updateData = await getStockPortfolio();
         if (updateData && updateData._id) setStockData(updateData);
      } catch (error) {
         console.log(error);
      }
   }

   async function handleToggleOwned(obj: AddStockType) {
      try {
         await updateWatchList({ ...obj, owned: !obj.owned }, stockData.name);
         const updateData = await getStockPortfolio();
         if (updateData && updateData._id) setStockData(updateData);
      } catch (e) {
         console.error("Error toggling owned status", e);
      }
   }

   function checkPeRatio(peRatio: string) {
      const peRatios = peRatio
         .replace(/,/g, ".")
         .split(";")
         .map((str: string) => parseFloat(str.trim()))
         .filter((num: number) => !isNaN(num));

      if (peRatios.length < 5) return "❗";

      return "";
   }

   function getLightbulbColor(lastDataRefresh?: Date): string {
      if (!lastDataRefresh) return "text-gray-400"; // No refresh date = gray

      const now = new Date();
      const refreshDate = new Date(lastDataRefresh);
      const daysDiff = Math.floor((now.getTime() - refreshDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff <= 14) return "text-green-600"; // Up to 2 weeks
      if (daysDiff <= 30) return "text-yellow-400"; // Up to 1 month
      return "text-red-500"; // More than 1 month
   }

   function getTargetPriceBorderColor(rate: number, targetPrice?: number): string {
      if (!targetPrice || targetPrice === 0) return "border-gray-300"; // Default if no target

      if (rate >= targetPrice) return "border-green-600 border-4"; // At or above target

      const percentBelow = ((targetPrice - rate) / targetPrice) * 100;

      if (percentBelow <= 10) return "border-green-600 border-4";
      if (percentBelow <= 30) return "border-yellow-500 border-4";
      if (percentBelow <= 50) return "border-orange-500 border-4";
      return "border-red-500 border-4";
   }

   return (
      <>
         {[...watchList]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((obj, index) => {
               const safetyValues = calcSafetyMargin(obj, stockData.anualTargetReturn);
               return (
                  <div key={index} className="flex flex-col items-center">
                     <div className={`relative grid grid-cols-1 sm:grid-cols-custom-sm lg:grid-cols-custom-lg md:grid-cols-custom-tablet lg:w-[60vw] w-[95vw] sm:justify-center gap-3 lg:gap-0 bg-white mt-3 p-4 rounded-xl ${getTargetPriceBorderColor(obj.rate, obj.targetPrice)} [&>div>input:first-child]:text-sm [&>div>p:first-child]:text-sm [&>div>input:first-child]:font-bold [&>div>p:first-child]:font-bold`}>
                        {edit === obj.isin ? (
                           <>
                              <div className="flex flex-col items-center sm:col-span-6 lg:col-span-1 [&>input]:w-[90%] [&>input]:bg-slate-200 [&>input]:rounded-md [&>input]:p-1 [&>input]:outline-none">
                                 <input className="text-center lg:text-left" type="text" onChange={(evt) => setInput({ ...input, ticker: evt.target.value })} value={input.ticker} />
                                 <input className="text-center lg:text-left" type="text" onChange={(evt) => setInput({ ...input, name: evt.target.value })} value={input.name} />
                              </div>
                              <div className="sm:col-span-1 flex flex-col items-center [&>input]:w-[90%] [&>input]:bg-slate-200 [&>input]:rounded-md [&>input]:p-1 [&>input]:outline-none [&>*]:text-center">
                                 <input type="text" onChange={(evt) => setInput({ ...input, isin: evt.target.value })} value={input.isin} />
                                 <div className="flex items-center gap-1 relative">
                                    <Image src={`https://flagcdn.com/w40/${obj.country}.png`} width={40} height={27} alt="Country flag" />
                                    <div
                                       className="relative"
                                       onMouseEnter={() => {
                                          const tooltip = document.getElementById(`tooltip-${obj.isin}`);
                                          if (tooltip) tooltip.style.display = "block";
                                       }}
                                       onMouseLeave={() => {
                                          const tooltip = document.getElementById(`tooltip-${obj.isin}`);
                                          if (tooltip) tooltip.style.display = "none";
                                       }}
                                    >
                                       <button type="button" className="flex ml-1 hover:opacity-70" title="Edit info" onClick={() => handleOpenInfoModal(obj)}>
                                          <Lightbulb size={18} className={getLightbulbColor(obj.lastDataRefresh)} />
                                       </button>
                                       {/* Tooltip on hover */}
                                       <StockTooltip stock={obj} />
                                    </div>
                                 </div>
                              </div>
                              <div className="flex flex-col items-center sm:col-span-1 [&>input]:w-[90%] [&>input]:bg-slate-200 [&>input]:rounded-md [&>input]:p-1 [&>input]:outline-none [&>*]:text-center">
                                 <p>Rate ($)</p>
                                 <input type="number" onChange={(evt) => setInput({ ...input, rate: +evt.target.value })} value={input.rate} />
                              </div>
                              <div className="flex flex-col items-center sm:col-span-1 [&>input]:w-[90%] [&>input]:bg-slate-200 [&>input]:rounded-md [&>input]:p-1 [&>input]:outline-none [&>*]:text-center">
                                 <p>EPS</p>
                                 <input type="number" onChange={(evt) => setInput({ ...input, dilutedEps: +evt.target.value })} value={input.dilutedEps} />
                              </div>
                           </>
                        ) : (
                           <>
                              <div className="sm:col-span-6 lg:col-span-1 items-center flex flex-col lg:items-start">
                                 <div className="flex items-center gap-2">
                                    <p className="font-bold text-center lg:text-left cursor-pointer">
                                       <Link href={`/details/${obj.ticker}?name=${obj.name}`}>{obj.ticker}</Link>
                                    </p>
                                    {/* Reload button */}
                                    <button
                                       type="button"
                                       className="ml-2 text-gray-500 hover:text-blue-600"
                                       title="Reload stock data"
                                       onClick={async () => {
                                          try {
                                             setLoadingId(obj.ticker);
                                             const result = await fetchPERatios(obj.ticker);
                                             console.log(result);

                                             if (!result.realTimePrice) throw new Error("Rate is required");
                                             if (!result.epsDiluted) throw new Error("dilutedEps is required");
                                             if (!result.epsGrowth5Y) throw new Error("epsGrowth5Y is required");

                                             const updatedInput = {
                                                ticker: obj.ticker,
                                                name: obj.name,
                                                isin: obj.isin,
                                                country: obj.country,
                                                dilutedEps: parseFloat(result.epsDiluted),
                                                growthForecast: parseFloat(result.epsGrowth5Y.replace("%", "")),
                                                peRatio: result.peRatios.join(";"),
                                                rate: parseFloat(result.realTimePrice.replace(/,/g, "")) || 0,
                                                _id: obj._id,
                                                lastDataRefresh: new Date(), // NEW
                                             };

                                             const updateResult = await updateWatchList(updatedInput, stockData.name);
                                             console.log({ updateResult });
                                             const updateData = await getStockPortfolio();
                                             setStockData(updateData);
                                          } catch (err) {
                                             console.error("Error while updating PE ratios", err);
                                          } finally {
                                             setLoadingId(null);
                                          }
                                       }}
                                    >
                                       <span className={loadingId === obj.ticker ? "loader" : ""} style={{ fontSize: "18px" }}>
                                          {loadingId === obj.ticker ? "" : "⭮"}
                                       </span>
                                    </button>
                                 </div>
                                 <p className="text-center lg:text-left mt-1">{obj.name}</p>
                              </div>
                              <div className="sm:col-span-1 flex flex-col items-center [&>*]:text-center">
                                 <p>{obj.isin}</p>
                                 <div className="flex items-center gap-1 relative">
                                    <Image src={`https://flagcdn.com/w40/${obj.country}.png`} width={40} height={27} alt="Country flag" />
                                    <div
                                       className="relative"
                                       onMouseEnter={() => {
                                          const tooltip = document.getElementById(`tooltip-${obj.isin}`);
                                          if (tooltip) tooltip.style.display = "block";
                                       }}
                                       onMouseLeave={() => {
                                          const tooltip = document.getElementById(`tooltip-${obj.isin}`);
                                          if (tooltip) tooltip.style.display = "none";
                                       }}
                                    >
                                       <button type="button" className="flex ml-1 hover:opacity-70" title="Edit info" onClick={() => handleOpenInfoModal(obj)}>
                                          <Lightbulb size={18} className={getLightbulbColor(obj.lastDataRefresh)} />
                                       </button>
                                       {/* Tooltip on hover */}
                                       <StockTooltip stock={obj} />
                                    </div>
                                    {/* NEW: Star toggle */}
                                    <button type="button" onClick={() => handleToggleOwned(obj)} className="cursor-pointer" title={obj.owned ? "Owned" : "Not owned"}>
                                       <Star size={20} className={obj.owned ? "fill-yellow-400 text-yellow-400" : "text-gray-400"} />
                                    </button>
                                 </div>
                              </div>
                              <div className="sm:col-span-1 [&>*]:text-center">
                                 <p>Rate ($)</p>
                                 <p>{obj.rate}</p>
                              </div>
                              <div className="sm:col-span-1 [&>*]:text-center">
                                 <p>EPS</p>
                                 <p>{obj.dilutedEps}</p>
                              </div>
                           </>
                        )}
                        <div className="sm:col-span-1 [&>*]:text-center">
                           <p>PE Ratio (5y)</p>
                           <p>
                              {obj.peRatioAverage}
                              {checkPeRatio(obj.peRatio)}
                           </p>
                        </div>
                        <div className="sm:col-start-2 sm:col-span-1 lg:col-start-auto lg:col-span-auto [&>*]:text-center">
                           <p title="Fundamental Value">Fv</p>
                           <p className={`font-bold ${safetyValues && safetyValues.Fv !== "N/A" && +safetyValues.Fv >= obj.rate ? "text-green-500" : "text-red-500"}`}>{safetyValues?.Fv}</p>
                        </div>
                        <div className="[&>*]:text-center">
                           <p>Safety</p>
                           <p className={`font-bold ${safetyValues && safetyValues.safetyMargin != "N/A" ? "text-green-500" : "text-red-500"}`}>{safetyValues?.safetyMargin}</p>
                        </div>
                        <div className="sm:col-span-6 lg:col-span-1 flex justify-center items-center">
                           <span onClick={() => handleDelete(obj._id)} className="absolute right-2 top-0 cursor-pointer">
                              x
                           </span>
                           <button onClick={() => handleEdit(obj)} className={"py-1 lg:px-3 px-7 bg-green-700 text-white lg:text-sm sm:text-lg rounded-md hover:bg-green-600"}>
                              {edit === obj.isin ? "Save" : "Edit"}
                           </button>
                        </div>
                     </div>
                     <div className={`${edit === obj.isin ? "flex" : "hidden"} relative flex-col md:flex-row gap-2 py-2 px-4 bg-gray-800 rounded-lg text-white -mt-3 z-20 [&>div>p]:text-center [&>div>input]:outline-none`}>
                        <div className="text-sm [&>*]:text-center">
                           <p>Country Code</p>
                           <input onChange={(evt) => setInput({ ...input, country: evt.target.value })} value={input.country || ""} className="rounded-sm text-gray-800" type="text" />
                        </div>
                        <div className="text-sm [&>*]:text-center">
                           <p>Growth 5y</p>
                           <input onChange={(evt) => setInput({ ...input, growthForecast: +evt.target.value })} value={input.growthForecast || ""} className="rounded-sm text-gray-800" type="number" />
                        </div>
                        <div className="text-sm [&>*]:text-center">
                           <p>PE Ratio</p>
                           <input onChange={(evt) => setInput({ ...input, peRatio: evt.target.value })} value={input.peRatio || ""} className="rounded-sm text-gray-800" type="text" />
                        </div>
                        <span onClick={() => setEdit(false)} className="absolute top-0 right-2 text-sm cursor-pointer">
                           x
                        </span>
                     </div>
                     {/* Info Modal */}
                     {infoModal === obj.isin && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                           <div className="bg-white rounded-lg p-6 w-[90vw] max-w-md shadow-lg relative">
                              <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={() => setInfoModal(false)}>
                                 x
                              </button>
                              <h2 className="text-lg font-bold mb-2">Edit Info for {obj.ticker}</h2>
                              {/* Show createdAt and lastDataRefresh */}
                              {obj.createdAt && <div className="mb-1 text-xs text-gray-500">Created: {new Date(obj.createdAt).toLocaleString()}</div>}
                              {obj.lastDataRefresh && <div className="mb-2 text-xs text-gray-500">Last Data Refresh: {new Date(obj.lastDataRefresh).toLocaleString()}</div>}

                              {/* Target Price Input - NEW */}
                              <div className="mb-4">
                                 <label className="block text-sm font-medium mb-1">Target Price</label>
                                 <input type="number" className="w-full border rounded p-2" value={targetPrice ?? 0} onChange={(e) => setTargetPrice(parseFloat(e.target.value) || 0)} placeholder="Enter target price" />
                              </div>

                              {/* Info Text Area */}
                              <div className="mb-4">
                                 <label className="block text-sm font-medium mb-1">Notes</label>
                                 <textarea className="w-full border rounded p-2" rows={4} value={infoText || ""} onChange={(e) => setInfoText(e.target.value)} placeholder="Enter notes" />
                              </div>

                              <div className="flex justify-end gap-2">
                                 <button className="px-4 py-1 bg-gray-300 rounded hover:bg-gray-400" onClick={() => setInfoModal(false)}>
                                    Cancel
                                 </button>
                                 <button className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700" onClick={() => handleSaveInfo(obj)}>
                                    Save
                                 </button>
                              </div>
                           </div>
                        </div>
                     )}
                  </div>
               );
            })}
      </>
   );
}
