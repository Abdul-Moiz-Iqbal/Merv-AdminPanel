import { AuthService } from "@/services/authService";
import { NextResponse, NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const userData = await req.json();
    console.log(userData);
    const result = await AuthService.createUser(userData);
    return NextResponse.json(
      { message: result.message },
      { status: result.code }
    );
  } catch (error) {
    console.error("Route error:", error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
