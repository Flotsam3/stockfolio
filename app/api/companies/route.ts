import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/libs/connectDB";
import CompanyModel from "@/models/Company";
import StockPortfolio from "@/models/StockPortfolio";
import { getServerSession } from "next-auth";

type CompanyInput = {
    name?: unknown;
    profitability?: unknown;
    efficiencyAndLeverage?: unknown;
    liquidity?: unknown;
    valuation?: unknown;
};

export async function POST(request:Request){
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return Response.json({ error: "Not authenticated" }, { status: 401 });
        }

        await connectDB();

        const body = await request.json() as CompanyInput;
        const name = typeof body.name === "string" ? body.name.trim() : "";
        if (!name) {
            return Response.json({ error: "Company name is required" }, { status: 400 });
        }

        // Get the active portfolio for this user
        const activePortfolio = await StockPortfolio.findOne({ userId: session.user.id, active: true });
        if (!activePortfolio) {
            return Response.json({ error: "No active portfolio found" }, { status: 404 });
        }

        const response = await CompanyModel.create({
            name,
            profitability: body.profitability,
            efficiencyAndLeverage: body.efficiencyAndLeverage,
            liquidity: body.liquidity,
            valuation: body.valuation,
            stockPortfolioId: activePortfolio._id,
        });

        return Response.json({ response }, { status: 201 });
    } catch (error) {
        console.log(error);
        return Response.json({ msg: "Server error!" }, { status: 500 });
    }
}
