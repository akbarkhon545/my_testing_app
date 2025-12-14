"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabase/client";
import { useLocale } from "next-intl";
import Link from "next/link";
import { Book, Award, ChevronRight, FileQuestion, GraduationCap } from "lucide-react";

type Subject = {
  id: number;
  name: string;
  faculty_id: number;
};

// Mock data for when Supabase is not connected
const mockSubjects: Subject[] = [
  { id: 1, name: "Python программирование", faculty_id: 1 },
  { id: 2, name: "Математика", faculty_id: 1 },
  { id: 3, name: "Физика", faculty_id: 1 },
  { id: 4, name: "Английский язык", faculty_id: 2 },
];

export default function TestsIndexPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const locale = useLocale();

  useEffect(() => {
    (async () => {
      setError(null);
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("subjects")
          .select("id, name, faculty_id")
          .order("name");

        if (error) {
          console.warn("Supabase error, using mock data:", error.message);
          setSubjects(mockSubjects);
        } else {
          setSubjects(data && data.length > 0 ? data : mockSubjects);
        }
      } catch (e) {
        console.warn("Connection error, using mock data");
        setSubjects(mockSubjects);
      }
      setLoading(false);
    })();
  }, []);

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2 flex items-center gap-3">
          <FileQuestion className="w-8 h-8 text-[var(--primary)]" />
          Выбор теста
        </h1>
        <p className="text-[var(--foreground-secondary)]">
          Выберите предмет и режим тестирования для проверки своих знаний
        </p>
      </div>

      {error && (
        <div className="alert alert-danger mb-6">
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-24 bg-[var(--border)] rounded-t-lg" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-[var(--border)] rounded w-3/4" />
                <div className="h-4 bg-[var(--border)] rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : subjects.length === 0 ? (
        <div className="alert alert-info">
          <GraduationCap className="w-5 h-5" />
          <span>Пока нет доступных предметов для тестирования. Обратитесь к администратору.</span>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <div key={subject.id} className="card group hover:scale-[1.02] transition-transform">
              {/* Card Header with gradient */}
              <div className="p-6 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-t-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
                    <Book className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-lg">{subject.name}</h3>
                    <p className="text-white/70 text-sm">ID: {subject.id}</p>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-4">
                <p className="text-sm text-[var(--foreground-secondary)]">
                  Выберите режим тестирования:
                </p>

                <div className="space-y-3">
                  <Link
                    href={`/${locale}/tests/${subject.id}/instructions?mode=training`}
                    className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--primary-light)] transition-all group/link"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[var(--primary-light)] flex items-center justify-center">
                        <Book className="w-5 h-5 text-[var(--primary)]" />
                      </div>
                      <div>
                        <p className="font-medium text-[var(--foreground)]">Тренировка</p>
                        <p className="text-xs text-[var(--foreground-muted)]">25 вопросов, 25 минут</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[var(--foreground-muted)] group-hover/link:text-[var(--primary)] transition-colors" />
                  </Link>

                  <Link
                    href={`/${locale}/tests/${subject.id}/instructions?mode=all`}
                    className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)] hover:border-[var(--success)] hover:bg-[var(--success-light)] transition-all group/link"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[var(--success-light)] flex items-center justify-center">
                        <Award className="w-5 h-5 text-[var(--success)]" />
                      </div>
                      <div>
                        <p className="font-medium text-[var(--foreground)]">Полный тест</p>
                        <p className="text-xs text-[var(--foreground-muted)]">Все вопросы, без лимита</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[var(--foreground-muted)] group-hover/link:text-[var(--success)] transition-colors" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info section */}
      <div className="mt-12 card">
        <div className="card-header">
          <h2 className="text-lg font-semibold">О режимах тестирования</h2>
        </div>
        <div className="card-body">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 rounded-lg bg-[var(--primary-light)]">
              <div className="flex items-center gap-3 mb-3">
                <Book className="w-6 h-6 text-[var(--primary)]" />
                <h3 className="font-semibold text-[var(--foreground)]">Тренировочный режим</h3>
              </div>
              <ul className="space-y-2 text-sm text-[var(--foreground-secondary)]">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                  25 случайных вопросов
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                  Ограничение 25 минут
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                  Результаты сохраняются
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-[var(--success-light)]">
              <div className="flex items-center gap-3 mb-3">
                <Award className="w-6 h-6 text-[var(--success)]" />
                <h3 className="font-semibold text-[var(--foreground)]">Полный тест</h3>
              </div>
              <ul className="space-y-2 text-sm text-[var(--foreground-secondary)]">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
                  Все вопросы по предмету
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
                  Без ограничения времени
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
                  Идеально для подготовки
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
