import React from 'react';
import data from '../data/exchangeData';
import {DateTime} from "luxon";

export default function page() {
    function isMarketOpen(openTime: string, closingTime: string, timeZone: string, names: string) {
        // Parse the UTC time strings (assumes format HH:mm)
        const [hours1, minutes1] = openTime.split(':').map(Number);
        const [hours2, minutes2] = closingTime.split(':').map(Number);
    
        // Crypto is always open
        if (names === "Crypto"){
            return {localOpenTime:"00:00", localCloseTime:"23:59", status:"open"};
        }
    
        let status;
    
        const currentGermanTime = DateTime.now().setZone('Europe/Berlin');
    
        // Special days/time for Forex
        if (names === "Forex"){
            // 16:00 (on Fridays)
            const localBreakStart = DateTime.fromObject(
                { hour: 16, minute: 0 },
                { zone: "America/New_York" }
            );
            const breakStartGermany = localBreakStart.setZone('Europe/Berlin');
    
            // 17:00 (on Sundays)
            const localBreakEnd = DateTime.fromObject(
                { hour: 17, minute: 0 },
                { zone: "America/New_York" }
            );
            const breakEndGermany = localBreakEnd.setZone('Europe/Berlin');

            console.log({breakStartGermany, breakEndGermany, currentGermanTime});
            
    
            // Check for open/closed on Fridays/Sunday
            if (currentGermanTime.weekday === 5 && currentGermanTime >= breakStartGermany || currentGermanTime.weekday === 6 || currentGermanTime.weekday === 7 && currentGermanTime < breakEndGermany){
                return {localOpenTime:"00:00", localCloseTime:"23:59", status: "closed"}
            }
            
            return {localOpenTime:"00:00", localCloseTime:"23:59", status: "open"}
        }
    
        // Create a DateTime object in local exchange time
        const localOpenTime = DateTime.fromObject(
            { hour: hours1, minute: minutes1 },
            { zone: timeZone }
        );
        
        const localClosingTime = DateTime.fromObject(
            { hour: hours2, minute: minutes2 },
            { zone: timeZone }
        );
           
        // Convert to Berlin time
        const openTimeGermany = localOpenTime.setZone('Europe/Berlin');
        const closingTimeGermany = localClosingTime.setZone('Europe/Berlin');
    
        // Check for break times
        function specialBreakTimes(hours1: number, minutes1: number, hours2: number, minutes2: number){
            const localBreakStart = DateTime.fromObject(
                { hour: hours1, minute: minutes1 },
                { zone: timeZone }
            );
            
            const lokalBreakEnd = DateTime.fromObject(
                { hour: hours2, minute: minutes2 },
                { zone: timeZone }
            );
    
            const breakStartGermany = localBreakStart.setZone('Europe/Berlin');
            const breakEndGermany = lokalBreakEnd.setZone('Europe/Berlin');
    
            if (currentGermanTime >= breakStartGermany && currentGermanTime < breakEndGermany){
                return {status: "closed"};
            } else {
                return false;
            }
        }
    
        // Compare times to check for open/closed status
        if (currentGermanTime >= openTimeGermany && currentGermanTime <= closingTimeGermany){
            if (names === "Tokyo"){
                const breakStatus = specialBreakTimes(11, 30, 12, 30);
                if (breakStatus){
                    status = "closed";
                }
            } else if (names === "Shanghai, Shenzhen"){
                const breakStatus = specialBreakTimes(11, 30, 13, 0);
                if (breakStatus){
                    status = "closed";
                }
            } else if (names === "Hong Kong"){
                const breakStatus = specialBreakTimes(12, 0, 13, 0);
                if (breakStatus){
                    status = "closed";
                }
            }
            if (currentGermanTime.weekday === 6 || currentGermanTime.weekday === 7) {
                status = "closed"
            } else {
                status = "open";
            }
        } else {
            status = "closed";
        }
        
        return {localOpenTime:openTimeGermany.toFormat('HH:mm'), localCloseTime:closingTimeGermany.toFormat('HH:mm'), status};
    }
            
  return (
    <div className='flex flex-wrap justify-center gap-4 w-[vw-80%] p-28'>
        {data.map((obj, index)=>{
            const times = isMarketOpen(obj.localOpen, obj.localClose, obj.localTimezone, obj.names);
            return <div key={index} className={`flex flex-col gap-1 w-72 p-5 ${times.status === "open" ? "bg-green-100": "bg-red-100"} text-gray-800 rounded-xl shadow-md`}>
                {obj.country === "Global" ? 
                    <img src="/images/globe.png" alt="Globe" width={30} /> :
                    <img src={`https://flagcdn.com/w40/${obj.country}.png`}
                    srcSet={`https://flagcdn.com/w80/${obj.country}.png 2x`}
                    width="40"
                    alt="Country flag" />
                }
                <h3 className='font-bold'>{obj.names}</h3>
                <p>Open: {times.localOpenTime}</p>
                <p>Close: {times.localCloseTime}</p>
                {obj.notes ? <p className='text-sm'>{obj.notes}</p> : null}
                <p className='flex items-center'>Status: {times.status === "open" ? <span className='inline-block w-4 h-4 m-2 rounded-full bg-green-700 animate-pulse'></span> : <span className='inline-block w-4 h-4 m-2 rounded-full bg-red-500'></span>}</p>
            </div>
        })}
    </div>
  )
}
