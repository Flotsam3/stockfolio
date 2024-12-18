type incomeData = Record<string, Array<Record<string, string>>>;

export function processValuation(balance:incomeData, cashFlow:incomeData, monthlyStock:incomeData){
    const annualBalance = balance.annualReports.slice(0, 5);
    const quarterlyBalance = balance.quarterlyReports.slice(0, 5);
    const annualCashFlow = cashFlow.annualReports.slice(0, 5);
    const quarterlyCashFlow = cashFlow.quarterlyReports.slice(0, 5);
    const transformedArray = Object.entries(monthlyStock["Monthly Adjusted Time Series"]).map(([date, values]) => ({
        date,
        close: parseFloat(values["4. close"])
      }));

    const slicedData = transformedArray.slice(0, 72);
    const monthlyStockData = slicedData.slice(0, 24);

    let epsArrayAnnual: {eps:string, year:string}[] = [];
    let epsArrayMonthly: {eps:string, month:string, year:string}[] = [];

    const annualResult1 = annualBalance.map((obj, index)=>{
        const yearBalance = obj.fiscalDateEnding.slice(2, 4);
        const yearCashFlow = annualCashFlow[index].fiscalDateEnding.slice(2, 4);
        const sharesOutstanding = obj.commonStockSharesOutstanding;
        const netIncome = annualCashFlow[index].netIncome;

        let eps: number | string = "n/a";
        if (yearBalance === yearCashFlow){
            eps = (+netIncome / +sharesOutstanding).toFixed(2);
        }
        epsArrayAnnual.push({eps, year: yearBalance});
        return {value:eps, year: yearBalance};
    })

    const quarterlyResult1 = quarterlyBalance.map((obj, index)=>{
        const monthBalance = obj.fiscalDateEnding.slice(5, 7);
        const monthCashFlow = quarterlyCashFlow[index].fiscalDateEnding.slice(5, 7);
        const yearBalance = obj.fiscalDateEnding.slice(2, 4);
        const yearCashFlow = quarterlyCashFlow[index].fiscalDateEnding.slice(2, 4);
        const sharesOutstanding = obj.commonStockSharesOutstanding;
        const netIncome = quarterlyCashFlow[index].netIncome;

        let eps: number | string = "n/a";
        if (yearBalance === yearCashFlow && monthBalance === monthCashFlow){
            eps = (+netIncome / +sharesOutstanding).toFixed(2);
        }
        epsArrayMonthly.push({eps, month:monthBalance, year:yearBalance});
        return {value:eps, month:monthBalance, year:yearBalance};
    })

    const annualResult2 = annualBalance.map((obj, index)=>{
        const monthBalance = obj.fiscalDateEnding.slice(5, 7);
        const yearBalance = obj.fiscalDateEnding.slice(2, 4);

        const matchingStock = slicedData.find(obj=>{
            return obj.date.slice(2, 4) === yearBalance && obj.date.slice(5, 7) === monthBalance;
        });
        if (matchingStock?.date.slice(2, 4) === epsArrayAnnual[index].year){
            return {value:(matchingStock.close/+epsArrayAnnual[index].eps).toFixed(2), year:epsArrayAnnual[index].year}
        }
        return {value:"n/a", year:epsArrayAnnual[index].year}
    })

    const quarterlyResult2 = quarterlyBalance.map((obj, index)=>{
        const monthBalance = obj.fiscalDateEnding.slice(5, 7);
        const yearBalance = obj.fiscalDateEnding.slice(2, 4);

        const matchingStock = monthlyStockData.find(obj=>{
            return obj.date.slice(2, 4) === yearBalance && obj.date.slice(5, 7) === monthBalance;
        });
        if (matchingStock?.date.slice(2, 4) === epsArrayMonthly[index].year && matchingStock?.date.slice(5, 7) === epsArrayMonthly[index].month){
            return {value:(matchingStock.close/+epsArrayMonthly[index].eps).toFixed(2), year:epsArrayMonthly[index].year, month:epsArrayMonthly[index].month}
        }
        return {value:"n/a", year:epsArrayMonthly[index].year, month:epsArrayMonthly[index].month}
    })

    return {annualResult1, quarterlyResult1, annualResult2, quarterlyResult2};
}