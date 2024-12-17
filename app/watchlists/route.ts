import StockPortfolio from "@/models/StockPortfolio";
import { connectDB } from "@/libs/connectDB";

export async function POST(request: Request){
    try {
        await connectDB();
        const body = await request.json();
        console.log({body});
        const response = await StockPortfolio.create({name:body});
        return Response.json(response, {status: 201});

    } catch (error) {
        console.log(error);
        return Response.json({msg: "Server error!"}, {status:500});
    }
}

export async function GET(request: Request){
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const active = searchParams.get('active');
        
        if (!active) {
            return Response.json({ msg: "Active parameter is required" }, { status: 400 });
        }
        const response = await StockPortfolio.findOne({ name: active });
        return Response.json(response, { status: 200 });

    } catch (error) {
        console.log(error);
        return Response.json({msg: "Server error!"}, {status:500});
    }
}

export async function PUT(request: Request){
    try {
        await connectDB();
        const body = await request.json();

        body.payload.peRatioAverage = (body.payload.peRatio.replace(/,/g, ".").split(";").reduce((acc:string, curr:string)=>{return acc + +curr },0) / 5).toFixed(2);
        
        const response = await StockPortfolio.updateOne({name:body.name}, {$push:{watchList:body.payload}});
        return Response.json(response, {status:200});
    } catch (error) {
        console.log(error);
        return Response.json({msg: "Server error!"}, {status:500});
    }
}

export async function PATCH(request: Request){
    try {
        await connectDB();
        const body = await request.json();

        body.payload.peRatioAverage = (body.payload.peRatio.replace(/,/g, ".").split(";").reduce((acc:string, curr:string)=>{return acc + +curr },0) / 5).toFixed(2);
       
        console.log("payload", body.payload);

        // First find the document
        const stock = await StockPortfolio.findOne({ name: body.name });
    
        // Find the index of the item to update
        const itemIndex = stock.watchList.findIndex(
            (item:any) => item._id.toString() === body.payload._id
        );

        // Update the item
        if (itemIndex > -1) {
            stock.watchList[itemIndex] = body.payload;
            await stock.save();
        }

        return Response.json(null, {status:200});
    } catch (error) {
        console.log(error);
        return Response.json({msg: "Server error!"}, {status:500});
    }
}

export async function DELETE(request: Request, ){
    try {
        await connectDB();
        console.log("delete start");
        
        const { searchParams } = new URL(request.url);
        const name = searchParams.get('name');
        const stockId = searchParams.get('stockId');
        
        if (!name || !stockId) {
            return Response.json({ msg: "name and stockId are required" }, { status: 400 });
        }
        const portfolio = await StockPortfolio.findOne({ name });
        
        const index = portfolio.watchList.findIndex((obj:any) => obj._id.toString() === stockId);
        
        if (index !== -1) {
            portfolio.watchList.splice(index, 1);
        }   
        const response = portfolio.save();

        return Response.json(response, { status: 200 });

    } catch (error) {
        console.log(error);
        return Response.json({msg: "Server error!"}, {status:500});
    }
}