"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabase/client";
import { useLocale } from "next-intl";
import Link from "next/link";

type Result = {
  id: number;
  subject_id: number;
  mode: "training" | "exam" | string;
  timestamp: string;
  score: number;
  correct_count: number;
  total_time: number;
};

type Subject = { id: number; name: string };

export default function ResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const locale = useLocale();

  useEffect(() => {
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      if (!session) {
        // Let the page render a CTA instead of redirecting hard
        setLoading(false);
        return;
      }

      setError(null);
      setLoading(true);
      const [resRes, subjRes] = await Promise.all([
        supabase
          .from("test_results")
          .select("id, subject_id, mode, timestamp, score, correct_count, total_time")
          .order("timestamp", { ascending: false })
          .limit(50),
        supabase.from("subjects").select("id, name"),
      ]);

      if (resRes.error) setError(resRes.error.message);
      if (subjRes.error) setError(subjRes.error.message);

      setResults(resRes.data ?? []);
      setSubjects(subjRes.data ?? []);
      setLoading(false);
    })();
  }, []);

  const subjectName = (id: number) => subjects.find((s) => s.id === id)?.name || "-";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Результаты тестов</h1>
        <p className="text-gray-600 mt-1">Ваши последние прохождения</p>
      </div>

      {loading ? (
        <p className="text-sm text-gray-600">Загрузка...</p>
      ) : results.length === 0 ? (
        <div className="text-sm text-gray-600 space-y-2">
          <p>Пока нет результатов.</p>
          <Link
            href={`/${locale}/tests`}
            className="inline-flex h-9 items-center justify-center rounded-md bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-500"
          >
            Перейти к тестам
          </Link>
        </div>
      ) : (
        <ul className="divide-y rounded-md border">
          {results.map((r) => (
            <li key={r.id} className="px-4 py-3 grid gap-1 sm:grid-cols-5 text-sm">
              <div>
                <div className="text-gray-500">Предмет</div>
                <div className="font-medium">{subjectName(r.subject_id)}</div>
              </div>
              <div>
                <div className="text-gray-500">Режим</div>
                <div className="font-medium">{r.mode === "exam" ? "Экзамен" : "Тренировка"}</div>
              </div>
              <div>
                <div className="text-gray-500">Оценка</div>
                <div className="font-medium">{Math.round(r.score)}%</div>
              </div>
              <div>
                <div className="text-gray-500">Верно</div>
                <div className="font-medium">{r.correct_count}</div>
              </div>
              <div>
                <div className="text-gray-500">Время</div>
                <div className="font-medium">{r.total_time}s</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
