"use client";

import React, { useState, Dispatch, SetStateAction } from "react";
import { AddStockType } from "@/types/types";
import { StockData } from "@/types/types";
import { updateWatchList } from "@/services/dashboard";
import { getStockPortfolio } from "@/services/dashboard";
import { deleteOneWatchList } from "@/services/dashboard";
import Link from "next/link";
import { fetchPERatios } from "@/services/stockanalysis";
import "./WatchListPanel.css";

export default function WatchListPanel({
   watchList,
   stockData,
   setStockData,
}: {
   watchList: AddStockType[];
   stockData: StockData;
   setStockData: Dispatch<SetStateAction<StockData>>;
}) {
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
   const [loadingId, setLoadingId] = useState<string | null>(null);

   async function handleEdit(obj: AddStockType) {
      if (edit) {
         const data = await updateWatchList(input, stockData.name);
         setEdit(false);

         const updateData = await getStockPortfolio();
         if (updateData && updateData._id) setStockData(updateData);
      } else {
         setEdit(obj.isin);
         setInput(obj);
      }
   }

   function calcSafetyMargin(obj: AddStockType) {
      if (!obj.peRatioAverage) return;

      const profitPerShare5y = obj.dilutedEps * (1 + obj.growthForecast / 100) ** 5;
      const ratePerStock5y = profitPerShare5y * obj.peRatioAverage;
      const fundamentalValue = ratePerStock5y / (1 + stockData.anualTargetReturn / 100) ** 5;
      let safetyMargin = -(obj.rate / fundamentalValue - 1).toFixed(2);
      const Fv = fundamentalValue.toFixed(2);
      if (safetyMargin < 0) return { safetyMargin: "N/A", Fv };
      return { safetyMargin, Fv };
   }

   async function handleDelete(id: string | undefined) {
      if (!id) return;
      const response = await deleteOneWatchList(stockData.name, id);

   const updateData = await getStockPortfolio();
   if (updateData && updateData._id) setStockData(updateData);
   }

   function handleOpenInfoModal(obj: AddStockType) {
      setInfoText(obj.info || "");
      setInfoModal(obj.isin);
   }

   async function handleSaveInfo(obj: AddStockType) {
      try {
         await updateWatchList({ ...obj, info: infoText }, stockData.name);
         setInfoModal(false);
         // Optionally refresh data here
         const updateData = await getStockPortfolio();
         if (updateData && updateData._id) setStockData(updateData);
      } catch (e) {
         // handle error
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

   return (
      <>
         {[...watchList]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((obj, index) => {
               const safetyValues = calcSafetyMargin(obj);
               return (
                  <div key={index} className="flex flex-col items-center">
                     <div className="relative grid grid-cols-1 sm:grid-cols-custom-sm lg:grid-cols-custom-lg md:grid-cols-custom-tablet lg:w-[60vw] w-[95vw] sm:justify-center gap-3 lg:gap-0 bg-white mt-3 p-4 rounded-xl [&>div>input:first-child]:text-sm [&>div>p:first-child]:text-sm [&>div>input:first-child]:font-bold [&>div>p:first-child]:font-bold">
                        {edit === obj.isin ? (
                           <>
                              <div className="flex flex-col items-center sm:col-span-6 lg:col-span-1 [&>input]:w-[90%] [&>input]:bg-slate-200 [&>input]:rounded-md [&>input]:p-1 [&>input]:outline-none">
                                 <input
                                    className="text-center lg:text-left"
                                    type="text"
                                    onChange={(evt) =>
                                       setInput({ ...input, ticker: evt.target.value })
                                    }
                                    value={input.ticker}
                                 />
                                 <input
                                    className="text-center lg:text-left"
                                    type="text"
                                    onChange={(evt) =>
                                       setInput({ ...input, name: evt.target.value })
                                    }
                                    value={input.name}
                                 />
                              </div>
                              <div className="sm:col-span-1 flex flex-col items-center [&>input]:w-[90%] [&>input]:bg-slate-200 [&>input]:rounded-md [&>input]:p-1 [&>input]:outline-none [&>*]:text-center">
                                 <input
                                    type="text"
                                    onChange={(evt) =>
                                       setInput({ ...input, isin: evt.target.value })
                                    }
                                    value={input.isin}
                                 />
                                 <div className="flex items-center gap-1 relative">
                                    <img
                                       src={`https://flagcdn.com/w40/${obj.country}.png`}
                                       srcSet={`https://flagcdn.com/w80/${obj.country}.png 2x`}
                                       width="40"
                                       alt="Country flag"
                                    />
                                    <div
                                       className="relative"
                                       onMouseEnter={(e) => {
                                          const tooltip = document.getElementById(
                                             `tooltip-${obj.isin}`
                                          );
                                          if (tooltip) tooltip.style.display = "block";
                                       }}
                                       onMouseLeave={(e) => {
                                          const tooltip = document.getElementById(
                                             `tooltip-${obj.isin}`
                                          );
                                          if (tooltip) tooltip.style.display = "none";
                                       }}
                                    >
                                       <button
                                          type="button"
                                          className="ml-1 text-blue-500 hover:text-blue-700"
                                          title="Edit info"
                                          onClick={() => handleOpenInfoModal(obj)}
                                       >
                                          <span style={{ fontSize: "18px" }}>💡</span>
                                       </button>
                                       {/* Tooltip on hover */}
                                       <div
                                          id={`tooltip-${obj.isin}`}
                                          style={{ display: "none" }}
                                          className="absolute left-6 top-0 z-50 bg-white text-gray-800 border border-gray-300 rounded shadow-lg p-2 text-xs w-64 max-w-xs"
                                       >
                                          {/* CreatedAt */}
                                          {obj.createdAt && (
                                             <div className="mb-1 text-xs text-gray-500">
                                                Created: {new Date(obj.createdAt).toLocaleString()}
                                             </div>
                                          )}
                                          {/* UpdatedAt if different */}
                                          {obj.updatedAt && obj.updatedAt !== obj.createdAt && (
                                             <div className="mb-2 text-xs text-gray-500">
                                                Updated: {new Date(obj.updatedAt).toLocaleString()}
                                             </div>
                                          )}
                                          {/* Info content */}
                                          <div>
                                             {obj.info ? (
                                                obj.info
                                             ) : (
                                                <span className="italic text-gray-400">
                                                   No info
                                                </span>
                                             )}
                                          </div>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                              <div className="flex flex-col items-center sm:col-span-1 [&>input]:w-[90%] [&>input]:bg-slate-200 [&>input]:rounded-md [&>input]:p-1 [&>input]:outline-none [&>*]:text-center">
                                 <p>Rate</p>
                                 <input
                                    type="number"
                                    onChange={(evt) =>
                                       setInput({ ...input, rate: +evt.target.value })
                                    }
                                    value={input.rate}
                                 />
                              </div>
                              <div className="flex flex-col items-center sm:col-span-1 [&>input]:w-[90%] [&>input]:bg-slate-200 [&>input]:rounded-md [&>input]:p-1 [&>input]:outline-none [&>*]:text-center">
                                 <p>EPS</p>
                                 <input
                                    type="number"
                                    onChange={(evt) =>
                                       setInput({ ...input, dilutedEps: +evt.target.value })
                                    }
                                    value={input.dilutedEps}
                                 />
                              </div>
                           </>
                        ) : (
                           <>
                              <div className="sm:col-span-6 lg:col-span-1 items-center flex flex-col lg:items-start">
                                 <div className="flex items-center gap-2">
                                    <p className="font-bold text-center lg:text-left cursor-pointer">
                                       <Link href={`/details/${obj.ticker}?name=${obj.name}`}>
                                          {obj.ticker}
                                       </Link>
                                    </p>
                                    {/* Reload button */}
                                    <button
                                       type="button"
                                       className="ml-2 text-gray-500 hover:text-blue-600"
                                       title="Reload stock data"
                                       onClick={async () => {
                                          // Call the fetchPERatios function from stockanalysis.ts
                                          try {
                                             setLoadingId(obj.ticker);
                                             const result = await fetchPERatios(obj.ticker);
                                             console.log(result);

                                             if (!result.realTimePrice)
                                                throw new Error("Rate is required");
                                             if (!result.epsDiluted)
                                                throw new Error("dilutedEps is required");
                                             if (!result.epsGrowth5Y)
                                                throw new Error("epsGrowth5Y is required");

                                             const updatedInput = {
                                                ticker: obj.ticker,
                                                name: obj.name,
                                                isin: obj.isin,
                                                country: obj.country,
                                                dilutedEps: parseFloat(result.epsDiluted),
                                                growthForecast: parseFloat(
                                                   result.epsGrowth5Y.replace("%", "")
                                                ),
                                                peRatio: result.peRatios.join(";"),
                                                rate:
                                                   parseFloat(
                                                      result.realTimePrice.replace(/,/g, "")
                                                   ) || 0,
                                                _id: obj._id,
                                             };

                                             const updateResult = await updateWatchList(
                                                updatedInput,
                                                stockData.name
                                             );
                                             console.log({ updateResult });
                                             const updateData = await getStockPortfolio();
                                             setStockData(updateData);
                                             setLoadingId(null);
                                          } catch (err) {
                                             console.error("Error while updating PE ratios", err);
                                          }
                                       }}
                                    >
                                       <span
                                          className={loadingId === obj.ticker ? "loader" : ""}
                                          style={{ fontSize: "18px" }}
                                       >
                                          {loadingId === obj.ticker ? "" : "⭮"}
                                       </span>
                                    </button>
                                 </div>
                                 <p className="text-center lg:text-left mt-1">{obj.name}</p>
                              </div>
                              <div className="sm:col-span-1 flex flex-col items-center [&>*]:text-center">
                                 <p>{obj.isin}</p>
                                 <div className="flex items-center gap-1 relative">
                                    <img
                                       src={`https://flagcdn.com/w40/${obj.country}.png`}
                                       srcSet={`https://flagcdn.com/w80/${obj.country}.png 2x`}
                                       width="40"
                                       alt="Country flag"
                                    />
                                    <div
                                       className="relative"
                                       onMouseEnter={(e) => {
                                          const tooltip = document.getElementById(
                                             `tooltip-${obj.isin}`
                                          );
                                          if (tooltip) tooltip.style.display = "block";
                                       }}
                                       onMouseLeave={(e) => {
                                          const tooltip = document.getElementById(
                                             `tooltip-${obj.isin}`
                                          );
                                          if (tooltip) tooltip.style.display = "none";
                                       }}
                                    >
                                       <button
                                          type="button"
                                          className="ml-1 text-blue-500 hover:text-blue-700"
                                          title="Edit info"
                                          onClick={() => handleOpenInfoModal(obj)}
                                       >
                                          <span style={{ fontSize: "18px" }}>💡</span>
                                       </button>
                                       {/* Tooltip on hover */}
                                       <div
                                          id={`tooltip-${obj.isin}`}
                                          style={{ display: "none" }}
                                          className="absolute left-6 top-0 z-50 bg-white text-gray-800 border border-gray-300 rounded shadow-lg p-2 text-xs w-64 max-w-xs"
                                       >
                                          {/* CreatedAt */}
                                          {obj.createdAt && (
                                             <div className="mb-1 text-xs text-gray-500">
                                                Created: {new Date(obj.createdAt).toLocaleString()}
                                             </div>
                                          )}
                                          {/* UpdatedAt if different */}
                                          {obj.updatedAt && obj.updatedAt !== obj.createdAt && (
                                             <div className="mb-2 text-xs text-gray-500">
                                                Updated: {new Date(obj.updatedAt).toLocaleString()}
                                             </div>
                                          )}
                                          {/* Info content */}
                                          <div>
                                             {obj.info ? (
                                                obj.info
                                             ) : (
                                                <span className="italic text-gray-400">
                                                   No info
                                                </span>
                                             )}
                                          </div>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                              <div className="sm:col-span-1 [&>*]:text-center">
                                 <p>Rate</p>
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
                           <p
                              className={`font-bold ${
                                 safetyValues && +safetyValues.Fv >= obj.rate
                                    ? "text-green-500"
                                    : "text-red-500"
                              }`}
                           >
                              {safetyValues?.Fv}
                           </p>
                        </div>
                        <div className="[&>*]:text-center">
                           <p>Safety</p>
                           <p
                              className={`font-bold ${
                                 safetyValues && safetyValues.safetyMargin != "N/A"
                                    ? "text-green-500"
                                    : "text-red-500"
                              }`}
                           >
                              {safetyValues?.safetyMargin}
                           </p>
                        </div>
                        <div className="sm:col-span-6 lg:col-span-1 flex justify-center items-center">
                           <span
                              onClick={() => handleDelete(obj._id)}
                              className="absolute right-2 top-0 cursor-pointer"
                           >
                              x
                           </span>
                           <button
                              onClick={() => handleEdit(obj)}
                              className={
                                 "py-1 lg:px-3 px-7 bg-green-700 text-white lg:text-sm sm:text-lg rounded-md hover:bg-green-600"
                              }
                           >
                              {edit === obj.isin ? "Save" : "Edit"}
                           </button>
                        </div>
                     </div>
                     <div
                        className={`${
                           edit === obj.isin ? "flex" : "hidden"
                        } relative flex-col md:flex-row gap-2 py-2 px-4 bg-gray-800 rounded-lg text-white -mt-3 z-20 [&>div>p]:text-center [&>div>input]:outline-none`}
                     >
                        <div className="text-sm [&>*]:text-center">
                           <p>Country Code</p>
                           <input
                              onChange={(evt) => setInput({ ...input, country: evt.target.value })}
                              value={input.country}
                              className="rounded-sm text-gray-800"
                              type="text"
                           />
                        </div>
                        <div className="text-sm [&>*]:text-center">
                           <p>Growth 5y</p>
                           <input
                              onChange={(evt) =>
                                 setInput({ ...input, growthForecast: +evt.target.value })
                              }
                              value={input.growthForecast}
                              className="rounded-sm text-gray-800"
                              type="number"
                           />
                        </div>
                        <div className="text-sm [&>*]:text-center">
                           <p>PE Ratio</p>
                           <input
                              onChange={(evt) => setInput({ ...input, peRatio: evt.target.value })}
                              value={input.peRatio}
                              className="rounded-sm text-gray-800"
                              type="text"
                           />
                        </div>
                        <span
                           onClick={() => setEdit(false)}
                           className="absolute top-0 right-2 text-sm cursor-pointer"
                        >
                           x
                        </span>
                     </div>
                     {/* Info Modal */}
                     {infoModal === obj.isin && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                           <div className="bg-white rounded-lg p-6 w-[90vw] max-w-md shadow-lg relative">
                              <button
                                 className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                                 onClick={() => setInfoModal(false)}
                              >
                                 x
                              </button>
                              <h2 className="text-lg font-bold mb-2">Edit Info for {obj.ticker}</h2>
                              {/* Show createdAt at the very top, updatedAt below if different */}
                              {obj.createdAt && (
                                 <div className="mb-1 text-xs text-gray-500">
                                    Created: {new Date(obj.createdAt).toLocaleString()}
                                 </div>
                              )}
                              {obj.updatedAt && obj.updatedAt !== obj.createdAt && (
                                 <div className="mb-2 text-xs text-gray-500">
                                    Updated: {new Date(obj.updatedAt).toLocaleString()}
                                 </div>
                              )}
                              <textarea
                                 className="w-full border rounded p-2 mb-4"
                                 rows={4}
                                 value={infoText}
                                 onChange={(e) => setInfoText(e.target.value)}
                              />
                              <div className="flex justify-end gap-2">
                                 <button
                                    className="px-4 py-1 bg-gray-300 rounded hover:bg-gray-400"
                                    onClick={() => setInfoModal(false)}
                                 >
                                    Cancel
                                 </button>
                                 <button
                                    className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                                    onClick={() => handleSaveInfo(obj)}
                                 >
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
