import EconomicsModel from "@/models/Economics";

export async function GET(){
    try {
        const response = await EconomicsModel.find();
        return Response.json({response, status: 200})
    } catch (error) {
        console.log(error);
        return Response.json({msg: "Server error!", status: 500});
    }
}

export async function POST(request:Request){
    try {
        const body = await request.json();
        console.log({body});
        
        const response = await EconomicsModel.create(body);
        return Response.json({response, status: 200})
    } catch (error) {
        console.log(error);
        return Response.json({msg: "Server error!", status: 500});
    }
}