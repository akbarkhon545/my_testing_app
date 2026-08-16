"use client";

import { useTranslations } from "next-intl";
import { CheckCircle, Crown, X } from "lucide-react";
import { displayName, type AdminUser, type SubscriptionPlan } from "./types";

interface SubscriptionModalProps {
    user: AdminUser;
    plan: Exclude<SubscriptionPlan, "FREE">;
    expiryDate: string;
    saving: boolean;
    onPlanChange: (plan: Exclude<SubscriptionPlan, "FREE">, expiryDate: string) => void;
    onExpiryChange: (expiryDate: string) => void;
    onClose: () => void;
    onSave: () => void;
}

function isoDate(date: Date): string {
    return date.toISOString().split("T")[0];
}

export function monthlyExpiry(): string {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return isoDate(date);
}

export function yearlyExpiry(): string {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return isoDate(date);
}

export default function SubscriptionModal({
    user,
    plan,
    expiryDate,
    saving,
    onPlanChange,
    onExpiryChange,
    onClose,
    onSave,
}: SubscriptionModalProps) {
    const t = useTranslations();
    const parsedExpiry = expiryDate ? new Date(expiryDate) : null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fadeIn">
            <div className="bg-[var(--background-secondary)] rounded-xl shadow-lg w-full max-w-md mx-4 animate-scaleIn">
                <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                    <h3 className="font-semibold text-[var(--foreground)] flex items-center gap-2">
                        <Crown className="w-5 h-5 text-[var(--premium-strong)]" />
                        {t("admin.addSubscription")}
                    </h3>
                    <button onClick={onClose} className="text-[var(--foreground-muted)] hover:text-[var(--foreground)]">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    <div className="p-3 rounded-lg bg-[var(--background)] border border-[var(--border)]">
                        <p className="text-sm text-[var(--foreground-muted)]">{t("admin.users")}</p>
                        <p className="font-medium text-[var(--foreground)]">{displayName(user)}</p>
                        <p className="text-sm text-[var(--foreground-secondary)]">{user.email}</p>
                    </div>

                    <div>
                        <label className="label">{t("admin.plan")}</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => onPlanChange("MONTHLY", monthlyExpiry())}
                                className={`p-4 rounded-lg border-2 text-center transition-all ${
                                    plan === "MONTHLY"
                                        ? "border-[var(--primary)] bg-[var(--primary-light)]"
                                        : "border-[var(--border)]"
                                }`}
                            >
                                <p className="font-bold text-[var(--foreground)]">25 000 {t("pricing.sum")}</p>
                                <p className="text-xs text-[var(--foreground-muted)]">{t("admin.perMonth")}</p>
                            </button>
                            <button
                                onClick={() => onPlanChange("YEARLY", yearlyExpiry())}
                                className={`p-4 rounded-lg border-2 text-center transition-all ${
                                    plan === "YEARLY"
                                        ? "border-[var(--primary)] bg-[var(--primary-light)]"
                                        : "border-[var(--border)]"
                                }`}
                            >
                                <p className="font-bold text-[var(--foreground)]">50 000 {t("pricing.sum")}</p>
                                <p className="text-xs text-[var(--foreground-muted)]">{t("admin.perYear")}</p>
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="label">{t("admin.expiryDate") || "Дата окончания"}</label>
                        <input
                            type="date"
                            className="input"
                            value={expiryDate}
                            min={isoDate(new Date())}
                            onChange={(e) => onExpiryChange(e.target.value)}
                        />
                    </div>

                    <div className="p-3 rounded-lg bg-[var(--success-light)] border border-[var(--success)]/20">
                        <p className="text-sm text-[var(--foreground-muted)]">Тариф</p>
                        <p className="font-bold text-lg text-[var(--success-strong)]">
                            {plan === "MONTHLY" ? "25 000" : "50 000"} {t("pricing.sum")}
                        </p>
                        <p className="text-xs text-[var(--foreground-secondary)]">
                            {t("common.validUntil") || "Действует до"}:{" "}
                            {parsedExpiry && !Number.isNaN(parsedExpiry.getTime())
                                ? parsedExpiry.toLocaleDateString()
                                : "—"}
                        </p>
                    </div>
                </div>

                <div className="flex justify-end gap-2 p-4 border-t border-[var(--border)]">
                    <button onClick={onClose} className="btn btn-secondary">
                        {t("admin.cancel")}
                    </button>
                    <button onClick={onSave} className="btn btn-success" disabled={saving}>
                        <CheckCircle className="w-4 h-4" />
                        {t("admin.activateSubscription")}
                    </button>
                </div>
            </div>
        </div>
    );
}
