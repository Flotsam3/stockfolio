import EconomicsModel from "@/models/Economics";
import { connectDB } from "@/libs/connectDB";

export async function GET(){
    try {
        await connectDB();

        const response = await EconomicsModel.find();
        return Response.json({response, status: 200})
    } catch (error) {
        console.log(error);
        return Response.json({msg: "Server error!", status: 500});
    }
}

export async function POST(request:Request){
    try {
        await connectDB();

        const body = await request.json();
        console.log({body});
        
        const response = await EconomicsModel.create(body);
        return Response.json({response, status: 200})
    } catch (error) {
        console.log(error);
        return Response.json({msg: "Server error!", status: 500});
    }
}
