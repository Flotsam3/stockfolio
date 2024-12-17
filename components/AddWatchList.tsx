"use client"

import React, { useState, Dispatch, SetStateAction } from 'react';
import { postStockPortfolio } from '@/api/dashboard';
import { StockData } from '@/types/types';
import { getStockPortfolio } from '@/api/dashboard';
import toast, {Toaster} from "react-hot-toast";

export default function AddWatchList({portfolioNames, setPortfolioNames, stockDataName, setStockData}:{portfolioNames:{name:string}[], setPortfolioNames:Dispatch<SetStateAction<{
    name: string;}[]>>, stockDataName:string, setStockData:Dispatch<SetStateAction<StockData>>}) {
    const [input, setInput] = useState("");

    const notify = () => toast.success("Added a new watchlist!")

    async function handleCreate(){
        try {
            const response = await postStockPortfolio(input);
            localStorage.setItem("watchList", input);
            notify();
            console.log({response});
            setStockData(response);
            setPortfolioNames([{name:input}])
        } catch (error) {
            console.log(error); 
        }
    }

    async function handleSwitchWatchList(name:string){
        const data = await getStockPortfolio(name);
        if (!data) return;
        localStorage.setItem("watchList", name);
        setStockData(data);
    }

  return (
    <div className='w-52 bg-[#161616] text-white mt-8 p-5'>
        <div className='flex gap-2'>
            {portfolioNames.map((obj) => (
                <div key={obj.name} className='flex justify-start mb-2'>
                    <span onClick={()=>handleSwitchWatchList(obj.name)} className={`inline-block w-4 h-4 rounded-full cursor-pointer ${obj.name === stockDataName ? "bg-yellow-400" : "bg-gray-700"}`}></span>
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
