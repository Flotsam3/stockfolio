// app/portfolios/route.ts
import StockPortfolio from "@/models/StockPortfolio";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
   try {
      const session = await getServerSession(authOptions);
      if (!session || !session.user?.id) {
         return Response.json({ error: "Not authenticated" }, { status: 401 });
      }
      const userId = session.user.id;

      const response = await StockPortfolio.find({ userId }).select('name active');
      return Response.json(response, { status: 200 });
   } catch (error) {
      console.log(error);
      return Response.json({ msg: "Server error!" }, { status: 500 });
   }
}

export async function PATCH(request: Request) {
   try {
      const session = await getServerSession(authOptions);
      if (!session || !session.user?.id) {
         return Response.json({ error: "Not authenticated" }, { status: 401 });
      }
      const userId = session.user.id;

      const body = await request.json();

      // Update only if the portfolio belongs to this user
      const response = await StockPortfolio.findOneAndUpdate(
         { name: body.name, userId }, // ← Added userId check for security
         { anualTargetReturn: body.targetReturn },
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