"use client"

import React, {useState, Dispatch, SetStateAction} from 'react';
import { AddStockType } from '@/types/types';
import { StockData } from '@/types/types';
import { updateWatchList } from '@/api/dashboard';
import { getStockPortfolio } from '@/api/dashboard';
import { deleteOneWatchList } from '@/api/dashboard';
import Link from "next/link";

export default function WatchListPanel({watchList, stockData, setStockData}:{watchList:AddStockType[], stockData:StockData, setStockData:Dispatch<SetStateAction<StockData>>}) {
    const [edit, setEdit] = useState<boolean | string>(false);
    const [input, setInput] = useState<AddStockType>( {
        name:"",
        ticker:"",
        isin:"",
        country:"",
        rate:0,
        dilutedEps: 0,
        growthForecast: 0,
        peRatio:"",
    });

    async function handleEdit(obj:AddStockType){
        if (edit) {
            const data = await updateWatchList(input, stockData.name);
            setEdit(false);

            const updateData = await getStockPortfolio();
            setStockData(updateData);
        } else {
            setEdit(obj.isin);
            setInput(obj);
        }
    }

    function calcSafetyMargin(obj: AddStockType){
        if (!obj.peRatioAverage) return;

        const profitPerShare5y = obj.dilutedEps * (1 + obj.growthForecast/100) ** 5;
        const ratePerStock5y = profitPerShare5y * obj.peRatioAverage;
        const fundamentalValue = ratePerStock5y/(1 + stockData.anualTargetReturn/100) ** 5;
        let safetyMargin = -(obj.rate/fundamentalValue-1).toFixed(2);
        const Fv = fundamentalValue.toFixed(2);
        if (safetyMargin < 0) return {safetyMargin: "N/A", Fv};
        return {safetyMargin, Fv};
    }

    async function handleDelete(id: string | undefined){
        if (!id) return;
        const response = await deleteOneWatchList(stockData.name, id);
        
        const updateData = await getStockPortfolio();
        setStockData(updateData);
    }

  return (
  <>
  {watchList.map((obj, index) => {
    const safetyValues = calcSafetyMargin(obj);
    return (  
        <div key={index} className='flex flex-col items-center'>
            <div className="relative grid grid-cols-1 sm:grid-cols-custom-sm lg:grid-cols-custom-lg md:grid-cols-custom-tablet lg:w-[60vw] w-[95vw] sm:justify-center gap-3 lg:gap-0 bg-white mt-3 p-4 rounded-xl [&>div>input:first-child]:text-sm [&>div>p:first-child]:text-sm [&>div>input:first-child]:font-bold [&>div>p:first-child]:font-bold" >
                {edit === obj.isin ? 
                <>
                    <div className='flex flex-col items-center sm:col-span-6 lg:col-span-1 [&>input]:w-[90%] [&>input]:bg-slate-200 [&>input]:rounded-md [&>input]:p-1 [&>input]:outline-none'>
                        <input className='text-center lg:text-left' type="text" onChange={(evt)=>setInput({...input, ticker:evt.target.value})} value={input.ticker}/>
                        <input className='text-center lg:text-left' type="text" onChange={(evt)=>setInput({...input, name:evt.target.value})} value={input.name}/>
                    </div>
                    <div className='sm:col-span-1 flex flex-col items-center [&>input]:w-[90%] [&>input]:bg-slate-200 [&>input]:rounded-md [&>input]:p-1 [&>input]:outline-none [&>*]:text-center'>
                        <input  type="text" onChange={(evt)=>setInput({...input, isin:evt.target.value})} value={input.isin}/>
                        <img
                            
                            src={`https://flagcdn.com/w40/${obj.country}.png`}
                            srcSet={`https://flagcdn.com/w80/${obj.country}.png 2x`}
                            width="40"
                            alt="Country flag" />
                    </div>
                    <div className='flex flex-col items-center sm:col-span-1 [&>input]:w-[90%] [&>input]:bg-slate-200 [&>input]:rounded-md [&>input]:p-1 [&>input]:outline-none [&>*]:text-center'>
                        <p >Rate</p>
                        <input  type="number" onChange={(evt)=>setInput({...input, rate:+evt.target.value})} value={input.rate}/>
                    </div>
                    <div className='flex flex-col items-center sm:col-span-1 [&>input]:w-[90%] [&>input]:bg-slate-200 [&>input]:rounded-md [&>input]:p-1 [&>input]:outline-none [&>*]:text-center'>
                        <p >EPS</p>
                        <input  type="number" onChange={(evt)=>setInput({...input, dilutedEps:+evt.target.value})} value={input.dilutedEps}/>
                    </div>
                </>
                : <>
                    <div title='Click for technical details' className='sm:col-span-6 sm:text-center text-2xl lg:text-base lg:col-span-1'>
                        <p className='text-center lg:text-left cursor-pointer'><Link href={`/details/${obj.ticker}?name=${obj.name}`}>{obj.ticker}</Link></p>
                        <p className='text-center lg:text-left'>{obj.name}</p>
                    </div>
                    <div className='sm:col-span-1 flex flex-col items-center [&>*]:text-center'>
                        <p>{obj.isin}</p>
                        <img
                            src={`https://flagcdn.com/w40/${obj.country}.png`}
                            srcSet={`https://flagcdn.com/w80/${obj.country}.png 2x`}
                            width="40"
                            alt="Country flag" />
                    </div>
                    <div className='sm:col-span-1 [&>*]:text-center'>
                        <p>Rate</p>
                        <p>{obj.rate}</p>
                    </div>
                    <div className='sm:col-span-1 [&>*]:text-center'>
                        <p>EPS</p>
                        <p>{obj.dilutedEps}</p>
                    </div>
                </>}
                    <div className='sm:col-span-1 [&>*]:text-center'>
                        <p>PE Ratio (5y)</p>
                        <p>{obj.peRatioAverage}</p>
                    </div>
                    <div className='sm:col-start-2 sm:col-span-1 lg:col-start-auto lg:col-span-auto [&>*]:text-center'>
                        <p title='Fundamental Value'>Fv</p>
                        <p className={`font-bold ${safetyValues && +safetyValues.Fv >= obj.rate ? 'text-green-500' : 'text-red-500'}`}>
                            {safetyValues?.Fv}
                        </p>
                    </div>
                    <div className='[&>*]:text-center'>
                        <p>Safety</p>
                        <p className={`font-bold ${safetyValues && safetyValues.safetyMargin != "N/A" ? 'text-green-500' : 'text-red-500'}`}>
                            {safetyValues?.safetyMargin}
                        </p>
                    </div>
                    <div className='sm:col-span-6 lg:col-span-1 flex justify-center items-center'>
                        <span onClick={()=>handleDelete(obj._id)} className='absolute right-2 top-0 cursor-pointer'>x</span>
                        <button onClick={()=>handleEdit(obj)} className={'py-1 lg:px-3 px-7 bg-green-700 text-white lg:text-sm sm:text-lg rounded-md hover:bg-green-600'}>{edit === obj.isin ? "Save" : "Edit"}</button>
                    </div>
            </div>
            <div className={`${edit === obj.isin ? "flex" : "hidden"} relative flex-col md:flex-row gap-2 py-2 px-4 bg-gray-800 rounded-lg text-white -mt-3 z-20 [&>div>p]:text-center [&>div>input]:outline-none`}>
                <div className='text-sm [&>*]:text-center'>
                    <p>Country Code</p>
                    <input onChange={(evt)=>setInput({...input, country:evt.target.value})} value={input.country} className='rounded-sm text-gray-800' type="text" />
                </div>
                <div className='text-sm [&>*]:text-center'>
                    <p>Growth 5y</p>
                    <input onChange={(evt)=>setInput({...input, growthForecast:+evt.target.value})} value={input.growthForecast} className='rounded-sm text-gray-800' type="number" />
                </div>
                <div className='text-sm [&>*]:text-center'>
                    <p>PE Ratio</p>
                    <input onChange={(evt)=>setInput({...input, peRatio:evt.target.value})} value={input.peRatio} className='rounded-sm text-gray-800' type="text" />
                </div>
                <span onClick={()=>setEdit(false)} className='absolute top-0 right-2 text-sm cursor-pointer'>x</span>
            </div>
        </div>
    );
})}
  </>
  )
}
