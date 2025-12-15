"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase/client";
import { useLocale } from "next-intl";
import Link from "next/link";
import { Book, Award, ChevronRight, FileQuestion, GraduationCap, AlertCircle, Crown } from "lucide-react";

type Subject = {
  id: number;
  name: string;
  faculty_id: number;
};

export default function TestsIndexPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const locale = useLocale();

  // Check authentication first
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push(`/${locale}/auth/login`);
        return;
      }

      // Check subscription by email
      const userEmail = session.user.email;

      // Admin bypass - full access without subscription
      if (userEmail === "akbarkhon545@gmail.com") {
        setHasSubscription(true);
        setAuthChecked(true);
        return;
      }

      const allSubs = JSON.parse(localStorage.getItem('all_subscriptions') || '{}');
      const userSub = allSubs[userEmail || ''];

      // Check if subscription exists and is not expired
      if (userSub && userSub.expiresAt) {
        const expiryDate = new Date(userSub.expiresAt);
        setHasSubscription(expiryDate > new Date());
      } else {
        setHasSubscription(false);
      }

      setAuthChecked(true);
    };
    checkAuth();
  }, [locale, router]);

  // Load subjects only after auth check
  useEffect(() => {
    if (!authChecked) return;

    (async () => {
      setError(null);
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("subjects")
          .select("id, name, faculty_id")
          .order("name");

        if (error) {
          console.warn("Supabase error:", error.message);
          setError("Не удалось загрузить предметы");
          setSubjects([]);
        } else {
          setSubjects(data || []);
        }
      } catch (e) {
        console.warn("Connection error");
        setError("Ошибка подключения к базе данных");
        setSubjects([]);
      }
      setLoading(false);
    })();
  }, [authChecked]);

  // Show loading while checking auth
  if (!authChecked) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Show subscription required message
  if (!hasSubscription) {
    return (
      <div className="max-w-xl mx-auto text-center py-12 animate-fadeIn">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 mb-6">
          <Crown className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">
          Требуется подписка
        </h2>
        <p className="text-[var(--foreground-secondary)] mb-8">
          Для доступа к тестам необходимо оформить подписку
        </p>
        <Link href={`/${locale}/pricing`} className="btn btn-primary btn-lg">
          <Crown className="w-5 h-5" />
          Оформить подписку
        </Link>
        <p className="mt-4 text-sm text-[var(--foreground-muted)]">
          Начните с 25 000 сум/месяц
        </p>
      </div>
    );
  }

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
