// app/watchlists/route.ts
import StockPortfolio from "@/models/StockPortfolio";
import { connectDB } from "@/libs/connectDB";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import type { AddStockType } from "@/types/types";
import { averagePeRatios, readSavedPeRatios } from "@/utils/stockCalculations";
import { parseStockTicker } from "@/utils/stockTicker";

type MongoWriteError = {
   code?: number;
   name?: string;
   message?: string;
};

function readWatchlistFields(input: unknown): Record<string, unknown> | null {
   if (!input || typeof input !== "object" || Array.isArray(input)) return null;
   const values = input as Record<string, unknown>;
   const fields: Record<string, unknown> = {};

   for (const key of ["name", "ticker", "isin", "country", "peRatio", "info"]) {
      if (!Object.hasOwn(values, key)) continue;
      if (typeof values[key] !== "string") return null;
      fields[key] = values[key];
   }
   if (typeof fields.ticker === "string") {
      const listing = parseStockTicker(fields.ticker);
      if (!listing) return null;
      fields.ticker = listing.ticker;
   }
   if (typeof fields.peRatio === "string") {
      fields.peRatioAverage = averagePeRatios(readSavedPeRatios(fields.peRatio));
   }
   if (Object.hasOwn(values, "owned")) {
      if (typeof values.owned !== "boolean") return null;
      fields.owned = values.owned;
   }
   for (const key of ["rate", "dilutedEps", "growthForecast", "targetPrice"]) {
      if (!Object.hasOwn(values, key)) continue;
      const value = values[key];
      if (value !== null && (typeof value !== "number" || !Number.isFinite(value))) return null;
      if ((key === "rate" || key === "targetPrice") && typeof value === "number" && value < 0) return null;
      fields[key] = value;
   }
   for (const [key, original] of [["rate", "quoteOriginal"], ["dilutedEps", "epsOriginal"]]) {
      if (!Object.hasOwn(fields, key)) continue;
      const amount = fields[key];
      fields[original] = amount === null ? null : { amount, currency: "USD", asOf: null, source: "manual", fx: null };
   }
   if (Object.hasOwn(fields, "growthForecast")) {
      fields.growthForecastSource = fields.growthForecast === null ? null : "manual";
   }
   return fields;
}

// Helper function to get authenticated user
async function getAuthenticatedUserId() {
   const session = await getServerSession(authOptions);
   
   if (!session || !session.user?.id) {
      return null;
   }
   
   return session.user.id;
}

export async function POST(request: Request) {
   try {
      await connectDB();
      const body = await request.json();
      
      const userId = await getAuthenticatedUserId();
      if (!userId) {
         return Response.json({ error: "Not authenticated" }, { status: 401 });
      }

      // Deactivate all portfolios for this user
      const response1 = await StockPortfolio.updateMany(
         { userId, active: true },
         { $set: { active: false } }
      );
      console.log({ response1 });

      // Create new portfolio and set it active
      console.log('Creating portfolio', { name: body, userId });
      const response2 = await StockPortfolio.create({ name: body, active: true, userId });
      return Response.json(response2, { status: 201 });
   } catch (error: unknown) {
      console.log(error);
      const mongoError = error as MongoWriteError;
      // Mongoose duplicate key
      if (mongoError?.code === 11000) {
         return Response.json({ error: 'A portfolio with that name already exists for this user.' }, { status: 409 });
      }
      // Validation errors
      if (mongoError?.name === 'ValidationError') {
         return Response.json({ error: mongoError.message }, { status: 400 });
      }
      return Response.json({ msg: "Server error!", error: String(error) }, { status: 500 });
   }
}

export async function GET() {
   try {
      await connectDB();
      
      const userId = await getAuthenticatedUserId();
      if (!userId) {
         return Response.json({ error: "Not authenticated" }, { status: 401 });
      }

      const response = await StockPortfolio.findOne({ userId, active: true });
      return Response.json(response, { status: 200 });
   } catch (error) {
      console.log(error);
      return Response.json({ msg: "Server error!" }, { status: 500 });
   }
}

