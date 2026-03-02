"use client";

import { useTranslations, useLocale } from "next-intl";
import { Settings, Info, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
    const t = useTranslations();
    const locale = useLocale();

    return (
        <div className="min-h-[60vh] flex items-center justify-center animate-fadeIn px-4">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--primary-light)] mb-4">
                    <Settings className="w-10 h-10 text-[var(--primary)] animate-spin-slow" />
                </div>

                <h1 className="text-3xl font-bold text-[var(--foreground)]">
                    Техническое обслуживание
                </h1>

                <div className="p-6 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border)] space-y-4">
                    <div className="flex items-center gap-3 text-left">
                        <CheckCircle className="w-6 h-6 text-[var(--success)] shrink-0" />
                        <p className="text-[var(--foreground-secondary)]">
                            Все функции платформы временно доступны <strong>бесплатно</strong> для всех пользователей.
                        </p>
                    </div>
                </div>

                <p className="text-[var(--foreground-muted)] text-sm">
                    Мы обновляем нашу систему платежей, чтобы сделать её удобнее. Спасибо за понимание!
                </p>

                <div className="pt-4">
                    <Link href={`/${locale}/tests`} className="btn btn-primary btn-lg w-full">
                        Перейти к тестам
                    </Link>
                </div>
            </div>
        </div>
    );
}
