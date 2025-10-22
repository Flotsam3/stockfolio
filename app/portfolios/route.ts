import StockPortfolio from "@/models/StockPortfolio";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET(){
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) {
            return Response.json({ error: "Not authenticated" }, { status: 401 });
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET || "") as { id: string };
        const userId = payload.id;

        const response = await StockPortfolio.find({ userId }).select('name active');
        return Response.json(response, { status: 200 });
    } catch (error) {
        console.log(error);
        return Response.json({msg: "Server error!"}, {status:500});
    }
}

export async function PATCH(request: Request){
    try {
        const body = await request.json();

        const response = await StockPortfolio.findOneAndUpdate({name: body.name}, {anualTargetReturn:body.targetReturn});

        return Response.json(response, {status:200});
    } catch (error) {
        console.log(error);
        return Response.json({msg: "Server error!"}, {status:500});
    }
}