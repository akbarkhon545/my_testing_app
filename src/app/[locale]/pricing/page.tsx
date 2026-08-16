"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import {
    Check,
    Crown,
    Sparkles,
    Zap,
    Star,
    CreditCard
} from "lucide-react";
import PaymentModal from "@/components/PaymentModal";

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

export default function PricingPage() {
    const locale = useLocale();
    const t = useTranslations();
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("ru-RU").format(price);
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
                                    <span className="inline-block px-3 py-1 rounded-full bg-[var(--success-light)] text-[var(--success-strong)] text-sm font-medium">
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
                                            <Check className="w-3 h-3 text-[var(--success-strong)]" />
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
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--success)] text-[var(--on-success)] flex items-center justify-center font-bold">
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

            {showPaymentModal && selectedPlanData && (
                <PaymentModal
                    planName={selectedPlanData.name}
                    price={selectedPlanData.price}
                    onClose={() => setShowPaymentModal(false)}
                />
            )}
        </div>
    );
}
