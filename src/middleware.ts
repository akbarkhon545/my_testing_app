import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  locales: ["ru", "uz"],
  defaultLocale: "ru",
  localePrefix: "always",
});

export const config = {
  matcher: ["/", "/(ru|uz)/:path*"],
};
