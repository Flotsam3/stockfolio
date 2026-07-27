"use client"

import { Profitability, EfficiencyAndLeverage, Liquidity, Valuation } from '@/types/types';

type AnalysisProps = {
    profitability: Profitability,
    efficiencyAndLeverage: EfficiencyAndLeverage,
    liquidity: Liquidity,
    valuation: Valuation
}

type AnalysisRecord = Record<string, string | number | undefined>;

function getAnalysisData(title: string, data: AnalysisProps) {
    switch (title) {
        case "Gross Profit":
            return { monthlyData: data.profitability.annual, quarterlyData: data.profitability.quarterly, valueName: "grossProfit" };
        case "Operating Income":
            return { monthlyData: data.profitability.annual, quarterlyData: data.profitability.quarterly, valueName: "operatingIncome" };
        case "Net Income":
            return { monthlyData: data.profitability.annual, quarterlyData: data.profitability.quarterly, valueName: "netIncome" };
        case "EBITDA":
            return { monthlyData: data.efficiencyAndLeverage.ebitdaAnnual, quarterlyData: data.efficiencyAndLeverage.ebitdaQuarterly, valueName: "value" };
        case "Debt-to-Equity Ratio":
            return { monthlyData: data.efficiencyAndLeverage.debtToEquityAnnual, quarterlyData: data.efficiencyAndLeverage.debtToEquityQuarterly, valueName: "value" };
        case "Current Ratio":
            return { monthlyData: data.liquidity.currentRatioAnnual, quarterlyData: data.liquidity.currentRatioQuarterly, valueName: "value" };
        case "Operating Cash Flow":
            return { monthlyData: data.liquidity.cashFlowAnnual, quarterlyData: data.liquidity.cashFlowQuarterly, valueName: "value" };
        case "Earnings Per Share (EPS)":
            return { monthlyData: data.valuation.epsAnnual, quarterlyData: data.valuation.epsQuarterly, valueName: "value" };
        case "Price-To-Earnings (P/E) Ratio":
            return { monthlyData: data.valuation.peRatioAnnual, quarterlyData: data.valuation.peRatioQuarterly, valueName: "value" };
        default:
            return { monthlyData: [], quarterlyData: [], valueName: "value" };
    }
}

export default function AnalysisSection({title, data}:{title:string, data:AnalysisProps}) {
    const { monthlyData, quarterlyData, valueName } = getAnalysisData(title, data);

  return (
    <section className='py-3'>
        <h3 className='text-center text-yellow-500 '>{title}</h3>
        <div className='flex justify-evenly text-gray-400 [&>div>p:last-of-type]:text-sm'>
            {(monthlyData as AnalysisRecord[]).map((obj, index)=>(
                <div key={index} className='flex flex-col items-center'>
                    <p>{obj.year}</p>
                    <p className='text-white text-center'>{obj[valueName]}</p>
                </div>
            ))}
        </div>
        <div className='flex justify-evenly text-gray-400 [&>div>p:last-of-type]:text-sm'>
            {(quarterlyData as AnalysisRecord[]).map((obj, index)=>(
                <div key={index} className='flex flex-col items-center'>
                    <p>{`${obj.month}/${obj.year}`}</p>
                    <p className='text-white text-center'>{obj[valueName]}</p>
                </div>
            ))}
        </div>
    </section>
  )
}
