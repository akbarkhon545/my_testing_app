"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { getUserSession } from "@/app/actions/auth";
import { getUserResults } from "@/app/actions/admin";
import { Trophy, BookOpen, Clock, CheckCircle, Award } from "lucide-react";

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
  const t = useTranslations();

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

  const getScoreColor = (score: number) => {
    if (score >= 70) return "success";
    if (score >= 50) return "warning";
    return "danger";
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center gap-3">
        <Trophy className="w-7 h-7 text-[var(--primary)]" />
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Результаты тестов</h1>
          <p className="text-[var(--foreground-secondary)]">Ваши последние прохождения</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[30vh]">
          <div className="w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">
          <span>{error}</span>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--primary-light)] mb-4">
            <BookOpen className="w-8 h-8 text-[var(--primary)]" />
          </div>
          <h3 className="font-semibold text-[var(--foreground)] mb-2">Пока нет результатов</h3>
          <p className="text-[var(--foreground-secondary)] mb-4">Пройдите тест, чтобы увидеть результаты здесь</p>
          <Link href={`/${locale}/tests`} className="btn btn-primary">
            <BookOpen className="w-4 h-4" />
            Перейти к тестам
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {results.map((r) => (
            <div key={r.id} className="card">
              <div className="card-body">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* Subject & Mode */}
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-[var(--${getScoreColor(r.score)}-light)] flex items-center justify-center`}>
                      <Award className={`w-5 h-5 text-[var(--${getScoreColor(r.score)})]`} />
                    </div>
                    <div>
                      <h3 className="font-medium text-[var(--foreground)]">{r.subject?.name || "—"}</h3>
                      <p className="text-xs text-[var(--foreground-muted)]">
                        {r.mode === "EXAM" ? "Экзамен" : "Тренировка"} • {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="text-center">
                      <div className="text-xs text-[var(--foreground-muted)]">Оценка</div>
                      <span className={`badge badge-${getScoreColor(r.score)}`}>{Math.round(r.score)}%</span>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-[var(--foreground-muted)]">Верно</div>
                      <div className="flex items-center gap-1 text-sm font-medium text-[var(--foreground)]">
                        <CheckCircle className="w-3.5 h-3.5 text-[var(--success)]" />
                        {r.correct_count}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-[var(--foreground-muted)]">Время</div>
                      <div className="flex items-center gap-1 text-sm font-medium text-[var(--foreground)]">
                        <Clock className="w-3.5 h-3.5 text-[var(--primary)]" />
                        {r.total_time}с
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
