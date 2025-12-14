"use client";

import { use } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Clock, CheckCircle, AlertCircle, ArrowRight, Book, Award } from "lucide-react";

interface InstructionsPageProps {
    params: Promise<{ locale: string; subjectId: string }>;
    searchParams: Promise<{ mode?: string }>;
}

export default function InstructionsPage({ params, searchParams }: InstructionsPageProps) {
    const resolvedParams = use(params);
    const resolvedSearchParams = use(searchParams);
    const locale = useLocale();

    const mode = resolvedSearchParams.mode || "training";
    const subjectId = resolvedParams.subjectId;
    const isTraining = mode === "training";

    return (
        <div className="max-w-3xl mx-auto animate-fadeIn">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--primary-light)] mb-4">
                    {isTraining ? (
                        <Book className="w-8 h-8 text-[var(--primary)]" />
                    ) : (
                        <Award className="w-8 h-8 text-[var(--primary)]" />
                    )}
                </div>
                <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">
                    {isTraining ? "Тренировочный режим" : "Полный тест"}
                </h1>
                <p className="text-[var(--foreground-secondary)]">
                    Пожалуйста, ознакомьтесь с инструкциями перед началом
                </p>
            </div>

            {/* Instructions Card */}
            <div className="card mb-6">
                <div className="card-header">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        Инструкции
                    </h2>
                </div>
                <div className="card-body space-y-4">
                    {isTraining ? (
                        <>
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--primary-light)] flex items-center justify-center">
                                    <span className="text-[var(--primary)] font-semibold text-sm">1</span>
                                </div>
                                <div>
                                    <h3 className="font-medium text-[var(--foreground)]">25 вопросов</h3>
                                    <p className="text-sm text-[var(--foreground-secondary)]">
                                        Вам будет предложено ответить на 25 случайных вопросов по выбранному предмету
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--primary-light)] flex items-center justify-center">
                                    <span className="text-[var(--primary)] font-semibold text-sm">2</span>
                                </div>
                                <div>
                                    <h3 className="font-medium text-[var(--foreground)]">25 минут</h3>
                                    <p className="text-sm text-[var(--foreground-secondary)]">
                                        На прохождение теста отводится 25 минут. Таймер будет отображаться на экране
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--primary-light)] flex items-center justify-center">
                                    <span className="text-[var(--primary)] font-semibold text-sm">3</span>
                                </div>
                                <div>
                                    <h3 className="font-medium text-[var(--foreground)]">Сохранение результатов</h3>
                                    <p className="text-sm text-[var(--foreground-secondary)]">
                                        Результаты сохраняются в вашей статистике для отслеживания прогресса
                                    </p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--primary-light)] flex items-center justify-center">
                                    <span className="text-[var(--primary)] font-semibold text-sm">1</span>
                                </div>
                                <div>
                                    <h3 className="font-medium text-[var(--foreground)]">Все вопросы</h3>
                                    <p className="text-sm text-[var(--foreground-secondary)]">
                                        Вы пройдёте все доступные вопросы по данному предмету
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--success-light)] flex items-center justify-center">
                                    <span className="text-[var(--success)] font-semibold text-sm">2</span>
                                </div>
                                <div>
                                    <h3 className="font-medium text-[var(--foreground)]">Без ограничения времени</h3>
                                    <p className="text-sm text-[var(--foreground-secondary)]">
                                        Вы можете отвечать на вопросы без спешки
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--info-light)] flex items-center justify-center">
                                    <span className="text-[var(--info)] font-semibold text-sm">3</span>
                                </div>
                                <div>
                                    <h3 className="font-medium text-[var(--foreground)]">Полная проверка знаний</h3>
                                    <p className="text-sm text-[var(--foreground-secondary)]">
                                        Идеально подходит для финальной подготовки к экзамену
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Tips */}
            <div className="bg-[var(--info-light)] border border-[var(--info)]/20 rounded-lg p-4 mb-8">
                <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[var(--info)] flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium text-[var(--info)]">Советы для успешного прохождения</p>
                        <ul className="mt-2 text-sm text-[var(--foreground-secondary)] space-y-1">
                            <li>• Внимательно читайте каждый вопрос</li>
                            <li>• Не торопитесь с ответом</li>
                            <li>• Если не уверены — пропустите и вернитесь позже</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                    href={`/${locale}/tests`}
                    className="btn btn-secondary"
                >
                    Вернуться к выбору
                </Link>
                <Link
                    href={`/${locale}/tests/${subjectId}/question?mode=${mode}`}
                    className="btn btn-primary btn-lg"
                >
                    Начать тест
                    <ArrowRight className="w-5 h-5" />
                </Link>
            </div>
        </div>
    );
}
