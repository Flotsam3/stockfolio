import StockPortfolio from "@/models/StockPortfolio";
import EconomicsModel from "@/models/Economics";
import { EconomicsType } from "@/types/types";
import { EconomicEntry } from "@/types/types";

export async function GET(request:Request, {params}:{params: {id: string}}) {
    try {
        const {id} = await params;
        console.log({id});
        const users = await StockPortfolio.findOne({id});
        console.log({users});    
        return Response.json(users, { status: 200 });
    } catch (error) {
        console.log(error);
        return Response.json(
            { message: "Error fetching users" },
            { status: 500 }
        );
    }
  }

  export async function PUT(request:Request, {params}:{params: {id: string}}) {
    
    try {
        const {id} = await params;

        const body: EconomicsType = await request.json();
        type EconomicField = 'inflation' | 'cpi' | 'unemployment' | 'interest';
        
        type UpdateFields = Partial<{
            [K in EconomicField]: EconomicEntry[];
        }>;

        const updateFields: UpdateFields = {};

        // Process each field
        const fields: EconomicField[] = ['inflation', 'cpi', 'unemployment', 'interest'];
        
        fields.forEach(field => {
            if (body[field]) {
                updateFields[field] = body[field].map(entry => ({
                    value: entry.value,
                    date: entry.date
                }));
            }
        });

        let updatedEconomics;
        
        // Only perform update if there are fields to update
        if (Object.keys(updateFields).length > 0) {
            
            updatedEconomics = await EconomicsModel.findByIdAndUpdate(
                id,
                { $set: updateFields },
                { new: true }
            );
            return Response.json(updatedEconomics);
        }

        return Response.json("successfully updated", {status: 200});
        
    } catch (error) {
        console.log(error);
        return Response.json(
            { message: "Error fetching users" },
            { status: 500 }
        );
    }
  }
