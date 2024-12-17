"use client"

import React, {useState, useEffect} from 'react';
import { Profitability, EfficiencyAndLeverage, Liquidity, Valuation } from '@/types/types';

type AnalisisProps = {
    profitability: Profitability,
    efficiencyAndLeverage: EfficiencyAndLeverage,
    liquidity: Liquidity,
    valuation: Valuation
}

export default function AnalysisSection({title, data}:{title:string, data:AnalisisProps}) {
    const [monthlyData, setMonthlyData] = useState<any[]>([]);
    const [quarterlyData, setQuarterlyData] = useState<any[]>([]);
    const [valueName, setValueName] = useState<string>("");

    useEffect(()=>{
        switch (title) {
            case "Gross Profit": 
                setMonthlyData(data.profitability.annual);
                setQuarterlyData(data.profitability.quarterly);
                setValueName("grossProfit")
                break;
            case "Operating Income": 
                setMonthlyData(data.profitability.annual);
                setQuarterlyData(data.profitability.quarterly);
                setValueName("operatingIncome")
                break;
            case "Net Income": 
                setMonthlyData(data.profitability.annual);
                setQuarterlyData(data.profitability.quarterly);
                setValueName("netIncome")
                break;
            case "EBITDA": 
                setMonthlyData(data.efficiencyAndLeverage.ebitdaAnnual);
                setQuarterlyData(data.efficiencyAndLeverage.ebitdaQuarterly);
                setValueName("value")
                break;
            case "Debt-to-Equity Ratio": 
                setMonthlyData(data.efficiencyAndLeverage.debtToEquityAnnual);
                setQuarterlyData(data.efficiencyAndLeverage.debtToEquityQuarterly);
                setValueName("value")
                break;
            case "Current Ratio": 
                setMonthlyData(data.liquidity.currentRatioAnnual);
                setQuarterlyData(data.liquidity.currentRatioQuarterly);
                setValueName("value")
                break;
            case "Operating Cash Flow": 
                setMonthlyData(data.liquidity.cashFlowAnnual);
                setQuarterlyData(data.liquidity.cashFlowQuarterly);
                setValueName("value")
                break;
            case "Earnings Per Share (EPS)": 
                setMonthlyData(data.valuation.epsAnnual);
                setQuarterlyData(data.valuation.epsQuarterly);
                setValueName("value")
                break;
            case "Price-To-Earnings (P/E) Ratio": 
                setMonthlyData(data.valuation.peRatioAnnual);
                setQuarterlyData(data.valuation.peRatioQuarterly);
                setValueName("value")
                break;
        
            default:
                break;
        }
    },[data])

  return (
    <section className='py-3'>
        <h3 className='text-center text-yellow-500 '>{title}</h3>
        <div className='flex justify-evenly text-gray-400 [&>div>p:last-of-type]:text-sm'>
            {monthlyData.map((obj, index)=>(
                <div key={index} className='flex flex-col items-center'>
                    <p>{obj.year}</p>
                    <p className='text-white text-center'>{obj[valueName]}</p>
                </div>
            ))}
        </div>
        <div className='flex justify-evenly text-gray-400 [&>div>p:last-of-type]:text-sm'>
            {quarterlyData.map((obj, index)=>(
                <div key={index} className='flex flex-col items-center'>
                    <p>{`${obj.month}/${obj.year}`}</p>
                    <p className='text-white text-center'>{obj[valueName]}</p>
                </div>
            ))}
        </div>
    </section>
  )
}
