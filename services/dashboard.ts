import type { AddStockType, StockData, WatchlistEdit } from "@/types/types";

// const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
// console.log("BASE_URL in production:", process.env.NEXT_PUBLIC_BASE_URL);

export async function postStockPortfolio(payload:string){
    try {
        const response = await fetch(`/api/watchlists`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        console.log(data);
        return data;
        
    } catch (error) {
        console.log(error);
    }
}

export async function getStockPortfolio(){
    try {
        const response = await fetch(`/api/watchlists`);
        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.log(error);
    }
}

export async function postNewWatchList(payload: AddStockType, name: string): Promise<StockData> {
    const response = await fetch("/api/watchlists", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload, name }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? "Could not add the stock.");
    return data;
}

export async function switchWatchList(id:string){
    try {
        const response = await fetch(`/api/watchlists/switch?id=${id}`, {
            method: "PATCH"
        });
        const data = await response.json();
        console.log(data);
        return data;
    } catch {
        console.log();
    }
}

export async function updateWatchList(payload: WatchlistEdit, name: string): Promise<StockData> {
    const response = await fetch("/api/watchlists", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload, name }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? "Could not update the watchlist.");
    return data;
}

export async function getAllPortfolios(){
    try {
        const response = await fetch(`/api/portfolios`);
        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.log(error);
    }
}

export async function updateAnualTargetReturn(name:string, targetReturn:number){
    try {
        const response = await fetch(`/api/portfolios`, {
            method: "PATCH",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({name, targetReturn})
        });
        let data;
        if (response.ok){
            data = await response.json();
        }
        console.log(data);
        return data;
    } catch (error) {
        console.log(error);
    }
}

export async function deleteOneWatchList(name:string, id:string){
    try {
        const response = await fetch(`/api/watchlists?name=${name}&stockId=${id}`, {
            method: "DELETE"
        });
        const data = await response.json();
        console.log(data);
        return data;
    } catch {
        console.log();
    }
}
