"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
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
        price: 29990,
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
        price: 49990,
        period: "year",
        periodLabel: "/год",
        popular: true,
        features: [
            "Все преимущества месячной",
            "Эксклюзивные материалы",
            "Приоритетная поддержка 24/7",
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
    const t = useTranslations();
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

    // Override plans with translated values
    const translatedPlans: PricingPlan[] = [
        {
            id: "monthly",
            name: t("pricing.monthly"),
            price: 29990,
            period: "month",
            periodLabel: "/" + (locale === 'ru' ? 'месяц' : 'oy'),
            features: [
                t("pricing.unlimitedTests"),
                t("pricing.allSubjects"),
                t("pricing.detailedStats"),
                t("pricing.resultHistory"),
                t("pricing.prioritySupport"),
            ],
        },
        {
            id: "yearly",
            name: t("pricing.yearly"),
            price: 49990,
            period: "year",
            periodLabel: "/" + (locale === 'ru' ? 'год' : 'yil'),
            popular: true,
            features: [
                t("pricing.allMonthlyBenefits"),
                t("pricing.exclusiveMaterials"),
                t("pricing.prioritySupport") + " 24/7",
            ],
        },
    ];

    const selectedPlanData = translatedPlans.find(p => p.id === selectedPlan);

    return (
        <div className="animate-fadeIn">
            {/* Header */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary-light)] text-[var(--primary)] text-sm font-medium mb-4">
                    <Sparkles className="w-4 h-4" />
                    {t("pricing.premiumAccess")}
                </div>
                <h1 className="text-4xl font-bold text-[var(--foreground)] mb-4">
                    {t("pricing.chooseYourPlan")}
                </h1>
                <p className="text-lg text-[var(--foreground-secondary)] max-w-2xl mx-auto">
                    {t("pricing.getFullAccess")}
                </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
                {translatedPlans.map((plan) => (
                    <div
                        key={plan.id}
                        className={`relative card ${plan.popular
                            ? "border-2 border-[var(--primary)] shadow-lg md:scale-105"
                            : ""
                            }`}
                    >
                        {plan.popular && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                <span className="inline-flex items-center gap-1 px-4 py-1 rounded-full bg-[var(--primary)] text-white text-sm font-medium">
                                    <Crown className="w-4 h-4" />
                                    {t("pricing.popular")}
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
                                    <span className="text-lg text-[var(--foreground-secondary)]">{t("pricing.sum")}</span>
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
                                {t("pricing.subscribe")}
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
                        {t("pricing.howToPay")}
                    </h2>
                </div>
                <div className="card-body">
                    <div className="grid gap-6">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold">
                                1
                            </div>
                            <div>
                                <h4 className="font-medium text-[var(--foreground)]">{t("pricing.step1Title")}</h4>
                                <p className="text-sm text-[var(--foreground-secondary)]">
                                    {t("pricing.step1Desc")}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold">
                                2
                            </div>
                            <div>
                                <h4 className="font-medium text-[var(--foreground)]">{t("pricing.step2Title")}</h4>
                                <p className="text-sm text-[var(--foreground-secondary)]">
                                    {t("pricing.step2Desc")}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold">
                                3
                            </div>
                            <div>
                                <h4 className="font-medium text-[var(--foreground)]">{t("pricing.step3Title")}</h4>
                                <p className="text-sm text-[var(--foreground-secondary)]">
                                    {t("pricing.step3Desc")}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--success)] text-white flex items-center justify-center font-bold">
                                ✓
                            </div>
                            <div>
                                <h4 className="font-medium text-[var(--foreground)]">{t("pricing.step4Title")}</h4>
                                <p className="text-sm text-[var(--foreground-secondary)]">
                                    {t("pricing.step4Desc")}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Info */}
            <div className="text-center">
                <p className="text-[var(--foreground-secondary)] mb-4">
                    {t("pricing.haveQuestions")} <Link href={`/${locale}/support`} className="text-[var(--primary)] hover:underline">{t("pricing.contactUs")}</Link>
                </p>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && selectedPlanData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fadeIn p-2 sm:p-4">
                    <div className="bg-[var(--background-secondary)] rounded-2xl shadow-2xl w-full max-w-md md:max-w-lg max-h-[90vh] overflow-y-auto animate-scaleIn">
                        {/* Modal Header */}
                        <div className="p-4 sm:p-6 border-b border-[var(--border)] text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] mb-3 sm:mb-4">
                                <CreditCard className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-[var(--foreground)]">{t("pricing.paymentTitle")}</h3>
                            <p className="text-sm sm:text-base text-[var(--foreground-secondary)]">{selectedPlanData.name}</p>
                        </div>

                        {/* Modal Body */}
                        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                            {/* Amount */}
                            <div className="text-center p-4 rounded-lg bg-[var(--primary-light)]">
                                <p className="text-sm text-[var(--foreground-secondary)] mb-1">{t("pricing.amountToPay")}</p>
                                <p className="text-3xl font-bold text-[var(--primary)]">
                                    {formatPrice(selectedPlanData.price)} {t("pricing.sum")}
                                </p>
                            </div>

                            {/* Card Number */}
                            <div>
                                <label className="label">{t("pricing.cardNumber")}</label>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 p-4 rounded-lg bg-[var(--background)] border border-[var(--border)] font-mono text-lg text-[var(--foreground)] text-center tracking-wider">
                                        {CARD_NUMBER}
                                    </div>
                                    <button
                                        onClick={handleCopyCard}
                                        className="btn btn-secondary"
                                        title={copied ? t("pricing.copied") : t("pricing.copy")}
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
                        <div className="p-4 sm:p-6 border-t border-[var(--border)] flex gap-2 sm:gap-3">
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
