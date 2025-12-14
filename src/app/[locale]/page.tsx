"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";

export default function HomePage() {
  const t = useTranslations("hero");
  const locale = useLocale();

  return (
    <div className="relative isolate overflow-hidden rounded-2xl border bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-10">
      <div className="max-w-2xl">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-gray-900">
          {t("title")}
        </h1>
        <p className="mt-4 text-gray-600 text-base sm:text-lg">
          {t("subtitle")}
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href={`/${locale}/auth/login`}
            className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            {t("cta")}
          </Link>
          <Link
            href={`/${locale}/dashboard`}
            className="inline-flex items-center justify-center rounded-md border px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50"
          >
            Dashboard
          </Link>
        </div>
      </div>
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-cyan-200/40 blur-3xl" />
    </div>
  );
}
