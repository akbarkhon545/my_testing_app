"use client";

import { useTranslations } from "next-intl";
import { Crown } from "lucide-react";
import type { AdminUser } from "./types";

export function RoleBadge({ role }: { role: string }) {
    const t = useTranslations();

    const badges: Record<string, string> = {
        ADMIN: "badge-danger",
        STUDENT: "badge-primary",
    };
    const labels: Record<string, string> = {
        ADMIN: t("admin.adminRole"),
        STUDENT: t("admin.studentRole"),
    };

    return <span className={`badge ${badges[role] || "badge-primary"}`}>{labels[role] || role}</span>;
}

export function SubscriptionBadge({ user }: { user: Pick<AdminUser, "subscriptionPlan" | "subscriptionExpiresAt"> }) {
    const t = useTranslations();

    if (!user.subscriptionPlan || user.subscriptionPlan === "FREE") {
        return <span className="badge badge-secondary">{t("admin.noSubscription")}</span>;
    }

    const isExpired = user.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt) < new Date();
    if (isExpired) {
        return <span className="badge badge-danger">{t("admin.expired")}</span>;
    }

    return (
        <span className="badge badge-success flex items-center gap-1">
            <Crown className="w-3 h-3" />
            {user.subscriptionPlan === "MONTHLY" ? t("admin.monthlyPlan") : t("admin.yearlyPlan")}
        </span>
    );
}
