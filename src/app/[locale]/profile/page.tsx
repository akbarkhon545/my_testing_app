"use client";

import { useState, useEffect } from "react";
import supabase from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import Link from "next/link";
import {
    User,
    Mail,
    Phone,
    Calendar,
    Camera,
    Lock,
    Save,
    ArrowLeft,
    CheckCircle,
    AlertCircle,
    GraduationCap,
    Crown,
    CreditCard,
    Clock,
    AlertTriangle
} from "lucide-react";

interface Subscription {
    plan: "monthly" | "yearly" | null;
    status: "active" | "expired" | "none";
    expiresAt: Date | null;
}

export default function ProfilePage() {
    const router = useRouter();
    const locale = useLocale();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Profile data
    const [name, setName] = useState("Студент");
    const [email, setEmail] = useState("student@example.com");
    const [phone, setPhone] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    // Password change
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [changingPassword, setChangingPassword] = useState(false);

    // Subscription (mock for demo)
    const [subscription, setSubscription] = useState<Subscription>({
        plan: "monthly",
        status: "active",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    });

    useEffect(() => {
        async function loadProfile() {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setEmail(session.user.email || "");
                setName(session.user.email?.split("@")[0] || "Студент");
            }
            setLoading(false);
        }
        loadProfile();
    }, []);

    const handleSaveProfile = async () => {
        setSaving(true);
        setMessage(null);

        await new Promise(resolve => setTimeout(resolve, 1000));

        setMessage({ type: "success", text: "Профиль успешно сохранён" });
        setSaving(false);
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            setMessage({ type: "error", text: "Пароли не совпадают" });
            return;
        }
        if (newPassword.length < 8) {
            setMessage({ type: "error", text: "Пароль должен содержать минимум 8 символов" });
            return;
        }

        setChangingPassword(true);
        setMessage(null);

        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;

            setMessage({ type: "success", text: "Пароль успешно изменён" });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            setMessage({ type: "error", text: error.message || "Ошибка при смене пароля" });
        }

        setChangingPassword(false);
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat("ru-RU", {
            day: "numeric",
            month: "long",
            year: "numeric",
        }).format(date);
    };

    const getDaysRemaining = () => {
        if (!subscription.expiresAt) return 0;
        const diff = subscription.expiresAt.getTime() - Date.now();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-[var(--foreground-secondary)]">Загрузка...</div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto animate-fadeIn">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => router.back()}
                    className="btn btn-secondary"
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-[var(--foreground)]">Мой профиль</h1>
                    <p className="text-[var(--foreground-secondary)]">Управление личными данными и подпиской</p>
                </div>
            </div>

            {/* Message */}
            {message && (
                <div className={`alert ${message.type === "success" ? "alert-success" : "alert-danger"} mb-6`}>
                    {message.type === "success" ? (
                        <CheckCircle className="w-5 h-5" />
                    ) : (
                        <AlertCircle className="w-5 h-5" />
                    )}
                    <span>{message.text}</span>
                </div>
            )}

            <div className="grid gap-6">
                {/* Avatar Card */}
                <div className="card">
                    <div className="card-body">
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <div className="avatar avatar-lg w-24 h-24 text-3xl">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="Avatar" />
                                    ) : (
                                        name[0].toUpperCase()
                                    )}
                                </div>
                                <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center hover:bg-[var(--primary-hover)] transition-colors">
                                    <Camera className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl font-semibold text-[var(--foreground)]">{name}</h2>
                                <p className="text-[var(--foreground-secondary)]">{email}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    {subscription.status === "active" ? (
                                        <span className="badge badge-success flex items-center gap-1">
                                            <Crown className="w-3 h-3" />
                                            Премиум
                                        </span>
                                    ) : (
                                        <span className="badge badge-warning">Бесплатный</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subscription Card */}
                <div className="card">
                    <div className="card-header flex justify-between items-center">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Crown className="w-5 h-5" />
                            Подписка
                        </h3>
                        {subscription.status === "active" && (
                            <span className="badge badge-success">Активна</span>
                        )}
                    </div>
                    <div className="card-body">
                        {subscription.status === "active" ? (
                            <>
                                <div className="grid sm:grid-cols-3 gap-4 mb-6">
                                    <div className="p-4 rounded-lg bg-[var(--background)] border border-[var(--border)]">
                                        <div className="flex items-center gap-2 text-[var(--foreground-muted)] text-sm mb-1">
                                            <CreditCard className="w-4 h-4" />
                                            Тариф
                                        </div>
                                        <p className="font-semibold text-[var(--foreground)]">
                                            {subscription.plan === "monthly" ? "Месячный" : "Годовой"}
                                        </p>
                                    </div>

                                    <div className="p-4 rounded-lg bg-[var(--background)] border border-[var(--border)]">
                                        <div className="flex items-center gap-2 text-[var(--foreground-muted)] text-sm mb-1">
                                            <Calendar className="w-4 h-4" />
                                            Действует до
                                        </div>
                                        <p className="font-semibold text-[var(--foreground)]">
                                            {subscription.expiresAt && formatDate(subscription.expiresAt)}
                                        </p>
                                    </div>

                                    <div className="p-4 rounded-lg bg-[var(--background)] border border-[var(--border)]">
                                        <div className="flex items-center gap-2 text-[var(--foreground-muted)] text-sm mb-1">
                                            <Clock className="w-4 h-4" />
                                            Осталось
                                        </div>
                                        <p className={`font-semibold ${getDaysRemaining() <= 7 ? "text-[var(--warning)]" : "text-[var(--foreground)]"}`}>
                                            {getDaysRemaining()} дней
                                        </p>
                                    </div>
                                </div>

                                {getDaysRemaining() <= 7 && (
                                    <div className="alert alert-warning mb-4">
                                        <AlertTriangle className="w-5 h-5" />
                                        <span>Ваша подписка скоро истекает. Продлите для продолжения доступа.</span>
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <Link href={`/${locale}/pricing`} className="btn btn-primary">
                                        <Crown className="w-4 h-4" />
                                        Продлить подписку
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-6">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--warning-light)] mb-4">
                                    <Crown className="w-8 h-8 text-[var(--warning)]" />
                                </div>
                                <h4 className="font-semibold text-[var(--foreground)] mb-2">У вас нет активной подписки</h4>
                                <p className="text-[var(--foreground-secondary)] mb-4">
                                    Оформите подписку для полного доступа ко всем функциям
                                </p>
                                <Link href={`/${locale}/pricing`} className="btn btn-primary">
                                    <Crown className="w-4 h-4" />
                                    Оформить подписку
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Profile Form */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="font-semibold flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Личные данные
                        </h3>
                    </div>
                    <div className="card-body space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="label">Имя</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground-muted)]" />
                                    <input
                                        type="text"
                                        className="input pl-10"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Ваше имя"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="label">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground-muted)]" />
                                    <input
                                        type="email"
                                        className="input pl-10"
                                        value={email}
                                        disabled
                                        placeholder="email@example.com"
                                    />
                                </div>
                                <p className="text-xs text-[var(--foreground-muted)] mt-1">Email нельзя изменить</p>
                            </div>

                            <div>
                                <label className="label">Телефон</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground-muted)]" />
                                    <input
                                        type="tel"
                                        className="input pl-10"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="+998 90 123 45 67"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="label">Дата рождения</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground-muted)]" />
                                    <input
                                        type="date"
                                        className="input pl-10"
                                        value={birthDate}
                                        onChange={(e) => setBirthDate(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={handleSaveProfile}
                                disabled={saving}
                                className="btn btn-primary"
                            >
                                <Save className="w-4 h-4" />
                                {saving ? "Сохранение..." : "Сохранить"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Password Change */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Lock className="w-5 h-5" />
                            Смена пароля
                        </h3>
                    </div>
                    <div className="card-body space-y-4">
                        <div>
                            <label className="label">Текущий пароль</label>
                            <input
                                type="password"
                                className="input"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="label">Новый пароль</label>
                                <input
                                    type="password"
                                    className="input"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Минимум 8 символов"
                                />
                            </div>

                            <div>
                                <label className="label">Подтверждение</label>
                                <input
                                    type="password"
                                    className="input"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Повторите пароль"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={handleChangePassword}
                                disabled={changingPassword || !currentPassword || !newPassword}
                                className="btn btn-secondary"
                            >
                                <Lock className="w-4 h-4" />
                                {changingPassword ? "Изменение..." : "Изменить пароль"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
