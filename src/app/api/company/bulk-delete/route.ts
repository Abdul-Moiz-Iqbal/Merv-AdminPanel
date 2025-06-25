import { CompanyService } from "@/services/companyService";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
  try {
    const { ids } = await req.json();
    // console.log(ids)
    const data = ids.map((id:string)=> new Types.ObjectId(id));
    console.log("bellow map")
    const res = await CompanyService.deleteCompanies(data)
    console.log(res)
    return NextResponse.json("Success");
  } catch (error) {
    return NextResponse.json({message:"Failed ", error});
  }
}
