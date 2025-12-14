"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabase/client";
import { useLocale } from "next-intl";
import Link from "next/link";

type Subject = {
  id: number;
  name: string;
  faculty_id: number;
};

export default function TestsIndexPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const locale = useLocale();

  useEffect(() => {
    (async () => {
      setError(null);
      setLoading(true);
      const { data, error } = await supabase
        .from("subjects")
        .select("id, name, faculty_id")
        .order("name");
      if (error) setError(error.message);
      setSubjects(data ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Тесты</h1>
        <p className="text-gray-600 mt-1">Выберите предмет и начните тестирование</p>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {loading ? (
        <p className="text-sm text-gray-600">Загрузка...</p>
      ) : subjects.length === 0 ? (
        <p className="text-sm text-gray-600">Пока нет предметов</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((s) => (
            <li key={s.id} className="rounded-md border p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{s.name}</p>
                <p className="text-xs text-gray-500">ID: {s.id}</p>
              </div>
              <Link
                href={`/${locale}/tests/${s.id}`}
                className="inline-flex h-9 items-center justify-center rounded-md bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-500"
              >
                Начать
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
