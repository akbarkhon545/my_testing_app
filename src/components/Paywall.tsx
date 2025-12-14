"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { Lock, Crown, ArrowRight } from "lucide-react";

interface PaywallProps {
    title?: string;
    description?: string;
}

export default function Paywall({
    title = "Премиум функция",
    description = "Эта функция доступна только для подписчиков"
}: PaywallProps) {
    const locale = useLocale();

    return (
        <div className="text-center py-12 animate-fadeIn">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 mb-6">
                <Lock className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">
                {title}
            </h2>
            <p className="text-[var(--foreground-secondary)] mb-8 max-w-md mx-auto">
                {description}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={`/${locale}/pricing`} className="btn btn-primary btn-lg">
                    <Crown className="w-5 h-5" />
                    Оформить подписку
                    <ArrowRight className="w-5 h-5" />
                </Link>
            </div>

            <div className="mt-8 p-4 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)] max-w-sm mx-auto">
                <p className="text-sm text-[var(--foreground-secondary)]">
                    <Crown className="w-4 h-4 inline text-yellow-500 mr-1" />
                    Начните с <span className="font-semibold">25 000 сум/месяц</span>
                </p>
            </div>
        </div>
    );
}
