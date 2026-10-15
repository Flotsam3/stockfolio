import "server-only";

const API_KEY:string = encodeURIComponent(process.env.ALPHA_VANTAGE_KEY || "");

export async function getInflation(){
    try {
        const response = await fetch(`https://www.alphavantage.co/query?function=INFLATION&apikey=${API_KEY}`);
        const data = await response.json();

        if (data?.Information?.includes("API rate limit")) throw new Error("API limit reached!")
        
        return data;
    } catch {
        throw new Error("Could not fetch inflation data");
    }
}

export async function getCpi(){
    try {
        const response = await fetch(`https://www.alphavantage.co/query?function=CPI&interval=monthly&apikey=${API_KEY}`);
        const data = await response.json();
        return data;
    } catch {
        return undefined;
    }
}

export async function getUnemployment(){
    try {
        const response = await fetch(`https://www.alphavantage.co/query?function=UNEMPLOYMENT&apikey=${API_KEY}`);
        const data = await response.json();
        return data;
    } catch {
        return undefined;
    }
}

export async function getInterest(){
    try {
        const response = await fetch(`https://www.alphavantage.co/query?function=FEDERAL_FUNDS_RATE&interval=monthly&apikey=${API_KEY}`);
        const data = await response.json();
        return data;
    } catch {
        return undefined;
    }
}
