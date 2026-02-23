"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { getUserSession } from "@/app/actions/auth";
import { getUserResults } from "@/app/actions/admin";

type Result = {
  id: string;
  subject_id: number;
  mode: "TRAINING" | "EXAM";
  score: number;
  correct_count: number;
  total_time: number;
  createdAt: Date;
  subject?: { name: string };
};

export default function ResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const locale = useLocale();

  useEffect(() => {
    (async () => {
      const user = await getUserSession();
      if (!user) {
        setLoading(false);
        return;
      }

      setError(null);
      setLoading(true);
      try {
        const data = await getUserResults(user.id);
        setResults(data as any[]);
      } catch (err: any) {
        setError(err.message || "Ошибка загрузки результатов");
      }
      setLoading(false);
    })();
  }, []);

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
            <li key={r.id} className="px-4 py-3 grid gap-1 sm:grid-cols-6 text-sm">
              <div>
                <div className="text-gray-500">Предмет</div>
                <div className="font-medium">{r.subject?.name || "-"}</div>
              </div>
              <div>
                <div className="text-gray-500">Режим</div>
                <div className="font-medium">{r.mode === "EXAM" ? "Экзамен" : "Тренировка"}</div>
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
              <div>
                <div className="text-gray-500">Дата</div>
                <div className="font-medium text-xs">{new Date(r.createdAt).toLocaleDateString()}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
