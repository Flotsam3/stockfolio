import { AddStockType } from "@/types/types";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
console.log("BASE_URL in production:", process.env.NEXT_PUBLIC_BASE_URL);

export async function postStockPortfolio(payload:string){
    try {
        const response = await fetch(`${BASE_URL}/watchlists`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(payload)
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

export async function getStockPortfolio(){
    try {
        const response = await fetch(`${BASE_URL}/watchlists`);
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

export async function postNewWatchList(payload:AddStockType, name:string, targetReturn:Number){
    try {
        const response = await fetch(`${BASE_URL}/watchlists`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({payload, name, targetReturn})
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

export async function switchWatchList(id:string){
    try {
        const response = await fetch(`${BASE_URL}/watchlists/switch?id=${id}`, {
            method: "PATCH"
        });
        let data;
        if (response.ok){
            data = await response.json();
        }
        console.log(data);
        return data;
    } catch (error) {
        console.log();
    }
}

export async function updateWatchList(payload:AddStockType, name:string){
    try {
        const response = await fetch(`${BASE_URL}/watchlists`, {
            method: "PATCH",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({payload, name})
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

export async function getAllPortfolios(){
    try {
        const response = await fetch(`${BASE_URL}/portfolios`);
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

export async function updateAnualTargetReturn(name:string, targetReturn:number){
    try {
        const response = await fetch(`${BASE_URL}/portfolios`, {
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
        const response = await fetch(`${BASE_URL}/watchlists?name=${name}&stockId=${id}`, {
            method: "DELETE"
        });
        let data;
        if (response.ok){
            data = await response.json();
        }
        console.log(data);
        return data;
    } catch (error) {
        console.log();
    }
}