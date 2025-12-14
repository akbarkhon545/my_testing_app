"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import FacultiesAdmin from "@/components/admin/Faculties";
import SubjectsAdmin from "@/components/admin/Subjects";
import QuestionsAdmin from "@/components/admin/Questions";

export default function AdminPage() {
  const router = useRouter();
  const locale = useLocale();
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [tab, setTab] = useState<"faculties" | "subjects" | "questions">(
    "faculties"
  );

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
      <div className="flex items-center gap-2 border-b">
        <button
          onClick={() => setTab("faculties")}
          className={`px-3 py-2 text-sm border-b-2 -mb-px ${
            tab === "faculties" ? "border-indigo-600" : "border-transparent"
          }`}
        >
          Факультеты
        </button>
        <button
          onClick={() => setTab("subjects")}
          className={`px-3 py-2 text-sm border-b-2 -mb-px ${
            tab === "subjects" ? "border-indigo-600" : "border-transparent"
          }`}
        >
          Предметы
        </button>
        <button
          onClick={() => setTab("questions")}
          className={`px-3 py-2 text-sm border-b-2 -mb-px ${
            tab === "questions" ? "border-indigo-600" : "border-transparent"
          }`}
        >
          Вопросы
        </button>
      </div>

      {tab === "faculties" && <FacultiesAdmin />}
      {tab === "subjects" && <SubjectsAdmin />}
      {tab === "questions" && <QuestionsAdmin />}
    </div>
  );
}
