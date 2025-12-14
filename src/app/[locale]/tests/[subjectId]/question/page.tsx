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
    StopCircle
} from "lucide-react";
import { use } from "react";

// Mock data for testing (will be replaced with Supabase queries)
const mockQuestions = [
    {
        id: 1,
        question_text: "Какой оператор используется для присваивания значения переменной в Python?",
        correct_answer: "=",
        answer2: "==",
        answer3: ":=",
        answer4: "=>",
    },
    {
        id: 2,
        question_text: "Какой тип данных используется для хранения текста в Python?",
        correct_answer: "str",
        answer2: "text",
        answer3: "string",
        answer4: "char",
    },
    {
        id: 3,
        question_text: "Как объявить список в Python?",
        correct_answer: "[]",
        answer2: "{}",
        answer3: "()",
        answer4: "<>",
    },
    {
        id: 4,
        question_text: "Какой метод добавляет элемент в конец списка?",
        correct_answer: "append()",
        answer2: "add()",
        answer3: "insert()",
        answer4: "push()",
    },
    {
        id: 5,
        question_text: "Какое ключевое слово используется для определения функции?",
        correct_answer: "def",
        answer2: "function",
        answer3: "func",
        answer4: "fn",
    },
];

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

    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [timeRemaining, setTimeRemaining] = useState(mode === "training" ? 25 * 60 : 0);
    const [isFinishing, setIsFinishing] = useState(false);

    const questions = mockQuestions;
    const currentQuestion = questions[currentIndex];
    const isTraining = mode === "training";

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
    }, []);

    const shuffledOptions = shuffledOptionsMap[currentQuestion.id];

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

    const handleFinish = () => {
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

    const progress = ((currentIndex + 1) / questions.length) * 100;
    const timerClass = timeRemaining <= 60 ? "danger" : timeRemaining <= 5 * 60 ? "warning" : "";

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
