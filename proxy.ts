import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "./app/lib/auth";

// Define protected routes
const protectedRoutes = ["/dashboard", "/students", "/courses", "/enrollment", "/settings"];
const publicRoutes = ["/login", "/"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip API routes and static assets
  if (pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname.includes(".")) {
    return NextResponse.next();
  }

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // Get session
  const session = await getSession();

  // Redirect to login if accessing a protected route without being authenticated
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect to dashboard if logged in and accessing login page
  if (pathname === "/login" && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}
