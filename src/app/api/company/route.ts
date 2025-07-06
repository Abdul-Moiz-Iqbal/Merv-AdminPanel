import { CompanyService } from "@/services/companyService";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";


const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*", // or set to your frontend origin
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  // This handles the preflight request
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function POST(req: NextRequest) {
  try {
    const companyData = await req.json();
    console.log(companyData)
    const result = await CompanyService.createComapny(companyData);

    return new NextResponse(JSON.stringify({ message: result.message }), {
      status: result.code || 200,
      headers: CORS_HEADERS,
    });
  } catch (error) {
    console.error(error);
    return new NextResponse(JSON.stringify({ error: "Something went wrong" }), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
}

//Create a company
// export async function POST(res: NextRequest) {
//   const companyData = await res.json();
//   console.log(companyData);
//   try {
//     const result = await CompanyService.createComapny(companyData);
//     // return NextResponse.json(
//     //   { message: result.message },
//     //   { status: result.code }
//     // );
//     return NextResponse.json(
//   { message: result.message },
//   {
//     status: result.code,
//     headers: {
//       "Access-Control-Allow-Origin": "*", // Use specific origin in production for security
//       "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
//       "Access-Control-Allow-Headers": "Content-Type, Authorization",
//     },
//   }
// );

//   } catch (error) {
//     console.log(error);
//     return NextResponse.json(error);
//   }
// }

//Get all companies
// export async function GET() {
//   try {
//     const result = await CompanyService.getAllCompanies();
//     console.log("companies api called");
//     // return NextResponse.json(result);
//   } catch (error) {
//     return NextResponse.json({ message: error }, { status: 500 });
//   }
// }

export async function GET() {
  try {
    const result = await CompanyService.getAllCompanies();
    console.log("companies api called");

    return new NextResponse(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // Allow all origins (for dev only)
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error", error },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
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
