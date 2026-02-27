import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  // Get NextAuth token
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  const isAuthPage = request.nextUrl.pathname.startsWith("/auth");
  const isApiRoute = request.nextUrl.pathname.startsWith("/api");
  const isRootPage = request.nextUrl.pathname === "/";
  const isPublicRoute = isRootPage || isAuthPage || isApiRoute;

  console.log("Proxy:", {
    path: request.nextUrl.pathname,
    hasToken: !!token,
    isPublicRoute
  });

  // If trying to access an auth page while logged in, redirect to dashboard
  if (isAuthPage && token) {
    console.log("Has token, redirecting to dashboard");
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If trying to access a protected route without being logged in
  if (!isPublicRoute && !token) {
    console.log("No token, redirecting to login");
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};