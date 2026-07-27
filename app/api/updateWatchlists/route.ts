import { JSDOM } from "jsdom";
import { NextRequest } from "next/server";

async function fetchFinvizEpsGrowth5Y(ticker: string): Promise<string | null> {
   const response = await fetch(`https://finviz.com/quote.ashx?t=${encodeURIComponent(ticker)}&p=d`, {
      headers: {
         "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
         Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
   });

   if (!response.ok) {
      console.warn(`Finviz request failed for ${ticker}: ${response.status}`);
      return null;
   }

   const doc = new JSDOM(await response.text()).window.document;

   for (const cell of doc.querySelectorAll("td")) {
      if (cell.textContent?.trim() === "EPS next 5Y") {
         return cell.nextElementSibling?.textContent?.trim() || null;
      }
   }

   return null;
}

export async function GET(request: NextRequest) {
   try {
      const { searchParams } = new URL(request.url);
      const ticker = searchParams.get("ticker") || "pypl";

      console.log("Fetching data for ticker:", ticker);

      // Parallel fetch for all source pages
      const [ratiosHtml, financialsHtml, incomeStatementHtml, statsHtml, finvizEpsGrowth5Y] = await Promise.all([
         fetch(`https://stockanalysis.com/stocks/${ticker}/financials/ratios/`).then((res) => res.text()),
         fetch(`https://stockanalysis.com/stocks/${ticker}/financials/`).then((res) => res.text()),
         fetch(`https://stockanalysis.com/stocks/${ticker}/financials/income-statement/`).then((res) => res.text()),
         fetch(`https://stockanalysis.com/stocks/${ticker}/statistics/`).then((res) => res.text()),
         fetchFinvizEpsGrowth5Y(ticker).catch((error) => {
            console.warn(`Could not fetch EPS next 5Y from Finviz for ${ticker}:`, error);
            return null;
         }),
      ]);

      // Parse DOMs
      const ratiosDoc = new JSDOM(ratiosHtml).window.document;
      const financialsDoc = new JSDOM(financialsHtml).window.document;
      const incomeStatementDoc = new JSDOM(incomeStatementHtml).window.document;
      const statsDoc = new JSDOM(statsHtml).window.document;

      // Check if page returned 404 or error
      const notFound = ratiosDoc.querySelector("h1")?.textContent?.includes("404") || ratiosDoc.querySelector("h1")?.textContent?.includes("not found");

      if (notFound) {
         return Response.json({ error: `Stock ticker "${ticker}" not found on stockanalysis.com. This service only supports US-listed stocks.` }, { status: 404 });
      }

      // Extract PE Ratios from ratios page
      let peRatios: string[] = [];
      for (const row of ratiosDoc.querySelectorAll("tr")) {
         if (row.textContent?.includes("PE Ratio")) {
            const cells = row.querySelectorAll("td");
            peRatios = Array.from(cells)
               .slice(2, 7)
               .map((td) => td.textContent?.trim() || "");
            break;
         }
      }

      // Extract closing or real-time price
      let realTimePrice: string | null = null;
      const priceEl = ratiosDoc.querySelector("div.text-4xl.font-bold.transition-colors.duration-300.inline-block") || ratiosDoc.querySelector("div.text-4xl.font-bold.transition-colors.duration-300.block");

      realTimePrice = priceEl?.textContent?.trim() || null;

      // Extract after-hours price if available
      let afterHoursPrice: string | null = null;
      const afterHoursEl = ratiosDoc.querySelector("div.block.font-semibold.leading-5.text-faded");
      afterHoursPrice = afterHoursEl?.textContent?.trim() || null;

      // Extract EPS (Diluted) from the income statement page.
      let epsDiluted: string = "";
      for (const row of incomeStatementDoc.querySelectorAll("tr")) {
         const firstCol = row.querySelector("td");
         if (firstCol?.textContent?.trim() === "EPS (Diluted)") {
            const cells = row.querySelectorAll("td");
            epsDiluted = cells[1]?.textContent?.trim() || "";
            break;
         }
      }

      // Fallback for the Financials Overview page, where EPS is now labeled differently.
      if (!epsDiluted) {
         for (const row of financialsDoc.querySelectorAll("tr")) {
            const firstCol = row.querySelector("td")?.textContent?.trim() || "";
            if (firstCol.includes("Earnings Per Share")) {
               const cells = row.querySelectorAll("td");
               epsDiluted = cells[1]?.textContent?.trim() || "";
               break;
            }
         }
      }

      // Extract EPS next 5Y from Finviz, with the old StockAnalysis label as a fallback
      let epsGrowth5Y: string | null = finvizEpsGrowth5Y;
      for (const row of statsDoc.querySelectorAll("tr")) {
         const label = row.querySelector("td")?.textContent?.trim() || "";
         if (!epsGrowth5Y && label === "EPS Growth Forecast (5Y)") {
            epsGrowth5Y = row.querySelectorAll("td")[1]?.textContent?.trim() || null;
            break;
         }
      }

      // If realTimePrice is not available, use afterHoursPrice
      realTimePrice = realTimePrice || afterHoursPrice;

      // Check if we got meaningful data
      if (!realTimePrice && peRatios.length === 0 && !epsDiluted) {
         return Response.json({ error: `No data available for ticker "${ticker}". stockanalysis.com may not support this stock.` }, { status: 404 });
      }

      // Return all data
      return Response.json({ ticker, realTimePrice, peRatios, epsDiluted, epsGrowth5Y }, { status: 200 });
   } catch (err: unknown) {
      console.error("Error in updateWatchlists:", err);
      return Response.json({ error: err instanceof Error ? err.message : "Server error!" }, { status: 500 });
   }
}
