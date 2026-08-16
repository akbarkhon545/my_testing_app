"use client";

import { useTranslations } from "next-intl";
import { CheckCircle, Crown } from "lucide-react";
import Modal from "@/components/ui/Modal";
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
        <Modal
            title={t("admin.addSubscription")}
            icon={<Crown className="w-5 h-5 text-[var(--premium-strong)]" />}
            onClose={onClose}
            footer={
                <>
                    <button type="button" onClick={onClose} className="btn btn-secondary">
                        {t("admin.cancel")}
                    </button>
                    <button type="button" onClick={onSave} className="btn btn-success" disabled={saving}>
                        <CheckCircle className="w-4 h-4" />
                        {t("admin.activateSubscription")}
                    </button>
                </>
            }
        >
            <div className="p-3 rounded-lg bg-[var(--background)] border border-[var(--border)]">
                <p className="text-sm text-[var(--foreground-muted)]">{t("admin.users")}</p>
                <p className="font-medium text-[var(--foreground)]">{displayName(user)}</p>
                <p className="text-sm text-[var(--foreground-secondary)]">{user.email}</p>
            </div>

            <fieldset>
                <legend className="label">{t("admin.plan")}</legend>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        aria-pressed={plan === "MONTHLY"}
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
                        type="button"
                        aria-pressed={plan === "YEARLY"}
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
            </fieldset>

            <div>
                <label className="label" htmlFor="subscription-expiry">
                    {t("admin.expiryDate") || "Дата окончания"}
                </label>
                <input
                    id="subscription-expiry"
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
                    {parsedExpiry && !Number.isNaN(parsedExpiry.getTime()) ? parsedExpiry.toLocaleDateString() : "—"}
                </p>
            </div>
        </Modal>
    );
}
