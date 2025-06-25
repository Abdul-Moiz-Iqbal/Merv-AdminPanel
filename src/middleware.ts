// import { NextRequest, NextResponse } from "next/server";
// import { verifyJWT } from "./lib/jwt-edge";

// export async function middleware(request: NextRequest) {
//   console.log("middleware running");
//   const token = request.cookies.get("token")?.value;
//   console.log("middleware token:", token);

//     // If user is logged in, and tries to access /login or /register — redirect to /admin
//   //  if (token && request.nextUrl.pathname.startsWith("/login")) {
//   //   return NextResponse.redirect(new URL("/admin", request.url));
//   // }
//   // Protect /admin and /profile routes
//   if (
//     request.nextUrl.pathname.startsWith("/admin") ||
//     request.nextUrl.pathname.startsWith("/profile")
//   ) {
//     if (!token) {
//       console.log("No token found, redirecting to login");
//       return NextResponse.redirect(new URL("/login", request.url));
//     }

//     const payload = await verifyJWT(token);
//     if (!payload) {
//       console.log("Invalid token, redirecting to login");
//       return NextResponse.redirect(new URL("/login", request.url));
//     }

//     console.log("Token verified, user:", payload);
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/admin/:path*", "/login"],
// };

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
    console.log("redirecting to login page")
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Allow access
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/company/:path*", "/login"],
};
