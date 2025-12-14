"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Home, RotateCcw, AlertOctagon } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center animate-fadeIn">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--danger-light)] mb-6">
                    <AlertOctagon className="w-10 h-10 text-[var(--danger)]" />
                </div>

                <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">
                    Что-то пошло не так
                </h1>
                <p className="text-[var(--foreground-secondary)] mb-2 max-w-md mx-auto">
                    Произошла непредвиденная ошибка. Мы уже работаем над её исправлением.
                </p>
                {error.digest && (
                    <p className="text-sm text-[var(--foreground-muted)] mb-8">
                        Код ошибки: {error.digest}
                    </p>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => reset()}
                        className="btn btn-secondary"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Попробовать снова
                    </button>
                    <Link href="/" className="btn btn-primary">
                        <Home className="w-4 h-4" />
                        На главную
                    </Link>
                </div>
            </div>
        </div>
    );
}
