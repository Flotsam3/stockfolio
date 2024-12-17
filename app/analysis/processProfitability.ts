type incomeData = Record<string, Array<Record<string, string>>>;

export function processProfitability(income:incomeData){
    const annual = income.annualReports.slice(0, 5);
    const quarterly = income.quarterlyReports.slice(0, 5);

    const annualResult = annual.map(obj=>{
        const year = obj.fiscalDateEnding.slice(2, 4);
        const grossProfit = (+obj.totalRevenue - +obj.costOfRevenue)/1_000_000;
        const operatingIncome = (+obj.grossProfit - +obj.operatingExpenses)/1_000_000;
        const netIncome = +obj.netIncome/1_000_000;

        return {year, grossProfit, operatingIncome, netIncome};
    });

    const quarterlyResult = quarterly.map(obj=>{
        const month = obj.fiscalDateEnding.slice(5, 7);
        const year = obj.fiscalDateEnding.slice(2, 4);
        const grossProfit = (+obj.totalRevenue - +obj.costOfRevenue)/1_000_000;
        const operatingIncome = (+obj.grossProfit - +obj.operatingExpenses)/1_000_000;
        const netIncome = +obj.netIncome/1_000_000;

        return {month, year, grossProfit, operatingIncome, netIncome};
    });

    return {annualResult, quarterlyResult};
};