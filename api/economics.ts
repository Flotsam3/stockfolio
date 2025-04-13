const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
import { EconomicsType } from "@/types/types";

export async function getEconomics(){
    try {
        const response = await fetch(`${BASE_URL}/economics/`);
        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.log(error);
    }
}

export async function postEconomics(economicsData: EconomicsType){
    try {
        if (!economicsData) return; 
        const response = await fetch(`${BASE_URL}/economics`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(economicsData)
        });
        const data = await response.json();
    } catch (error) {
        console.log(error);
    }
}

export async function updateEconomics(updateData: EconomicsType, id:string){
    console.log("in updateEconomice before fetch", updateData);
    
    try {
        if (!updateData) return; 
        const response = await fetch(`${BASE_URL}/economics/${id}`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(updateData)
        });
        const data = await response.json();
        console.log("data from updateEconomics", data);
        
        return data;
    } catch (error) {
        console.log(error);
    }
}

