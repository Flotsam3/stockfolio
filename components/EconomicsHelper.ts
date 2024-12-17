import { Dispatch, SetStateAction } from "react";
import { getEconomics } from "@/api/economics";
import { postEconomics } from "@/api/economics";
import { updateEconomics } from "@/api/economics";
import { DateTime } from "luxon";
import { getInflation } from '@/libs/api';
import { getCpi } from '@/libs/api';
import { getInterest } from '@/libs/api';
import { getUnemployment } from '@/libs/api';
import { EconomicsType } from "@/types/types.js";
import { EconomicEntry } from "@/types/types.js";
import Cookies from "js-cookie";

export async function prepareEconomics(setEconomics: Dispatch<SetStateAction<EconomicsType>>){
    try {
        const {response} = await getEconomics();
        setEconomics(response[0]);
        console.log("response", response.length, response);
        if (response.length === 0){
            console.log("no economics!");
            const updateData = await processUpdateData();
            console.log({updateData});
            await postEconomics(updateData);
        } else {
            const hasCookie = Cookies.get("eco");
            if (hasCookie) return console.log("Data already fetched for today!");

            const dbDateCpi = response[0].cpi[0].date;
            const dbDate_1 = DateTime.fromISO(dbDateCpi, { zone: "utc" });

            const now = DateTime.utc();
            const oneMonthAgo = now.minus({ months: 1 });

            if (dbDate_1 < oneMonthAgo) {
                console.log("Time to update");

                const updateData = await processUpdateData();
                const updatedData = await updateEconomics(updateData, response[0]._id);
                if (!updateData) return console.log("No updateEconomics data!");
                console.log({updateData});
                setEconomics(updatedData);
            } else {
                console.log("Not yet one month since last update");
            }

            Cookies.set("eco", "daily", { expires: 1 }); // Expires in 1 day
        }
    } catch (error) {
        console.log(error);
    }
}

async function processUpdateData(){
    const inflation = await getInflation();
    const cpi = await getCpi();
    const interest = await getInterest();
    const unemployment = await getUnemployment();
    
    return {
        inflation: processInflationData(inflation.data),
        cpi: processCpi(cpi.data),
        interest: processInterest(interest.data),
        unemployment: processUnemployment(unemployment.data)
    }
}

function processInflationData(inflationData:EconomicEntry[]){
    const data = inflationData.splice(0, 2);
    return data;
}

function processCpi(cpiData:EconomicEntry[]){
    const dataSlice = cpiData.splice(0, 12);

    if (dataSlice.length < 2) throw new Error("The cpiData array needs at least two elements!");
    const lastEntry = dataSlice.at(-1);
    if (!lastEntry){
        throw new Error("The last entry is undefined!");
    }

    const inflationMonth = ((+dataSlice[0].value - +dataSlice[1].value)/+dataSlice[1].value * 100).toFixed(2);
    const inflationYear = ((+dataSlice[0].value - +lastEntry.value)/+lastEntry.value * 100).toFixed(2);
    const data = [{value:inflationMonth,  date:dataSlice[0].date}, {value:inflationYear,  date:lastEntry.date}]
    return data;
}

function processInterest(interestData:EconomicEntry[]){
    const data = interestData.splice(0, 2);
    return data;
}

function processUnemployment(unemploymentData:EconomicEntry[]){
    const data = unemploymentData.splice(0, 2);
    return data;
}