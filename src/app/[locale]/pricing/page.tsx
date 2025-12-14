"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import Link from "next/link";
import {
    Check,
    Crown,
    Sparkles,
    Zap,
    Shield,
    Clock,
    Star,
    ArrowRight,
    CreditCard
} from "lucide-react";

interface PricingPlan {
    id: string;
    name: string;
    price: number;
    period: string;
    periodLabel: string;
    features: string[];
    popular?: boolean;
    savings?: string;
}

const plans: PricingPlan[] = [
    {
        id: "monthly",
        name: "Месячная подписка",
        price: 25000,
        period: "month",
        periodLabel: "/месяц",
        features: [
            "Неограниченные тесты",
            "Доступ ко всем предметам",
            "Подробная статистика",
            "История результатов",
            "Приоритетная поддержка",
        ],
    },
    {
        id: "yearly",
        name: "Годовая подписка",
        price: 50000,
        period: "year",
        periodLabel: "/год",
        popular: true,
        savings: "Экономия 250 000 сум!",
        features: [
            "Все преимущества месячной",
            "Неограниченные тесты",
            "Доступ ко всем предметам",
            "Подробная статистика",
            "История результатов",
            "Приоритетная поддержка",
            "Эксклюзивные материалы",
        ],
    },
];

export default function PricingPage() {
    const locale = useLocale();
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("ru-RU").format(price);
    };

    const handleSubscribe = async (planId: string) => {
        setSelectedPlan(planId);
        setIsProcessing(true);

        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 1500));

        // In a real app, redirect to payment gateway (Click, Payme, etc.)
        alert(`Перенаправление на оплату плана: ${planId}`);
        setIsProcessing(false);
    };

    return (
        <div className="animate-fadeIn">
            {/* Header */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary-light)] text-[var(--primary)] text-sm font-medium mb-4">
                    <Sparkles className="w-4 h-4" />
                    Премиум доступ
                </div>
                <h1 className="text-4xl font-bold text-[var(--foreground)] mb-4">
                    Выберите свой тариф
                </h1>
                <p className="text-lg text-[var(--foreground-secondary)] max-w-2xl mx-auto">
                    Получите полный доступ ко всем тестам и возможностям платформы
                </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        className={`relative card ${plan.popular
                                ? "border-2 border-[var(--primary)] shadow-lg scale-105"
                                : ""
                            }`}
                    >
                        {plan.popular && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                <span className="inline-flex items-center gap-1 px-4 py-1 rounded-full bg-[var(--primary)] text-white text-sm font-medium">
                                    <Crown className="w-4 h-4" />
                                    Популярный выбор
                                </span>
                            </div>
                        )}

                        <div className="card-body p-8">
                            {/* Plan Header */}
                            <div className="text-center mb-6">
                                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 ${plan.popular
                                        ? "bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)]"
                                        : "bg-[var(--primary-light)]"
                                    }`}>
                                    {plan.popular ? (
                                        <Crown className="w-7 h-7 text-white" />
                                    ) : (
                                        <Star className="w-7 h-7 text-[var(--primary)]" />
                                    )}
                                </div>
                                <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">
                                    {plan.name}
                                </h3>
                                {plan.savings && (
                                    <span className="inline-block px-3 py-1 rounded-full bg-[var(--success-light)] text-[var(--success)] text-sm font-medium">
                                        {plan.savings}
                                    </span>
                                )}
                            </div>

                            {/* Price */}
                            <div className="text-center mb-6">
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-4xl font-bold text-[var(--foreground)]">
                                        {formatPrice(plan.price)}
                                    </span>
                                    <span className="text-lg text-[var(--foreground-secondary)]">сум</span>
                                </div>
                                <span className="text-[var(--foreground-muted)]">{plan.periodLabel}</span>
                            </div>

                            {/* Features */}
                            <ul className="space-y-3 mb-8">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-center gap-3">
                                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--success-light)] flex items-center justify-center">
                                            <Check className="w-3 h-3 text-[var(--success)]" />
                                        </div>
                                        <span className="text-[var(--foreground-secondary)]">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* CTA Button */}
                            <button
                                onClick={() => handleSubscribe(plan.id)}
                                disabled={isProcessing && selectedPlan === plan.id}
                                className={`btn btn-lg w-full ${plan.popular ? "btn-primary" : "btn-outline"
                                    }`}
                            >
                                {isProcessing && selectedPlan === plan.id ? (
                                    <>Обработка...</>
                                ) : (
                                    <>
                                        <CreditCard className="w-5 h-5" />
                                        Оформить подписку
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Features Section */}
            <div className="card max-w-4xl mx-auto">
                <div className="card-header">
                    <h2 className="font-semibold flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        Что включено в подписку
                    </h2>
                </div>
                <div className="card-body">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[var(--primary-light)] flex items-center justify-center">
                                <Check className="w-5 h-5 text-[var(--primary)]" />
                            </div>
                            <div>
                                <h4 className="font-medium text-[var(--foreground)]">Все тесты</h4>
                                <p className="text-sm text-[var(--foreground-secondary)]">Неограниченный доступ ко всем предметам</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[var(--success-light)] flex items-center justify-center">
                                <Clock className="w-5 h-5 text-[var(--success)]" />
                            </div>
                            <div>
                                <h4 className="font-medium text-[var(--foreground)]">Без ограничений</h4>
                                <p className="text-sm text-[var(--foreground-secondary)]">Проходите тесты сколько угодно</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[var(--warning-light)] flex items-center justify-center">
                                <Star className="w-5 h-5 text-[var(--warning)]" />
                            </div>
                            <div>
                                <h4 className="font-medium text-[var(--foreground)]">Статистика</h4>
                                <p className="text-sm text-[var(--foreground-secondary)]">Подробный анализ результатов</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[var(--info-light)] flex items-center justify-center">
                                <Shield className="w-5 h-5 text-[var(--info)]" />
                            </div>
                            <div>
                                <h4 className="font-medium text-[var(--foreground)]">Поддержка</h4>
                                <p className="text-sm text-[var(--foreground-secondary)]">Приоритетная помощь 24/7</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[var(--danger-light)] flex items-center justify-center">
                                <Crown className="w-5 h-5 text-[var(--danger)]" />
                            </div>
                            <div>
                                <h4 className="font-medium text-[var(--foreground)]">Эксклюзив</h4>
                                <p className="text-sm text-[var(--foreground-secondary)]">Доступ к новым материалам</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h4 className="font-medium text-[var(--foreground)]">Обновления</h4>
                                <p className="text-sm text-[var(--foreground-secondary)]">Новые функции и контент</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Methods */}
            <div className="text-center mt-8">
                <p className="text-sm text-[var(--foreground-muted)] mb-4">Принимаем к оплате:</p>
                <div className="flex justify-center gap-4 flex-wrap">
                    <div className="px-4 py-2 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)]">
                        <span className="font-medium text-[var(--foreground)]">💳 Click</span>
                    </div>
                    <div className="px-4 py-2 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)]">
                        <span className="font-medium text-[var(--foreground)]">💳 Payme</span>
                    </div>
                    <div className="px-4 py-2 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)]">
                        <span className="font-medium text-[var(--foreground)]">💳 Uzcard</span>
                    </div>
                    <div className="px-4 py-2 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)]">
                        <span className="font-medium text-[var(--foreground)]">💳 Humo</span>
                    </div>
                </div>
            </div>

            {/* FAQ */}
            <div className="max-w-2xl mx-auto mt-12 text-center">
                <p className="text-[var(--foreground-secondary)]">
                    Есть вопросы? <Link href={`/${locale}/support`} className="text-[var(--primary)] hover:underline">Свяжитесь с нами</Link>
                </p>
            </div>
        </div>
    );
}
