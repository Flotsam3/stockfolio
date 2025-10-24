// app/watchlists/switch/route.ts
import { connectDB } from "@/libs/connectDB";
import StockPortfolio from "@/models/StockPortfolio";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(request: Request) {
   try {
      await connectDB();

      const session = await getServerSession(authOptions);
      if (!session || !session.user?.id) {
         return Response.json({ error: "Not authenticated" }, { status: 401 });
      }
      const userId = session.user.id;

      const { searchParams } = new URL(request.url);
      const id = searchParams.get("id");

      if (!id) {
         return Response.json({ msg: "The id is required" }, { status: 400 });
      }

      // Deactivate only this user's portfolios
      await StockPortfolio.updateMany({ userId }, { $set: { active: false } });
      
      // Activate the selected portfolio (only if it belongs to this user)
      const response = await StockPortfolio.findOneAndUpdate(
         { _id: id, userId }, 
         { $set: { active: true } }, 
         { new: true }
      );

      if (!response) {
         return Response.json({ msg: "Portfolio not found or access denied" }, { status: 404 });
      }

      return Response.json(response, { status: 200 });
   } catch (error) {
      console.log(error);
      return Response.json({ msg: "Server error!" }, { status: 500 });
   }
}