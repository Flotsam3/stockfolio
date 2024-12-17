const API_KEY:string = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_KEY || "";
console.log({API_KEY});

export async function getInflation(){
    try {
        const response = await fetch(`https://www.alphavantage.co/query?function=INFLATION&apikey=${API_KEY}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log(error);
    }
}

export async function getCpi(){
    try {
        const response = await fetch(`https://www.alphavantage.co/query?function=CPI&interval=monthly&apikey=${API_KEY}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log(error);
    }
}

export async function getUnemployment(){
    try {
        const response = await fetch(`https://www.alphavantage.co/query?function=UNEMPLOYMENT&apikey=${API_KEY}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log(error);
    }
}

export async function getInterest(){
    try {
        const response = await fetch(`https://www.alphavantage.co/query?function=FEDERAL_FUNDS_RATE&interval=monthly&apikey=${API_KEY}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log(error);
    }
}

export async function getIncomeStatement(ticker:string){
    try {
        const response = await fetch(`https://www.alphavantage.co/query?function=INCOME_STATEMENT&symbol=${ticker}&apikey=${API_KEY}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log(error);
    }
}

export async function getBalanceSheet(ticker:string){
    try {
        const response = await fetch(`https://www.alphavantage.co/query?function=BALANCE_SHEET&symbol=${ticker}&apikey=${API_KEY}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log(error);
    }
}

export async function getCashFlow(ticker:string){
    try {
        const response = await fetch(`https://www.alphavantage.co/query?function=CASH_FLOW&symbol=${ticker}&apikey=${API_KEY}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log(error);
    }
}

export async function getMonthlyStock(ticker:string){
    try {
        const response = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY_ADJUSTED&symbol=${ticker}&apikey=${API_KEY}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log(error);
    }
}