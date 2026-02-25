import createIntlMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/auth";

const intlMiddleware = createIntlMiddleware({
  locales: ["ru", "uz"],
  defaultLocale: "ru",
  localePrefix: "always",
});

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Run the intl middleware first
  const response = intlMiddleware(request);

  // 2. Auth protection logic
  const session = request.cookies.get("session")?.value;

  // Public routes that don't need auth (but might need locale prefix)
  const isAuthPage = pathname.includes("/auth/login") || pathname.includes("/auth/signup");
  const isProtectedPage = pathname.includes("/dashboard") || pathname.includes("/profile") || pathname.includes("/admin");

  if (isProtectedPage) {
    if (!session) {
      const locale = pathname.split("/")[1] || "ru";
      return NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url));
    }

    // Validate session
    try {
      await decrypt(session);
    } catch (e) {
      const locale = pathname.split("/")[1] || "ru";
      const res = NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url));
      res.cookies.delete("session");
      return res;
    }
  }

  if (isAuthPage && session) {
    try {
      await decrypt(session);
      const locale = pathname.split("/")[1] || "ru";
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
    } catch (e) {
      // Invalid session, let them stay on the auth page
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.webp|.*\\.svg|.*\\.ico).*)"],
};
