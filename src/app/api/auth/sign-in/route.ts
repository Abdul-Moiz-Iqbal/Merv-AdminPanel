import { decodeJwtToken, verifyJwtToken } from "@/lib/jwt";
import { AuthService } from "@/services/authService";
import { AppError } from "@/utils/error";
import { NextResponse, NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    console.log("token:", token);

    // Route user away from login if already authenticated

    if (token && verifyJwtToken(token)) {
      const decodedToken = decodeJwtToken(token);
      console.log("decoded Token", decodedToken);
      const user = await AuthService.verifyUser(decodedToken.email);

      if(user){
      console.log("User already logged in");
      // return NextResponse.redirect(new URL('/admin', req.url)); // or dashboard
      return NextResponse.json({
        message: "User is logged in already go to dashboard",
        code: 200,
      });
      }
    }

    const userData = await req.json();

    const result = await AuthService.login(userData);

    const response = NextResponse.json({ message: true, code: 200, result });
    response.cookies.set("token", result, {
      httpOnly: true,
      path: "/",
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        {
          message: error.message,
          type: error.type,
          code: error.code,
          details: error.details || null,
        },
        { status: error.code }
      );
    }

    // Fallback for unknown errors
    return NextResponse.json(
      { message: "Something went wrong", code: 500 },
      { status: 500 }
    );
  }
}
