type incomeData = Record<string, Array<Record<string, string>>>;

export function processLiquidity(balance:incomeData, cashFlow:incomeData){
    const annualBalance = balance.annualReports.slice(0, 5);
    const quarterlyBalance = balance.quarterlyReports.slice(0, 5);
    const annualCashFlow = cashFlow.annualReports.slice(0, 5);
    const quarterlyCashFlow = cashFlow.quarterlyReports.slice(0, 5);

    const annualResult1 = annualBalance.map((obj)=>{
        const year = obj.fiscalDateEnding.slice(2, 4);
        const currentRatio = +obj.totalCurrentAssets / +obj.totalCurrentLiabilities;
        
        return {year, value:currentRatio.toFixed(1)};
    });

    const annualResult2 = annualCashFlow.map((obj)=>{
        const year = obj.fiscalDateEnding.slice(2, 4);
        const operatingCashFlow = +obj.operatingCashflow/1_000_000;

        return {year, value:Number(operatingCashFlow).toFixed(0)};
    });

    const quarterlyResult1 = quarterlyBalance.map((obj)=>{
        const month = obj.fiscalDateEnding.slice(5, 7);
        const year = obj.fiscalDateEnding.slice(2, 4);
        const currentRatio = +obj.totalCurrentAssets / +obj.totalCurrentLiabilities;

        return {month, year, value:currentRatio.toFixed(1)};
    });

    const quarterlyResult2 = quarterlyCashFlow.map((obj)=>{
        const month = obj.fiscalDateEnding.slice(5, 7);
        const year = obj.fiscalDateEnding.slice(2, 4);
        const operatingCashFlow = +obj.operatingCashflow/1_000_000;

        return {month, year, value:Number((operatingCashFlow).toFixed(0))};
    });

    return {annualResult1, annualResult2, quarterlyResult1, quarterlyResult2};
};