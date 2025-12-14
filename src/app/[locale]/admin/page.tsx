"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import FacultiesAdmin from "@/components/admin/Faculties";

export default function AdminPage() {
  const router = useRouter();
  const locale = useLocale();
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    async function ensureAdmin() {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      if (!session) {
        router.replace(`/${locale}/auth/login`);
        return;
      }
      const userId = session.user.id;
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();
      if (error || !profile || !["admin", "manager"].includes(profile.role)) {
        router.replace(`/${locale}/dashboard`);
        return;
      }
      setAllowed(true);
      setLoading(false);
    }
    ensureAdmin();
  }, [router, locale]);

  if (loading) {
    return <div className="text-sm text-gray-600">Loading...</div>;
  }
  if (!allowed) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Админ-панель</h1>
        <p className="text-gray-600 mt-1">Управление контентом платформы</p>
      </div>
      <FacultiesAdmin />
    </div>
  );
}
