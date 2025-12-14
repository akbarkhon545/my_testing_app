"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { Home, ArrowLeft, AlertTriangle } from "lucide-react";

export default function NotFound() {
    const locale = useLocale();

    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center animate-fadeIn">
                <div className="relative inline-block mb-6">
                    <div className="text-[150px] font-bold text-[var(--border)] leading-none select-none">
                        404
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <AlertTriangle className="w-16 h-16 text-[var(--warning)]" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">
                    Страница не найдена
                </h1>
                <p className="text-[var(--foreground-secondary)] mb-8 max-w-md mx-auto">
                    Страница, которую вы ищете, не существует или была перемещена.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => window.history.back()}
                        className="btn btn-secondary"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Назад
                    </button>
                    <Link href={`/${locale}`} className="btn btn-primary">
                        <Home className="w-4 h-4" />
                        На главную
                    </Link>
                </div>
            </div>
        </div>
    );
}
