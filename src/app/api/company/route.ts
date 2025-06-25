import { CompanyService } from "@/services/companyService";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

//Create a company
export async function POST(res: NextRequest) {
  const companyData = await res.json();
  console.log(companyData);
  try {
    const result = await CompanyService.createComapny(companyData);
    return NextResponse.json(
      { message: result.message },
      { status: result.code }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(error);
  }
}

//Get all companies
export async function GET() {
  try {
    const result = await CompanyService.getAllCompanies();
    console.log("companies api called");
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ message: error }, { status: 500 });
  }
}

//Accpet/reject all company(changing status to approved/rejected from pending)
export async function PUT(req:NextRequest){
  try {
    
    const {companies , action } = await req.json();
    console.log("Raw data: ",companies)
    companies.forEach((company:any)=> {
      if(company.status == "pending"){
        return company
      }
    })
    console.log("Procceded filter status data",companies)
    const ids:string[] = companies.map((company:any) => new Types.ObjectId(company._id))

    let result;
    if(action == 1){
      console.log("accept block")
      await CompanyService.approveCompaniesStatus(ids)
      return NextResponse.json({message:"Succefully updated status to accepted", code:200})

    }else if (action == 0){
      await CompanyService.rejectCompaniesStatus(ids);
      return NextResponse.json({message:"Succefully updated status to rejected", code:200})

    }else {
      return NextResponse.json({message:"Invalid action, only 1 or 0 accepted as action ", code:409})
    }
    
  } catch (error) {
    console.log(error)
    return NextResponse.json({error})
  }
}
