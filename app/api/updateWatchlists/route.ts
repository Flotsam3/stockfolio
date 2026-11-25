import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/libs/connectDB";
import { fetchStockAnalysis, StockAnalysisError } from "@/libs/stockAnalysis/fetchStockAnalysis";
import StockPortfolio from "@/models/StockPortfolio";
import type { AddStockType } from "@/types/types";
import { averagePeRatios } from "@/utils/stockCalculations";

const objectIdPattern = /^[a-f\d]{24}$/i;

function failure(error: unknown) {
   if (error instanceof StockAnalysisError) {
      return Response.json({ code: error.code, error: error.message }, { status: error.status });
   }
   console.error("Stock Analysis refresh failed.");
   return Response.json({ code: "REFRESH_ERROR", error: "Could not complete the stock refresh." }, { status: 500 });
}

export async function GET(request: Request) {
   try {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) return Response.json({ error: "Not authenticated" }, { status: 401 });

      const tickers = new URL(request.url).searchParams.getAll("ticker");
      if (tickers.length !== 1) throw new StockAnalysisError("INVALID_TICKER", "Provide one stock ticker.", 400);
      const data = await fetchStockAnalysis(tickers[0]);
      return Response.json(data, { headers: { "Cache-Control": "private, no-store" } });
   } catch (error) {
      return failure(error);
   }
}

export async function POST(request: Request) {
   try {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) return Response.json({ error: "Not authenticated" }, { status: 401 });

      const body = await request.json().catch(() => null);
      if (typeof body?.portfolioId !== "string" || !objectIdPattern.test(body.portfolioId) ||
          typeof body.stockId !== "string" || !objectIdPattern.test(body.stockId)) {
         return Response.json({ error: "Provide a valid watchlist and stock ID." }, { status: 400 });
      }

      const stockId = body.stockId.toLowerCase();
      const filter = { _id: body.portfolioId, userId: session.user.id };
      await connectDB();
      const portfolio = await StockPortfolio.findOne({ ...filter, "watchList._id": stockId }, { "watchList.$": 1 }).lean() as { watchList?: AddStockType[] } | null;
      const stock = portfolio?.watchList?.[0];
      if (!stock) return Response.json({ error: "Watchlist stock not found." }, { status: 404 });

      const data = await fetchStockAnalysis(stock.ticker);
      const { usd: rate, ...quoteOriginal } = data.quote;
      const fields: Record<string, unknown> = {
         "watchList.$.ticker": data.ticker,
         "watchList.$.rate": rate,
         "watchList.$.quoteOriginal": quoteOriginal,
         "watchList.$.analystTarget": data.analystTarget,
         "watchList.$.upside": data.upside,
         "watchList.$.annualDividend": data.annualDividend,
         "watchList.$.dividendYield": data.dividendYield,
         "watchList.$.lastPaidDividend": data.lastPaidDividend,
         "watchList.$.refreshIssues": data.issues,
         "watchList.$.lastDataRefresh": new Date(),
      };
      if (data.eps) {
         const { usd, ...epsOriginal } = data.eps;
         fields["watchList.$.dilutedEps"] = usd;
         fields["watchList.$.epsOriginal"] = epsOriginal;
      }
      if (data.peRatios.length > 0) {
         fields["watchList.$.peRatio"] = data.peRatios.join(";");
         fields["watchList.$.peRatioAverage"] = averagePeRatios(data.peRatios);
      }
      if (data.growthForecast) {
         fields["watchList.$.growthForecast"] = data.growthForecast.percent;
         fields["watchList.$.growthForecastSource"] = data.growthForecast.source;
      }

      const updated = await StockPortfolio.findOneAndUpdate(
         { ...filter, watchList: { $elemMatch: { _id: stockId, ticker: stock.ticker, updatedAt: stock.updatedAt ?? null } } },
         { $set: fields },
         { new: true, runValidators: true },
      ).lean() as { watchList?: AddStockType[] } | null;
      const saved = updated?.watchList?.find(item => String(item._id) === stockId);
      if (!saved) {
         return Response.json({ code: "STOCK_CHANGED", error: "The stock changed during the refresh. Please try again." }, { status: 409 });
      }
      return Response.json({ stock: saved });
   } catch (error) {
      return failure(error);
   }
}
