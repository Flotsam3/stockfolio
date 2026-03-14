export async function fetchPERatios(ticker: string): Promise<{ ticker: string; peRatios: string[]; epsDiluted: string; realTimePrice: string | null; epsGrowth5Y: string | null }> {
   const controller = new AbortController();
   const timeout = setTimeout(() => controller.abort(), 10000);

   try {
      const response = await fetch(`/updateWatchlists?ticker=${ticker}`, {
         signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
         const errorText = await response.text();
         throw new Error(`Failed to fetch data (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      console.log("Backend returned:", data);

      // Check if backend returned an error object
      if (data.error) {
         throw new Error(data.error);
      }

      // Validate that we have meaningful data
      if (!data.realTimePrice) {
         throw new Error(`No price data available for ${ticker}. This stock may not be supported.`);
      }

      if (!data.epsDiluted) {
         throw new Error(`No EPS data available for ${ticker}.`);
      }

      if (!data.epsGrowth5Y) {
         throw new Error(`No growth forecast available for ${ticker}.`);
      }

      if (!data.peRatios || data.peRatios.length === 0) {
         throw new Error(`No PE ratio history available for ${ticker}.`);
      }

      return {
         ticker: data.ticker,
         peRatios: data.peRatios,
         epsDiluted: data.epsDiluted,
         realTimePrice: data.realTimePrice,
         epsGrowth5Y: data.epsGrowth5Y,
      };
   } catch (error) {
      clearTimeout(timeout);
      if (error instanceof Error && error.name === "AbortError") {
         throw new Error(`Request timed out after 10 seconds for ${ticker}`);
      }
      throw error;
   }
}
