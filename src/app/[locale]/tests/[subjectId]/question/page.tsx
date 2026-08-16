"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
import { getUserProfile } from "@/app/actions/auth";
import { getTestQuestions, revealAnswer, submitTest, type SafeQuestion } from "@/app/actions/tests";

const TRAINING_SECONDS = 25 * 60;

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

    const [questions, setQuestions] = useState<SafeQuestion[]>([]);
    const [ticket, setTicket] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [authChecked, setAuthChecked] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    // Correct answers are fetched one at a time, only after the user commits (full mode).
    const [revealedAnswers, setRevealedAnswers] = useState<Record<number, string>>({});
    const [timeRemaining, setTimeRemaining] = useState(mode === "training" ? TRAINING_SECONDS : 0);
    const [isFinishing, setIsFinishing] = useState(false);

    const isTraining = mode === "training";

    // Check auth and subscription first (the server re-checks on every action)
    useEffect(() => {
        const checkAuth = async () => {
            const userProfile = await getUserProfile();

            if (!userProfile) {
                router.push(`/${locale}/auth/login`);
                return;
            }

            if (!userProfile.hasTestAccess) {
                router.push(`/${locale}/pricing`);
                return;
            }

            setAuthChecked(true);
        };
        checkAuth();
    }, [locale, router]);

    useEffect(() => {
        if (!authChecked) return;

        (async () => {
            setLoading(true);
            try {
                const test = await getTestQuestions(resolvedParams.subjectId, mode);
                setQuestions(test.questions);
                setTicket(test.ticket);
            } catch (e) {
                console.error("Failed to load test:", e);
                setQuestions([]);
                setTicket(null);
            }
            setLoading(false);
        })();
    }, [resolvedParams.subjectId, mode, authChecked]);

    const currentQuestion = questions[currentIndex];

    const handleFinish = useCallback(async () => {
        if (isFinishing || !ticket) return;
        setIsFinishing(true);

        const timeSpent = isTraining ? TRAINING_SECONDS - timeRemaining : 0;

        try {
            // Grading happens on the server; the client never sees the answer key.
            const summary = await submitTest({
                ticket,
                answers,
                totalTime: timeSpent,
            });

            sessionStorage.setItem("testResult", JSON.stringify({
                correct: summary.correct,
                total: summary.total,
                score: summary.score,
                timeSpent: summary.timeSpent,
                mode,
            }));

            router.push(`/${locale}/tests/${resolvedParams.subjectId}/result`);
        } catch (error) {
            console.error("Error submitting test:", error);
            setIsFinishing(false);
        }
    }, [answers, isFinishing, isTraining, locale, mode, resolvedParams.subjectId, router, ticket, timeRemaining]);

    // Keep the timer callback pointed at the latest state
    const finishRef = useRef(handleFinish);
    useEffect(() => {
        finishRef.current = handleFinish;
    }, [handleFinish]);

    // Timer for training mode
    useEffect(() => {
        if (!isTraining || loading || questions.length === 0) return;

        const timer = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    finishRef.current();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isTraining, loading, questions.length]);

    const handleAnswer = async (answer: string) => {
        if (!currentQuestion) return;
        if (!isTraining && answers[currentQuestion.id]) return; // answer is final in full mode
        setAnswers((prev) => ({ ...prev, [currentQuestion.id]: answer }));

        // Full mode shows feedback immediately - ask the server for this one answer.
        if (!isTraining && !revealedAnswers[currentQuestion.id]) {
            try {
                const { correctAnswer } = await revealAnswer(currentQuestion.id);
                setRevealedAnswers((prev) => ({ ...prev, [currentQuestion.id]: correctAnswer }));
            } catch (e) {
                console.error("Failed to reveal answer:", e);
            }
        }
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
                    <AlertCircle className="w-8 h-8 text-[var(--warning-strong)]" />
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
    const options = currentQuestion?.options || [];
    const correctAnswer = currentQuestion ? revealedAnswers[currentQuestion.id] : undefined;

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
                        {options.map((option, idx) => {
                            const isSelected = answers[currentQuestion.id] === option;
                            const isCorrect = !!correctAnswer && option === correctAnswer;
                            const isRevealed = !!correctAnswer;

                            let statusClass = "";
                            if (isTraining) {
                                // Training mode: just show selected state, no correct/incorrect feedback
                                if (isSelected) statusClass = "selected";
                            } else {
                                // Full/Exam mode: show correct/incorrect feedback
                                if (isRevealed) {
                                    if (isCorrect) statusClass = "border-[var(--success)] bg-[var(--success-light)]";
                                    else if (isSelected) statusClass = "border-[var(--danger)] bg-[var(--danger-light)]";
                                    else statusClass = "opacity-50";
                                } else if (isSelected) {
                                    statusClass = "selected";
                                }
                            }

                            return (
                                <label
                                    key={idx}
                                    className={`answer-option transition-all ${statusClass}`}
                                >
                                    <input
                                        type="radio"
                                        name="answer"
                                        value={option}
                                        checked={isSelected}
                                        disabled={!isTraining && !!answers[currentQuestion.id]}
                                        onChange={() => handleAnswer(option)}
                                        className="accent-[var(--primary)]"
                                    />
                                    <span className="text-[var(--foreground)]">{option}</span>
                                    {!isTraining && isRevealed && isCorrect && (
                                        <CheckCircle className="w-5 h-5 text-[var(--success-strong)] ml-auto" />
                                    )}
                                    {!isTraining && isRevealed && isSelected && !isCorrect && (
                                        <StopCircle className="w-5 h-5 text-[var(--danger-strong)] ml-auto" />
                                    )}
                                </label>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex flex-row gap-2 justify-between">
                <button
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="btn btn-secondary text-xs sm:text-sm px-2 sm:px-4 py-2"
                >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Предыдущий</span>
                    <span className="sm:hidden">Назад</span>
                </button>

                <button
                    onClick={handleFinish}
                    disabled={isFinishing}
                    className="btn btn-danger text-xs sm:text-sm px-2 sm:px-4 py-2"
                >
                    <StopCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Завершить тест</span>
                    <span className="sm:hidden">Стоп</span>
                </button>

                {currentIndex < questions.length - 1 ? (
                    <button
                        onClick={handleNext}
                        className="btn btn-primary text-xs sm:text-sm px-2 sm:px-4 py-2"
                    >
                        <span className="hidden sm:inline">Следующий</span>
                        <span className="sm:hidden">Далее</span>
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                ) : (
                    <button
                        onClick={handleFinish}
                        disabled={isFinishing}
                        className="btn btn-success text-xs sm:text-sm px-2 sm:px-4 py-2"
                    >
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="hidden sm:inline">Завершить</span>
                        <span className="sm:hidden">Готово</span>
                    </button>
                )}
            </div>


        </div>
    );
}
