import CompanyModel from "@/models/Company";
import StockPortfolio from "@/models/StockPortfolio";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function POST(request:Request){
    try {
        const body = await request.json();
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        
        if (!token) {
            return Response.json({ error: "Not authenticated" }, { status: 401 });
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET || "") as { id: string };
        const userId = payload.id;

        // Get the active portfolio for this user
        const activePortfolio = await StockPortfolio.findOne({ userId, active: true });
        if (!activePortfolio) {
            return Response.json({ error: "No active portfolio found" }, { status: 404 });
        }

        // Associate the company with the active portfolio
        const company = { ...body, stockPortfolioId: activePortfolio._id };
        const response = await CompanyModel.create(company);
        return Response.json({response, status: 200})
    } catch (error) {
        console.log(error);
        return Response.json({msg: "Server error!", status: 500});
    }
}

export async function PUT(request: Request){
    try {
        const body = await request.json();
        
        const response = await CompanyModel.updateOne({name:body.name}, {$push:{watchList:body.payload}});
        return Response.json(response, {status:200});
    } catch (error) {
        console.log(error);
        return Response.json({msg: "Server error!"}, {status:500});
    }
}