import { CompanyService } from "@/services/companyService";
import { NextRequest, NextResponse } from "next/server";

//delete a single company
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!params.id) {
      return NextResponse.json({ message: "Invalid Id", code: 409 });
    }
    const result = await CompanyService.deleteCompany(params.id);

    return NextResponse.json(result);
  } catch (error) {
    console.log("Error in Delete company api", error);
    return NextResponse.json({
      message: "error in deleting company",
      code: 500,
    });
  }
}

//update a single company
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updatedCompany  = await req.json();
    console.log(updatedCompany);

    if (!params.id) {
      return NextResponse.json({ message: "Invalid Id", code: 409 });
    }
    const result = await CompanyService.updateCompany(
      params.id,
      updatedCompany
    );

    return NextResponse.json(result);
  } catch (error) {
    console.log("Error in Update company api", error);
    return NextResponse.json({
      message: "error in updating company",
      code: 500,
    });
  }
}
