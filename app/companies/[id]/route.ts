import CompanyModel from "@/models/Company";

export async function GET(request:Request, {params}:{params: {id: string}}){
    try {
        const {id} = await params;
        console.log({id});
        const company = await CompanyModel.findOne({name:id});
        return Response.json({company, status: 200})
    } catch (error) {
        console.log(error);
        return Response.json({msg: "Server error!", status: 500});
    }
}

export async function PUT(request:Request, {params}:{params: {id: string}}){
    const { id } = await params;
    const body = await request.json();

    try {
      const updatedCompany = await CompanyModel.findOneAndUpdate(
        {name:id},
        body,
        {
          new: true,
          overwrite: true, // Replace the entire document
        }
      );

      if (!updatedCompany) {
        return Response.json({ error: 'Company not found', status: 404 });
      }

      return Response.json({updatedCompany, status:200});
    } catch (error) {
      console.error('Error updating company:', error);
      return Response.json({ error: 'Internal Server Error', status: 500 });
    }
}