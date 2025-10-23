import { connectDB } from "@/libs/connectDB";
import StockPortfolio from "@/models/StockPortfolio";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function PATCH(request: Request) {
   try {
      await connectDB();

      const { searchParams } = new URL(request.url);
      const id = searchParams.get("id");

      if (!id) {
         return Response.json({ msg: "The id is required" }, { status: 400 });
      }

   const cookieStore = await cookies();
   const token = cookieStore.get("token")?.value;
   if (!token) return Response.json({ error: "Not authenticated" }, { status: 401 });
   const payload = jwt.verify(token, process.env.JWT_SECRET || "") as { id: string };
   const userId = payload.id;

   // Deactivate only this user's portfolios
   await StockPortfolio.updateMany({ userId }, { $set: { active: false } });
   const response = await StockPortfolio.findOneAndUpdate({ _id: id, userId }, { $set: { active: true } }, { new: true });

      return Response.json(response, { status: 200 });
   } catch (error) {
      console.log(error);
      return Response.json({ msg: "Server error!" }, { status: 500 });
   }
}
