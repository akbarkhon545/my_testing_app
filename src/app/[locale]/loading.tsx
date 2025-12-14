"use client";

export default function Loading() {
    return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center animate-fadeIn">
                <div className="relative w-16 h-16 mx-auto mb-4">
                    <div className="absolute inset-0 rounded-full border-4 border-[var(--border)]"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[var(--primary)] animate-spin"></div>
                </div>
                <p className="text-[var(--foreground-secondary)]">Загрузка...</p>
            </div>
        </div>
    );
}
