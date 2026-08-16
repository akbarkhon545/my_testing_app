"use client";

import { useTranslations } from "next-intl";
import { Crown, Edit, Trash2, UserCheck, UserX } from "lucide-react";
import { RoleBadge, SubscriptionBadge } from "./Badges";
import { displayName, initial, type AdminUser } from "./types";

export const DEACTIVATED_MARK = "[ДЕАКТИВИРОВАН]";

interface UsersTableProps {
    users: AdminUser[];
    searchQuery: string;
    onEdit: (user: AdminUser) => void;
    onDelete: (id: string) => void;
    onGrantSubscription: (user: AdminUser) => void;
    onDeactivate: (user: AdminUser) => void;
    onActivate: (user: AdminUser) => void;
}

export default function UsersTable({
    users,
    searchQuery,
    onEdit,
    onDelete,
    onGrantSubscription,
    onDeactivate,
    onActivate,
}: UsersTableProps) {
    const t = useTranslations();
    const query = searchQuery.toLowerCase();

    const visibleUsers = users.filter(
        (u) => (u.name || "").toLowerCase().includes(query) || u.email.toLowerCase().includes(query)
    );

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-[var(--border)]">
                        <th className="text-left py-3 px-4 font-medium text-[var(--foreground)]">{t("admin.users")}</th>
                        <th className="text-left py-3 px-4 font-medium text-[var(--foreground)]">{t("admin.email")}</th>
                        <th className="text-center py-3 px-4 font-medium text-[var(--foreground)]">{t("admin.role")}</th>
                        <th className="text-center py-3 px-4 font-medium text-[var(--foreground)]">{t("admin.subscription")}</th>
                        <th className="text-right py-3 px-4 font-medium text-[var(--foreground)]">{t("admin.actions")}</th>
                    </tr>
                </thead>
                <tbody>
                    {visibleUsers.map((user) => {
                        const isDeactivated = (user.name || "").includes(DEACTIVATED_MARK);

                        return (
                            <tr key={user.id} className="border-b border-[var(--border)] hover:bg-[var(--border)]/30">
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-3">
                                        <div className="avatar w-8 h-8 text-xs">{initial(user)}</div>
                                        <span className="font-medium text-[var(--foreground)]">{displayName(user)}</span>
                                    </div>
                                </td>
                                <td className="py-3 px-4 text-[var(--foreground-secondary)]">{user.email}</td>
                                <td className="py-3 px-4 text-center">
                                    <RoleBadge role={user.role} />
                                </td>
                                <td className="py-3 px-4 text-center">
                                    <SubscriptionBadge user={user} />
                                </td>
                                <td className="py-3 px-4 text-right">
                                    <button
                                        onClick={() => onGrantSubscription(user)}
                                        className="btn btn-sm btn-success mr-2"
                                        title={t("admin.addSubscription")}
                                    >
                                        <Crown className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => onEdit(user)} className="btn btn-sm btn-secondary mr-2">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    {isDeactivated ? (
                                        <button
                                            onClick={() => onActivate(user)}
                                            className="btn btn-sm btn-success mr-2"
                                            title="Активировать пользователя"
                                        >
                                            <UserCheck className="w-4 h-4" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => onDeactivate(user)}
                                            className="btn btn-sm btn-warning mr-2"
                                            title="Деактивировать пользователя"
                                        >
                                            <UserX className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => onDelete(user.id)}
                                        className="btn btn-sm btn-danger"
                                        title="Удалить пользователя"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
