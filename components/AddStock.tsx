"use client"

import React, { useState, Dispatch, SetStateAction } from 'react';
import { StockData } from '../types/types';
import { getStockPortfolio } from '@/api/dashboard';
import { AddStockType } from '../types/types';
import { postNewWatchList } from '@/api/dashboard';
import toast, {Toaster} from "react-hot-toast";

export default function AddStock({setStockData, stockData}:{setStockData: Dispatch<SetStateAction<StockData>>, stockData:StockData}) {
    const [input, setInput] = useState<AddStockType>({
        name:"",
        ticker:"",
        isin:"",
        country:"",
        rate:0,
        dilutedEps: 0,
        growthForecast: 0,
        peRatio:""
    });

    const notify = () => toast.error("You need to create a watchlist first!");

    async function handleForm(evt: React.MouseEvent<HTMLButtonElement>){
        try {
            evt.preventDefault();
            console.log("stockData name", stockData.name);
            if (!stockData.name) return notify();
            // if (!input.name || !input.ticker || !input.isin || !input.country || !input.peRatio) return;
            if (!input.name || !input.ticker || !input.isin || !input.country) return;
            await postNewWatchList(input, stockData.name, stockData.anualTargetReturn);
            const data = await getStockPortfolio();
            if (!data) return console.log("Error while fetching stock data!");
            setStockData(data);
            setInput({
                name:"",
                ticker:"",
                isin:"",
                country:"",
                rate:0,
                dilutedEps: 0,
                growthForecast: 0,
                peRatio:""
            })
        } catch (error) {
            console.log(error);
        }
    }
    
  return (
    <div className='block md:absolute top-0 right-0 w-64 bg-[#161616] text-white rounded-lg'>
        <p className='pl-5 pt-3'>Add To Watchlist</p>
        <form className='flex flex-col items-center gap-3 p-3 [&>label>input]:rounded-sm [&>label>input]:outline-none [&>label>input]:p-1 text-sm [&>label>input]:flex [&>label]:flex-col [&>label>input]:w-full [&>label>input]:bg-[#212224] [&>label]:w-full'>
            <label>Stock
                <input type="text" name='stock' onChange={(evt)=>setInput({...input, name:evt.target.value})} value={input.name}/>
            </label>
            <label>Ticker
                <input type="text" name='ticker' onChange={(evt)=>setInput({...input, ticker:evt.target.value})} value={input.ticker}/>
            </label>
            <label>ISIN
                <input type="text" name='isin' onChange={(evt)=>setInput({...input, isin:evt.target.value})} value={input.isin}/>
            </label>
            <label>Country Code
                <input type="text" maxLength={2} name='country' onChange={(evt)=>setInput({...input, country:evt.target.value})} value={input.country}/>
            </label>
            <label>Rate
                <input type="number" name='rate' onChange={(evt)=>setInput({...input, rate:+evt.target.value})} value={input.rate}/>
            </label>
            <label title='yahoo.com/statistiken/GuV'>Diluted EPS (ttm)
                <input type="number" name='eps-diluted' onChange={(evt)=>setInput({...input, dilutedEps:+evt.target.value})} value={input.dilutedEps}/>
            </label>
            <label title='stockanalysis.com/stocks/statistics/Analyst-Forecast'>5-year earnings growth forecast
                <input type="number" name='growth-forecast' onChange={(evt)=>setInput({...input, growthForecast:+evt.target.value})} value={input.growthForecast}/>
            </label>
            <label title='stockanalysis.com/stocks/financials/ratios'>PE Ratio (semicolon separated)
                <input type="text" name='pe-ratio' onChange={(evt)=>setInput({...input, peRatio:evt.target.value})} value={input.peRatio}/>
            </label>
            <button onClick={handleForm} className='bg-yellow-400 px-4 py-1 text-main-dark rounded-md mt-3 font-bold hover:bg-white'>Add</button>
        </form>
        <Toaster />
    </div>
  )
}
