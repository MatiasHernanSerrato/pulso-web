import { NextResponse, type NextRequest } from "next/server";

const PROTECTED = ["/dashboard"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const protectedPath = PROTECTED.some((p) => pathname.startsWith(p));
  if (!protectedPath) return NextResponse.next();

  const hasSession = req.cookies.has("pulso_session");
  if (!hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
