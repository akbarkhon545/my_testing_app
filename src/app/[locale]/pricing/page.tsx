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
    CreditCard,
    Copy,
    CheckCircle,
    Send,
    MessageCircle,
    Phone
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

// Номер карты для оплаты
const CARD_NUMBER = "9860 1604 1780 2420";
const CARD_HOLDER = "AKBARKHON FAKHRIDDINOV";
const TELEGRAM_USERNAME = "@akbarkhonfakhriddinov";
const PHONE_NUMBER = "+998 93 167 49 59";

export default function PricingPage() {
    const locale = useLocale();
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("ru-RU").format(price);
    };

    const handleCopyCard = async () => {
        await navigator.clipboard.writeText(CARD_NUMBER.replace(/\s/g, ""));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSelectPlan = (planId: string) => {
        setSelectedPlan(planId);
        setShowPaymentModal(true);
    };

    const selectedPlanData = plans.find(p => p.id === selectedPlan);

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
                                onClick={() => handleSelectPlan(plan.id)}
                                className={`btn btn-lg w-full ${plan.popular ? "btn-primary" : "btn-outline"
                                    }`}
                            >
                                <CreditCard className="w-5 h-5" />
                                Оформить подписку
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* How to Pay Section */}
            <div className="card max-w-3xl mx-auto mb-12">
                <div className="card-header">
                    <h2 className="font-semibold flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        Как оплатить
                    </h2>
                </div>
                <div className="card-body">
                    <div className="grid gap-6">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold">
                                1
                            </div>
                            <div>
                                <h4 className="font-medium text-[var(--foreground)]">Выберите тариф</h4>
                                <p className="text-sm text-[var(--foreground-secondary)]">
                                    Нажмите кнопку "Оформить подписку" на понравившемся тарифе
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold">
                                2
                            </div>
                            <div>
                                <h4 className="font-medium text-[var(--foreground)]">Переведите оплату</h4>
                                <p className="text-sm text-[var(--foreground-secondary)]">
                                    Переведите сумму на указанную карту через любое банковское приложение
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold">
                                3
                            </div>
                            <div>
                                <h4 className="font-medium text-[var(--foreground)]">Отправьте скриншот</h4>
                                <p className="text-sm text-[var(--foreground-secondary)]">
                                    Отправьте скриншот чека в Telegram и укажите ваш email
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--success)] text-white flex items-center justify-center font-bold">
                                ✓
                            </div>
                            <div>
                                <h4 className="font-medium text-[var(--foreground)]">Получите доступ</h4>
                                <p className="text-sm text-[var(--foreground-secondary)]">
                                    Мы активируем вашу подписку в течение 5-10 минут
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Info */}
            <div className="text-center">
                <p className="text-[var(--foreground-secondary)] mb-4">
                    Есть вопросы? <Link href={`/${locale}/support`} className="text-[var(--primary)] hover:underline">Свяжитесь с нами</Link>
                </p>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && selectedPlanData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fadeIn p-4">
                    <div className="bg-[var(--background-secondary)] rounded-2xl shadow-2xl w-full max-w-md animate-scaleIn">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-[var(--border)] text-center">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] mb-4">
                                <CreditCard className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-[var(--foreground)]">Оплата подписки</h3>
                            <p className="text-[var(--foreground-secondary)]">{selectedPlanData.name}</p>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6">
                            {/* Amount */}
                            <div className="text-center p-4 rounded-lg bg-[var(--primary-light)]">
                                <p className="text-sm text-[var(--foreground-secondary)] mb-1">Сумма к оплате</p>
                                <p className="text-3xl font-bold text-[var(--primary)]">
                                    {formatPrice(selectedPlanData.price)} сум
                                </p>
                            </div>

                            {/* Card Number */}
                            <div>
                                <label className="label">Номер карты для перевода</label>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 p-4 rounded-lg bg-[var(--background)] border border-[var(--border)] font-mono text-lg text-[var(--foreground)] text-center tracking-wider">
                                        {CARD_NUMBER}
                                    </div>
                                    <button
                                        onClick={handleCopyCard}
                                        className="btn btn-secondary"
                                        title="Скопировать"
                                    >
                                        {copied ? (
                                            <CheckCircle className="w-5 h-5 text-[var(--success)]" />
                                        ) : (
                                            <Copy className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                                <p className="text-sm text-[var(--foreground-muted)] mt-2 text-center">
                                    {CARD_HOLDER}
                                </p>
                            </div>

                            {/* Telegram Contact */}
                            <div className="p-4 rounded-lg bg-[#229ED9]/10 border border-[#229ED9]/20">
                                <div className="flex items-center gap-3 mb-3">
                                    <Send className="w-5 h-5 text-[#229ED9]" />
                                    <span className="font-medium text-[var(--foreground)]">Отправьте скриншот чека:</span>
                                </div>
                                <a
                                    href={`https://t.me/${TELEGRAM_USERNAME.replace("@", "")}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-lg w-full"
                                    style={{ backgroundColor: "#229ED9", color: "white" }}
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    Открыть Telegram
                                </a>
                                <p className="text-sm text-[var(--foreground-muted)] mt-2 text-center">
                                    {TELEGRAM_USERNAME}
                                </p>
                            </div>

                            {/* Instructions */}
                            <div className="p-4 rounded-lg bg-[var(--warning-light)] border border-[var(--warning)]/20">
                                <p className="text-sm text-[var(--foreground)]">
                                    <strong>Важно!</strong> При отправке скриншота укажите:
                                </p>
                                <ul className="text-sm text-[var(--foreground-secondary)] mt-2 space-y-1">
                                    <li>• Ваш email аккаунта</li>
                                    <li>• Выбранный тариф ({selectedPlanData.name})</li>
                                </ul>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-[var(--border)] flex gap-3">
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="btn btn-secondary flex-1"
                            >
                                Закрыть
                            </button>
                            <a
                                href={`tel:${PHONE_NUMBER.replace(/\s/g, "")}`}
                                className="btn btn-outline flex-1"
                            >
                                <Phone className="w-4 h-4" />
                                Позвонить
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
