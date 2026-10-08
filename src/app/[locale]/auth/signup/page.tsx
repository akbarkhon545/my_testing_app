"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerUser } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { Mail, Lock, UserPlus, Eye, EyeOff, Sparkles, Check } from "lucide-react";

const schema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(8, "Минимум 8 символов"),
  confirmPassword: z.string().min(8, "Минимум 8 символов"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof schema>;

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84Z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z" fill="#EA4335" />
    </svg>
  );
}

export default function SignupPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const password = watch("password", "");

  const passwordChecks = [
    { label: "Минимум 8 символов", valid: password.length >= 8 },
    { label: "Содержит цифру", valid: /\d/.test(password) },
    { label: "Содержит букву", valid: /[a-zA-Z]/.test(password) },
  ];

  const onSubmit = async (values: FormValues) => {
    setError(null);
    setLoading(true);
    try {
      await registerUser({
        email: values.email,
        password: values.password,
        name: values.email.split("@")[0],
      });
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      setError(err.message || "Ошибка при регистрации");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    setGoogleLoading(true);
    window.location.href = `/api/auth/google?locale=${locale}`;
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center animate-fadeIn">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="card overflow-hidden">
          {/* Header */}
          <div className="relative p-8 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-center">
            {/* Decorations */}
            <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full bg-cyan-400/20 blur-2xl" />

            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">EduPlatform</h1>
              <p className="text-white/80 text-sm">Создайте аккаунт для начала</p>
            </div>
          </div>

          {/* Form */}
          <div className="p-8">
            <h2 className="text-xl font-semibold text-[var(--foreground)] mb-6 text-center">
              {t("signup")}
            </h2>

            {/* Кнопка Google */}
            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border-2 border-[var(--border)] bg-[var(--background)] hover:bg-[var(--border)] hover:border-[var(--foreground-muted)] transition-all duration-200 text-sm font-medium text-[var(--foreground)] disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {googleLoading ? (
                <div className="w-5 h-5 border-2 border-[var(--foreground-muted)] border-t-transparent rounded-full animate-spin" />
              ) : (
                <GoogleIcon className="w-5 h-5 transition-transform group-hover:scale-110" />
              )}
              {t("googleSignUp")}
            </button>

            {/* Разделитель */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--border)]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[var(--background-secondary)] px-3 text-[var(--foreground-muted)]">
                  {t("orDivider")}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="label">{t("email")}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground-muted)] pointer-events-none z-10" />
                  <input
                    type="email"
                    className="input"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="name@example.com"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-[var(--danger-strong)] mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="label">{t("password")}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground-muted)] pointer-events-none z-10" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="input"
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                    placeholder="••••••••"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Password strength indicators */}
                <div className="mt-2 space-y-1">
                  {passwordChecks.map((check, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <Check className={`w-3 h-3 ${check.valid ? "text-[var(--success-strong)]" : "text-[var(--foreground-muted)]"}`} />
                      <span className={check.valid ? "text-[var(--success-strong)]" : "text-[var(--foreground-muted)]"}>
                        {check.label}
                      </span>
                    </div>
                  ))}
                </div>

                {errors.password && (
                  <p className="text-sm text-[var(--danger-strong)] mt-1">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="label">Подтверждение пароля</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground-muted)] pointer-events-none z-10" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="input"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="••••••••"
                    {...register("confirmPassword")}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-[var(--danger-strong)] mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              {error && (
                <div className="alert alert-danger">
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg w-full"
              >
                {loading ? (
                  <span>Создание аккаунта...</span>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    {t("signup")}
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[var(--foreground-secondary)]">
              {t("haveAccount")}{" "}
              <Link href={`/${locale}/auth/login`} className="text-[var(--primary)] hover:underline font-medium">
                {t("signin")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
