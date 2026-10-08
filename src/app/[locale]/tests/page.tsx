"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { Book, Award, ChevronRight, FileQuestion, GraduationCap, Crown, Lock, Shield } from "lucide-react";
import { getUserProfile, getPublicFaculties } from "@/app/actions/auth";
import { getAvailableSubjects } from "@/app/actions/tests";

interface FacultyItem {
  id: number;
  name: string;
}

export default function TestsIndexPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [faculties, setFaculties] = useState<FacultyItem[]>([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState<number | "ALL">("ALL");
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const locale = useLocale();
  const t = useTranslations();

  // Check authentication first
  useEffect(() => {
    const checkAuth = async () => {
      const profile = await getUserProfile();

      if (!profile) {
        router.push(`/${locale}/auth/login`);
        return;
      }

      setUserProfile(profile);
      setHasSubscription(profile.hasTestAccess);
      setAuthChecked(true);

      if (profile.isAdmin) {
        try {
          const facs = await getPublicFaculties();
          setFaculties(facs);
        } catch (e) {
          console.error("Failed to load faculties", e);
        }
      }
    };
    checkAuth();
  }, [locale, router]);

  // Load subjects based on user's faculty or admin filter
  useEffect(() => {
    if (!authChecked || !userProfile) return;

    (async () => {
      setError(null);
      setLoading(true);
      try {
        const filterId = userProfile.isAdmin && selectedFacultyId !== "ALL"
          ? Number(selectedFacultyId)
          : null;
        const data = await getAvailableSubjects(filterId);
        setSubjects(data);
      } catch {
        setError("Не удалось загрузить предметы");
        setSubjects([]);
      }
      setLoading(false);
    })();
  }, [authChecked, userProfile, selectedFacultyId]);

  // Show loading while checking auth
  if (!authChecked) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2 flex items-center gap-3">
          <FileQuestion className="w-8 h-8 text-[var(--primary)]" />
          {t("tests.title")}
        </h1>
        <p className="text-[var(--foreground-secondary)]">
          {t("tests.selectSubject")}
        </p>
      </div>

      {/* Faculty Indicator for regular students */}
      {userProfile && !userProfile.isAdmin && (
        userProfile.facultyId ? (
          <div className="flex items-center justify-between flex-wrap gap-4 mb-8 p-4 rounded-xl bg-[var(--background-secondary)] border border-[var(--border)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--primary-light)] flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-[var(--primary)]" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-[var(--foreground-muted)]">
                  {t("tests.yourFaculty")}
                </span>
                <h2 className="text-lg font-bold text-[var(--foreground)]">
                  {userProfile.facultyName}
                </h2>
              </div>
            </div>
            <Link
              href={`/${locale}/profile`}
              className="text-sm font-medium text-[var(--primary)] hover:underline flex items-center gap-1"
            >
              {t("tests.changeFaculty")} →
            </Link>
          </div>
        ) : (
          <div className="mb-8 p-6 rounded-xl bg-[var(--warning-light)] border border-[var(--warning)]/30 text-[var(--foreground)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <GraduationCap className="w-6 h-6 text-[var(--warning-strong)] shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-base mb-1">
                    {t("tests.noFacultySelected")}
                  </h3>
                  <p className="text-sm text-[var(--foreground-secondary)]">
                    {t("tests.selectFacultyPrompt")}
                  </p>
                </div>
              </div>
              <Link
                href={`/${locale}/profile`}
                className="btn btn-warning whitespace-nowrap self-start sm:self-center"
              >
                {t("tests.goToProfile")}
              </Link>
            </div>
          </div>
        )
      )}

      {/* Admin Faculty Filter Switcher */}
      {userProfile?.isAdmin && (
        <div className="mb-8 p-4 rounded-xl bg-[var(--background-secondary)] border border-[var(--border)]">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[var(--primary)]" />
              <span className="font-semibold text-sm text-[var(--foreground)]">
                {t("tests.adminFacultyView")}
              </span>
            </div>
            <span className="text-xs text-[var(--foreground-muted)]">
              {t("tests.adminFacultyHint")}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--border)]">
            <button
              onClick={() => setSelectedFacultyId("ALL")}
              className={`btn btn-sm ${selectedFacultyId === "ALL" ? "btn-primary" : "btn-secondary"}`}
            >
              {t("tests.allFaculties")}
            </button>
            {faculties.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFacultyId(f.id)}
                className={`btn btn-sm ${selectedFacultyId === f.id ? "btn-primary" : "btn-secondary"}`}
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>
      )}

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
          <span>
            {userProfile?.facultyId
              ? t("tests.noSubjectsForFaculty")
              : !userProfile?.isAdmin
              ? t("tests.selectFacultyPrompt")
              : t("tests.noSubjects")}
          </span>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <div key={subject.id} className="card group hover:scale-[1.02] transition-transform">
              {/* Card Header with gradient */}
              <div className="p-6 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-t-lg">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
                    <Book className="w-6 h-6 text-white" />
                  </div>
                  {subject.faculty?.name && (
                    <span className="text-xs bg-white/20 text-white px-2.5 py-1 rounded-full font-medium">
                      {subject.faculty.name}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-white text-lg">{subject.name}</h3>
                <p className="text-white/70 text-xs mt-1">
                  {subject._count?.questions !== undefined
                    ? `${subject._count.questions} ${t("tests.question").toLowerCase()}`
                    : `ID: ${subject.id}`}
                </p>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-4">
                <p className="text-sm text-[var(--foreground-secondary)]">
                  {t("tests.aboutModes")}:
                </p>

                <div className="space-y-3">
                  {hasSubscription ? (
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
                  ) : (
                    <div
                      onClick={() => router.push(`/${locale}/pricing`)}
                      className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)] bg-[var(--background-secondary)] opacity-70 cursor-pointer group/link hover:border-[var(--premium)] transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[var(--background)] flex items-center justify-center">
                          <Lock className="w-5 h-5 text-[var(--foreground-muted)]" />
                        </div>
                        <div>
                          <p className="font-medium text-[var(--foreground-muted)]">{t("tests.training")} (Заблокировано)</p>
                          <p className="text-xs text-[var(--foreground-muted)]">Требуется подписка</p>
                        </div>
                      </div>
                      <Crown className="w-5 h-5 text-[var(--premium-strong)]" />
                    </div>
                  )}

                  {hasSubscription ? (
                    <Link
                      href={`/${locale}/tests/${subject.id}/instructions?mode=all`}
                      className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)] hover:border-[var(--success)] hover:bg-[var(--success-light)] transition-all group/link"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[var(--success-light)] flex items-center justify-center">
                          <Award className="w-5 h-5 text-[var(--success-strong)]" />
                        </div>
                        <div>
                          <p className="font-medium text-[var(--foreground)]">{t("tests.full")}</p>
                          <p className="text-xs text-[var(--foreground-muted)]">{t("tests.allQuestions")}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[var(--foreground-muted)] group-hover/link:text-[var(--success-strong)] transition-colors" />
                    </Link>
                  ) : (
                    <div
                      onClick={() => router.push(`/${locale}/pricing`)}
                      className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)] bg-[var(--background-secondary)] opacity-70 cursor-pointer group/link hover:border-[var(--premium)] transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[var(--background)] flex items-center justify-center">
                          <Lock className="w-5 h-5 text-[var(--foreground-muted)]" />
                        </div>
                        <div>
                          <p className="font-medium text-[var(--foreground-muted)]">{t("tests.full")} (Заблокировано)</p>
                          <p className="text-xs text-[var(--foreground-muted)]">Требуется подписка</p>
                        </div>
                      </div>
                      <Crown className="w-5 h-5 text-[var(--premium-strong)]" />
                    </div>
                  )}
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
                <Award className="w-6 h-6 text-[var(--success-strong)]" />
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
