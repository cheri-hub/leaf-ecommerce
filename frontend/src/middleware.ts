import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_ROUTES = ["/profile", "/orders"];
const ADMIN_ROUTES = ["/admin"];
const GUEST_ROUTES = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("access_token")?.value;

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route));
  const isGuestRoute = GUEST_ROUTES.some((route) => pathname.startsWith(route));

  if (isAdminRoute && !token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isAuthRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isGuestRoute && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/orders/:path*", "/admin/:path*", "/login", "/register"],
};
