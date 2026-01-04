"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { use } from "react";
import {
    Trophy,
    Frown,
    CheckCircle,
    Clock,
    Award,
    ArrowRight,
    RotateCcw,
    Home
} from "lucide-react";

interface TestResult {
    correct: number;
    total: number;
    score: number;
    timeSpent: number;
    mode: string;
}

interface ResultPageProps {
    params: Promise<{ locale: string; subjectId: string }>;
}

export default function ResultPage({ params }: ResultPageProps) {
    const resolvedParams = use(params);
    const locale = useLocale();
    const t = useTranslations();
    const [result, setResult] = useState<TestResult | null>(null);
    const [animatedScore, setAnimatedScore] = useState(0);

    const passingScore = 60;

    useEffect(() => {
        // Get results from sessionStorage
        const storedResult = sessionStorage.getItem("testResult");
        if (storedResult) {
            const parsed = JSON.parse(storedResult);
            setResult(parsed);

            // Animate score counter
            let current = 0;
            const target = parsed.score;
            const duration = 1500;
            const increment = target / (duration / 16);

            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                setAnimatedScore(Math.round(current));
            }, 16);

            return () => clearInterval(timer);
        }
    }, []);

    if (!result) {
        return (
            <div className="text-center py-12">
                <p className="text-[var(--foreground-secondary)]">Загрузка результатов...</p>
            </div>
        );
    }

    const passed = result.score >= passingScore;
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div className="max-w-2xl mx-auto animate-fadeIn">
            {/* Result Card */}
            <div className="card overflow-hidden">
                {/* Header */}
                <div className={`p-8 text-center ${passed ? "bg-gradient-to-br from-green-500 to-emerald-600" : "bg-gradient-to-br from-red-500 to-rose-600"}`}>
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 mb-4">
                        {passed ? (
                            <Trophy className="w-10 h-10 text-white" />
                        ) : (
                            <Frown className="w-10 h-10 text-white" />
                        )}
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">
                        {passed ? t("result.passed") : t("result.failed")}
                    </h1>
                    <p className="text-white/80">
                        {passed
                            ? t("result.passedDesc")
                            : t("result.failedDesc")}
                    </p>
                </div>

                {/* Score Circle */}
                <div className="p-8">
                    <div className="flex justify-center mb-8">
                        <div className="relative">
                            <svg className="w-40 h-40 transform -rotate-90">
                                <circle
                                    cx="80"
                                    cy="80"
                                    r="70"
                                    stroke="var(--border)"
                                    strokeWidth="12"
                                    fill="none"
                                />
                                <circle
                                    cx="80"
                                    cy="80"
                                    r="70"
                                    stroke={passed ? "var(--success)" : "var(--danger)"}
                                    strokeWidth="12"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeDasharray={`${(animatedScore / 100) * 440} 440`}
                                    className="transition-all duration-1000 ease-out"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className={`text-4xl font-bold ${passed ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
                                    {animatedScore}%
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="stats-card">
                            <div className="stats-icon text-[var(--success)]">
                                <CheckCircle className="w-8 h-8 mx-auto" />
                            </div>
                            <div className="stats-number">{result.correct}/{result.total}</div>
                            <div className="stats-label">{t("result.correct")}</div>
                        </div>

                        <div className="stats-card">
                            <div className="stats-icon text-[var(--primary)]">
                                <Clock className="w-8 h-8 mx-auto" />
                            </div>
                            <div className="stats-number">{formatTime(result.timeSpent)}</div>
                            <div className="stats-label">{t("result.time")}</div>
                        </div>

                        <div className="stats-card">
                            <div className={`stats-icon ${passed ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
                                <Award className="w-8 h-8 mx-auto" />
                            </div>
                            <div className="stats-number">{passingScore}%</div>
                            <div className="stats-label">{t("result.passingScore")}</div>
                        </div>
                    </div>

                    {/* Message */}
                    <div className={`alert ${passed ? "alert-success" : "alert-danger"} mb-8`}>
                        {passed ? (
                            <>
                                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                                <p>
                                    Вы успешно прошли тест с результатом <strong>{result.score}%</strong>.
                                    Ваш результат сохранён в статистике.
                                </p>
                            </>
                        ) : (
                            <>
                                <Frown className="w-5 h-5 flex-shrink-0" />
                                <p>
                                    Ваш результат <strong>{result.score}%</strong> ниже проходного балла ({passingScore}%).
                                    Рекомендуем повторить материал и попробовать ещё раз.
                                </p>
                            </>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href={`/${locale}/tests`} className="btn btn-primary btn-lg">
                            <ArrowRight className="w-5 h-5" />
                            {t("result.otherTest")}
                        </Link>

                        {!passed && (
                            <Link href={`/${locale}/tests/${resolvedParams.subjectId}/question?mode=${result.mode}`} className="btn btn-success btn-lg">
                                <RotateCcw className="w-5 h-5" />
                                {t("result.tryAgain")}
                            </Link>
                        )}

                        <Link href={`/${locale}/dashboard`} className="btn btn-secondary btn-lg">
                            <Home className="w-5 h-5" />
                            {t("result.backToHome")}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
