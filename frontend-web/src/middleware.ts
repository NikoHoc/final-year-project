import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("token")?.value;
  const userCookie = request.cookies.get("user")?.value;

  if (!token || !userCookie) {
    return NextResponse.redirect(new URL("/login?error=must_login", request.url));
  }

  let user;
  try {
    user = JSON.parse(userCookie);
  } catch (error) {
    console.error("Gagal memparsing data user dari cookies:", error);

    const response = NextResponse.redirect(new URL("/login?error=session_expired", request.url));
    response.cookies.delete("token");
    response.cookies.delete("user");

    return response;
  }

  const role = user.role;

  // redirect user ke dashboard page per role
  if (pathname === "/") {
    return NextResponse.redirect(new URL(`/${role}`, request.url));
  }

  // redirect kembali user jika ingin mengakses page diluar role mereka
  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL(`/${role}?error=unauthorized`, request.url));
  }
  if (pathname.startsWith("/owner") && role !== "owner") {
    return NextResponse.redirect(new URL(`/${role}?error=unauthorized`, request.url));
  }
  if (pathname.startsWith("/kasir") && role !== "kasir") {
    return NextResponse.redirect(new URL(`/${role}?error=unauthorized`, request.url));
  }
  if (pathname.startsWith("/pelayan") && role !== "pelayan") {
    return NextResponse.redirect(new URL(`/${role}?error=unauthorized`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/admin/:path*",
    "/owner/:path*",
    "/kasir/:path*",
    "/pelayan/:path*",
  ],
};
