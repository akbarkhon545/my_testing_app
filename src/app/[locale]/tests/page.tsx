"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { Book, Award, ChevronRight, FileQuestion, GraduationCap, AlertCircle, Crown } from "lucide-react";
import { getUserSession, getUserProfile } from "@/app/actions/auth";
import { getSubjects } from "@/app/actions/admin";

export default function TestsIndexPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const locale = useLocale();
  const t = useTranslations();

  // Check authentication first
  useEffect(() => {
    const checkAuth = async () => {
      const userProfile = await getUserProfile();

      if (!userProfile) {
        router.push(`/${locale}/auth/login`);
        return;
      }

      // Admin bypass - full access
      if (userProfile.role === "ADMIN" || userProfile.email === "akbarkhon545@gmail.com") {
        setHasSubscription(true);
        setAuthChecked(true);
        return;
      }

      const hasActiveSub = userProfile.subscriptionPlan !== "FREE" &&
        userProfile.subscriptionExpiresAt &&
        new Date(userProfile.subscriptionExpiresAt) > new Date();

      setHasSubscription(!!hasActiveSub);
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
        const data = await getSubjects();
        setSubjects(data);
      } catch (e: any) {
        setError("Не удалось загрузить предметы");
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
          {t("tests.subscriptionRequired")}
        </h2>
        <p className="text-[var(--foreground-secondary)] mb-8">
          {t("tests.subscriptionRequiredDesc")}
        </p>
        <Link href={`/${locale}/pricing`} className="btn btn-primary btn-lg">
          <Crown className="w-5 h-5" />
          {t("pricing.subscribe")}
        </Link>
        <p className="mt-4 text-sm text-[var(--foreground-muted)]">
          {t("tests.startFrom")} 25 000 {t("pricing.sum")}
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
          {t("tests.title")}
        </h1>
        <p className="text-[var(--foreground-secondary)]">
          {t("tests.selectSubject")}
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
                  {t("tests.aboutModes")}:
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
                        <p className="font-medium text-[var(--foreground)]">{t("tests.training")}</p>
                        <p className="text-xs text-[var(--foreground-muted)]">{t("tests.trainingDesc")}</p>
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
                        <p className="font-medium text-[var(--foreground)]">{t("tests.full")}</p>
                        <p className="text-xs text-[var(--foreground-muted)]">{t("tests.allQuestions")}</p>
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
          <h2 className="text-lg font-semibold">{t("tests.aboutModes")}</h2>
        </div>
        <div className="card-body">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 rounded-lg bg-[var(--primary-light)]">
              <div className="flex items-center gap-3 mb-3">
                <Book className="w-6 h-6 text-[var(--primary)]" />
                <h3 className="font-semibold text-[var(--foreground)]">{t("tests.trainingMode")}</h3>
              </div>
              <ul className="space-y-2 text-sm text-[var(--foreground-secondary)]">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                  {t("tests.trainingModeDesc1")}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                  {t("tests.trainingModeDesc2")}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                  {t("tests.trainingModeDesc3")}
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-[var(--success-light)]">
              <div className="flex items-center gap-3 mb-3">
                <Award className="w-6 h-6 text-[var(--success)]" />
                <h3 className="font-semibold text-[var(--foreground)]">{t("tests.fullTest")}</h3>
              </div>
              <ul className="space-y-2 text-sm text-[var(--foreground-secondary)]">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
                  {t("tests.fullTestDesc1")}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
                  {t("tests.fullTestDesc2")}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
                  {t("tests.fullTestDesc3")}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
