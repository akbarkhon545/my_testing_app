"use client";

import { useEffect, useState } from "react";
import { getUserSession, signOutUser } from "@/app/actions/auth";
import { getDashboardStats } from "@/app/actions/stats";
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
  const t = useTranslations();
  const [email, setEmail] = useState<string | null>(null);
  const [name, setName] = useState<string>("Студент");
  const [stats, setStats] = useState<Stats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const user = await getUserSession();
        if (!user) {
          router.push(`/${locale}/auth/login`);
          return;
        }

        setEmail(user.email);
        setName(user.name || user.email.split("@")[0] || "Студент");

        const dashboardStats = await getDashboardStats();
        setStats(dashboardStats);
      } catch (error) {
        console.error("Dashboard load error:", error);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [router, locale]);

  const signOut = async () => {
    await signOutUser();
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
        <div className="text-[var(--foreground-secondary)]">{t("common.loading")}</div>
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
            {t("dashboard.title")}
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
                {t("dashboard.welcome")}, {name}!
              </h2>
              <p className="text-sm text-[var(--foreground-secondary)]">{email || "Гость"}</p>
            </div>
          </div>

          <div className="mt-4 alert alert-info">
            <Lightbulb className="w-5 h-5 flex-shrink-0" />
            <span>{t("dashboard.infoMessage")}</span>
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
                {t("dashboard.stats")}
              </h2>
              <span className="badge badge-primary">
                {t("dashboard.totalSubjects")}: {stats.length}
              </span>
            </div>
            <div className="card-body">
              {stats.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[var(--border)]">
                        <th className="text-left py-3 px-4 font-medium text-[var(--foreground)]">{t("dashboard.subject")}</th>
                        <th className="text-center py-3 px-4 font-medium text-[var(--foreground)]">{t("dashboard.attempts")}</th>
                        <th className="text-center py-3 px-4 font-medium text-[var(--foreground)]">{t("dashboard.avgScore")}</th>
                        <th className="text-left py-3 px-4 font-medium text-[var(--foreground)]">{t("dashboard.progress")}</th>
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
                  {t("dashboard.noStats")}
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
              {t("dashboard.achievements")}
            </h2>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 gap-4">
              <div className="stats-card">
                <div className="stats-icon">
                  <CheckCircle className="w-8 h-8 mx-auto" />
                </div>
                <div className="stats-number">{totalAttempts}</div>
                <div className="stats-label">{t("dashboard.totalTests")}</div>
              </div>

              <div className="stats-card">
                <div className="stats-icon text-yellow-500">
                  <Trophy className="w-8 h-8 mx-auto" />
                </div>
                <div className="stats-number">{avgTotalScore}%</div>
                <div className="stats-label">{t("dashboard.avgScore")}</div>
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
              {t("dashboard.startTest")}
            </h2>
          </div>
          <div className="card-body">
            <p className="text-[var(--foreground-secondary)] mb-4">
              {t("dashboard.checkKnowledge")}
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2 text-[var(--foreground-secondary)]">
                <CheckCircle className="w-4 h-4 text-[var(--success)]" />
                {t("dashboard.selectSubject")}
              </li>
              <li className="flex items-center gap-2 text-[var(--foreground-secondary)]">
                <CheckCircle className="w-4 h-4 text-[var(--success)]" />
                {t("dashboard.answerQuestions")}
              </li>
              <li className="flex items-center gap-2 text-[var(--foreground-secondary)]">
                <CheckCircle className="w-4 h-4 text-[var(--success)]" />
                {t("dashboard.getResult")}
              </li>
            </ul>
            <Link href={`/${locale}/tests`} className="btn btn-primary btn-lg w-full">
              <BookOpen className="w-5 h-5" />
              {t("dashboard.startTest")}
            </Link>
          </div>
        </div>

        {/* Tips */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              {t("dashboard.tips")}
            </h2>
          </div>
          <div className="card-body space-y-4">
            <div className="p-3 rounded-lg bg-[var(--background)] border border-[var(--border)]">
              <div className="flex items-center gap-2 font-medium text-[var(--foreground)] mb-1">
                <Clock className="w-4 h-4 text-[var(--primary)]" />
                {t("dashboard.manageTime")}
              </div>
              <p className="text-sm text-[var(--foreground-secondary)]">
                {t("dashboard.manageTimeDesc")}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[var(--background)] border border-[var(--border)]">
              <div className="flex items-center gap-2 font-medium text-[var(--foreground)] mb-1">
                <BookOpen className="w-4 h-4 text-[var(--primary)]" />
                {t("dashboard.readCarefully")}
              </div>
              <p className="text-sm text-[var(--foreground-secondary)]">
                {t("dashboard.readCarefullyDesc")}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[var(--background)] border border-[var(--border)]">
              <div className="flex items-center gap-2 font-medium text-[var(--foreground)] mb-1">
                <TrendingUp className="w-4 h-4 text-[var(--primary)]" />
                {t("dashboard.practice")}
              </div>
              <p className="text-sm text-[var(--foreground-secondary)]">
                {t("dashboard.practiceDesc")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
