"use client"

import React, { useState, Dispatch, SetStateAction } from 'react';
import { StockData } from '@/types/types';
import { AddStockType } from '@/types/types';
import { postNewWatchList } from '@/services/dashboard';
import toast, {Toaster} from "react-hot-toast";

export default function AddStock({setStockData, stockData}:{setStockData: Dispatch<SetStateAction<StockData>>, stockData:StockData}) {
    const [input, setInput] = useState<AddStockType>({
        name:"",
        ticker:"",
        isin:"",
        country:"",
        rate: null,
        dilutedEps: null,
        growthForecast: null,
        peRatio:""
    });

    const notify = () => toast.error("You need to create a watchlist first!");

    async function handleForm(evt: React.FormEvent<HTMLFormElement>){
        evt.preventDefault();
        try {
            if (!stockData.name) return notify();
            const name = input.name.trim();
            const ticker = input.ticker.trim();
            const country = input.country.trim();
            if (!name || !ticker || !country) return toast.error("Enter a stock name, ticker, and country code.");
            const data = await postNewWatchList({ ...input, name, ticker, country }, stockData.name);
            setStockData(current => current._id === data._id ? data : current);
            setInput({
                name:"",
                ticker:"",
                isin:"",
                country:"",
                rate: null,
                dilutedEps: null,
                growthForecast: null,
                peRatio:""
            })
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not add the stock.");
        }
    }
    
  return (
    <div className='block md:absolute top-0 right-0 w-64 bg-[#161616] text-white rounded-lg'>
        <p className='pl-5 pt-3'>Add To Watchlist</p>
        <form onSubmit={handleForm} className='flex flex-col items-center gap-3 p-3 [&>label>input]:rounded-sm [&>label>input]:outline-none [&>label>input]:p-1 text-sm [&>label>input]:flex [&>label]:flex-col [&>label>input]:w-full [&>label>input]:bg-[#212224] [&>label]:w-full'>
            <label>Stock<span aria-hidden="true" className="ml-1 text-xs">*</span>
                <input type="text" name='stock' required onChange={(evt)=>setInput({...input, name:evt.target.value})} value={input.name}/>
            </label>
            <label>Ticker<span aria-hidden="true" className="ml-1 text-xs">*</span>
                <input type="text" name='ticker' required placeholder="NVDA or CPH:JYSK" onChange={(evt)=>setInput({...input, ticker:evt.target.value})} value={input.ticker}/>
            </label>
            <label>ISIN
                <input type="text" name='isin' onChange={(evt)=>setInput({...input, isin:evt.target.value})} value={input.isin}/>
            </label>
            <label>Country Code<span aria-hidden="true" className="ml-1 text-xs">*</span>
                <input type="text" maxLength={2} name='country' required onChange={(evt)=>setInput({...input, country:evt.target.value})} value={input.country}/>
            </label>
            <label>Price (USD)
                <input type="number" step="any" name='rate' onChange={(evt)=>setInput({...input, rate:evt.target.value === "" ? null : evt.target.valueAsNumber})} value={input.rate ?? ""}/>
            </label>
            <label title='yahoo.com/statistiken/GuV'>Diluted EPS (TTM, USD)
                <input type="number" step="any" name='eps-diluted' onChange={(evt)=>setInput({...input, dilutedEps:evt.target.value === "" ? null : evt.target.valueAsNumber})} value={input.dilutedEps ?? ""}/>
            </label>
            <label title='stockanalysis.com/stocks/statistics/Analyst-Forecast'>5-year earnings growth forecast
                <input type="number" step="any" name='growth-forecast' onChange={(evt)=>setInput({...input, growthForecast:evt.target.value === "" ? null : evt.target.valueAsNumber})} value={input.growthForecast ?? ""}/>
            </label>
            <label title='stockanalysis.com/stocks/financials/ratios'>PE Ratio (semicolon separated)
                <input type="text" name='pe-ratio' onChange={(evt)=>setInput({...input, peRatio:evt.target.value})} value={input.peRatio}/>
            </label>
            <button type="submit" className='bg-yellow-400 px-4 py-1 text-main-dark rounded-md mt-3 font-bold hover:bg-white'>Add</button>
        </form>
        <Toaster />
    </div>
  )
}
