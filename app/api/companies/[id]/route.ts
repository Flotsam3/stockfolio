import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/libs/connectDB";
import CompanyModel from "@/models/Company";
import StockPortfolio from "@/models/StockPortfolio";
import { getServerSession } from "next-auth";

type RouteContext = {
    params: Promise<{ id: string }>;
};

type CompanyUpdate = {
    profitability?: unknown;
    efficiencyAndLeverage?: unknown;
    liquidity?: unknown;
    valuation?: unknown;
};

async function getAuthenticatedActivePortfolio() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return null;
    }

    await connectDB();

    const portfolio = await StockPortfolio.findOne({ userId: session.user.id, active: true }).select("_id");
    return { portfolioId: portfolio?._id ?? null };
}

export async function GET(_request: Request, { params }: RouteContext){
    try {
        const auth = await getAuthenticatedActivePortfolio();
        if (!auth) {
            return Response.json({ error: "Not authenticated" }, { status: 401 });
        }
        if (!auth.portfolioId) {
            return Response.json({ error: "No active portfolio found" }, { status: 404 });
        }

        const {id} = await params;
        const company = await CompanyModel.findOne({
            name: id,
            stockPortfolioId: auth.portfolioId,
        });

        if (!company) {
            return Response.json({ error: "Company not found" }, { status: 404 });
        }

        return Response.json({ company }, { status: 200 });
    } catch (error) {
        console.log(error);
        return Response.json({ msg: "Server error!" }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: RouteContext){
    try {
      const auth = await getAuthenticatedActivePortfolio();
      if (!auth) {
        return Response.json({ error: "Not authenticated" }, { status: 401 });
      }
      if (!auth.portfolioId) {
        return Response.json({ error: "No active portfolio found" }, { status: 404 });
      }

      const { id } = await params;
      const body = await request.json() as CompanyUpdate;
      const updateFields: CompanyUpdate = {};

      if (body.profitability !== undefined) updateFields.profitability = body.profitability;
      if (body.efficiencyAndLeverage !== undefined) updateFields.efficiencyAndLeverage = body.efficiencyAndLeverage;
      if (body.liquidity !== undefined) updateFields.liquidity = body.liquidity;
      if (body.valuation !== undefined) updateFields.valuation = body.valuation;

      if (Object.keys(updateFields).length === 0) {
        return Response.json({ error: "No supported fields to update" }, { status: 400 });
      }

      const updatedCompany = await CompanyModel.findOneAndUpdate(
        { name: id, stockPortfolioId: auth.portfolioId },
        { $set: updateFields },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!updatedCompany) {
        return Response.json({ error: "Company not found" }, { status: 404 });
      }

      return Response.json({ updatedCompany }, { status: 200 });
    } catch (error) {
      console.error("Error updating company:", error);
      return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
