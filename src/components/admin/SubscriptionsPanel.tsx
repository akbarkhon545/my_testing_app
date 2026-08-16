"use client";

import { useTranslations } from "next-intl";
import { Calendar, CheckCircle, Clock, CreditCard, Crown, Trash2 } from "lucide-react";
import { displayName, initial, type AdminStats, type AdminUser } from "./types";

interface SubscriptionsPanelProps {
    users: AdminUser[];
    stats: AdminStats;
    onGrantSubscription: (user: AdminUser) => void;
    onRemoveSubscription: (userId: string) => void;
}

export default function SubscriptionsPanel({
    users,
    stats,
    onGrantSubscription,
    onRemoveSubscription,
}: SubscriptionsPanelProps) {
    const t = useTranslations();

    const usersWithSub = users.filter((u) => u.subscriptionPlan && u.subscriptionPlan !== "FREE");
    const usersWithoutSub = users.filter(
        (u) => (!u.subscriptionPlan || u.subscriptionPlan === "FREE") && u.role === "STUDENT"
    );

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-[var(--success-light)] border border-[var(--success)]/20">
                    <div className="flex items-center gap-2 mb-2">
                        <Crown className="w-5 h-5 text-[var(--success)]" />
                        <span className="font-medium text-[var(--foreground)]">{t("admin.activeSubscriptions")}</span>
                    </div>
                    <p className="text-2xl font-bold text-[var(--success)]">{usersWithSub.length}</p>
                </div>
                <div className="p-4 rounded-lg bg-[var(--warning-light)] border border-[var(--warning)]/20">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-5 h-5 text-[var(--warning)]" />
                        <span className="font-medium text-[var(--foreground)]">{t("admin.withoutSubscription")}</span>
                    </div>
                    <p className="text-2xl font-bold text-[var(--warning)]">{usersWithoutSub.length}</p>
                </div>
                <div className="p-4 rounded-lg bg-[var(--primary-light)] border border-[var(--primary)]/20">
                    <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="w-5 h-5 text-[var(--primary)]" />
                        <span className="font-medium text-[var(--foreground)]">{t("admin.incomeApprox")}</span>
                    </div>
                    <p className="text-2xl font-bold text-[var(--primary)] text-sm">
                        {(stats.estimatedIncome || 0).toLocaleString()} {t("pricing.sum")}
                    </p>
                </div>
            </div>

            {/* Active subscriptions */}
            <div>
                <h3 className="font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-[var(--success)]" />
                    {t("admin.activeSubscriptionsTitle")}
                </h3>
                {usersWithSub.length === 0 ? (
                    <p className="text-[var(--foreground-muted)] text-center py-8">{t("admin.noActiveSubscriptions")}</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[var(--border)]">
                                    <th className="text-left py-3 px-4 font-medium text-[var(--foreground)]">{t("admin.users")}</th>
                                    <th className="text-left py-3 px-4 font-medium text-[var(--foreground)]">{t("admin.email")}</th>
                                    <th className="text-center py-3 px-4 font-medium text-[var(--foreground)]">{t("admin.plan")}</th>
                                    <th className="text-center py-3 px-4 font-medium text-[var(--foreground)]">{t("admin.expiresAt")}</th>
                                    <th className="text-right py-3 px-4 font-medium text-[var(--foreground)]">{t("admin.actions")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usersWithSub.map((user) => (
                                    <tr key={user.id} className="border-b border-[var(--border)] hover:bg-[var(--border)]/30">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="avatar w-8 h-8 text-xs bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
                                                    {initial(user)}
                                                </div>
                                                <span className="font-medium text-[var(--foreground)]">{displayName(user)}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-[var(--foreground-secondary)]">{user.email}</td>
                                        <td className="py-3 px-4 text-center">
                                            <span
                                                className={`badge ${user.subscriptionPlan === "YEARLY" ? "badge-success" : "badge-primary"}`}
                                            >
                                                {user.subscriptionPlan === "MONTHLY"
                                                    ? `25 000 ${t("admin.perMonth")}`
                                                    : `50 000 ${t("admin.perYear")}`}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className="flex items-center justify-center gap-1 text-[var(--foreground-secondary)]">
                                                <Calendar className="w-4 h-4" />
                                                {user.subscriptionExpiresAt
                                                    ? new Date(user.subscriptionExpiresAt).toLocaleDateString()
                                                    : "-"}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <button
                                                onClick={() => onGrantSubscription(user)}
                                                className="btn btn-sm btn-primary mr-2"
                                                title={t("admin.extend")}
                                            >
                                                <Clock className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => onRemoveSubscription(user.id)}
                                                className="btn btn-sm btn-danger"
                                                title={t("admin.cancelSub")}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Users without subscription */}
            <div>
                <h3 className="font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[var(--warning)]" />
                    {t("admin.studentsWithoutSub")}
                </h3>
                {usersWithoutSub.length === 0 ? (
                    <p className="text-[var(--foreground-muted)] text-center py-8">{t("admin.allStudentsHaveSub")}</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[var(--border)]">
                                    <th className="text-left py-3 px-4 font-medium text-[var(--foreground)]">{t("admin.users")}</th>
                                    <th className="text-left py-3 px-4 font-medium text-[var(--foreground)]">{t("admin.email")}</th>
                                    <th className="text-right py-3 px-4 font-medium text-[var(--foreground)]">{t("admin.actions")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usersWithoutSub.map((user) => (
                                    <tr key={user.id} className="border-b border-[var(--border)] hover:bg-[var(--border)]/30">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="avatar w-8 h-8 text-xs">{initial(user)}</div>
                                                <span className="font-medium text-[var(--foreground)]">{displayName(user)}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-[var(--foreground-secondary)]">{user.email}</td>
                                        <td className="py-3 px-4 text-right">
                                            <button onClick={() => onGrantSubscription(user)} className="btn btn-sm btn-success">
                                                <Crown className="w-4 h-4" />
                                                {t("admin.addSubscription")}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
