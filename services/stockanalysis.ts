import type { AddStockType } from "@/types/types";

export async function refreshStock(portfolioId: string, stockId: string): Promise<AddStockType> {
   const response = await fetch("/api/updateWatchlists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ portfolioId, stockId }),
      signal: AbortSignal.timeout(45_000),
   });
   const data = await response.json().catch(() => null);
   if (!response.ok || !data?.stock) {
      throw new Error(data?.error ?? "Could not refresh the stock.");
   }
   return data.stock;
}
