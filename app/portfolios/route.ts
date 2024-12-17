import StockPortfolio from "@/models/StockPortfolio";

export async function GET(){
    try {
        const response = await StockPortfolio.find().select('name');
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