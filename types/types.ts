export type AddStockType = {
    name:string,
    ticker:string,
    isin:string,
    country:string,
    rate:number,
    dilutedEps: number,
    growthForecast: number,
    peRatio:string,
    peRatioAverage?:number,
    anualTargetReturn?:number
    _id?:string
}

export type StockData = {
    name:string,
    watchList:[{
        name:string,
        ticker:string,
        isin:string,
        country:string,
        rate:number,
        dilutedEps: number,
        growthForecast: number,
        peRatio:string,
        anualTargetReturn?:number
    }],
    anualTargetReturn:number,
    _id?:string
}

export type EconomicEntry = {
    value: number | string;
    date?: Date;
}

export type EconomicsType = {
    inflation: EconomicEntry[];
    cpi: EconomicEntry[];
    unemployment: EconomicEntry[];
    interest: EconomicEntry[];
    _id?: string;
}

type ProfitabilityRecord = {
    grossProfit: number;
    netIncome: number;
    operatingIncome: number;
    year: string;
    month?: string;  // Optional for quarterly data
  };
  
export type Profitability = {
    annual: ProfitabilityRecord[];
    quarterly: ProfitabilityRecord[];
  };

type FinancialMetric = {
    value: number | string;
    year: string;
    month?: string;  // Optional for quarterly data
  };
  
export type EfficiencyAndLeverage = {
    ebitdaAnnual: FinancialMetric[];
    ebitdaQuarterly: FinancialMetric[];
    debtToEquityAnnual: FinancialMetric[];
    debtToEquityQuarterly: FinancialMetric[];
  };

export type Liquidity = {
    currentRatioAnnual: FinancialMetric[];
    currentRatioQuarterly: FinancialMetric[];
    cashFlowAnnual: FinancialMetric[];
    cashFlowQuarterly: FinancialMetric[];
  };

type ValuationMetric = {
    value: string;  // EPS and PE Ratio might use string for non-numeric values
    year: string;
    month?: string;
  };
  
export type Valuation = {
    epsAnnual: ValuationMetric[];
    epsQuarterly: ValuationMetric[];
    peRatioAnnual: ValuationMetric[];
    peRatioQuarterly: ValuationMetric[];
  };

/* 
{
    profitabilityAnnual: [{
        grossProfit: number,
        netIncome: number,
        operatingIncome: number,
        year: string
    }],
    profitabilityQuarterly: [{
        grossProfit: number,
        netIncome: number,
        operatingIncome: number,
        year: string,
        month: string
    }],
    EfficiencyLeverage: {
        ebitdaAnnual:[{
            value: number, // ebitda
            year: string
            }],
        ebitdaQuarterly: [{
            value: number, // ebitda
            year: string,
            month: string
            }],
        debtToEquityAnnual:[{
            value: number, // debtToEquity
            year: string
            }],
        debtToEquityQuarterly: [{
            value: number, // debtToEquity
            year: string,
            month: string
        }]
    },
    Liquidity: {
        currentRatioAnnual:[{
            value: number, // currentRatio
            year: string
            }],
        currentRatioQuarterly: [{
            value: number, // currentRatio
            year: string,
            month: string
            }],
        cashFlowAnnual:[{
            value: number, // operatingCashFlow
            year: string
            }],
        cashFlowQuarterly: [{
            value: number, // operatingCashFlow
            year: string,
            month: string
        }]
    },
    Valuation: {
        epsAnnual:[{
            value: string, // eps
            year: string
        }],
        epsQuarterly:[{
            value: string, // eps
            year: string,
            month: string
        }],
        peRatioAnnual:[{
            value: string, // peRatio
            year: string
        }],
        peRatioQuarterly:[{
            value: string, // peRatio
            year: string,
            month: string
        }]
    }
}
*/