"use client"

import React, { useState, Dispatch, SetStateAction } from 'react';
import { postStockPortfolio } from '@/services/dashboard';
import { StockData } from '@/types/types';
import { getAllPortfolios, switchWatchList } from '@/services/dashboard';
import toast, {Toaster} from "react-hot-toast";

export default function AddWatchList({portfolioNames, setPortfolioNames,  setStockData}:{portfolioNames:StockData[], setPortfolioNames:Dispatch<SetStateAction<StockData[]>>, setStockData:Dispatch<SetStateAction<StockData>>}) {
    const [input, setInput] = useState("");

    const notify = () => toast.success("Added a new watchlist!");
    const notifyError = (msg:string) => toast.error(msg || "Could not create watchlist");

    console.log({portfolioNames});
    

    async function handleCreate(){
        try {
            const response = await postStockPortfolio(input);
            notify();
            if (response && response._id) {
                notify();
                setStockData(response);
            } else {
                console.warn("Unexpected response from postStockPortfolio", response);
                notifyError(response?.error || response?.msg || "Failed to create watchlist");
            }

            const updatedData = await getAllPortfolios();
            if (Array.isArray(updatedData)) {
                setPortfolioNames(updatedData);
            } else {
                console.warn('Unexpected portfolios response', updatedData);
            }
            setInput("");
        } catch (error) {
            console.log(error); 
        }
    }

    async function handleSwitchWatchList(id:string | undefined){
        if (!id) return;

        const updatedWatchlist = await switchWatchList(id);
        const response = await getAllPortfolios();
        
        setStockData(updatedWatchlist);
        setPortfolioNames(response);
    }

  return (
    <div className='w-52 bg-[#161616] text-white mt-8 p-5'>
        <div className='flex gap-2'>
            {portfolioNames.map((obj) => (
                <div key={obj._id} className='flex justify-start mb-2' title={obj.name}>
                    <span onClick={()=>handleSwitchWatchList(obj._id)} className={`inline-block w-4 h-4 rounded-full cursor-pointer ${obj.active === true ? "bg-yellow-400" : "bg-gray-700"}`}></span>
                </div>
            ))}
        </div>
        <div className='flex flex-col items-center'>
            <label className='flex flex-col text-sm'>New Watchlist
                <input onChange={(evt)=>setInput(evt.target.value)} value={input} type="text" className='rounded-sm p-1 mt-2 bg-[#212224] text-white outline-none text-center' />
            </label>
            <button onClick={handleCreate} className='bg-yellow-400 py-1 px-4 mt-3 rounded-sm text-main-dark font-bold text-sm hover:bg-white'>Create</button>
        </div>
        <Toaster />
    </div>
  )
}