export async function PUT(request: Request) {
   try {
      const userId = await getAuthenticatedUserId();
      if (!userId) {
         return Response.json({ error: "Not authenticated" }, { status: 401 });
      }

      const body = await request.json().catch(() => null);
      const fields = readWatchlistFields(body?.payload);
      if (typeof body?.name !== "string" || !fields?.ticker || !fields.name || !fields.country) {
         return Response.json({ error: "Provide a stock name, valid ticker, and country code." }, { status: 400 });
      }

      await connectDB();
      const response = await StockPortfolio.findOneAndUpdate(
         { name: body.name, userId },
         { $push: { watchList: fields } },
         { new: true, runValidators: true },
      );
      if (!response) return Response.json({ error: "Watchlist not found." }, { status: 404 });
      return Response.json(response, { status: 200 });
   } catch (error) {
      console.log(error);
      return Response.json({ msg: "Server error!" }, { status: 500 });
   }
}

export async function PATCH(request: Request) {
   try {
      const userId = await getAuthenticatedUserId();
      if (!userId) {
         return Response.json({ error: "Not authenticated" }, { status: 401 });
      }

      const body = await request.json().catch(() => null);
      const stockId = body?.payload?._id;
      let fields = readWatchlistFields(body?.payload);
      if (typeof body?.name !== "string" || typeof stockId !== "string" || !/^[a-f\d]{24}$/i.test(stockId) ||
          !fields || Object.keys(fields).length === 0) {
         return Response.json({ error: "Provide valid changes for a watchlist stock." }, { status: 400 });
      }

      await connectDB();
      const owner = { name: body.name, userId };
      const entry = { "watchList._id": stockId };
      let filter: Record<string, unknown> = { ...owner, ...entry };
      if (fields.ticker) {
         const portfolio = await StockPortfolio.findOne(filter, { "watchList.$": 1 }).lean() as { watchList?: AddStockType[] } | null;
         const stock = portfolio?.watchList?.[0];
         if (!stock) return Response.json({ error: "Watchlist stock not found." }, { status: 404 });
         filter = { ...owner, watchList: { $elemMatch: { _id: stockId, ticker: stock.ticker, updatedAt: stock.updatedAt ?? null } } };
         if (fields.ticker !== parseStockTicker(stock.ticker)?.ticker) {
            fields = {
               rate: null,
               quoteOriginal: null,
               dilutedEps: null,
               epsOriginal: null,
               growthForecast: null,
               growthForecastSource: null,
               peRatio: "",
               peRatioAverage: null,
               analystTarget: null,
               upside: null,
               annualDividend: null,
               dividendYield: null,
               lastPaidDividend: null,
               lastDataRefresh: null,
               refreshIssues: [],
               ...fields,
            };
         }
      }

      const updateFields = Object.fromEntries(Object.entries(fields).map(([key, value]) => [`watchList.$.${key}`, value]));
      const response = await StockPortfolio.findOneAndUpdate(
         filter,
         { $set: updateFields },
         { new: true, runValidators: true },
      );
      if (!response) return Response.json({ error: "The watchlist stock could not be updated." }, { status: 409 });
      return Response.json(response, { status: 200 });
   } catch (error) {
      console.log(error);
      return Response.json({ msg: "Server error!" }, { status: 500 });
   }
}

export async function DELETE(request: Request) {
   try {
      await connectDB();
      console.log("delete start");

      const userId = await getAuthenticatedUserId();
      if (!userId) {
         return Response.json({ error: "Not authenticated" }, { status: 401 });
      }

      const { searchParams } = new URL(request.url);
      const name = searchParams.get("name");
      const stockId = searchParams.get("stockId");

      if (!name || !stockId) {
         return Response.json({ msg: "name and stockId are required" }, { status: 400 });
      }

      const response = await StockPortfolio.findOneAndUpdate(
         { name, userId },
         { $pull: { watchList: { _id: stockId } } },
         { new: true }
      );

      if (!response) {
         return Response.json({ msg: "Portfolio not found" }, { status: 404 });
      }

      return Response.json(response, { status: 200 });
   } catch (error) {
      console.log(error);
      return Response.json({ msg: "Server error!" }, { status: 500 });
   }
}
