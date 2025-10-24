"use client"

import React, { useState } from 'react';
import { getIncomeStatement, getBalanceSheet, getCashFlow, getMonthlyStock } from '@/libs/api';
import { useStockContext } from '@/app/context/StockContext';
import toast, { Toaster } from 'react-hot-toast';
import { getCompany, createCompany, updateCompany } from '@/services/company';
import AnalysisSection from '@/components/AnalysisSection';
import { processEfficiencyAndLeverage } from '../../fundamentals/processEfficiencyAndLeverage';
import { processLiquidity } from '../../fundamentals/processLiquidity';
import { processProfitability } from '../../fundamentals/processProfitability';
import { processValuation } from '../../fundamentals/processValuation';
import { Profitability, EfficiencyAndLeverage, Liquidity, Valuation } from '@/types/types';
import AnalysisInfo from '@/components/AnalysisInfo';

const API_KEY: string = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_KEY || "";
const BASE_URL: string = process.env.NEXT_PUBLIC_BASE_URL || "";

export default function Fundamentals() {
  const { stockData } = useStockContext();
  const [select, setSelect] = useState("");
  const [message, setMessage] = useState("Pick a company from the list!");
  const [isLoading, setIsLoading] = useState(false);

  const [profitability, setProfitability] = useState<Profitability>({
    annual: [],
    quarterly: []
  });

  const [efficiencyAndLeverage, setEfficiencyAndLeverage] = useState<EfficiencyAndLeverage>({
    ebitdaAnnual: [],
    ebitdaQuarterly: [],
    debtToEquityAnnual: [],
    debtToEquityQuarterly: []
  });

  const [liquidity, setLiquidity] = useState<Liquidity>({
    currentRatioAnnual: [],
    currentRatioQuarterly: [],
    cashFlowAnnual: [],
    cashFlowQuarterly: []
  });

  const [valuation, setValuation] = useState<Valuation>({
    epsAnnual: [],
    epsQuarterly: [],
    peRatioAnnual: [],
    peRatioQuarterly: []
  });

  const notify = () => toast.error("You need to choose a company first!");
  const notifyCreateError = () => toast.error("Creating the company data failed!");
  const notifyUpdateError = () => toast.error("Updating the company data failed!");

  async function handleSelectChange(evt: React.ChangeEvent<HTMLSelectElement>) {
    try {
      const selectedValue = evt.target.value;
      if (!selectedValue) return notify();

      setSelect(selectedValue);
      setIsLoading(true);
      const company = await getCompany(selectedValue);
      setIsLoading(false);
      if (!company) {
        setProfitability({ annual: [], quarterly: [] });
        setEfficiencyAndLeverage({ ebitdaAnnual: [], ebitdaQuarterly: [], debtToEquityAnnual: [], debtToEquityQuarterly: [] });
        setLiquidity({ currentRatioAnnual: [], currentRatioQuarterly: [], cashFlowAnnual: [], cashFlowQuarterly: [] });
        setValuation({ epsAnnual: [], epsQuarterly: [], peRatioAnnual: [], peRatioQuarterly: [] });
        return setMessage("No data for this company available yet. Click on the update button to get the latest figures!");
      }

      setProfitability(company.profitability);
      setEfficiencyAndLeverage(company.efficiencyAndLeverage);
      setLiquidity(company.liquidity);
      setValuation(company.valuation);
    } catch (error) {
      console.log(error);
    }
  }

  async function handleData() {
    try {
      if (!select) return notify();

      setIsLoading(true);
      const company = await getCompany(select);

      const income = await getIncomeStatement(select);
      const balance = await getBalanceSheet(select);
      const cashFlow = await getCashFlow(select);
      const monthlyStock = await getMonthlyStock(select);

      const data1 = processProfitability(income);
      const data2 = processEfficiencyAndLeverage(income, balance);
      const data3 = processLiquidity(balance, cashFlow);
      const data4 = processValuation(balance, cashFlow, monthlyStock);

      if (!company) {
        const companyData = {
          name: select,
          profitability: { annual: data1.annualResult, quarterly: data1.quarterlyResult },
          efficiencyAndLeverage: { debtToEquityAnnual: data2.annualResult1, debtToEquityQuarterly: data2.quarterlyResult1, ebitdaAnnual: data2.annualResult2, ebitdaQuarterly: data2.quarterlyResult2 },
          liquidity: { cashFlowAnnual: data3.annualResult1, cashFlowQuarterly: data3.quarterlyResult1, currentRatioAnnual: data3.annualResult2, currentRatioQuarterly: data3.quarterlyResult2 },
          valuation: { epsAnnual: data4.annualResult1, epsQuarterly: data4.quarterlyResult1, peRatioAnnual: data4.annualResult2, peRatioQuarterly: data4.quarterlyResult2 }
        };

        const response = await createCompany(companyData);
        if (!response) return notifyCreateError();

        setProfitability({ annual: data1.annualResult, quarterly: data1.quarterlyResult });
        setEfficiencyAndLeverage({ ebitdaAnnual: data2.annualResult1, ebitdaQuarterly: data2.quarterlyResult1, debtToEquityAnnual: data2.annualResult2, debtToEquityQuarterly: data2.quarterlyResult2 });
        setLiquidity({ currentRatioAnnual: data3.annualResult1, currentRatioQuarterly: data3.quarterlyResult1, cashFlowAnnual: data3.annualResult2, cashFlowQuarterly: data3.quarterlyResult2 });
        setValuation({ epsAnnual: data4.annualResult1, epsQuarterly: data4.quarterlyResult1, peRatioAnnual: data4.annualResult2, peRatioQuarterly: data4.quarterlyResult2 });
      } else {
        const companyData = {
          profitability: { annual: data1.annualResult, quarterly: data1.quarterlyResult },
          efficiencyAndLeverage: { debtToEquityAnnual: data2.annualResult1, debtToEquityQuarterly: data2.quarterlyResult1, ebitdaAnnual: data2.annualResult2, ebitdaQuarterly: data2.quarterlyResult2 },
          liquidity: { cashFlowAnnual: data3.annualResult1, cashFlowQuarterly: data3.quarterlyResult1, currentRatioAnnual: data3.annualResult2, currentRatioQuarterly: data3.quarterlyResult2 },
          valuation: { epsAnnual: data4.annualResult1, epsQuarterly: data4.quarterlyResult1, peRatioAnnual: data4.annualResult2, peRatioQuarterly: data4.quarterlyResult2 }
        };

        const updatedData = await updateCompany(select, companyData);
        if (!updatedData) return notifyUpdateError();

        setProfitability({ annual: updatedData.profitability.annual, quarterly: updatedData.profitability.quarterly });
        setEfficiencyAndLeverage({ ebitdaAnnual: updatedData.efficiencyAndLeverage.ebitdaAnnual, ebitdaQuarterly: updatedData.efficiencyAndLeverage.ebitdaQuarterly, debtToEquityAnnual: updatedData.efficiencyAndLeverage.debtToEquityAnnual, debtToEquityQuarterly: updatedData.efficiencyAndLeverage.debtToEquityQuarterly });
        setLiquidity({ currentRatioAnnual: updatedData.liquidity.currentRatioAnnual, currentRatioQuarterly: updatedData.liquidity.currentRatioQuarterly, cashFlowAnnual: updatedData.liquidity.cashFlowAnnual, cashFlowQuarterly: updatedData.liquidity.cashFlowQuarterly });
        setValuation({ epsAnnual: updatedData.valuation.epsAnnual, epsQuarterly: updatedData.valuation.epsQuarterly, peRatioAnnual: updatedData.valuation.peRatioAnnual, peRatioQuarterly: updatedData.valuation.peRatioQuarterly });
      }

      setIsLoading(false);

    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className='min-h-[calc(100vh-86px)] py-24 px-4 bg-neutral-300'>
      <h1 className='mb-4 text-center font-bold text-3xl'>Companies Fundamental Data</h1>
      <div className='flex justify-center mt-2'>
        <select onChange={handleSelectChange} className='py-1 px-2 outline-none' name="companies" id="companies">
          <option value="">Choose a company</option>
          {stockData.watchList.map((obj, index) => (
            <option key={index} value={obj.ticker}>{obj.name}</option>
          ))}
        </select>
      </div>
      {profitability.annual.length === 0 ?
        <h1 className='py-5 text-2xl text-center'>{isLoading ? "Loading data..." : message}</h1> :
        <section className='grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-1 auto-rows-max gap-3 py-5 text-white'>
          <div className='bg-zinc-600 shadow-xl rounded-sm pt-2'>
            <h2 className='text-lg text-center'>Profitability </h2>
            <AnalysisSection title={"Gross Profit"} data={{ profitability, efficiencyAndLeverage, liquidity, valuation }} />
            <AnalysisSection title={"Operating Income"} data={{ profitability, efficiencyAndLeverage, liquidity, valuation }} />
            <AnalysisSection title={"Net Income"} data={{ profitability, efficiencyAndLeverage, liquidity, valuation }} />
          </div>
          <div className='bg-zinc-600 shadow-xl rounded-sm pt-2'>
            <h2 className='text-center text-lg'>Efficiency and Leverage</h2>
            <AnalysisSection title={"EBITDA"} data={{ profitability, efficiencyAndLeverage, liquidity, valuation }} />
            <AnalysisSection title={"Debt-to-Equity Ratio"} data={{ profitability, efficiencyAndLeverage, liquidity, valuation }} />
          </div>
          <div className='bg-zinc-600 shadow-xl rounded-sm pt-2'>
            <h2 className='text-center text-lg'>Liquidity </h2>
            <AnalysisSection title={"Current Ratio"} data={{ profitability, efficiencyAndLeverage, liquidity, valuation }} />
            <AnalysisSection title={"Operating Cash Flow"} data={{ profitability, efficiencyAndLeverage, liquidity, valuation }} />
          </div>
          <div className='bg-zinc-600 shadow-xl rounded-sm pt-2'>
            <h2 className='text-center text-lg'>Valuation </h2>
            <AnalysisSection title={"Earnings Per Share (EPS)"} data={{ profitability, efficiencyAndLeverage, liquidity, valuation }} />
            <AnalysisSection title={"Price-To-Earnings (P/E) Ratio"} data={{ profitability, efficiencyAndLeverage, liquidity, valuation }} />
          </div>
        </section>
      }
      <div className='flex justify-center'>
        <button onClick={handleData} className='py-2 px-4 bg-green-700 hover:bg-green-600 text-white rounded-md'>Update Data</button>
      </div>
      <AnalysisInfo />
      <Toaster></Toaster>
    </div>
  )
}
