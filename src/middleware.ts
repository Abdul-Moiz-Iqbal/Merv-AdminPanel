import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "./lib/jwt-edge";

export async function middleware(request: NextRequest) {
  console.log("middleware running");
  const token = request.cookies.get("token")?.value;
  const url = request.nextUrl;

  const isLoginPage = url.pathname.startsWith("/login");
  const isProtectedRoute =
    url.pathname.startsWith("/admin") ||
    url.pathname.startsWith("/profile") ||
    url.pathname.startsWith("/api/company");

  let isAuthenticated = false;

  // Safely verify the token
  if (token) {
    const payload = await verifyJWT(token);
    if (payload) {
      isAuthenticated = true;
      console.log("Token verified. Payload:", payload);
    } else {
      console.log("Token exists but is invalid/expired.");
    }
  } else {
    console.log("No token found.");
  }

  // Prevent logged-in users from accessing login page
  if (isLoginPage && isAuthenticated) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // Prevent unauthenticated access to protected routes
  if (isProtectedRoute && !isAuthenticated) {
    console.log("redirecting to login page");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Allow access
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
