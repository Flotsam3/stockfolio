import { connectDB } from "@/libs/connectDB";
import StockPortfolio from "@/models/StockPortfolio";

export async function PATCH(request: Request) {
   try {
      await connectDB();

      const { searchParams } = new URL(request.url);
      const id = searchParams.get("id");

      if (!id) {
         return Response.json({ msg: "The id is required" }, { status: 400 });
      }

      await StockPortfolio.updateMany({}, { $set: { active: false } }); // Deactivate all
      const response = await StockPortfolio.findByIdAndUpdate(id, { $set: { active: true } }); // Activate one

      return Response.json(response, { status: 200 });
   } catch (error) {
      console.log(error);
      return Response.json({ msg: "Server error!" }, { status: 500 });
   }
}
