"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import LanguageSwitcher from "./LanguageSwitcher";

export default function NavBar() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <Link href={`/${locale}`} className="font-semibold text-lg">
          {t("brand")}
        </Link>
        <nav className="flex items-center gap-4">
          <Link href={`/${locale}/dashboard`} className="text-sm hover:underline">
            {t("nav.dashboard")}
          </Link>
          <Link href={`/${locale}/auth/login`} className="text-sm hover:underline">
            {t("nav.login")}
          </Link>
          <Link href={`/${locale}/auth/signup`} className="text-sm hover:underline">
            {t("nav.signup")}
          </Link>
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}
