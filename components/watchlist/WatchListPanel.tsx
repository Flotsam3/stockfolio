"use client";

import React, { useState, Dispatch, SetStateAction } from "react";
import type { AddStockType, StockData, WatchlistEdit } from "@/types/types";
import { deleteOneWatchList, getStockPortfolio, updateWatchList } from "@/services/dashboard";
import Link from "next/link";
import { refreshStock } from "@/services/stockanalysis";
import { calcSafetyMargin, getStockEpsUsd, getStockGrowthForecast, getStockPriceUsd, readSavedPeRatios } from "@/utils/stockCalculations";
import { describeStockAmount, formatUsd } from "@/utils/stockMoney";
import { Star, Lightbulb, RefreshCw } from "lucide-react";
import StockTooltip, { StockMarketDetails } from "@/components/stock/StockTooltip";
import Image from "next/image";
import "./WatchListPanel.css";

export default function WatchListPanel({ watchList, stockData, setStockData }: { watchList: AddStockType[]; stockData: StockData; setStockData: Dispatch<SetStateAction<StockData>> }) {
   const [edit, setEdit] = useState<boolean | string>(false);
   const [input, setInput] = useState<AddStockType>({
      name: "",
      ticker: "",
      isin: "",
      country: "",
      rate: null,
      dilutedEps: null,
      growthForecast: null,
      peRatio: "",
   });
   const [infoModal, setInfoModal] = useState<string | false>(false);
   const [infoText, setInfoText] = useState<string>("");
   const [targetPrice, setTargetPrice] = useState<number>(0);
   const [loadingId, setLoadingId] = useState<string | null>(null);

   const [actionError, setActionError] = useState<{ key: string; message: string } | null>(null);

   function applySavedStock(stock: AddStockType, portfolioId: string | undefined) {
      setStockData(current => current._id === portfolioId
         ? { ...current, watchList: current.watchList.map(entry => entry._id === stock._id ? stock : entry) }
         : current);
   }

   async function saveEdit(obj: AddStockType, changes: WatchlistEdit) {
      const portfolio = await updateWatchList({ ...changes, _id: obj._id }, stockData.name);
      const saved = portfolio.watchList.find(stock => stock._id === obj._id);
      if (!saved) throw new Error("The updated stock could not be found.");
      applySavedStock(saved, portfolio._id);
   }

   async function handleEdit(obj: AddStockType) {
      const key = obj._id ?? obj.ticker;
      const previous = {
         ...obj,
         rate: getStockPriceUsd(obj),
         dilutedEps: getStockEpsUsd(obj),
         growthForecast: getStockGrowthForecast(obj),
      };
      setActionError(null);
      if (edit !== key) {
         setEdit(key);
         setInput(previous);
         return;
      }

      const { name, ticker, isin, country, rate, dilutedEps, growthForecast, peRatio } = input;
      const changed = Object.entries({ name, ticker, isin, country, rate, dilutedEps, growthForecast, peRatio })
         .filter(([field, value]) => value !== previous[field as keyof AddStockType]);
      try {
         if (changed.length > 0) await saveEdit(obj, Object.fromEntries(changed));
         setEdit(false);
      } catch (error) {
         setActionError({ key, message: error instanceof Error ? error.message : "Could not save the stock." });
      }
   }

   async function handleRefresh(obj: AddStockType) {
      const portfolioId = stockData._id;
      if (!portfolioId || !obj._id || loadingId) return;
      setLoadingId(obj._id);
      setActionError(null);
      try {
         applySavedStock(await refreshStock(portfolioId, obj._id), portfolioId);
      } catch (error) {
         setActionError({ key: obj._id, message: error instanceof Error ? error.message : "Could not refresh the stock." });
      } finally {
         setLoadingId(null);
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
      setInfoModal(obj._id ?? obj.ticker);
   }

   async function handleSaveInfo(obj: AddStockType) {
      setActionError(null);
      try {
         await saveEdit(obj, { info: infoText, targetPrice });
         setInfoModal(false);
      } catch (error) {
         setActionError({ key: obj._id ?? obj.ticker, message: error instanceof Error ? error.message : "Could not save the stock information." });
      }
   }

   async function handleToggleOwned(obj: AddStockType) {
      setActionError(null);
      try {
         await saveEdit(obj, { owned: !obj.owned });
      } catch (error) {
         setActionError({ key: obj._id ?? obj.ticker, message: error instanceof Error ? error.message : "Could not update ownership." });
      }
   }

   function getLightbulbColor(lastDataRefresh?: Date | string): string {
      if (!lastDataRefresh) return "text-gray-400"; // No refresh date = gray

      const now = new Date();
      const refreshDate = new Date(lastDataRefresh);
      const daysDiff = Math.floor((now.getTime() - refreshDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff <= 14) return "text-green-600"; // Up to 2 weeks
      if (daysDiff <= 30) return "text-yellow-400"; // Up to 1 month
      return "text-red-500"; // More than 1 month
   }

   function getTargetPriceBorderColor(rate: number | null, targetPrice?: number): string {
      if (rate === null || !targetPrice || targetPrice <= 0) return "border-gray-300";

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
            .map((obj) => {
               const key = obj._id ?? obj.ticker;
               const tradingPrice = getStockPriceUsd(obj);
               const eps = getStockEpsUsd(obj);
               const safetyValues = calcSafetyMargin(obj, stockData.anualTargetReturn);
               const fundamentalValue = safetyValues.Fv === "N/A" ? null : Number(safetyValues.Fv);
               return (
                  <div key={key} className="flex flex-col items-center">
                     <div className={`relative grid grid-cols-1 sm:grid-cols-custom-sm lg:grid-cols-custom-lg md:grid-cols-custom-tablet lg:w-[60vw] w-[95vw] sm:justify-center gap-3 lg:gap-0 bg-white mt-3 p-4 rounded-xl ${getTargetPriceBorderColor(tradingPrice, obj.targetPrice)} [&>div>input:first-child]:text-sm [&>div>p:first-child]:text-sm [&>div>input:first-child]:font-bold [&>div>p:first-child]:font-bold`}>
                        {edit === key ? (
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
                                          const tooltip = document.getElementById(`tooltip-${key}`);
                                          if (tooltip) tooltip.style.display = "block";
                                       }}
                                       onMouseLeave={() => {
                                          const tooltip = document.getElementById(`tooltip-${key}`);
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
                                 <p>Price (USD)</p>
                                 <input aria-label="Price in USD" type="number" step="any" onChange={(evt) => setInput({ ...input, rate: evt.target.value === "" ? null : evt.target.valueAsNumber })} value={input.rate ?? ""} />
                              </div>
                              <div className="flex flex-col items-center sm:col-span-1 [&>input]:w-[90%] [&>input]:bg-slate-200 [&>input]:rounded-md [&>input]:p-1 [&>input]:outline-none [&>*]:text-center">
                                 <p>EPS (USD)</p>
                                 <input aria-label="Diluted EPS in USD" type="number" step="any" onChange={(evt) => setInput({ ...input, dilutedEps: evt.target.value === "" ? null : evt.target.valueAsNumber })} value={input.dilutedEps ?? ""} />
                              </div>
                           </>
                        ) : (
                           <>
                              <div className="sm:col-span-6 lg:col-span-1 items-center flex flex-col lg:items-start">
                                 <div className="flex items-center gap-2">
                                    <p className="font-bold text-center lg:text-left cursor-pointer">
                                       <Link href={`/details/${encodeURIComponent(obj.ticker)}?${new URLSearchParams({ name: obj.name })}`}>{obj.ticker}</Link>
                                    </p>
                                    <button
                                       type="button"
                                       className="ml-2 text-gray-500 hover:text-blue-600"
                                       title="Reload stock data"
                                       aria-label={`Reload stock data for ${obj.ticker}`}
                                       aria-busy={loadingId === key}
                                       disabled={Boolean(loadingId) || !obj._id || !stockData._id}
                                       onClick={() => handleRefresh(obj)}
                                    >
                                       <RefreshCw aria-hidden size={16} className={loadingId === key ? "animate-spin" : ""} />
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
                                          const tooltip = document.getElementById(`tooltip-${key}`);
                                          if (tooltip) tooltip.style.display = "block";
                                       }}
                                       onMouseLeave={() => {
                                          const tooltip = document.getElementById(`tooltip-${key}`);
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
                                 <p>Price (USD)</p>
                                 <p title={describeStockAmount(obj.quoteOriginal, tradingPrice === null ? obj.rate : undefined)}>{formatUsd(tradingPrice)}</p>
                              </div>
                              <div className="sm:col-span-1 [&>*]:text-center">
                                 <p>EPS (USD)</p>
                                 <p title={describeStockAmount(obj.epsOriginal, eps === null ? obj.dilutedEps : undefined)}>{formatUsd(eps)}</p>
                              </div>
                           </>
                        )}
                        <div className="sm:col-span-1 [&>*]:text-center">
                           <p>PE Ratio (5y)</p>
                           <p>
                              {obj.peRatioAverage ?? "—"}
                              {obj.peRatioAverage != null && readSavedPeRatios(obj.peRatio ?? "").length < 5 && "?"}
                           </p>
                        </div>
                        <div className="sm:col-start-2 sm:col-span-1 lg:col-start-auto lg:col-span-auto [&>*]:text-center">
                           <p title="Fundamental Value in USD">Fv</p>
                           <p className={`font-bold ${fundamentalValue === null || tradingPrice === null ? "text-gray-500" : fundamentalValue >= tradingPrice ? "text-green-500" : "text-red-500"}`}>{formatUsd(fundamentalValue)}</p>
                        </div>
                        <div className="[&>*]:text-center">
                           <p>Safety</p>
                           <p className={`font-bold ${safetyValues.safetyMargin === "N/A" ? "text-gray-500" : "text-green-500"}`}>{safetyValues.safetyMargin}</p>
                        </div>
                        <div className="sm:col-span-6 lg:col-span-1 flex justify-center items-center">
                           <span onClick={() => handleDelete(obj._id)} className="absolute right-2 top-0 cursor-pointer">
                              x
                           </span>
                           <button disabled={loadingId === key} onClick={() => handleEdit(obj)} className={"py-1 lg:px-3 px-7 bg-green-700 text-white lg:text-sm sm:text-lg rounded-md hover:bg-green-600"}>
                              {edit === key ? "Save" : "Edit"}
                           </button>
                        </div>
                     </div>
                     <div className={`${edit === key ? "flex" : "hidden"} relative flex-col md:flex-row gap-2 py-2 px-4 bg-gray-800 rounded-lg text-white -mt-3 z-20 [&>div>p]:text-center [&>div>input]:outline-none`}>
                        <div className="text-sm [&>*]:text-center">
                           <p>Country Code</p>
                           <input onChange={(evt) => setInput({ ...input, country: evt.target.value })} value={input.country || ""} className="rounded-sm text-gray-800" type="text" />
                        </div>
                        <div className="text-sm [&>*]:text-center">
                           <p>Growth 5y</p>
                           <input onChange={(evt) => setInput({ ...input, growthForecast: evt.target.value === "" ? null : evt.target.valueAsNumber })} value={input.growthForecast ?? ""} className="rounded-sm text-gray-800" type="number" step="any" />
                        </div>
                        <div className="text-sm [&>*]:text-center">
                           <p>PE Ratio</p>
                           <input onChange={(evt) => setInput({ ...input, peRatio: evt.target.value })} value={input.peRatio || ""} className="rounded-sm text-gray-800" type="text" />
                        </div>
                        <span onClick={() => setEdit(false)} className="absolute top-0 right-2 text-sm cursor-pointer">
                           x
                        </span>
                     </div>
                     {actionError?.key === key ? (
                        <p role="alert" className="mt-1 max-w-[95vw] text-xs text-red-700">{actionError.message}</p>
                     ) : obj.refreshIssues?.length ? (
                        <p role="status" className="mt-1 max-w-[95vw] text-xs text-[#FF7068]">{obj.refreshIssues.map(issue => issue.message).join(" ")}</p>
                     ) : null}
                     {infoModal === key && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                           <div className="bg-white rounded-lg p-6 w-[90vw] max-w-md shadow-lg relative">
                              <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={() => setInfoModal(false)}>
                                 x
                              </button>
                              <h2 className="text-lg font-bold mb-2">Edit Info for {obj.ticker}</h2>
                              {/* Show createdAt and lastDataRefresh */}
                              {obj.createdAt && <div className="mb-1 text-xs text-gray-500">Created: {new Date(obj.createdAt).toLocaleString()}</div>}
                              {obj.lastDataRefresh && <div className="mb-2 text-xs text-gray-500">Last Data Refresh: {new Date(obj.lastDataRefresh).toLocaleString()}</div>}
                              <StockMarketDetails stock={obj} />
                              {actionError?.key === key && <p role="alert" className="mb-2 text-xs text-red-700">{actionError.message}</p>}

                              {/* Target Price Input - NEW */}
                              <div className="mb-4">
                                 <label className="block text-sm font-medium mb-1">Personal target price (USD)</label>
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
