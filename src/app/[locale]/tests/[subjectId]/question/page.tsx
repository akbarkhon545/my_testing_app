"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import Link from "next/link";
import {
    Clock,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    StopCircle,
    AlertCircle
} from "lucide-react";
import { use } from "react";
import { getUserSession, getUserProfile } from "@/app/actions/auth";
import { getQuestionsBySubject, saveTestResult } from "@/app/actions/admin";

interface Question {
    id: number;
    question_text: string;
    correct_answer: string;
    answer2: string;
    answer3: string;
    answer4: string;
}

function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

interface QuestionPageProps {
    params: Promise<{ locale: string; subjectId: string }>;
}

export default function QuestionPage({ params }: QuestionPageProps) {
    const resolvedParams = use(params);
    const router = useRouter();
    const locale = useLocale();
    const searchParams = useSearchParams();
    const mode = searchParams.get("mode") || "training";

    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasSubscription, setHasSubscription] = useState(false);
    const [authChecked, setAuthChecked] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [timeRemaining, setTimeRemaining] = useState(mode === "training" ? 25 * 60 : 0);
    const [isFinishing, setIsFinishing] = useState(false);

    const isTraining = mode === "training";

    // Check auth and subscription first
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

            if (!hasActiveSub) {
                router.push(`/${locale}/pricing`);
                return;
            }

            setHasSubscription(true);
            setAuthChecked(true);
        };
        checkAuth();
    }, [locale, router]);

    // Load questions (only if subscription check passed)
    useEffect(() => {
        if (!authChecked || !hasSubscription) return;

        (async () => {
            setLoading(true);
            try {
                const data = await getQuestionsBySubject(Number(resolvedParams.subjectId));
                // Shuffle for training mode
                const shuffled = mode === "training" ? shuffleArray(data || []) : (data || []);
                setQuestions(shuffled.slice(0, mode === "training" ? 25 : 100));
            } catch (e) {
                console.error("Connection error:", e);
                setQuestions([]);
            }
            setLoading(false);
        })();
    }, [resolvedParams.subjectId, mode, authChecked, hasSubscription]);

    const currentQuestion = questions[currentIndex];

    // Memoize shuffled options per question
    const shuffledOptionsMap = useMemo(() => {
        const map: Record<number, string[]> = {};
        questions.forEach(q => {
            map[q.id] = shuffleArray([
                q.correct_answer,
                q.answer2,
                q.answer3,
                q.answer4,
            ]);
        });
        return map;
    }, [questions]);

    // Timer for training mode
    useEffect(() => {
        if (!isTraining || timeRemaining <= 0) return;

        const timer = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleFinish();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isTraining]);

    const handleAnswer = (answer: string) => {
        setAnswers((prev) => ({ ...prev, [currentQuestion.id]: answer }));
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handleFinish = async () => {
        if (isFinishing) return;
        setIsFinishing(true);

        // Calculate results
        let correct = 0;
        questions.forEach((q) => {
            if (answers[q.id] === q.correct_answer) {
                correct++;
            }
        });

        const score = Math.round((correct / questions.length) * 100);
        const timeSpent = isTraining ? (25 * 60 - timeRemaining) : 0;

        console.log("=== FINISHING TRAINING TEST ===");
        console.log("Correct:", correct, "Total:", questions.length, "Score:", score);

        // Save to Database (only for training mode)
        if (mode === "training") {
            const user = await getUserSession();

            if (user) {
                try {
                    await saveTestResult({
                        userId: user.id,
                        subjectId: parseInt(resolvedParams.subjectId),
                        score: score,
                        totalQuestions: questions.length,
                        correctCount: correct,
                        totalTime: timeSpent,
                        mode: "TRAINING",
                    });
                    console.log("✅ Result saved to database!");
                } catch (error) {
                    console.error("Error saving to database:", error);
                }
            } else {
                console.error("No session - cannot save result");
            }
        }

        // Store results in sessionStorage for the results page
        sessionStorage.setItem("testResult", JSON.stringify({
            correct,
            total: questions.length,
            score,
            timeSpent,
            mode,
        }));

        router.push(`/${locale}/tests/${resolvedParams.subjectId}/result`);
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-[var(--foreground-secondary)]">Загрузка вопросов...</p>
                </div>
            </div>
        );
    }

    // No questions available
    if (questions.length === 0) {
        return (
            <div className="max-w-xl mx-auto text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--warning-light)] mb-4">
                    <AlertCircle className="w-8 h-8 text-[var(--warning)]" />
                </div>
                <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">Нет вопросов</h2>
                <p className="text-[var(--foreground-secondary)] mb-6">
                    По этому предмету пока нет доступных вопросов. Обратитесь к администратору.
                </p>
                <Link href={`/${locale}/tests`} className="btn btn-primary">
                    Вернуться к выбору теста
                </Link>
            </div>
        );
    }

    const progress = ((currentIndex + 1) / questions.length) * 100;
    const timerClass = timeRemaining <= 60 ? "danger" : timeRemaining <= 5 * 60 ? "warning" : "";
    const shuffledOptions = shuffledOptionsMap[currentQuestion?.id] || [];

    return (
        <div className="max-w-3xl mx-auto animate-fadeIn">
            {/* Header with progress and timer */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                    <div className="text-sm font-medium text-[var(--foreground)]">
                        Вопрос <span className="text-[var(--primary)]">{currentIndex + 1}</span> из{" "}
                        <span className="text-[var(--primary)]">{questions.length}</span>
                    </div>

                    {isTraining && (
                        <div className={`timer ${timerClass}`}>
                            <Clock className="w-4 h-4" />
                            {formatTime(timeRemaining)}
                        </div>
                    )}
                </div>

                {/* Progress bar */}
                <div className="progress">
                    <div
                        className="progress-bar"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Question Card */}
            <div className="card mb-6">
                <div className="card-header flex justify-between items-center">
                    <span>Вопрос {currentIndex + 1}</span>
                    {answers[currentQuestion.id] && (
                        <span className="badge badge-success text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Отвечено
                        </span>
                    )}
                </div>
                <div className="card-body">
                    <h2 className="text-lg font-medium text-[var(--foreground)] mb-6">
                        {currentQuestion.question_text}
                    </h2>

                    {/* Answer options */}
                    <div className="space-y-3">
                        {shuffledOptions.map((option, idx) => (
                            <label
                                key={idx}
                                className={`answer-option ${answers[currentQuestion.id] === option ? "selected" : ""
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="answer"
                                    value={option}
                                    checked={answers[currentQuestion.id] === option}
                                    onChange={() => handleAnswer(option)}
                                    className="accent-[var(--primary)]"
                                />
                                <span className="text-[var(--foreground)]">{option}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between">
                <button
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="btn btn-secondary"
                >
                    <ChevronLeft className="w-5 h-5" />
                    Предыдущий
                </button>

                <button
                    onClick={handleFinish}
                    className="btn btn-danger"
                >
                    <StopCircle className="w-5 h-5" />
                    Завершить тест
                </button>

                {currentIndex < questions.length - 1 ? (
                    <button
                        onClick={handleNext}
                        className="btn btn-primary"
                    >
                        Следующий
                        <ChevronRight className="w-5 h-5" />
                    </button>
                ) : (
                    <button
                        onClick={handleFinish}
                        className="btn btn-success"
                    >
                        <CheckCircle className="w-5 h-5" />
                        Завершить
                    </button>
                )}
            </div>

            {/* Question navigation dots */}
            <div className="mt-8 flex flex-wrap justify-center gap-2">
                {questions.map((q, idx) => (
                    <button
                        key={q.id}
                        onClick={() => setCurrentIndex(idx)}
                        className={`w-8 h-8 rounded-full text-sm font-medium transition-all ${idx === currentIndex
                            ? "bg-[var(--primary)] text-white"
                            : answers[q.id]
                                ? "bg-[var(--success)] text-white"
                                : "bg-[var(--border)] text-[var(--foreground-secondary)] hover:bg-[var(--border-hover)]"
                            }`}
                    >
                        {idx + 1}
                    </button>
                ))}
            </div>
        </div>
    );
}
