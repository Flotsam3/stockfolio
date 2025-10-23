import StockPortfolio from "@/models/StockPortfolio";
import { connectDB } from "@/libs/connectDB";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(request: Request) {
   try {
      await connectDB();
      const body = await request.json();
      const cookieStore = await cookies();
      const token = cookieStore.get("token")?.value;
      if (!token) {
         return Response.json({ error: "Not authenticated" }, { status: 401 });
      }

      const payload = jwt.verify(token, process.env.JWT_SECRET || "") as { id: string };
      const userId = payload.id;

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
   } catch (error: any) {
      console.log(error);
      // Mongoose duplicate key
      if (error?.code === 11000) {
         return Response.json({ error: 'A portfolio with that name already exists for this user.' }, { status: 409 });
      }
      // Validation errors
      if (error?.name === 'ValidationError') {
         return Response.json({ error: error.message }, { status: 400 });
      }
      return Response.json({ msg: "Server error!", error: String(error) }, { status: 500 });
   }
}

export async function GET(request: Request) {
   try {
      await connectDB();
      const cookieStore = await cookies();
      const token = cookieStore.get("token")?.value;
      if (!token) {
         return Response.json({ error: "Not authenticated" }, { status: 401 });
      }

      const payload = jwt.verify(token, process.env.JWT_SECRET || "") as { id: string };
      const userId = payload.id;

      const response = await StockPortfolio.findOne({ userId, active: true });
      return Response.json(response, { status: 200 });
   } catch (error) {
      console.log(error);
      return Response.json({ msg: "Server error!" }, { status: 500 });
   }
}

export async function PUT(request: Request) {
   try {
      await connectDB();
      const body = await request.json();
   const cookieStore = await cookies();
   const token = cookieStore.get("token")?.value;
   if (!token) return Response.json({ error: "Not authenticated" }, { status: 401 });
   const payload = jwt.verify(token, process.env.JWT_SECRET || "") as { id: string };
   const userId = payload.id;

      const peRatios = body.payload.peRatio
         .replace(/,/g, ".")
         .split(";")
         .map((str: string) => parseFloat(str.trim()))
         .filter((num: number) => !isNaN(num));

      if (peRatios.length > 0) {
         const average = (
            peRatios.reduce((acc: string, curr: string) => acc + curr, 0) / peRatios.length
         ).toFixed(2);
         body.payload.peRatioAverage = average;
      } else {
         body.payload.peRatioAverage = null;
      }

      // Push into the portfolio that belongs to this user
      const response = await StockPortfolio.findOneAndUpdate(
         { name: body.name, userId },
         { $push: { watchList: body.payload } },
         { new: true }
      );
      return Response.json(response, { status: 200 });
   } catch (error) {
      console.log(error);
      return Response.json({ msg: "Server error!" }, { status: 500 });
   }
}

export async function PATCH(request: Request) {
   try {
      await connectDB();
      const body = await request.json();

      const peRatios = body.payload.peRatio
         .replace(/,/g, ".")
         .split(";")
         .map((str: string) => parseFloat(str.trim()))
         .filter((num: number) => !isNaN(num));

      if (peRatios.length > 0) {
         const average = (
            peRatios.reduce((acc: string, curr: string) => acc + curr, 0) / peRatios.length
         ).toFixed(2);
         body.payload.peRatioAverage = average;
      } else {
         body.payload.peRatioAverage = null;
      }

      console.log("payload", body.payload);

      // Use $set with positional operator to update only the fields, including info
      const cookieStore = await cookies();
      const token = cookieStore.get("token")?.value;
      if (!token) return Response.json({ error: "Not authenticated" }, { status: 401 });
      const payload = jwt.verify(token, process.env.JWT_SECRET || "") as { id: string };
      const userId = payload.id;

      const response = await StockPortfolio.findOneAndUpdate(
         { name: body.name, userId, "watchList._id": body.payload._id },
         {
            $set: {
               "watchList.$.name": body.payload.name,
               "watchList.$.ticker": body.payload.ticker,
               "watchList.$.isin": body.payload.isin,
               "watchList.$.country": body.payload.country,
               "watchList.$.rate": body.payload.rate,
               "watchList.$.dilutedEps": body.payload.dilutedEps,
               "watchList.$.growthForecast": body.payload.growthForecast,
               "watchList.$.peRatio": body.payload.peRatio,
               "watchList.$.peRatioAverage": body.payload.peRatioAverage,
               "watchList.$.info": body.payload.info ?? "",
            },
         },
         { new: true }
      );

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

      const { searchParams } = new URL(request.url);
      const name = searchParams.get("name");
      const stockId = searchParams.get("stockId");

      if (!name || !stockId) {
         return Response.json({ msg: "name and stockId are required" }, { status: 400 });
      }
      const cookieStore = await cookies();
      const token = cookieStore.get("token")?.value;
      if (!token) return Response.json({ error: "Not authenticated" }, { status: 401 });
      const payload = jwt.verify(token, process.env.JWT_SECRET || "") as { id: string };
      const userId = payload.id;

      const portfolio = await StockPortfolio.findOne({ name, userId });
      if (!portfolio) return Response.json({ msg: "Portfolio not found" }, { status: 404 });

      const index = portfolio.watchList.findIndex((obj: any) => obj._id.toString() === stockId);

      if (index !== -1) {
         portfolio.watchList.splice(index, 1);
      }
      const response = await portfolio.save();

      return Response.json(response, { status: 200 });
   } catch (error) {
      console.log(error);
      return Response.json({ msg: "Server error!" }, { status: 500 });
   }
}
