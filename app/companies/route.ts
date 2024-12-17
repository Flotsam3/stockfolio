import CompanyModel from "@/models/Company";

export async function POST(request:Request){
    try {
        const body = await request.json();
        console.log({body});
        
        const response = await CompanyModel.create(body);
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