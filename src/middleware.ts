import createIntlMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/auth";

const LOCALES = ["ru", "uz"] as const;
const DEFAULT_LOCALE = "ru";

const intlMiddleware = createIntlMiddleware({
  locales: [...LOCALES],
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: "always",
});

/** First path segment, but only when it is a locale we actually serve. */
function localeOf(pathname: string): string {
  const segment = pathname.split("/")[1];
  return (LOCALES as readonly string[]).includes(segment) ? segment : DEFAULT_LOCALE;
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Run the intl middleware first
  const response = intlMiddleware(request);

  // 2. Auth protection logic
  const session = request.cookies.get("session")?.value;
  const locale = localeOf(pathname);

  // Public routes that don't need auth (but might need locale prefix)
  const isAuthPage = pathname.includes("/auth/login") || pathname.includes("/auth/signup");
  const isProtectedPage =
    pathname.includes("/dashboard") ||
    pathname.includes("/profile") ||
    pathname.includes("/admin") ||
    pathname.includes("/tests");

  if (isProtectedPage) {
    if (!session) {
      return NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url));
    }

    // Validate session
    try {
      await decrypt(session);
    } catch {
      const res = NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url));
      res.cookies.delete("session");
      return res;
    }
  }

  if (isAuthPage && session) {
    try {
      await decrypt(session);
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
    } catch {
      // Invalid session, let them stay on the auth page
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.webp|.*\\.svg|.*\\.ico).*)"],
};
