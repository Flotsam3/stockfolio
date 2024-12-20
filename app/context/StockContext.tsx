"use client"

import React, { useState, createContext, useContext, Dispatch, SetStateAction } from "react";
import { StockData } from "@/types/types.js";

type ContextProps = {
    stockData: StockData;
    setStockData: Dispatch<SetStateAction<StockData>>;
    showAddWatchlist: boolean;
    setShowAddWatchlist: Dispatch<SetStateAction<boolean>>;
};

export const StockContext = createContext<ContextProps | null>(null);

export function StockProvider({ children }: { children: React.ReactNode }) {
    const [stockData, setStockData] = useState<StockData>({
        name: "",
        watchList: [
            {
                name: "",
                ticker: "",
                isin: "",
                country: "",
                rate: 0,
                dilutedEps: 0,
                growthForecast: 0,
                peRatio: "",
            },
        ],
        anualTargetReturn: 12,
    });
    const [showAddWatchlist, setShowAddWatchlist] = useState(false);

    return (
        <StockContext.Provider value={{ stockData, setStockData, showAddWatchlist, setShowAddWatchlist }}>
            {children}
        </StockContext.Provider>
    );
}

export function useStockContext() {
    const context = useContext(StockContext);
    if (!context) {
        throw new Error("useStockContext must be used within a StockProvider!");
    }
    return context;
}