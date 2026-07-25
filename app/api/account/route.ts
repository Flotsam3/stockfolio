import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/libs/connectDB";
import CompanyModel from "@/models/Company";
import StockPortfolio from "@/models/StockPortfolio";
import User from "@/models/User";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth";

async function getAuthenticatedUserId() {
   const session = await getServerSession(authOptions);

   if (!session || !session.user?.id) {
      return null;
   }

   return session.user.id;
}

export async function GET() {
   try {
      await connectDB();

      const userId = await getAuthenticatedUserId();
      if (!userId) {
         return Response.json({ error: "Not authenticated" }, { status: 401 });
      }

      const user = await User.findById(userId).select("name email password createdAt");
      if (!user) {
         return Response.json({ error: "User not found" }, { status: 404 });
      }

      return Response.json(
         {
            id: user._id,
            name: user.name,
            email: user.email,
            hasPassword: Boolean(user.password),
            createdAt: user.createdAt,
         },
         { status: 200 }
      );
   } catch (error) {
      console.log(error);
      return Response.json({ msg: "Server error!" }, { status: 500 });
   }
}

export async function DELETE(request: Request) {
   try {
      await connectDB();

      const userId = await getAuthenticatedUserId();
      if (!userId) {
         return Response.json({ error: "Not authenticated" }, { status: 401 });
      }

      const { currentPassword } = await request.json().catch(() => ({ currentPassword: "" }));
      const user = await User.findById(userId);
      if (!user) {
         return Response.json({ error: "User not found" }, { status: 404 });
      }

      if (user.password) {
         if (!currentPassword) {
            return Response.json({ error: "Current password is required" }, { status: 400 });
         }

         const isValidPassword = await bcrypt.compare(currentPassword, user.password);
         if (!isValidPassword) {
            return Response.json({ error: "Current password is incorrect" }, { status: 403 });
         }
      }

      const portfolios = await StockPortfolio.find({ userId }).select("_id");
      const portfolioIds = portfolios.map((portfolio) => portfolio._id);

      if (portfolioIds.length > 0) {
         await CompanyModel.deleteMany({ stockPortfolioId: { $in: portfolioIds } });
      }

      await StockPortfolio.deleteMany({ userId });
      await User.findByIdAndDelete(userId);

      return Response.json({ message: "Account deleted successfully" }, { status: 200 });
   } catch (error) {
      console.log(error);
      return Response.json({ msg: "Server error!" }, { status: 500 });
   }
}
