"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations("lang");
  const pathname = usePathname();

  const other = locale === "ru" ? "uz" : "ru";

  const switchHref = (() => {
    const parts = pathname.split("/");
    parts[1] = other;
    const path = parts.join("/");
    return path || `/${other}`;
  })();

  return (
    <div className="flex items-center gap-2">
      <Link href={switchHref} className="text-sm font-medium hover:underline">
        {other === "ru" ? t("ru") : t("uz")}
      </Link>
    </div>
  );
}
