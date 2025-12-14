"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

export default function DashboardPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("dashboard");
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const session = data.session;
      if (!session) {
        router.replace(`/${locale}/auth/login`);
      } else {
        setEmail(session.user.email ?? null);
      }
    });
  }, [router, locale]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace(`/${locale}/auth/login`);
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <p className="mt-2 text-gray-600">
        {t("welcome")} {email ? `, ${email}` : ""}
      </p>
      <button
        onClick={signOut}
        className="mt-6 inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium hover:bg-gray-50"
      >
        {t("signout")}
      </button>
    </div>
  );
}
