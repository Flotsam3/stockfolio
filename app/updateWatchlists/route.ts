import { JSDOM } from "jsdom";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
   try {
      const { searchParams } = new URL(request.url);
      const ticker = searchParams.get("ticker") || "pypl";

      // Parallel fetch for all three pages
      const [ratiosHtml, financialsHtml, statsHtml] = await Promise.all([
         fetch(`https://stockanalysis.com/stocks/${ticker}/financials/ratios/`).then((res) =>
            res.text()
         ),
         fetch(`https://stockanalysis.com/stocks/${ticker}/financials/`).then((res) => res.text()),
         fetch(`https://stockanalysis.com/stocks/${ticker}/statistics/`).then((res) => res.text()),
      ]);

      // Parse DOMs
      const ratiosDoc = new JSDOM(ratiosHtml).window.document;
      const financialsDoc = new JSDOM(financialsHtml).window.document;
      const statsDoc = new JSDOM(statsHtml).window.document;

      // Extract PE Ratios from ratios page
      let peRatios: string[] = [];
      for (let row of ratiosDoc.querySelectorAll("tr")) {
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
      const priceEl =
         ratiosDoc.querySelector(
            "div.text-4xl.font-bold.transition-colors.duration-300.inline-block"
         ) ||
         ratiosDoc.querySelector("div.text-4xl.font-bold.transition-colors.duration-300.block");

      realTimePrice = priceEl?.textContent?.trim() || null;

      // Extract after-hours price if available (more flexible)
      let afterHoursPrice: string | null = null;
      const afterHoursEl = ratiosDoc.querySelector("div.block.font-semibold.leading-5.text-faded");
      afterHoursPrice = afterHoursEl?.textContent?.trim() || null;

      // Extract EPS (Diluted) from financials page
      let epsDiluted: string = "";
      for (let row of financialsDoc.querySelectorAll("tr")) {
         const firstCol = row.querySelector("td");
         if (firstCol?.textContent?.trim() === "EPS (Diluted)") {
            const cells = row.querySelectorAll("td");
            epsDiluted = cells[1]?.textContent?.trim() || "";
            break;
         }
      }

      // Extract EPS Growth Forecast (5Y) from statistics page
      let epsGrowth5Y: string | null = null;
      for (let row of statsDoc.querySelectorAll("tr")) {
         const label = row.querySelector("td")?.textContent?.trim() || "";
         if (label === "EPS Growth Forecast (5Y)") {
            epsGrowth5Y = row.querySelectorAll("td")[1]?.textContent?.trim() || null;
            break;
         }
      }

      // If realTimePrice is not available, use afterHoursPrice
      realTimePrice = realTimePrice || afterHoursPrice;

      // Return all data
      return Response.json(
         { ticker, realTimePrice, peRatios, epsDiluted, epsGrowth5Y },
         { status: 200 }
      );
   } catch (err: any) {
      return Response.json({ error: err.message }, { status: 500 });
   }
}
