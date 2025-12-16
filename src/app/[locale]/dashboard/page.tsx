"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import {
  LogOut,
  User,
  BarChart3,
  CheckCircle,
  Clock,
  Trophy,
  BookOpen,
  Lightbulb,
  TrendingUp,
  Play
} from "lucide-react";

interface Subject {
  id: number;
  name: string;
}

interface Stats {
  subject: Subject;
  attempts: number;
  avgScore: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("dashboard");
  const [email, setEmail] = useState<string | null>(null);
  const [name, setName] = useState<string>("Студент");
  const [stats, setStats] = useState<Stats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session) {
        router.push(`/${locale}/auth/login`);
        return;
      }
      setEmail(session.user.email ?? null);
      setName(session.user.email?.split("@")[0] ?? "Студент");

      // Fetch real test results
      const { data: results, error } = await supabase
        .from("test_results")
        .select(`
          id,
          score,
          total_questions,
          subject_id,
          subjects (id, name)
        `)
        .eq("user_id", session.user.id);

      if (!error && results && results.length > 0) {
        // Aggregate results by subject
        const subjectMap = new Map<number, { subject: Subject; scores: number[]; attempts: number }>();

        results.forEach((result: any) => {
          const subjectId = result.subject_id;
          const percentage = result.total_questions > 0
            ? Math.round((result.score / result.total_questions) * 100)
            : 0;

          if (subjectMap.has(subjectId)) {
            const existing = subjectMap.get(subjectId)!;
            existing.scores.push(percentage);
            existing.attempts += 1;
          } else {
            subjectMap.set(subjectId, {
              subject: result.subjects,
              scores: [percentage],
              attempts: 1
            });
          }
        });

        // Convert to Stats array
        const aggregatedStats: Stats[] = Array.from(subjectMap.values()).map(item => ({
          subject: item.subject,
          attempts: item.attempts,
          avgScore: Math.round(item.scores.reduce((a, b) => a + b, 0) / item.scores.length)
        }));

        setStats(aggregatedStats);
      }

      setLoading(false);
    }
    loadDashboard();
  }, [router, locale]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace(`/${locale}/auth/login`);
  };

  const totalAttempts = stats.reduce((sum, s) => sum + s.attempts, 0);
  const avgTotalScore = stats.length > 0
    ? Math.round(stats.reduce((sum, s) => sum + s.avgScore, 0) / stats.length)
    : 0;

  const getScoreColor = (score: number) => {
    if (score >= 70) return "success";
    if (score >= 50) return "warning";
    return "danger";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-[var(--foreground-secondary)]">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn space-y-8">
      {/* Welcome Card */}
      <div className="card">
        <div className="card-header">
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            {t("title")}
          </h1>
        </div>
        <div className="card-body">
          <div className="flex items-center gap-5">
            <div
              className="flex-shrink-0 flex items-center justify-center w-11 h-11 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-white font-bold text-lg"
              style={{ borderRadius: '6px', minWidth: '44px', minHeight: '44px' }}
            >
              {name[0].toUpperCase()}
            </div>
            <div className="ml-1">
              <h2 className="text-lg sm:text-xl font-semibold text-[var(--foreground)]">
                {t("welcome")}, {name}!
              </h2>
              <p className="text-sm text-[var(--foreground-secondary)]">{email || "Гость"}</p>
            </div>
          </div>

          <div className="mt-4 alert alert-info">
            <Lightbulb className="w-5 h-5 flex-shrink-0" />
            <span>Ниже представлена ваша статистика по тестам и доступные действия.</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Stats Table */}
        <div className="lg:col-span-2">
          <div className="card h-full">
            <div className="card-header flex justify-between items-center">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Ваша статистика
              </h2>
              <span className="badge badge-primary">
                Всего предметов: {stats.length}
              </span>
            </div>
            <div className="card-body">
              {stats.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[var(--border)]">
                        <th className="text-left py-3 px-4 font-medium text-[var(--foreground)]">Предмет</th>
                        <th className="text-center py-3 px-4 font-medium text-[var(--foreground)]">Попытки</th>
                        <th className="text-center py-3 px-4 font-medium text-[var(--foreground)]">Средний балл</th>
                        <th className="text-left py-3 px-4 font-medium text-[var(--foreground)]">Прогресс</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.map((stat) => (
                        <tr key={stat.subject.id} className="border-b border-[var(--border)] hover:bg-[var(--border)]/30">
                          <td className="py-3 px-4 font-medium text-[var(--foreground)]">
                            {stat.subject.name}
                          </td>
                          <td className="py-3 px-4 text-center text-[var(--foreground-secondary)]">
                            {stat.attempts}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`badge badge-${getScoreColor(stat.avgScore)}`}>
                              {stat.avgScore}%
                            </span>
                          </td>
                          <td className="py-3 px-4 w-32">
                            <div className={`progress progress-${getScoreColor(stat.avgScore)}`}>
                              <div className="progress-bar" style={{ width: `${stat.avgScore}%` }} />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-[var(--foreground-secondary)]">
                  У вас пока нет статистики. Начните тестирование!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="card h-full">
          <div className="card-header">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Достижения
            </h2>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 gap-4">
              <div className="stats-card">
                <div className="stats-icon">
                  <CheckCircle className="w-8 h-8 mx-auto" />
                </div>
                <div className="stats-number">{totalAttempts}</div>
                <div className="stats-label">Всего тестов</div>
              </div>

              <div className="stats-card">
                <div className="stats-icon text-yellow-500">
                  <Trophy className="w-8 h-8 mx-auto" />
                </div>
                <div className="stats-number">{avgTotalScore}%</div>
                <div className="stats-label">Средний балл</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Start Testing */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Play className="w-5 h-5" />
              Начать тестирование
            </h2>
          </div>
          <div className="card-body">
            <p className="text-[var(--foreground-secondary)] mb-4">
              Проверьте свои знания, выбрав один из доступных предметов.
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2 text-[var(--foreground-secondary)]">
                <CheckCircle className="w-4 h-4 text-[var(--success)]" />
                Выберите предмет для тестирования
              </li>
              <li className="flex items-center gap-2 text-[var(--foreground-secondary)]">
                <CheckCircle className="w-4 h-4 text-[var(--success)]" />
                Ответьте на вопросы теста
              </li>
              <li className="flex items-center gap-2 text-[var(--foreground-secondary)]">
                <CheckCircle className="w-4 h-4 text-[var(--success)]" />
                Получите мгновенный результат
              </li>
            </ul>
            <Link href={`/${locale}/tests`} className="btn btn-primary btn-lg w-full">
              <BookOpen className="w-5 h-5" />
              Начать тестирование
            </Link>
          </div>
        </div>

        {/* Tips */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Полезные советы
            </h2>
          </div>
          <div className="card-body space-y-4">
            <div className="p-3 rounded-lg bg-[var(--background)] border border-[var(--border)]">
              <div className="flex items-center gap-2 font-medium text-[var(--foreground)] mb-1">
                <Clock className="w-4 h-4 text-[var(--primary)]" />
                Управляйте временем
              </div>
              <p className="text-sm text-[var(--foreground-secondary)]">
                Распределяйте время на каждый вопрос равномерно.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[var(--background)] border border-[var(--border)]">
              <div className="flex items-center gap-2 font-medium text-[var(--foreground)] mb-1">
                <BookOpen className="w-4 h-4 text-[var(--primary)]" />
                Читайте внимательно
              </div>
              <p className="text-sm text-[var(--foreground-secondary)]">
                Внимательно читайте вопросы и все варианты ответов.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[var(--background)] border border-[var(--border)]">
              <div className="flex items-center gap-2 font-medium text-[var(--foreground)] mb-1">
                <TrendingUp className="w-4 h-4 text-[var(--primary)]" />
                Практикуйтесь
              </div>
              <p className="text-sm text-[var(--foreground-secondary)]">
                Регулярное прохождение тестов улучшает результаты.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
