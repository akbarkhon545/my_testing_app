"use client";

import { useState, useEffect } from "react";
import supabase from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
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
    const t = useTranslations();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Profile data
    const [name, setName] = useState("Student");
    const [email, setEmail] = useState("student@example.com");
    const [phone, setPhone] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    // Password change
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [changingPassword, setChangingPassword] = useState(false);

    // Subscription - loaded from localStorage
    const [subscription, setSubscription] = useState<Subscription>({
        plan: null,
        status: "none",
        expiresAt: null,
    });

    useEffect(() => {
        async function loadProfile() {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const userEmail = session.user.email || "";
                setEmail(userEmail);
                setName(userEmail.split("@")[0] || "Student");

                // Super admin bypass - always show as Premium
                if (userEmail === "akbarkhon545@gmail.com") {
                    setSubscription({
                        plan: "yearly",
                        status: "active",
                        expiresAt: new Date("2099-12-31"), // Permanent access
                    });
                } else {
                    // Load subscription from localStorage
                    const allSubs = JSON.parse(localStorage.getItem('all_subscriptions') || '{}');
                    const userSub = allSubs[userEmail];

                    if (userSub && userSub.expiresAt) {
                        const expiryDate = new Date(userSub.expiresAt);
                        if (expiryDate > new Date()) {
                            setSubscription({
                                plan: userSub.plan || "monthly",
                                status: "active",
                                expiresAt: expiryDate,
                            });
                        } else {
                            setSubscription({
                                plan: userSub.plan || "monthly",
                                status: "expired",
                                expiresAt: expiryDate,
                            });
                        }
                    } else {
                        setSubscription({
                            plan: null,
                            status: "none",
                            expiresAt: null,
                        });
                    }
                }
            }
            setLoading(false);
        }
        loadProfile();
    }, []);

    const handleSaveProfile = async () => {
        setSaving(true);
        setMessage(null);

        await new Promise(resolve => setTimeout(resolve, 1000));

        setMessage({ type: "success", text: t("profile.profileSaved") });
        setSaving(false);
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            setMessage({ type: "error", text: t("profile.passwordMismatch") });
            return;
        }
        if (newPassword.length < 8) {
            setMessage({ type: "error", text: t("profile.passwordTooShort") });
            return;
        }

        setChangingPassword(true);
        setMessage(null);

        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;

            setMessage({ type: "success", text: t("profile.passwordChanged") });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            setMessage({ type: "error", text: error.message || t("profile.passwordChangeError") });
        }

        setChangingPassword(false);
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat(locale === "uz" ? "uz-UZ" : "ru-RU", {
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
                <div className="text-[var(--foreground-secondary)]">{t("common.loading")}</div>
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
                    <h1 className="text-2xl font-bold text-[var(--foreground)]">{t("profile.title")}</h1>
                    <p className="text-[var(--foreground-secondary)]">{t("profile.subtitle")}</p>
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
                                            {t("profile.premium")}
                                        </span>
                                    ) : (
                                        <span className="badge badge-warning">{t("profile.free")}</span>
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
                            {t("profile.subscription")}
                        </h3>
                        {subscription.status === "active" && (
                            <span className="badge badge-success">{t("profile.active")}</span>
                        )}
                    </div>
                    <div className="card-body">
                        {subscription.status === "active" ? (
                            <>
                                <div className="grid sm:grid-cols-3 gap-4 mb-6">
                                    <div className="p-4 rounded-lg bg-[var(--background)] border border-[var(--border)]">
                                        <div className="flex items-center gap-2 text-[var(--foreground-muted)] text-sm mb-1">
                                            <CreditCard className="w-4 h-4" />
                                            {t("profile.plan")}
                                        </div>
                                        <p className="font-semibold text-[var(--foreground)]">
                                            {subscription.plan === "monthly" ? t("profile.monthlyPlan") : t("profile.yearlyPlan")}
                                        </p>
                                    </div>

                                    <div className="p-4 rounded-lg bg-[var(--background)] border border-[var(--border)]">
                                        <div className="flex items-center gap-2 text-[var(--foreground-muted)] text-sm mb-1">
                                            <Calendar className="w-4 h-4" />
                                            {t("profile.validUntil")}
                                        </div>
                                        <p className="font-semibold text-[var(--foreground)]">
                                            {subscription.expiresAt && formatDate(subscription.expiresAt)}
                                        </p>
                                    </div>

                                    <div className="p-4 rounded-lg bg-[var(--background)] border border-[var(--border)]">
                                        <div className="flex items-center gap-2 text-[var(--foreground-muted)] text-sm mb-1">
                                            <Clock className="w-4 h-4" />
                                            {t("profile.remaining")}
                                        </div>
                                        <p className={`font-semibold ${getDaysRemaining() <= 7 ? "text-[var(--warning)]" : "text-[var(--foreground)]"}`}>
                                            {getDaysRemaining()} {t("profile.days")}
                                        </p>
                                    </div>
                                </div>

                                {getDaysRemaining() <= 7 && (
                                    <div className="alert alert-warning mb-4">
                                        <AlertTriangle className="w-5 h-5" />
                                        <span>{t("profile.subExpiringWarning")}</span>
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <Link href={`/${locale}/pricing`} className="btn btn-primary">
                                        <Crown className="w-4 h-4" />
                                        {t("profile.extendSubscription")}
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-6">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--warning-light)] mb-4">
                                    <Crown className="w-8 h-8 text-[var(--warning)]" />
                                </div>
                                <h4 className="font-semibold text-[var(--foreground)] mb-2">{t("profile.noActiveSubscription")}</h4>
                                <p className="text-[var(--foreground-secondary)] mb-4">
                                    {t("profile.getSubscriptionDesc")}
                                </p>
                                <Link href={`/${locale}/pricing`} className="btn btn-primary">
                                    <Crown className="w-4 h-4" />
                                    {t("profile.getSubscription")}
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
                            {t("profile.personalData")}
                        </h3>
                    </div>
                    <div className="card-body space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="label">{t("profile.name")}</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground-muted)]" />
                                    <input
                                        type="text"
                                        className="input pl-10"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder={t("profile.namePlaceholder")}
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
                                <p className="text-xs text-[var(--foreground-muted)] mt-1">{t("profile.emailCantChange")}</p>
                            </div>

                            <div>
                                <label className="label">{t("profile.phone")}</label>
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
                                <label className="label">{t("profile.birthDate")}</label>
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
                                {saving ? t("profile.saving") : t("profile.save")}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Password Change */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Lock className="w-5 h-5" />
                            {t("profile.changePassword")}
                        </h3>
                    </div>
                    <div className="card-body space-y-4">
                        <div>
                            <label className="label">{t("profile.currentPassword")}</label>
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
                                <label className="label">{t("profile.newPassword")}</label>
                                <input
                                    type="password"
                                    className="input"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder={t("profile.newPasswordPlaceholder")}
                                />
                            </div>

                            <div>
                                <label className="label">{t("profile.confirmPassword")}</label>
                                <input
                                    type="password"
                                    className="input"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder={t("profile.confirmPasswordPlaceholder")}
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
                                {changingPassword ? t("profile.changingPassword") : t("profile.changePasswordBtn")}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
