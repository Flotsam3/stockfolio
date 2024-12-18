type incomeData = Record<string, Array<Record<string, string>>>;

export function processEfficiencyAndLeverage(income:incomeData, balance:incomeData){
    const annualIncome = income.annualReports.slice(0, 5);
    const quarterlyIncome = income.quarterlyReports.slice(0, 5);
    const annualBalance = balance.annualReports.slice(0, 5);
    const quarterlyBalance = balance.quarterlyReports.slice(0, 5);

    const annualResult1 = annualIncome.map((obj)=>{
        const year = obj.fiscalDateEnding.slice(2, 4);
        const ebitda = +obj.ebitda / 1_000_000;

        return {year, value:ebitda};
    });

    const annualResult2 = annualBalance.map((obj)=>{
        const year = obj.fiscalDateEnding.slice(2, 4);
        const debtToEquity = (+obj.totalLiabilities / +obj.totalShareholderEquity);

        return {year, value:debtToEquity.toFixed(2)};
    });

    const quarterlyResult1 = quarterlyIncome.map((obj)=>{
        const month = obj.fiscalDateEnding.slice(5, 7);
        const year = obj.fiscalDateEnding.slice(2, 4);
        const ebitda = +obj.ebitda / 1_000_000;

        return {month, year, value:ebitda};
    });

    const quarterlyResult2 = quarterlyBalance.map((obj)=>{
        const month = obj.fiscalDateEnding.slice(5, 7);
        const year = obj.fiscalDateEnding.slice(2, 4);
        const debtToEquity = (+obj.totalLiabilities / +obj.totalShareholderEquity);

        return {month, year, value:debtToEquity.toFixed(2)};
    });

    return {annualResult1, annualResult2, quarterlyResult1, quarterlyResult2};
};