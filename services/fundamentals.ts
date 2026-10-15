async function getFundamentals(operation: string, symbol: string) {
    const params = new URLSearchParams({ function: operation, symbol });
    const response = await fetch(`/api/fundamentals?${params}`, { cache: "no-store" });
    if (!response.ok) {
        throw new Error("Loading company data failed. Please try again later.");
    }
    return response.json();
}

export function getIncomeStatement(symbol: string) {
    return getFundamentals("INCOME_STATEMENT", symbol);
}

export function getBalanceSheet(symbol: string) {
    return getFundamentals("BALANCE_SHEET", symbol);
}

export function getCashFlow(symbol: string) {
    return getFundamentals("CASH_FLOW", symbol);
}

export function getMonthlyStock(symbol: string) {
    return getFundamentals("TIME_SERIES_MONTHLY_ADJUSTED", symbol);
}
