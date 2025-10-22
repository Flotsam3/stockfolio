import React from 'react';
import "../globals.css";
import Navigation from "@/components/Navigation";
import { StockProvider } from "../context/StockContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <StockProvider>
      <Navigation />
      <main className="min-h-screen bg-neutral-100 pt-16">
        {children}
      </main>
    </StockProvider>
  );
}
