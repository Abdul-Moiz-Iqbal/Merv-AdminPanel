import { CompanyService } from "@/services/companyService";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  try {
    const {companies} = await req.json();
    console.log(companies);
    const ids = companies.map((id:any)=> new Types.ObjectId(id._id));
    console.log(ids)
    const result = await CompanyService.updateCompanies(companies,ids);
    return NextResponse.json({ result });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error });
  }
}
